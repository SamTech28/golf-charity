"use client";

import { useTransition } from "react";
import { toast } from "sonner";

export function PortalButton() {
  const [pending, start] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const res = await fetch("/api/stripe/portal", { method: "POST" });
            const json = (await res.json()) as { url?: string; error?: string };
            if (!res.ok) throw new Error(json.error ?? "Failed to open portal.");
            if (!json.url) throw new Error("Missing portal URL.");
            window.location.href = json.url;
          } catch (e) {
            toast.error((e as Error).message);
          }
        })
      }
      className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/5 disabled:opacity-60"
    >
      {pending ? "Opening…" : "Billing portal"}
    </button>
  );
}

