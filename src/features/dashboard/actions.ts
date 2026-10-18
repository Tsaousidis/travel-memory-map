"use server";

import { requireUser } from "@/features/auth/server";

export type MemoryState = {
  memory?: {
    tripId: string;
    tripTitle: string;
    cityName: string | null;
    placeName: string | null;
    photoUrl: string | null;
    date: string | null;
  };
  error?: string;
};

export async function getRandomMemory(): Promise<MemoryState> {
  const { supabase } = await requireUser();
  const [
    { data: trips, error: tripsError },
    { data: places, error: placesError },
    { data: photos, error: photosError },
    { data: tripCities, error: tripCitiesError },
    { data: cities, error: citiesError },
  ] = await Promise.all([
    supabase.from("trips").select("id, title, start_date, end_date"),
    supabase.from("places").select("id, trip_id, name, visited_on, trip_city_id"),
    supabase.from("photos").select("trip_id, storage_path"),
    supabase.from("trip_cities").select("id, city_id"),
    supabase.from("cities").select("id, name"),
  ]);

  if (tripsError || placesError || photosError || tripCitiesError || citiesError) {
    return { error: "Unable to find a memory. Please try again." };
  }
  if (!trips?.length) return { error: "Add a trip first to discover a memory." };

  const trip = trips[Math.floor(Math.random() * trips.length)];
  const tripPlaces = (places ?? []).filter((place) => place.trip_id === trip.id);
  const place = tripPlaces.length ? tripPlaces[Math.floor(Math.random() * tripPlaces.length)] : null;
  const tripPhotos = (photos ?? []).filter((photo) => photo.trip_id === trip.id);
  const photo = tripPhotos.length ? tripPhotos[Math.floor(Math.random() * tripPhotos.length)] : null;
  const tripCity = place ? tripCities?.find((item) => item.id === place.trip_city_id) : null;
  const city = tripCity ? cities?.find((item) => item.id === tripCity.city_id) : null;
  let photoUrl: string | null = null;

  if (photo) {
    const { data, error } = await supabase.storage.from("travel-photos").createSignedUrl(photo.storage_path, 3600);
    if (error) return { error: "Unable to load the memory photo. Please try again." };
    photoUrl = data.signedUrl;
  }

  return {
    memory: {
      tripId: trip.id,
      tripTitle: trip.title,
      cityName: city?.name ?? null,
      placeName: place?.name ?? null,
      photoUrl,
      date: place?.visited_on ?? trip.start_date,
    },
  };
}
