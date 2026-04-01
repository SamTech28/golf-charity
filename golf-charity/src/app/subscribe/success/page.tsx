import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-xl px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">You’re in.</h1>
        <p className="mt-3 text-sm text-zinc-300">
          Payment received. Your subscription status will update shortly after
          Stripe confirms it.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
          >
            Go to dashboard
          </Link>
          <Link
            href="/charities"
            className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/5"
          >
            Choose a charity
          </Link>
        </div>
      </div>
    </div>
  );
}

