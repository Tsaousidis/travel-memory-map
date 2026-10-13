"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteTrip, updateTrip } from "@/features/trips/actions";
import type { TripFormState } from "@/features/trips/validation";

type Country = { code: string; name: string };
type Trip = {
  id: string;
  title: string;
  primary_country_code: string;
  start_date: string;
  end_date: string;
  description: string;
};

const initialState: TripFormState = {};

export function EditTripForm({ trip, countries }: { trip: Trip; countries: Country[] }) {
  const [state, formAction, pending] = useActionState(updateTrip, initialState);
  const [deleteState, deleteAction, deleting] = useActionState(deleteTrip, initialState);

  return (
    <div className="edit-trip-layout">
      <form className="create-trip-form" action={formAction}>
        <input type="hidden" name="tripId" value={trip.id} />
        <div className="form-grid">
          <Input label="Trip title" name="title" defaultValue={trip.title} required error={state.fields?.title} />
          <div className="field">
            <label htmlFor="countryCode">Primary country <span aria-hidden="true">*</span></label>
            <select className="input" id="countryCode" name="countryCode" defaultValue={trip.primary_country_code} required aria-invalid={state.fields?.countryCode ? true : undefined}>
              {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
            </select>
            {state.fields?.countryCode && <p className="field-error">{state.fields.countryCode}</p>}
          </div>
          <Input label="Start date" name="startDate" type="date" defaultValue={trip.start_date} required error={state.fields?.startDate} />
          <Input label="End date" name="endDate" type="date" defaultValue={trip.end_date} required error={state.fields?.endDate} />
        </div>
        <Input label="Description" name="description" defaultValue={trip.description} placeholder="A short description of the journey." error={state.fields?.description} />
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={pending}>Save changes</Button>
          <a className="button button--secondary" href="/app/trips">Cancel</a>
        </div>
      </form>
      <section className="danger-zone" aria-labelledby="delete-trip-heading">
        <p className="eyebrow">Danger zone</p>
        <h2 id="delete-trip-heading">Delete this trip</h2>
        <p className="mt-3 text-muted">This removes the trip and its places and photos. Reusable cities are kept.</p>
        <form action={deleteAction} onSubmit={(event) => {
          if (!window.confirm("Delete this trip permanently?")) event.preventDefault();
        }}>
          <input type="hidden" name="tripId" value={trip.id} />
          {deleteState.error && <p className="form-error" role="alert">{deleteState.error}</p>}
          <Button type="submit" variant="danger" loading={deleting}>Delete trip</Button>
        </form>
      </section>
    </div>
  );
}
