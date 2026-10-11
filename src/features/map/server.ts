import "server-only";

import { requireUser } from "@/features/auth/server";

export async function getVisitedCountryCodes() {
  const { supabase } = await requireUser();
  const [{ data: trips, error: tripsError }, { data: cities, error: citiesError }] =
    await Promise.all([
      supabase.from("trips").select("primary_country_code"),
      supabase.from("cities").select("country_code"),
    ]);

  if (tripsError || citiesError) {
    throw new Error("Unable to load visited countries. Please try again.");
  }

  return Array.from(new Set([
    ...(trips ?? []).map((trip) => trip.primary_country_code),
    ...(cities ?? []).map((city) => city.country_code),
  ]));
}
