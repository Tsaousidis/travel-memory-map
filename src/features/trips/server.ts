import "server-only";

import { requireUser } from "@/features/auth/server";

export async function getCountries() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("countries").select("code, name").order("name");
  if (error) throw new Error("Unable to load countries. Please try again.");
  return data ?? [];
}
