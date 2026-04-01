import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: charity } = await supabase
    .from("charities")
    .select(
      "id, name, short_description, description, cover_image_url, gallery_image_urls, upcoming_events, tags",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!charity) return notFound();

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-4xl px-6 py-14">
        <div className="flex items-center justify-between gap-4">
          <Link href="/charities" className="text-sm text-zinc-300 hover:text-white">
            ← Charities
          </Link>
          <Link
            href="/subscribe"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
          >
            Subscribe
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
          <div className="relative h-56 bg-zinc-900/60">
            {charity.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                src={charity.cover_image_url}
                className="h-full w-full object-cover opacity-85"
              />
            ) : null}
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-semibold tracking-tight">
              {charity.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              {charity.short_description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {((charity.tags as string[]) ?? []).map((t: string) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-zinc-200 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>

            {charity.description ? (
              <div className="mt-8 text-sm leading-7 text-zinc-200">
                {charity.description}
              </div>
            ) : null}

            {Array.isArray(charity.upcoming_events) &&
            charity.upcoming_events.length > 0 ? (
              <div className="mt-10">
                <div className="text-sm font-semibold text-white">
                  Upcoming events
                </div>
                <div className="mt-3 grid gap-3">
                  {(charity.upcoming_events as Array<any>).slice(0, 5).map((e, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-zinc-900/40 p-4 text-sm text-zinc-200 ring-1 ring-white/10"
                    >
                      {typeof e === "string" ? e : JSON.stringify(e)}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(charity.gallery_image_urls) &&
            charity.gallery_image_urls.length > 0 ? (
              <div className="mt-10">
                <div className="text-sm font-semibold text-white">Gallery</div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(charity.gallery_image_urls as string[]).slice(0, 6).map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={u}
                      alt=""
                      src={u}
                      className="aspect-square w-full rounded-2xl object-cover ring-1 ring-white/10"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

