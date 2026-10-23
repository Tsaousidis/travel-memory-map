"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { uploadPhoto } from "@/features/trips/actions";
import type { PhotoFormState } from "@/features/trips/validation";
import { useLanguage } from "@/lib/i18n/context";

type Place = { id: string; name: string; cityName: string };
const initialState: PhotoFormState = {};

export function PhotoUploadForm({ tripId, places }: { tripId: string; places: Place[] }) {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(uploadPhoto, initialState);

  return (
    <form className="photo-upload-form" action={formAction}>
      <input type="hidden" name="tripId" value={tripId} />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="photo">{t.photos.photoLabel} <span aria-hidden="true">*</span></label>
          <input className="input" id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          <p className="field-hint">{t.photos.photoHint}</p>
        </div>
        <div className="field">
          <label htmlFor="photo-place">{t.photos.placeLabel}</label>
          <select className="input" id="photo-place" name="placeId" defaultValue="">
            <option value="">{t.photos.noPlaceOption}</option>
            {places.map((place) => <option key={place.id} value={place.id}>{place.name} · {place.cityName}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="photo-caption">{t.photos.captionLabel}</label>
        <textarea className="input" id="photo-caption" name="caption" rows={3} placeholder={t.photos.captionPlaceholder} />
      </div>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <Button type="submit" loading={pending}>{t.photos.uploadPhoto}</Button>
    </form>
  );
}

