import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  const navigation = [
    { name: "Overview", href: "/admin" },
    { name: "Users & Subscriptions", href: "/admin/users" },
    { name: "Draw Management", href: "/admin/draws" },
    { name: "Charities", href: "/admin/charities" },
    { name: "Winners Verification", href: "/admin/winners" },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-zinc-950 text-zinc-50">
      <aside className="w-full lg:w-64 flex-shrink-0 border-b lg:border-r border-white/10 p-6">
        <div className="mb-8 font-semibold text-white tracking-tight">Admin Console</div>
        <nav className="flex flex-col gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="mt-8 text-xs text-zinc-500 hover:text-white"
          >
            ← Back to App
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-12">
        {children}
      </main>
    </div>
  );
}
