"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOwnProfile, requireUser } from "@/features/auth/server";
import { validateTripForm, type TripFormState } from "./validation";

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
