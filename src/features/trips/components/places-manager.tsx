"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPlace, deletePlace, updatePlace } from "@/features/trips/actions";
import type { PlaceFormState } from "@/features/trips/validation";

const categories = [
  ["landmark", "Landmark"],
  ["nature", "Nature"],
  ["museum", "Museum"],
  ["food", "Food"],
  ["neighborhood", "Neighborhood"],
  ["other", "Other"],
];

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
  return (
    <div className="field">
      <label htmlFor="category">Category <span aria-hidden="true">*</span></label>
      <select className="input" id="category" name="category" defaultValue={defaultValue ?? "other"} required aria-invalid={error ? true : undefined}>
        {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function PlaceFields({ cities, place, state }: { cities: City[]; place?: Place; state: PlaceFormState }) {
  return (
    <>
      <div className="form-grid">
        <Input label="Place name" name="name" defaultValue={place?.name} placeholder="Fushimi Inari" required error={state.fields?.name} />
        <div className="field">
          <label htmlFor="tripCityId">City <span aria-hidden="true">*</span></label>
          <select className="input" id="tripCityId" name="tripCityId" defaultValue={place?.tripCityId ?? cities[0]?.tripCityId ?? ""} required aria-invalid={state.fields?.tripCityId ? true : undefined}>
            {cities.map((city) => <option key={city.tripCityId} value={city.tripCityId}>{city.name}</option>)}
          </select>
          {state.fields?.tripCityId && <p className="field-error">{state.fields.tripCityId}</p>}
        </div>
        <CategoryField defaultValue={place?.category} error={state.fields?.category} />
        <Input label="Visited on" name="visitedOn" type="date" defaultValue={place?.visitedOn ?? undefined} error={state.fields?.visitedOn} />
        <Input label="Latitude" name="latitude" type="number" step="any" defaultValue={place ? String(place.latitude) : ""} placeholder="35.3405" required error={state.fields?.latitude} />
        <Input label="Longitude" name="longitude" type="number" step="any" defaultValue={place ? String(place.longitude) : ""} placeholder="136.7794" required error={state.fields?.longitude} />
      </div>
      <div className="field">
        <label htmlFor="place-notes">Notes</label>
        <textarea className="input" id="place-notes" name="notes" defaultValue={place?.notes} rows={4} placeholder="What do you remember about this place?" aria-invalid={state.fields?.notes ? true : undefined} />
        {state.fields?.notes && <p className="field-error">{state.fields.notes}</p>}
      </div>
    </>
  );
}

function EditPlace({ tripId, cities, place }: { tripId: string; cities: City[]; place: Place }) {
  const [state, formAction, pending] = useActionState(updatePlace, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deletePlace, initialState);

  return (
    <li className="place-management-item">
      <details>
        <summary><strong>{place.name}</strong><span>{place.cityName} · {place.category}</span></summary>
        <form className="place-form" action={formAction}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="placeId" value={place.id} />
          <PlaceFields cities={cities} place={place} state={state} />
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" loading={pending}>Save place</Button>
            <Button type="submit" formAction={deleteAction} variant="danger" loading={deleting} onClick={(event) => {
              if (!window.confirm("Delete this place permanently?")) event.preventDefault();
            }}>Delete place</Button>
          </div>
          {deleteState.error && <p className="form-error" role="alert">{deleteState.error}</p>}
        </form>
      </details>
    </li>
  );
}

export function PlacesManager({ tripId, cities, places }: { tripId: string; cities: City[]; places: Place[] }) {
  const [state, formAction, pending] = useActionState(createPlace, initialState);

  return (
    <div className="places-manager">
      <form className="place-form" action={formAction}>
        <input type="hidden" name="tripId" value={tripId} />
        <PlaceFields cities={cities} state={state} />
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <Button type="submit" loading={pending} disabled={cities.length === 0}>Add place</Button>
      </form>
      {places.length > 0 && (
        <ul className="place-management-list">
          {places.map((place) => <EditPlace key={place.id} tripId={tripId} cities={cities} place={place} />)}
        </ul>
      )}
    </div>
  );
}
