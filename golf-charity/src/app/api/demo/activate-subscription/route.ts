import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BodySchema = z.object({
  interval: z.enum(["month", "year"]),
});

/**
 * Local / internship demo: activate subscription without Stripe (e.g. India, no Stripe account).
 * Requires DEMO_SUBSCRIPTION_MODE=true and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export async function POST(request: Request) {
  if (!env.DEMO_SUBSCRIPTION_MODE) {
    return NextResponse.json(
      { error: "Demo subscription is disabled." },
      { status: 403 },
    );
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Add SUPABASE_SERVICE_ROLE_KEY to use demo subscription." },
      { status: 500 },
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = BodySchema.parse(await request.json());

  const now = new Date();
  const end = new Date(now);
  if (body.interval === "year") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan_interval: body.interval,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: end.toISOString(),
      cancel_at_period_end: false,
      price_cents: body.interval === "year" ? 99900 : 9990,
      currency: "inr",
      stripe_customer_id: null,
      stripe_subscription_id: null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
