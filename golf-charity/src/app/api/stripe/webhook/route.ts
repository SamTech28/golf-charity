import { headers } from "next/headers";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const supabaseUserId =
    sub.metadata?.supabase_user_id ||
    (sub.items.data[0]?.price?.metadata as Record<string, string> | null)
      ?.supabase_user_id ||
    null;

  const planInterval = sub.metadata?.plan_interval ?? sub.items.data[0]?.plan?.interval;
  const statusMap: Record<string, "active" | "inactive" | "canceled" | "lapsed"> = {
    active: "active",
    trialing: "active",
    canceled: "canceled",
    unpaid: "lapsed",
    past_due: "lapsed",
    incomplete: "inactive",
    incomplete_expired: "inactive",
    paused: "lapsed",
  };

  const status =
    statusMap[sub.status] ??
    (sub.cancel_at_period_end ? "canceled" : "inactive");

  const supabaseAdmin = createSupabaseAdminClient();

  // Prefer linking by user_id if metadata exists; else link by customer id.
  if (supabaseUserId) {
    await supabaseAdmin.from("subscriptions").upsert(
      {
        user_id: supabaseUserId,
        stripe_customer_id: String(sub.customer),
        stripe_subscription_id: sub.id,
        plan_interval: planInterval === "year" ? "year" : "month",
        status,
        current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
      },
      { onConflict: "user_id" },
    );
    return;
  }

  await supabaseAdmin
    .from("subscriptions")
    .update({
      stripe_subscription_id: sub.id,
      plan_interval: planInterval === "year" ? "year" : "month",
      status,
      current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    })
    .eq("stripe_customer_id", String(sub.customer));
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const sig = (await headers()).get("stripe-signature");
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return new Response("Missing webhook secret/signature.", { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await upsertSubscriptionFromStripe(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    return new Response(`Webhook handler failed: ${(err as Error).message}`, {
      status: 500,
    });
  }

  return new Response("ok");
}

