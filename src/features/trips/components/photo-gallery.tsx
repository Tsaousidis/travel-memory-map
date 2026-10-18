"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { deletePhoto } from "@/features/trips/actions";
import type { PhotoFormState } from "@/features/trips/validation";

type Photo = { id: string; signedUrl: string; caption: string; placeName: string | null };
const initialState: PhotoFormState = {};

function PhotoItem({ tripId, photo }: { tripId: string; photo: Photo }) {
  const [state, formAction, pending] = useActionState(deletePhoto, initialState);
  return (
    <figure className="photo-gallery__item">
      {/* Signed Storage URLs are dynamic and may come from a project-specific host. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.signedUrl} alt={photo.caption || photo.placeName || "Trip memory"} />
      <figcaption>
        {photo.caption && <p>{photo.caption}</p>}
        {photo.placeName && <span>{photo.placeName}</span>}
        <form action={formAction} onSubmit={(event) => {
          if (!window.confirm("Delete this photo permanently?")) event.preventDefault();
        }}>
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="photoId" value={photo.id} />
          <Button type="submit" variant="danger" loading={pending}>Delete</Button>
        </form>
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
      </figcaption>
    </figure>
  );
}

export function PhotoGallery({ tripId, photos }: { tripId: string; photos: Photo[] }) {
  if (photos.length === 0) return <p className="mt-4 text-muted">Photos will appear here once you upload them.</p>;
  return <div className="photo-gallery">{photos.map((photo) => <PhotoItem key={photo.id} tripId={tripId} photo={photo} />)}</div>;
}
