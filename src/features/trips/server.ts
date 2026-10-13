import "server-only";

import { requireUser } from "@/features/auth/server";

export async function getCountries() {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("countries").select("code, name").order("name");
  if (error) throw new Error("Unable to load countries. Please try again.");
  return data ?? [];
}

export async function getTripForEdit(tripId: string) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("trips")
    .select("id, title, primary_country_code, start_date, end_date, description")
    .eq("id", tripId)
    .maybeSingle();
  if (error) throw new Error("Unable to load the trip. Please try again.");
  return data;
}
