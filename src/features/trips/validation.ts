export type TripFormState = {
  error?: string;
  fields?: Record<string, string>;
};

export type TripCityInput = {
  name: string;
  latitude: number;
  longitude: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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
