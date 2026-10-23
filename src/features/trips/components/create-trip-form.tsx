"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTrip } from "@/features/trips/actions";
import type { TripFormState } from "@/features/trips/validation";

type Country = { code: string; name: string };
type CityRow = { name: string; latitude: string; longitude: string };
const initialState: TripFormState = {};

export type InitialTripValues = {
  title?: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  cities?: Array<{ name: string; latitude: string | number; longitude: string | number }>;
};

export function CreateTripForm({
  countries,
  initialValues,
}: {
  countries: Country[];
  initialValues?: InitialTripValues;
}) {
  const [state, formAction, pending] = useActionState(createTrip, initialState);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [countryCode, setCountryCode] = useState(initialValues?.countryCode ?? "");
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [cities, setCities] = useState<CityRow[]>(() => {
    if (initialValues?.cities && initialValues.cities.length > 0) {
      return initialValues.cities.map((city) => ({
        name: city.name,
        latitude: String(city.latitude),
        longitude: String(city.longitude),
      }));
    }
    return [{ name: "", latitude: "", longitude: "" }];
  });

  return (
    <form className="create-trip-form" action={formAction}>
      <div className="form-grid">
        <Input
          label="Trip title"
          name="title"
          placeholder="Japan 2025"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          error={state.fields?.title}
        />
        <div className="field">
          <label htmlFor="countryCode">
            Primary country <span aria-hidden="true">*</span>
          </label>
          <select
            className="input"
            id="countryCode"
            name="countryCode"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            required
            aria-invalid={state.fields?.countryCode ? true : undefined}
          >
            <option value="" disabled>Select a country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </select>
          {state.fields?.countryCode && <p className="field-error">{state.fields.countryCode}</p>}
        </div>
        <Input
          label="Start date"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
          error={state.fields?.startDate}
        />
        <Input
          label="End date"
          name="endDate"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
          error={state.fields?.endDate}
        />
      </div>
      <Input
        label="Description"
        name="description"
        placeholder="A short description of the journey."
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        error={state.fields?.description}
      />
      <fieldset className="city-fields">
        <legend className="eyebrow">Cities</legend>
        <p className="field-hint">Add the cities included in this trip and their map coordinates.</p>
        {cities.map((city, index) => (
          <div className="city-row" key={index}>
            <Input
              label={`City ${index + 1}`}
              value={city.name}
              onChange={(event) =>
                setCities((items) =>
                  items.map((item, i) => (i === index ? { ...item, name: event.target.value } : item)),
                )
              }
              placeholder="Tokyo"
              required
            />
            <Input
              label="Latitude"
              value={city.latitude}
              onChange={(event) =>
                setCities((items) =>
                  items.map((item, i) => (i === index ? { ...item, latitude: event.target.value } : item)),
                )
              }
              placeholder="35.6762"
              type="number"
              step="any"
              required
            />
            <Input
              label="Longitude"
              value={city.longitude}
              onChange={(event) =>
                setCities((items) =>
                  items.map((item, i) => (i === index ? { ...item, longitude: event.target.value } : item)),
                )
              }
              placeholder="139.6503"
              type="number"
              step="any"
              required
            />
            {cities.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCities((items) => items.filter((_, i) => i !== index))}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        {state.fields?.cities && <p className="field-error">{state.fields.cities}</p>}
        <Button
          type="button"
          variant="secondary"
          onClick={() => setCities((items) => [...items, { name: "", latitude: "", longitude: "" }])}
        >
          Add another city
        </Button>
      </fieldset>
      <input
        type="hidden"
        name="cities"
        value={JSON.stringify(
          cities.map((city) => ({
            name: city.name,
            latitude: Number(city.latitude),
            longitude: Number(city.longitude),
          })),
        )}
      />
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <Button type="submit" loading={pending}>Create trip</Button>
    </form>
  );
}
