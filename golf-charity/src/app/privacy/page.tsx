import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-1px)] bg-zinc-950 text-zinc-50">
      <div className="mx-auto w-full max-w-3xl px-6 py-14">
        <Link href="/" className="text-sm text-zinc-300 hover:text-white">
          ← Back
        </Link>
        <h1 className="mt-8 text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-6 text-sm leading-7 text-zinc-200">
          This is a demo assignment build. Replace this page with your official
          privacy policy before production launch.
        </p>
      </div>
    </div>
  );
}

