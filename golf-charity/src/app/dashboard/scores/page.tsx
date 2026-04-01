import Link from "next/link";
import { z } from "zod";
import { requireActiveSubscription } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ScoreSchema = z.object({
  playedOn: z.string().min(1),
  stablefordScore: z.coerce.number().int().min(1).max(45),
});

async function addScore(formData: FormData) {
  "use server";
  await requireActiveSubscription();
  const user = await requireUser();

  const parsed = ScoreSchema.safeParse({
    playedOn: formData.get("playedOn"),
    stablefordScore: formData.get("stablefordScore"),
  });
  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  
  // PRD enforced limit: Only latest 5 scores retained. Replace oldest automatically.
  const { data: existingScores } = await supabase
    .from("scores")
    .select("id, played_on, created_at")
    .eq("user_id", user.id)
    .order("played_on", { ascending: true }) // oldest first
    .order("created_at", { ascending: true });

  // If there are 5 or more, delete the oldest
  if (existingScores && existingScores.length >= 5) {
    const oldestId = existingScores[0].id;
    await supabase.from("scores").delete().eq("id", oldestId);
  }

  const { error } = await supabase.from("scores").insert({
    user_id: user.id,
    played_on: parsed.data.playedOn,
    stableford_score: parsed.data.stablefordScore,
  });
  if (error) return;
  
  revalidatePath("/dashboard/scores");
}

export default async function ScoresPage() {
  await requireActiveSubscription();
  const user = await requireUser();

  const supabase = await createSupabaseServerClient();
  const { data: scores } = await supabase
    .from("scores")
    .select("id, played_on, stableford_score")
    .eq("user_id", user.id)
    .order("played_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
            ← Dashboard
          </Link>
          <Link
            href="/subscribe"
            className="text-sm font-semibold text-white underline underline-offset-4"
          >
            Subscription
          </Link>
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Scores</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Enter your latest Stableford rounds. We keep only your most recent 5.
        </p>

        <form
          action={addScore}
          className="mt-8 grid gap-3 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:grid-cols-3"
        >
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-200" htmlFor="playedOn">
              Date
            </label>
            <input
              id="playedOn"
              name="playedOn"
              type="date"
              required
              className="mt-1 h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </div>
          <div>
            <label
              className="text-xs font-medium text-zinc-200"
              htmlFor="stablefordScore"
            >
              Score (1–45)
            </label>
            <input
              id="stablefordScore"
              name="stablefordScore"
              type="number"
              min={1}
              max={45}
              required
              className="mt-1 h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
              placeholder="38"
            />
          </div>
          <button className="sm:col-span-3 h-11 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Add score
          </button>
        </form>

        <div className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Latest 5</div>
            <div className="text-xs text-zinc-400">
              {scores?.length ?? 0} / 5 stored
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {(scores ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-2xl bg-zinc-900/40 px-4 py-3 ring-1 ring-white/10"
              >
                <div className="text-sm text-zinc-200">
                  {new Date(String(s.played_on)).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-semibold text-white">
                    {s.stableford_score}
                  </div>
                  <Link
                    href={`/dashboard/scores/${s.id}/edit`}
                    className="text-xs font-semibold text-white/80 underline underline-offset-4 hover:text-white"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
            {scores && scores.length === 0 ? (
              <div className="rounded-2xl bg-zinc-900/40 px-4 py-6 text-sm text-zinc-300 ring-1 ring-white/10">
                No scores yet. Add your first round above.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

