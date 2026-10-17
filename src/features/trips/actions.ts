"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOwnProfile, requireUser } from "@/features/auth/server";
import { validatePlaceForm, validateTripDetails, validateTripForm, type PhotoFormState, type PlaceFormState, type TripFormState } from "./validation";

const PHOTO_BUCKET = "travel-photos";
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function createTrip(_previous: TripFormState, form: FormData): Promise<TripFormState> {
  const values = validateTripForm(form);
  if (!values.valid) return { error: "Check the highlighted fields.", fields: values.fields };

  const { supabase, user } = await requireUser();
  await getOwnProfile();
  const { data: trip, error: tripError } = await supabase.from("trips").insert({
    user_id: user.id,
    title: values.title,
    primary_country_code: values.countryCode,
    start_date: values.startDate,
    end_date: values.endDate,
    description: values.description,
  }).select("id").single();

  if (tripError || !trip) return { error: "Unable to create the trip. Please try again." };

  const createdCityIds: string[] = [];
  const fail = async (message: string): Promise<TripFormState> => {
    await supabase.from("trips").delete().eq("id", trip.id);
    for (const cityId of createdCityIds) {
      await supabase.from("cities").delete().eq("id", cityId);
    }
    return { error: message };
  };

  for (const [index, cityInput] of values.cities.entries()) {
    const { data: existingCity, error: cityReadError } = await supabase.from("cities")
      .select("id").eq("user_id", user.id).eq("country_code", values.countryCode)
      .ilike("name", cityInput.name).eq("region", "").maybeSingle();
    if (cityReadError) return fail("Unable to save the trip cities. Please try again.");

    let cityId = existingCity?.id;
    if (!cityId) {
      const { data: city, error: cityError } = await supabase.from("cities").insert({
        user_id: user.id,
        country_code: values.countryCode,
        name: cityInput.name,
        latitude: cityInput.latitude,
        longitude: cityInput.longitude,
      }).select("id").single();
      if (cityError || !city) return fail("Unable to save the trip cities. Please try again.");
      cityId = city.id;
      createdCityIds.push(city.id);
    }

    const { error: linkError } = await supabase.from("trip_cities").insert({
      user_id: user.id,
      trip_id: trip.id,
      city_id: cityId,
      sort_order: index,
    });
    if (linkError) return fail("Unable to finish the trip. Please try again.");
  }

  revalidatePath("/app");
  revalidatePath("/app/trips");
  redirect("/app/trips");
}

export async function updateTrip(_previous: TripFormState, form: FormData): Promise<TripFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  const values = validateTripDetails(form);
  if (!tripId || !values.valid) return { error: "Check the highlighted fields.", fields: values.fields };

  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("trips").update({
    title: values.title,
    primary_country_code: values.countryCode,
    start_date: values.startDate,
    end_date: values.endDate,
    description: values.description,
  }).eq("id", tripId).select("id").maybeSingle();

  if (error || !data) return { error: "Unable to update the trip. Please try again." };

  revalidatePath("/app");
  revalidatePath("/app/trips");
  revalidatePath(`/app/trips/${tripId}/edit`);
  redirect("/app/trips");
}

export async function deleteTrip(_previous: TripFormState, form: FormData): Promise<TripFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  if (!tripId) return { error: "Unable to delete the trip. Please try again." };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) return { error: "Unable to delete the trip. Please try again." };

  revalidatePath("/app");
  revalidatePath("/app/trips");
  redirect("/app/trips");
}

export async function createPlace(_previous: PlaceFormState, form: FormData): Promise<PlaceFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  const values = validatePlaceForm(form);
  if (!tripId || !values.valid) return { error: "Check the highlighted fields.", fields: values.fields };

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("places").insert({
    user_id: user.id,
    trip_id: tripId,
    trip_city_id: values.tripCityId,
    name: values.name,
    category: values.category,
    latitude: values.latitude,
    longitude: values.longitude,
    visited_on: values.visitedOn || null,
    notes: values.notes,
  });
  if (error) return { error: "Unable to create the place. Please try again." };

  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
  redirect(`/app/trips/${tripId}`);
}

export async function updatePlace(_previous: PlaceFormState, form: FormData): Promise<PlaceFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  const placeId = String(form.get("placeId") ?? "").trim();
  const values = validatePlaceForm(form);
  if (!tripId || !placeId || !values.valid) return { error: "Check the highlighted fields.", fields: values.fields };

  const { supabase } = await requireUser();
  const { data, error } = await supabase.from("places").update({
    trip_city_id: values.tripCityId,
    name: values.name,
    category: values.category,
    latitude: values.latitude,
    longitude: values.longitude,
    visited_on: values.visitedOn || null,
    notes: values.notes,
  }).eq("id", placeId).eq("trip_id", tripId).select("id").maybeSingle();
  if (error || !data) return { error: "Unable to update the place. Please try again." };

  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
  redirect(`/app/trips/${tripId}`);
}

export async function deletePlace(_previous: PlaceFormState, form: FormData): Promise<PlaceFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  const placeId = String(form.get("placeId") ?? "").trim();
  if (!tripId || !placeId) return { error: "Unable to delete the place. Please try again." };

  const { supabase } = await requireUser();
  const { error } = await supabase.from("places").delete().eq("id", placeId).eq("trip_id", tripId);
  if (error) return { error: "Unable to delete the place. Please try again." };

  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
  redirect(`/app/trips/${tripId}`);
}

export async function uploadPhoto(_previous: PhotoFormState, form: FormData): Promise<PhotoFormState> {
  const tripId = String(form.get("tripId") ?? "").trim();
  const placeId = String(form.get("placeId") ?? "").trim();
  const caption = String(form.get("caption") ?? "").trim();
  const fileValue = form.get("photo");

  if (!tripId) return { error: "Unable to identify the trip. Please try again." };
  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(fileValue.type)) {
    return { error: "Use a JPEG, PNG, WebP, or GIF image." };
  }
  if (fileValue.size > MAX_PHOTO_SIZE) {
    return { error: "Images must be 10 MB or smaller." };
  }
  if (caption.length > 2000) return { error: "Use 2,000 characters or fewer for the caption." };

  const { supabase, user } = await requireUser();
  const extension = fileValue.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${user.id}/${tripId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from(PHOTO_BUCKET).upload(storagePath, fileValue, {
    contentType: fileValue.type,
    upsert: false,
  });
  if (uploadError) return { error: "Unable to upload the photo. Please try again." };

  const { error: photoError } = await supabase.from("photos").insert({
    user_id: user.id,
    trip_id: tripId,
    place_id: placeId || null,
    storage_path: storagePath,
    caption,
  });
  if (photoError) {
    const { error: cleanupError } = await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    if (cleanupError) console.error("Photo storage cleanup failed after metadata insert failure.", cleanupError);
    return { error: "Unable to save the photo metadata. Please try again." };
  }

  revalidatePath(`/app/trips/${tripId}`);
  revalidatePath("/app");
  redirect(`/app/trips/${tripId}`);
}
