import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">
          ← Back
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">
          How it works
        </h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-200">
          <p>
            Subscribe monthly or yearly, then enter your latest Stableford
            scores. We retain only your most recent five.
          </p>
          <p>
            Each month, the admin runs a draw (random or algorithmic). Your last
            five scores are compared against the five drawn numbers — matches
            determine prize tier (5, 4, or 3).
          </p>
          <p>
            A portion of subscriptions funds the prize pool, and at least 10%
            supports your chosen charity (you can increase this).
          </p>
        </div>
      </div>
    </div>
  );
}

