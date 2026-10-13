import "server-only";

import { requireUser } from "@/features/auth/server";
import type { PlacePin, TripPin, TripSummary } from "@/features/map/types";

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
    if (!trip || !city) return [];
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

export async function getPlacePins(): Promise<PlacePin[]> {
  const { supabase } = await requireUser();
  const [
    { data: places, error: placesError },
    { data: tripCities, error: tripCitiesError },
    { data: cities, error: citiesError },
    { data: trips, error: tripsError },
  ] = await Promise.all([
    supabase.from("places").select("id, trip_id, trip_city_id, name, category, latitude, longitude, visited_on"),
    supabase.from("trip_cities").select("id, city_id"),
    supabase.from("cities").select("id, name"),
    supabase.from("trips").select("id, title"),
  ]);

  if (placesError || tripCitiesError || citiesError || tripsError) {
    throw new Error("Unable to load places. Please try again.");
  }

  const tripCitiesById = new Map((tripCities ?? []).map((tripCity) => [tripCity.id, tripCity]));
  const citiesById = new Map((cities ?? []).map((city) => [city.id, city]));
  const tripsById = new Map((trips ?? []).map((trip) => [trip.id, trip]));

  return (places ?? []).flatMap((place) => {
    const tripCity = tripCitiesById.get(place.trip_city_id);
    const city = tripCity ? citiesById.get(tripCity.city_id) : undefined;
    const trip = tripsById.get(place.trip_id);
    if (!city || !trip) return [];
    return [{
      id: place.id,
      placeName: place.name,
      cityName: city.name,
      tripTitle: trip.title,
      category: place.category,
      longitude: place.longitude,
      latitude: place.latitude,
      visitedOn: place.visited_on,
    }];
  });
}

export async function getTripSummaries(): Promise<TripSummary[]> {
  const { supabase } = await requireUser();
  const [
    { data: trips, error: tripsError },
    { data: countries, error: countriesError },
    { data: tripCities, error: tripCitiesError },
    { data: places, error: placesError },
    { data: photos, error: photosError },
  ] = await Promise.all([
    supabase.from("trips").select("id, title, primary_country_code, start_date, end_date, description").order("start_date", { ascending: false }),
    supabase.from("countries").select("code, name"),
    supabase.from("trip_cities").select("trip_id"),
    supabase.from("places").select("trip_id"),
    supabase.from("photos").select("trip_id"),
  ]);

  if (tripsError || countriesError || tripCitiesError || placesError || photosError) {
    throw new Error("Unable to load your trips. Please try again.");
  }

  const countryNames = new Map((countries ?? []).map((country) => [country.code, country.name]));
  const countByTrip = (rows: Array<{ trip_id: string }>) =>
    rows.reduce((counts, row) => counts.set(row.trip_id, (counts.get(row.trip_id) ?? 0) + 1), new Map<string, number>());
  const cityCounts = countByTrip(tripCities ?? []);
  const placeCounts = countByTrip(places ?? []);
  const photoCounts = countByTrip(photos ?? []);

  return (trips ?? []).map((trip) => ({
    id: trip.id,
    title: trip.title,
    countryName: countryNames.get(trip.primary_country_code) ?? trip.primary_country_code,
    startDate: trip.start_date,
    endDate: trip.end_date,
    description: trip.description,
    cityCount: cityCounts.get(trip.id) ?? 0,
    placeCount: placeCounts.get(trip.id) ?? 0,
    photoCount: photoCounts.get(trip.id) ?? 0,
  }));
}
