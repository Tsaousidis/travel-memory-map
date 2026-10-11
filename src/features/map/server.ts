import "server-only";

import { requireUser } from "@/features/auth/server";
import type { TripPin } from "@/features/map/types";

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

export async function getTripPins(): Promise<TripPin[]> {
  const { supabase } = await requireUser();
  const [
    { data: trips, error: tripsError },
    { data: tripCities, error: tripCitiesError },
    { data: cities, error: citiesError },
  ] = await Promise.all([
    supabase.from("trips").select("id, title, start_date, end_date"),
    supabase.from("trip_cities").select("trip_id, city_id"),
    supabase.from("cities").select("id, name, country_code, latitude, longitude"),
  ]);

  if (tripsError || tripCitiesError || citiesError) {
    throw new Error("Unable to load trip locations. Please try again.");
  }

  const tripsById = new Map((trips ?? []).map((trip) => [trip.id, trip]));
  const citiesById = new Map((cities ?? []).map((city) => [city.id, city]));

  return (tripCities ?? []).flatMap((tripCity) => {
    const trip = tripsById.get(tripCity.trip_id);
    const city = citiesById.get(tripCity.city_id);
    if (!trip || !city) {
      return [];
    }

    return [{
      id: `${trip.id}-${city.id}`,
      tripTitle: trip.title,
      cityName: city.name,
      countryCode: city.country_code,
      longitude: city.longitude,
      latitude: city.latitude,
      startDate: trip.start_date,
      endDate: trip.end_date,
    }];
  });
}
