import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient();
  
  // Join users with their subscriptions
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      created_at,
      subscriptions (
        status,
        plan_interval,
        current_period_end
      )
    `)
    .order("created_at", { ascending: false });

  if (error) console.error(error);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Users & Subscriptions</h1>
      </div>

      <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 text-xs font-semibold text-white">
              <tr>
                <th className="pb-3 px-2">Email</th>
                <th className="pb-3 px-2">Joined</th>
                <th className="pb-3 px-2">Sub Status</th>
                <th className="pb-3 px-2">Plan Details</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(users ?? []).map((u) => {
                const sub = (u.subscriptions as any)?.[0];
                return (
                  <tr key={u.id}>
                    <td className="py-4 px-2 font-medium text-white">{u.email}</td>
                    <td className="py-4 px-2">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium \${sub?.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                        {sub?.status || "inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-zinc-400">
                      {sub?.plan_interval ? `${sub.plan_interval} (renews ${new Date(sub.current_period_end).toLocaleDateString()})` : "—"}
                    </td>
                    <td className="py-4 px-2 text-right">
                      <button disabled className="opacity-50 text-xs text-zinc-500">
                        View profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users && users.length === 0 && (
            <p className="mt-6 text-sm text-zinc-400 text-center">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
