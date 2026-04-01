import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  interval: z.enum(["month", "year"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = BodySchema.parse(await request.json());

    if (!env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in .env.local" },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const priceId =
      body.interval === "month"
        ? env.STRIPE_PRICE_MONTHLY_ID
        : env.STRIPE_PRICE_YEARLY_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price is not configured." },
        { status: 500 },
      );
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: existingSub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = existingSub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin.from("subscriptions").upsert(
        {
          id: existingSub?.id,
          user_id: user.id,
          stripe_customer_id: customerId,
          plan_interval: body.interval,
          status: "inactive",
        },
        { onConflict: "user_id" },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe/success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/subscribe`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_interval: body.interval },
      },
      metadata: { supabase_user_id: user.id, plan_interval: body.interval },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Checkout initialization failed." },
      { status: 500 },
    );
  }
}

