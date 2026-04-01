import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signInAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
        ? sp.error[0]
        : undefined;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-md flex-col px-6 py-14">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Continue to your dashboard.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
            {error}
          </div>
        ) : null}

        <form
          className="mt-8 space-y-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
          action={signInAction}
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-200" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-500 focus:ring-white/25"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-zinc-200"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-500 focus:ring-white/25"
              placeholder="••••••••"
            />
          </div>
          <button className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Sign in
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-300">
          New here?{" "}
          <Link className="text-white underline underline-offset-4" href="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

