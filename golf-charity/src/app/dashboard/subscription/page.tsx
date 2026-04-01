import Link from "next/link";
import { getMySubscription } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import { PortalButton } from "@/app/dashboard/subscription/PortalButton";

export default async function SubscriptionPage() {
  await requireUser();
  const sub = await getMySubscription();

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
          ← Dashboard
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Subscription
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Status is synced from Stripe webhooks.
        </p>

        <div className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          {sub ? (
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-semibold text-white">{sub.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span className="font-semibold text-white">
                  {sub.plan_interval}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Renews</span>
                <span className="font-semibold text-white">
                  {sub.current_period_end
                    ? new Date(sub.current_period_end).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cancel at period end</span>
                <span className="font-semibold text-white">
                  {sub.cancel_at_period_end ? "Yes" : "No"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-300">
              No subscription found yet.
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
            >
              Subscribe / Change plan
            </Link>
            <PortalButton />
          </div>

          <p className="mt-4 text-xs text-zinc-400">
            Note: enable Stripe Billing Portal in your Stripe dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

