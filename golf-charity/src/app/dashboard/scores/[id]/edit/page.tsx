import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { requireActiveSubscription } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ScoreSchema = z.object({
  playedOn: z.string().min(1),
  stablefordScore: z.coerce.number().int().min(1).max(45),
});

async function updateScore(scoreId: string, formData: FormData) {
  "use server";
  await requireActiveSubscription();
  const user = await requireUser();

  const parsed = ScoreSchema.safeParse({
    playedOn: formData.get("playedOn"),
    stablefordScore: formData.get("stablefordScore"),
  });
  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("scores")
    .update({
      played_on: parsed.data.playedOn,
      stableford_score: parsed.data.stablefordScore,
    })
    .eq("id", scoreId)
    .eq("user_id", user.id);

  if (error) return;
  redirect("/dashboard/scores");
}

export default async function EditScorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireActiveSubscription();
  const user = await requireUser();
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: score } = await supabase
    .from("scores")
    .select("id, played_on, stableford_score")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!score) return notFound();

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-xl px-6 py-14">
        <Link
          href="/dashboard/scores"
          className="text-sm text-zinc-300 hover:text-white"
        >
          ← Scores
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">Edit score</h1>

        <form
          action={updateScore.bind(null, score.id)}
          className="mt-8 grid gap-3 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
        >
          <div>
            <label className="text-xs font-medium text-zinc-200" htmlFor="playedOn">
              Date
            </label>
            <input
              id="playedOn"
              name="playedOn"
              type="date"
              required
              defaultValue={String(score.played_on)}
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
              defaultValue={Number(score.stableford_score)}
              className="mt-1 h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </div>
          <button className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

