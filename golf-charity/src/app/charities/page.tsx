import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q =
    typeof sp.q === "string" ? sp.q.trim() : Array.isArray(sp.q) ? sp.q[0] : "";
  const tag =
    typeof sp.tag === "string"
      ? sp.tag.trim()
      : Array.isArray(sp.tag)
        ? sp.tag[0]
        : "";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("charities")
    .select(
      "id, name, slug, short_description, tags, cover_image_url, is_featured",
    )
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: charities } = await query;

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm text-zinc-300 hover:text-white">
            ← Back
          </Link>
          <Link
            href="/subscribe"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
          >
            Subscribe
          </Link>
        </div>

        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          Charity directory
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300">
          Choose where your subscription makes impact. Minimum 10% goes to your
          selected charity — you can increase it anytime.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="/charities">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search charities…"
            className="h-11 flex-1 rounded-2xl bg-white/5 px-4 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-500 focus:ring-white/25"
          />
          <select
            name="tag"
            defaultValue={tag}
            className="h-11 rounded-2xl bg-white/5 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
          >
            <option value="">All tags</option>
            <option value="health">Health</option>
            <option value="children">Children</option>
            <option value="community">Community</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
          <button className="h-11 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Search
          </button>
        </form>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(charities ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/charities/${c.slug}`}
              className="group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 hover:bg-white/7"
            >
              <div className="relative h-36 bg-zinc-900/60">
                {c.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    src={c.cover_image_url}
                    className="h-full w-full object-cover opacity-80 transition group-hover:opacity-95"
                  />
                ) : null}
                {c.is_featured ? (
                  <div className="absolute left-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white ring-1 ring-white/15">
                    Featured
                  </div>
                ) : null}
              </div>
              <div className="p-6">
                <div className="text-base font-semibold text-white">{c.name}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300 line-clamp-3">
                  {c.short_description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {((c.tags as string[]) ?? []).slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {charities && charities.length === 0 ? (
            <div className="rounded-3xl bg-white/5 p-8 text-sm text-zinc-300 ring-1 ring-white/10 sm:col-span-2 lg:col-span-3">
              No charities found. Try a different search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

