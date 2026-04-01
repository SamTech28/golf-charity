import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMySubscription } from "@/lib/subscription";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  const sub = await getMySubscription();

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-300">
              Signed in as {data.user.email}
            </p>
          </div>
          <form action="/logout" method="post">
            <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Subscription</div>
            {sub ? (
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
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
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-300">
                No subscription found yet.
              </p>
            )}
            <Link
              href="/dashboard/subscription"
              className="mt-4 inline-flex text-sm font-semibold text-white underline underline-offset-4"
            >
              Manage subscription
            </Link>
          </div>
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Scores</div>
            <p className="mt-2 text-sm text-zinc-300">
              Coming next: enter/edit last 5 Stableford scores.
            </p>
            <Link
              href="/dashboard/scores"
              className="mt-4 inline-flex text-sm font-semibold text-white underline underline-offset-4"
            >
              Manage scores
            </Link>
          </div>
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Charity</div>
            <p className="mt-2 text-sm text-zinc-300">
              Coming next: choose a charity and set contribution %.
            </p>
            <Link
              href="/dashboard/charity"
              className="mt-4 inline-flex text-sm font-semibold text-white underline underline-offset-4"
            >
              Set charity preference
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

