import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
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

        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-4 max-w-2xl text-base text-zinc-300">
          Choose monthly flexibility or a discounted yearly plan. A fixed portion
          goes to the prize pool, and a minimum of 10% supports your chosen
          charity.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Monthly</div>
            <div className="mt-2 text-3xl font-semibold">
              ₹— <span className="text-base font-medium text-zinc-300">/mo</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-200">
              <li>Full dashboard access</li>
              <li>Enter & manage last 5 scores</li>
              <li>Monthly draw eligibility</li>
              <li>Charity allocation control</li>
            </ul>
            <Link
              href="/subscribe"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
            >
              Start monthly
            </Link>
          </div>
          <div className="rounded-3xl bg-white/5 p-7 ring-1 ring-white/10">
            <div className="text-sm font-semibold text-white">Yearly</div>
            <div className="mt-2 text-3xl font-semibold">
              ₹— <span className="text-base font-medium text-zinc-300">/yr</span>
            </div>
            <div className="mt-2 text-xs text-emerald-200">
              Discounted vs monthly
            </div>
            <ul className="mt-6 space-y-3 text-sm text-zinc-200">
              <li>Everything in Monthly</li>
              <li>Best value over 12 months</li>
              <li>Priority winner verification lane (future)</li>
            </ul>
            <Link
              href="/subscribe"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-100"
            >
              Start yearly
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

