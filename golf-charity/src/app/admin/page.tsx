import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  
  // Quick stats
  const [{ count: userCount }, { count: charityCount }, { data: pool }] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("charities").select("*", { count: "exact", head: true }),
    supabase.from("draws").select("prize_pool").eq("status", "draft").maybeSingle()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-white mb-8">Admin Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10">
          <div className="text-sm text-zinc-400">Total Users</div>
          <div className="text-3xl font-semibold text-white mt-2">{userCount ?? 0}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10">
          <div className="text-sm text-zinc-400">Active Charities</div>
          <div className="text-3xl font-semibold text-white mt-2">{charityCount ?? 0}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10">
          <div className="text-sm text-zinc-400">Current Prize Pool</div>
          <div className="text-3xl font-semibold text-white mt-2">${pool?.prize_pool ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
