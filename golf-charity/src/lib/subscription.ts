import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type SubscriptionRow = {
  status: "inactive" | "active" | "canceled" | "lapsed";
  plan_interval: "month" | "year";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export const getMySubscription = cache(async (): Promise<SubscriptionRow | null> => {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status, plan_interval, current_period_end, cancel_at_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as SubscriptionRow | null) ?? null;
});

export const requireActiveSubscription = cache(async () => {
  const sub = await getMySubscription();
  if (!sub || sub.status !== "active") redirect("/subscribe");
  return sub;
});

