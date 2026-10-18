import "server-only";

import { requireUser } from "@/features/auth/server";

export type DashboardStats = {
  countriesVisited: number;
  citiesVisited: number;
  tripsCount: number;
  placesCount: number;
  photosCount: number;
  continentsVisited: number;
  percentageOfWorld: number;
  mostVisitedCountry: string | null;
  mostVisitedCity: string | null;
  longestTrip: { title: string; days: number } | null;
  tripsPerYear: Array<{ year: string; count: number }>;
};

function tripDays(startDate: string, endDate: string) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase } = await requireUser();
  const [
    { data: trips, error: tripsError },
    { data: countries, error: countriesError },
    { data: tripCities, error: tripCitiesError },
    { data: cities, error: citiesError },
    { data: places, error: placesError },
    { data: photos, error: photosError },
  ] = await Promise.all([
    supabase.from("trips").select("title, primary_country_code, start_date, end_date"),
    supabase.from("countries").select("code, name, continent_code"),
    supabase.from("trip_cities").select("city_id"),
    supabase.from("cities").select("id, name, country_code"),
    supabase.from("places").select("id"),
    supabase.from("photos").select("id"),
  ]);

  if (tripsError || countriesError || tripCitiesError || citiesError || placesError || photosError) {
    throw new Error("Unable to load dashboard statistics. Please try again.");
  }

  const countryByCode = new Map((countries ?? []).map((country) => [country.code, country]));
  const cityById = new Map((cities ?? []).map((city) => [city.id, city]));
  const visitedCountryCodes = new Set<string>();
  const countryVisits = new Map<string, number>();
  const cityVisits = new Map<string, number>();

  for (const trip of trips ?? []) {
    visitedCountryCodes.add(trip.primary_country_code);
    countryVisits.set(trip.primary_country_code, (countryVisits.get(trip.primary_country_code) ?? 0) + 1);
  }
  for (const tripCity of tripCities ?? []) {
    const city = cityById.get(tripCity.city_id);
    if (!city) continue;
    visitedCountryCodes.add(city.country_code);
    countryVisits.set(city.country_code, (countryVisits.get(city.country_code) ?? 0) + 1);
    cityVisits.set(city.id, (cityVisits.get(city.id) ?? 0) + 1);
  }

  const mostVisited = <T extends { count: number }>(items: T[]) =>
    items.sort((a, b) => b.count - a.count)[0];
  const topCountry = mostVisited(Array.from(countryVisits, ([code, count]) => ({ code, count })));
  const topCity = mostVisited(Array.from(cityVisits, ([id, count]) => ({ id, count })));
  const longestTrip = (trips ?? [])
    .map((trip) => ({ title: trip.title, days: tripDays(trip.start_date, trip.end_date) }))
    .sort((a, b) => b.days - a.days)[0] ?? null;
  const yearCounts = new Map<string, number>();
  for (const trip of trips ?? []) {
    const year = trip.start_date.slice(0, 4);
    yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1);
  }
  const continentCodes = new Set(
    Array.from(visitedCountryCodes)
      .map((code) => countryByCode.get(code)?.continent_code)
      .filter((code): code is string => Boolean(code)),
  );

  return {
    countriesVisited: visitedCountryCodes.size,
    citiesVisited: cityVisits.size,
    tripsCount: trips?.length ?? 0,
    placesCount: places?.length ?? 0,
    photosCount: photos?.length ?? 0,
    continentsVisited: continentCodes.size,
    percentageOfWorld: countries?.length ? Math.round((visitedCountryCodes.size / countries.length) * 1000) / 10 : 0,
    mostVisitedCountry: topCountry ? countryByCode.get(topCountry.code)?.name ?? topCountry.code : null,
    mostVisitedCity: topCity ? cityById.get(topCity.id)?.name ?? null : null,
    longestTrip,
    tripsPerYear: Array.from(yearCounts, ([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year)),
  };
}
