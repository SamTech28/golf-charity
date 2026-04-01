"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";

const demoMode =
  typeof process.env.NEXT_PUBLIC_DEMO_SUBSCRIPTION !== "undefined" &&
  process.env.NEXT_PUBLIC_DEMO_SUBSCRIPTION === "true";

async function activateDemoSubscription(interval: "month" | "year") {
  const res = await fetch("/api/demo/activate-subscription", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  let json: { ok?: boolean; error?: string } = {};
  try {
    json = (await res.json()) as { ok?: boolean; error?: string };
  } catch {
    // ignore
  }
  if (!res.ok) {
    throw new Error(json.error ?? "Demo activation failed.");
  }
  window.location.href = "/dashboard";
}

async function startCheckout(interval: "month" | "year") {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interval }),
  });

  let json: { url?: string; error?: string } = {};
  try {
    json = (await res.json()) as { url?: string; error?: string };
  } catch {
    // If backend crashes and returns non-JSON, show a clean error.
  }

  if (!res.ok) {
    throw new Error(
      json.error ?? "Checkout setup is incomplete. Please configure Stripe keys.",
    );
  }
  if (!json.url) throw new Error("Missing checkout URL.");
  window.location.href = json.url;
}

export default function SubscribePage() {
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<"month" | "year">("month");

  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-xl px-6 py-14">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">
          ← Back
        </Link>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight">
          Start your subscription
        </h1>
        <p className="mt-3 text-sm text-zinc-300">
          {demoMode
            ? "Use demo activation (no Stripe) for local testing, or Stripe checkout when configured."
            : "You’ll be redirected to Stripe checkout. After payment, your subscription status is validated on every authenticated request."}
        </p>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={() => setSelected("month")}
            className={[
              "rounded-3xl p-5 text-left ring-1 transition",
              selected === "month"
                ? "bg-white/10 ring-white/20"
                : "bg-white/5 ring-white/10 hover:bg-white/7",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-white">Monthly</div>
            <div className="mt-1 text-xs text-zinc-300">
              Flexible billing • Great to start
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelected("year")}
            className={[
              "rounded-3xl p-5 text-left ring-1 transition",
              selected === "year"
                ? "bg-white/10 ring-white/20"
                : "bg-white/5 ring-white/10 hover:bg-white/7",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-white">Yearly</div>
            <div className="mt-1 text-xs text-zinc-300">
              Discounted rate • Best value
            </div>
          </button>
        </div>

        {demoMode ? (
          <button
            disabled={pending}
            onClick={() =>
              start(async () => {
                try {
                  await activateDemoSubscription(selected);
                } catch (e) {
                  toast.error((e as Error).message);
                }
              })
            }
            className="mt-6 h-12 w-full rounded-2xl bg-emerald-400/90 text-sm font-semibold text-zinc-950 hover:bg-emerald-300 disabled:opacity-60"
          >
            {pending ? "Activating…" : "Activate demo subscription (no Stripe)"}
          </button>
        ) : null}

        <button
          disabled={pending}
          onClick={() =>
            start(async () => {
              try {
                await startCheckout(selected);
              } catch (e) {
                toast.error((e as Error).message);
              }
            })
          }
          className={`mt-3 h-12 w-full rounded-2xl bg-white text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-60 ${demoMode ? "" : "mt-6"}`}
        >
          {pending ? "Redirecting…" : "Continue to payment (Stripe)"}
        </button>

        <p className="mt-6 text-xs text-zinc-400">
          By subscribing, you agree to our{" "}
          <Link className="text-zinc-200 underline underline-offset-4" href="/terms">
            Terms
          </Link>{" "}
          and{" "}
          <Link
            className="text-zinc-200 underline underline-offset-4"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

