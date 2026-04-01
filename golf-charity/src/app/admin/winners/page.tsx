import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminWinnersPage() {
  const supabase = await createSupabaseServerClient();
  
  // Note: Winner logic requires querying the draws, tickets, and user proof uploads.
  // For the UI placeholder, we fetch pending proofs.
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Winner Verification</h1>
      </div>

      <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10">
        <p className="text-sm text-zinc-400 mb-6">Review uploaded screenshots of winning Stableford cards and approve payouts.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-white/10 text-xs font-semibold text-white">
              <tr>
                <th className="pb-3 px-2">User</th>
                <th className="pb-3 px-2">Prize Tier</th>
                <th className="pb-3 px-2">Match Type</th>
                <th className="pb-3 px-2">Amount</th>
                <th className="pb-3 px-2">Proof</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-8 text-center text-zinc-500 italic" colSpan={6}>No pending winner verifications...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
