import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function simulateDraw(formData: FormData) {
  "use server";
  const logicMode = formData.get("logic") as "random" | "algorithmic";
  const supabase = await createSupabaseServerClient();
  
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const drawMonthStr = nextMonth.toISOString().split('T')[0];

  let winningNumbers: number[] = [];

  if (logicMode === "random") {
    const nums = new Set<number>();
    while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
    winningNumbers = Array.from(nums).sort((a,b) => a - b);
  } else {
    // Algorithmic: get 5 most frequently played Stableford scores across all users
    const { data: allScores } = await supabase.from("scores").select("stableford_score");
    const frequency: Record<number, number> = {};
    (allScores || []).forEach(s => {
      frequency[s.stableford_score] = (frequency[s.stableford_score] || 0) + 1;
    });
    const sortedNums = Object.keys(frequency).map(Number).sort((a, b) => frequency[b] - frequency[a]);
    winningNumbers = sortedNums.slice(0, 5);
    
    const nums = new Set<number>(winningNumbers);
    while(nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
    winningNumbers = Array.from(nums).sort((a,b) => a - b);
  }

  // Base Prize Pool + $10 per active sub
  const { count: subCount } = await supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active");
  const totalPrizePoolCents = 10000 + ((subCount || 0) * 1000);

  const { data: existing } = await supabase.from("draws").select("id").eq("draw_month", drawMonthStr).maybeSingle();
  
  if (existing) {
    await supabase.from("draws").update({
      logic_mode: logicMode, numbers: winningNumbers, prize_pool_cents: totalPrizePoolCents, status: "draft"
    }).eq("id", existing.id);
  } else {
    await supabase.from("draws").insert({
      draw_month: drawMonthStr, logic_mode: logicMode, numbers: winningNumbers, prize_pool_cents: totalPrizePoolCents, status: "draft"
    });
  }
  revalidatePath("/admin/draws");
}

async function publishDraw(drawId: string) {
  "use server";
  const supabase = await createSupabaseServerClient();
  
  // 1. Get Draw Details
  const { data: draw } = await supabase.from("draws").select("*").eq("id", drawId).single();
  if (!draw || draw.status === "published") return;

  // 2. Get Users + their scores. (Real PRD constraint: must have exactly 5 scores)
  const { data: usersWithScores } = await supabase
    .from("profiles")
    .select(`
      id,
      subscriptions!inner (status),
      scores (stableford_score)
    `)
    .eq("subscriptions.status", "active");

  const eligibleUsers = (usersWithScores || []).filter((u: any) => u.scores && u.scores.length === 5);

  const winningSet = new Set(draw.numbers);

  // 3. Evaluate Winners
  for (const user of eligibleUsers) {
    const userScores = user.scores.map((s: any) => s.stableford_score);
    let matchCount = 0;
    userScores.forEach((s: number) => {
      if (winningSet.has(s)) matchCount++;
    });

    let tier = null;
    let prizeSharePercent = 0;
    if (matchCount === 5) { tier = "5"; prizeSharePercent = 0.40; } // 40%
    else if (matchCount === 4) { tier = "4"; prizeSharePercent = 0.35; } // 35%
    else if (matchCount === 3) { tier = "3"; prizeSharePercent = 0.25; } // 25%

    // Snap to DB
    await supabase.from("draw_entries").upsert({
      draw_id: draw.id, user_id: user.id, user_scores: userScores, match_count: matchCount, tier: tier
    });

    if (tier) {
      const prizeAmount = Math.floor(draw.prize_pool_cents * prizeSharePercent);
      await supabase.from("winners").insert({
        draw_id: draw.id, user_id: user.id, tier: tier, prize_cents: prizeAmount, payout_status: "pending"
      });
    }
  }

  // 4. Set Published
  await supabase.from("draws").update({ status: "published", published_at: new Date().toISOString() }).eq("id", draw.id);
  revalidatePath("/admin/draws");
}

export default async function AdminDrawsPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("draw_month", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Monthly Draws</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* CREATE DRAW FORM */}
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-white mb-2">Simulate Next Draw</h2>
          <p className="text-sm text-zinc-400 mb-6 leading-6">This generates the winning sequence according to the selected logic, determining variables for pre-analysis.</p>
          <form action={simulateDraw} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">Logic Type</label>
              <select name="logic" className="mt-1 h-11 w-full rounded-xl bg-zinc-950 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25">
                <option value="random">Pure Random Generation</option>
                <option value="algorithmic">Algorithmic (User frequencies)</option>
              </select>
            </div>
            <button className="w-full h-11 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-400">
              Run Simulation
            </button>
          </form>
        </div>

        {/* LIST DRAWS */}
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Past & Active Draws</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-white/10 text-xs font-semibold text-white">
                <tr>
                  <th className="pb-3 px-2">Month</th>
                  <th className="pb-3 px-2">Winning Seq</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Pool</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {draws?.length === 0 ? (
                  <tr>
                    <td className="py-8 text-center text-zinc-500 italic" colSpan={5}>No draws found...</td>
                  </tr>
                ) : (
                  draws?.map((d) => (
                    <tr key={d.id}>
                      <td className="py-4 px-2 font-medium text-white">{new Date(d.draw_month).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}</td>
                      <td className="py-4 px-2 tracking-widest">{d.numbers?.join(" · ") || "TBA"}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium \${d.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-white">${(d.prize_pool_cents / 100).toFixed(2)}</td>
                      <td className="py-4 px-2 text-right">
                        {d.status === 'draft' ? (
                          <form action={publishDraw.bind(null, d.id)}>
                            <button className="text-xs font-semibold bg-white text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200">
                              Publish Results
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-zinc-500 italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
