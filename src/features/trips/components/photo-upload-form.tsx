"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { uploadPhoto } from "@/features/trips/actions";
import type { PhotoFormState } from "@/features/trips/validation";

type Place = { id: string; name: string; cityName: string };
const initialState: PhotoFormState = {};

export function PhotoUploadForm({ tripId, places }: { tripId: string; places: Place[] }) {
  const [state, formAction, pending] = useActionState(uploadPhoto, initialState);

  return (
    <form className="photo-upload-form" action={formAction}>
      <input type="hidden" name="tripId" value={tripId} />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="photo">Photo <span aria-hidden="true">*</span></label>
          <input className="input" id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          <p className="field-hint">JPEG, PNG, WebP, or GIF up to 10 MB.</p>
        </div>
        <div className="field">
          <label htmlFor="photo-place">Place</label>
          <select className="input" id="photo-place" name="placeId" defaultValue="">
            <option value="">No specific place</option>
            {places.map((place) => <option key={place.id} value={place.id}>{place.name} · {place.cityName}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="photo-caption">Caption</label>
        <textarea className="input" id="photo-caption" name="caption" rows={3} placeholder="A short note about this photo." />
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <Button type="submit" loading={pending}>Upload photo</Button>
    </form>
  );
}
