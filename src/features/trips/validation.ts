export type TripFormState = {
  error?: string;
  fields?: Record<string, string>;
};

export type TripCityInput = {
  name: string;
  latitude: number;
  longitude: number;
};

export type PlaceFormState = {
  error?: string;
  fields?: Record<string, string>;
};

export type PhotoFormState = {
  error?: string;
  fields?: Record<string, string>;
};

const PLACE_CATEGORIES = ["landmark", "nature", "museum", "food", "neighborhood", "other"] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validatePlaceForm(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const tripCityId = String(form.get("tripCityId") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const latitude = Number(form.get("latitude"));
  const longitude = Number(form.get("longitude"));
  const visitedOn = String(form.get("visitedOn") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const fields: Record<string, string> = {};

  if (!name || name.length > 200) fields.name = "Use between 1 and 200 characters.";
  if (!tripCityId) fields.tripCityId = "Choose a city.";
  if (!PLACE_CATEGORIES.includes(category as typeof PLACE_CATEGORIES[number])) fields.category = "Choose a valid category.";
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) fields.latitude = "Use a latitude between -90 and 90.";
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) fields.longitude = "Use a longitude between -180 and 180.";
  if (visitedOn && !ISO_DATE.test(visitedOn)) fields.visitedOn = "Enter a valid date.";
  if (notes.length > 10000) fields.notes = "Use 10,000 characters or fewer.";

  return { name, tripCityId, category, latitude, longitude, visitedOn, notes, fields, valid: Object.keys(fields).length === 0 };
}

export function validateTripDetails(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const countryCode = String(form.get("countryCode") ?? "").trim().toUpperCase();
  const startDate = String(form.get("startDate") ?? "").trim();
  const endDate = String(form.get("endDate") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const fields: Record<string, string> = {};

  if (!title || title.length > 150) fields.title = "Use between 1 and 150 characters.";
  if (!/^[A-Z]{2}$/.test(countryCode)) fields.countryCode = "Choose a country.";
  if (!ISO_DATE.test(startDate)) fields.startDate = "Enter a valid start date.";
  if (!ISO_DATE.test(endDate)) fields.endDate = "Enter a valid end date.";
  if (ISO_DATE.test(startDate) && ISO_DATE.test(endDate) && endDate < startDate) {
    fields.endDate = "End date must be on or after the start date.";
  }
  if (description.length > 10000) fields.description = "Use 10,000 characters or fewer.";

  return { title, countryCode, startDate, endDate, description, fields, valid: Object.keys(fields).length === 0 };
}

export function validateTripForm(form: FormData) {
  const details = validateTripDetails(form);
  const fields = { ...details.fields };
  let cities: TripCityInput[] = [];

  try {
    const parsed = JSON.parse(String(form.get("cities") ?? "[]")) as unknown;
    if (!Array.isArray(parsed)) throw new Error();
    cities = parsed.map((city) => {
      if (!city || typeof city !== "object") throw new Error();
      const value = city as Record<string, unknown>;
      const name = typeof value.name === "string" ? value.name.trim() : "";
      const latitude = Number(value.latitude);
      const longitude = Number(value.longitude);
      if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error();
      return { name, latitude, longitude };
    });
  } catch {
    fields.cities = "Add at least one city with valid coordinates.";
  }

  if (cities.length === 0) fields.cities = "Add at least one city with valid coordinates.";
  if (cities.some((city) => city.name.length > 150 || city.latitude < -90 || city.latitude > 90 || city.longitude < -180 || city.longitude > 180)) {
    fields.cities = "Use valid city names and coordinates.";
  }

  return { ...details, cities, fields: { ...details.fields, ...fields }, valid: Object.keys({ ...details.fields, ...fields }).length === 0 };
}
