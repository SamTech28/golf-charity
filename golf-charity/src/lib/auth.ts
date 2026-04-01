import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

export const requireUser = cache(async () => {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
});

export const getMyRole = cache(async () => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return null;
  return (data?.role as "subscriber" | "admin" | undefined) ?? null;
});

export const requireAdmin = cache(async () => {
  const user = await requireUser();
  const role = await getMyRole();
  if (role !== "admin") redirect("/dashboard");
  return user;
});

