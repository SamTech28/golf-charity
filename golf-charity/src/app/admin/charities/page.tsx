import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddCharitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
});

async function addCharity(formData: FormData) {
  "use server";
  const parsed = AddCharitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) return;

  const supabase = await createSupabaseServerClient();
  await supabase.from("charities").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    is_active: true,
  });
  revalidatePath("/admin/charities");
}

async function toggleCharityStatus(charityId: string, currentStatus: boolean) {
  "use server";
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("charities")
    .update({ is_active: !currentStatus })
    .eq("id", charityId);
  revalidatePath("/admin/charities");
}

export default async function CharitiesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Charity Management</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ADD CHARITY FORM */}
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Add Charity</h2>
          <form action={addCharity} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">Name</label>
              <input
                name="name"
                required
                className="mt-1 h-11 w-full rounded-xl bg-zinc-950 px-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                className="mt-1 w-full rounded-xl bg-zinc-950 p-4 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-white/25"
              />
            </div>
            <button className="w-full h-11 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-200">
              Add Charity
            </button>
          </form>
        </div>

        {/* LIST CHARITIES */}
        <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-white/10 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">Listed Charities</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="border-b border-white/10 text-xs font-semibold text-white">
                <tr>
                  <th className="pb-3 px-2">Name</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(charities ?? []).map((c) => (
                  <tr key={c.id}>
                    <td className="py-4 px-2 font-medium text-white">{c.name}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <form action={toggleCharityStatus.bind(null, c.id, Boolean(c.is_active))}>
                        <button className="text-xs font-medium text-zinc-400 hover:text-white underline outline-none">
                          Toggle Status
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
