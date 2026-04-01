import Link from "next/link";
import { z } from "zod";
import { requireActiveSubscription } from "@/lib/subscription";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const PrefSchema = z.object({
  charityId: z.string().uuid().nullable(),
  contributionPercent: z.coerce.number().min(10).max(100),
});

import { revalidatePath } from "next/cache";

async function savePreference(formData: FormData) {
  "use server";
  await requireActiveSubscription();
  const user = await requireUser();

  const parsed = PrefSchema.safeParse({
    charityId: formData.get("charityId") ? String(formData.get("charityId")) : null,
    contributionPercent: formData.get("contributionPercent"),
  });
  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("user_charity_preferences").upsert(
    {
      user_id: user.id,
      charity_id: parsed.data.charityId,
      contribution_percent: parsed.data.contributionPercent,
    },
    { onConflict: "user_id" },
  );
  
  revalidatePath("/dashboard/charity");
}

export default async function CharityPreferencePage() {
  await requireActiveSubscription();
  const user = await requireUser();

  const supabase = await createSupabaseServerClient();
  const [{ data: charities }, { data: pref }] = await Promise.all([
    supabase
      .from("charities")
      .select("id, name")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("user_charity_preferences")
      .select("charity_id, contribution_percent")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">
            ← Dashboard
          </Link>
          <Link
            href="/charities"
            className="text-sm font-semibold text-white underline underline-offset-4"
          >
            Browse charities
          </Link>
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Charity preference
        </h1>
        <p className="mt-2 text-sm leading-7 text-zinc-300">
          Select a charity to receive a portion of your subscription. Minimum is
          10%, but you can increase it anytime.
        </p>

        <form
          action={savePreference}
          className="mt-8 grid gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
        >
          <div className="grid gap-2">
            <label className="text-xs font-medium text-zinc-200" htmlFor="charityId">
              Selected charity
            </label>
            <select
              id="charityId"
              name="charityId"
              defaultValue={pref?.charity_id ?? ""}
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
            >
              <option value="">Choose…</option>
              {(charities ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-medium text-zinc-200"
              htmlFor="contributionPercent"
            >
              Contribution percentage (10–100)
            </label>
            <input
              id="contributionPercent"
              name="contributionPercent"
              type="number"
              min={10}
              max={100}
              step={0.5}
              defaultValue={Number(pref?.contribution_percent ?? 10)}
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </div>

          <button className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

