import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signUpAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect("/signup?error=Signup%20failed.");
  redirect("/dashboard");
}

export default async function SignupPage({
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
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="mt-2 text-sm text-zinc-300">
          Then choose a charity and start tracking scores.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
            {error}
          </div>
        ) : null}

        <form
          className="mt-8 space-y-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
          action={signUpAction}
        >
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-zinc-200"
              htmlFor="fullName"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-500 focus:ring-white/25"
              placeholder="Your name"
            />
          </div>
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
              minLength={8}
              className="h-11 w-full rounded-2xl bg-zinc-900/60 px-4 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-zinc-500 focus:ring-white/25"
              placeholder="At least 8 characters"
            />
          </div>
          <button className="h-11 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100">
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-300">
          Already have an account?{" "}
          <Link className="text-white underline underline-offset-4" href="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

