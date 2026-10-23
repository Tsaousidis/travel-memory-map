"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPlace, deletePlace, updatePlace } from "@/features/trips/actions";
import type { PlaceFormState } from "@/features/trips/validation";
import { useLanguage } from "@/lib/i18n/context";

type City = { id: string; tripCityId: string; name: string };
type Place = {
  id: string;
  tripCityId: string;
  name: string;
  category: string;
  cityName: string;
  latitude: number;
  longitude: number;
  visitedOn: string | null;
  notes: string;
};

const initialState: PlaceFormState = {};

function CategoryField({ defaultValue, error }: { defaultValue?: string; error?: string }) {
  const { t } = useLanguage();

  const categories: Array<[string, string]> = [
    ["landmark", t.places.categories.landmark],
    ["nature", t.places.categories.nature],
    ["museum", t.places.categories.museum],
    ["food", t.places.categories.food],
    ["neighborhood", t.places.categories.neighborhood],
    ["other", t.places.categories.other],
  ];

  return (
    <div className="field">
      <label htmlFor="category">{t.places.category} <span aria-hidden="true">*</span></label>
      <select className="input" id="category" name="category" defaultValue={defaultValue ?? "other"} required aria-invalid={error ? true : undefined}>
        {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function PlaceFields({ cities, place, state }: { cities: City[]; place?: Place; state: PlaceFormState }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="form-grid">
        <Input label={t.places.placeName} name="name" defaultValue={place?.name} placeholder={t.places.placePlaceholder} required error={state.fields?.name} />
        <div className="field">
          <label htmlFor="tripCityId">{t.places.city} <span aria-hidden="true">*</span></label>
          <select className="input" id="tripCityId" name="tripCityId" defaultValue={place?.tripCityId ?? cities[0]?.tripCityId ?? ""} required aria-invalid={state.fields?.tripCityId ? true : undefined}>
            {cities.map((city) => <option key={city.tripCityId} value={city.tripCityId}>{city.name}</option>)}
          </select>
          {state.fields?.tripCityId && <p className="field-error">{state.fields.tripCityId}</p>}
        </div>
        <CategoryField defaultValue={place?.category} error={state.fields?.category} />
        <Input label={t.places.visitedOn} name="visitedOn" type="date" defaultValue={place?.visitedOn ?? undefined} error={state.fields?.visitedOn} />
        <Input label={t.places.latitude} name="latitude" type="number" step="any" defaultValue={place ? String(place.latitude) : ""} placeholder="35.3405" required error={state.fields?.latitude} />
        <Input label={t.places.longitude} name="longitude" type="number" step="any" defaultValue={place ? String(place.longitude) : ""} placeholder="136.7794" required error={state.fields?.longitude} />
      </div>
      <div className="field">
        <label htmlFor="place-notes">{t.places.notes}</label>
        <textarea className="input" id="place-notes" name="notes" defaultValue={place?.notes} rows={4} placeholder={t.places.notesPlaceholder} aria-invalid={state.fields?.notes ? true : undefined} />
        {state.fields?.notes && <p className="field-error">{state.fields.notes}</p>}
      </div>
    </>
  );
}

function EditPlace({ tripId, cities, place }: { tripId: string; cities: City[]; place: Place }) {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(updatePlace, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deletePlace, initialState);

  const categoryLabel = t.places.categories[place.category as keyof typeof t.places.categories] || place.category;

  return (
    <li className="place-management-item">
      <details>
        <summary><strong>{place.name}</strong><span>{place.cityName} · {categoryLabel}</span></summary>
        <form className="place-form" action={formAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="placeId" value={place.id} />
          <PlaceFields cities={cities} place={place} state={state} />
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={pending}>{t.places.savePlace}</Button>
            <Button type="submit" formAction={deleteAction} variant="danger" loading={deleting} onClick={(event) => {
              if (!window.confirm(t.places.confirmDelete)) event.preventDefault();
            }}>{t.places.deletePlace}</Button>
          </div>
          {deleteState.error && <p className="form-error" role="alert">{deleteState.error}</p>}
        </form>
      </details>
    </li>
  );
}

export function PlacesManager({ tripId, cities, places }: { tripId: string; cities: City[]; places: Place[] }) {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(createPlace, initialState);

  return (
    <div className="places-manager">
      <form className="place-form" action={formAction}>
        <input type="hidden" name="tripId" value={tripId} />
        <PlaceFields cities={cities} state={state} />
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <Button type="submit" loading={pending} disabled={cities.length === 0}>{t.places.addPlace}</Button>
      </form>
      {places.length > 0 && (
        <ul className="place-management-list">
          {places.map((place) => <EditPlace key={place.id} tripId={tripId} cities={cities} place={place} />)}
        </ul>
      )}
    </div>
  );
}

