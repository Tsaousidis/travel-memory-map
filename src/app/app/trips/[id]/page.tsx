import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getTripDetails } from "@/features/map/server";
import { TripMap } from "@/features/map/components/trip-map";
import { PlacesManager } from "@/features/trips/components/places-manager";
import { PhotoUploadForm } from "@/features/trips/components/photo-upload-form";
import { PhotoGallery } from "@/features/trips/components/photo-gallery";

export const metadata = { title: "Trip details | Travel Memory Map" };

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

function getTripDays(startDate: string, endDate: string) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1;
}

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripDetails(id);
  if (!trip) notFound();

  return (
    <section className="trip-details-page trip-details-editorial">
      <div className="trip-breadcrumbs">
        <Link href="/app/trips">Trips</Link>
        <span aria-hidden="true">/</span>
        <strong>{trip.title}</strong>
        <span aria-hidden="true">/</span>
        <span>{trip.cities.map((city) => city.name).join(", ") || trip.countryName}</span>
      </div>
      <div className="trip-details-heading">
        <div className="trip-editorial-title">
          <p className="eyebrow">Field journal · {trip.countryName}</p>
          <h1>{trip.title}</h1>
          <div className="trip-meta-line">
            <span>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</span>
            <span aria-hidden="true">•</span>
            <span>{getTripDays(trip.startDate, trip.endDate)} days</span>
            <span aria-hidden="true">•</span>
            <span>{trip.cities.length} {trip.cities.length === 1 ? "city" : "cities"}</span>
            <span aria-hidden="true">•</span>
            <span>{trip.places.length} {trip.places.length === 1 ? "place" : "places"}</span>
            <span aria-hidden="true">•</span>
            <span className="trip-meta-highlight">{trip.photoCount} photos</span>
          </div>
        </div>
        <div className="trip-action-suite">
          <Link className="button button--secondary" href={`/app/trips/${trip.id}/edit`}>Edit details</Link>
          <a className="button button--primary" href="#photos">Upload photos</a>
        </div>
      </div>
      <div className="trip-memory-banner">
        <span className="trip-memory-mark" aria-hidden="true">“</span>
        <div>
          <p>{trip.notes || trip.description || "A journey worth remembering."}</p>
          <span className="eyebrow">A memory from your personal atlas</span>
        </div>
      </div>
      <dl className="trip-details-stats trip-editorial-stats">
        <div><dt>Dates</dt><dd>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</dd></div>
        <div><dt>Days away</dt><dd>{getTripDays(trip.startDate, trip.endDate)}</dd></div>
        <div><dt>Cities visited</dt><dd>{trip.cities.length}</dd></div>
        <div><dt>Places remembered</dt><dd>{trip.places.length}</dd></div>
        <div><dt>Photo memories</dt><dd>{trip.photoCount}</dd></div>
      </dl>
      <Card className="trip-map-card trip-editorial-map-card">
        <div className="trip-section-heading">
          <div>
            <p className="eyebrow">Geographic track</p>
            <h2>Places along the way</h2>
          </div>
          <span className="trip-section-count">{trip.cities.length} stops</span>
        </div>
        {trip.cities.length === 0 && trip.places.length === 0
          ? <p className="mt-4 text-muted">Add a city or place to see this trip on a map.</p>
          : <TripMap trip={trip} />}
      </Card>
      <div className="trip-details-grid">
        <Card className="trip-editorial-card">
          <div className="trip-section-heading">
            <div>
              <p className="eyebrow">Route</p>
              <h2>Cities visited</h2>
            </div>
          </div>
          {trip.cities.length === 0 ? <p className="mt-4 text-muted">No cities have been added yet.</p> : (
            <ol className="trip-route-list">
              {trip.cities.map((city, index) => <li key={city.id}><span className="trip-route-index">{String(index + 1).padStart(2, "0")}</span><strong>{city.name}</strong><span>{city.countryCode}</span></li>)}
            </ol>
          )}
        </Card>
        <Card className="places-card trip-editorial-card">
          <div className="trip-section-heading">
            <div>
              <p className="eyebrow">Waypoint log</p>
              <h2>Places remembered</h2>
            </div>
            <span className="trip-section-count">{trip.places.length}</span>
          </div>
          <PlacesManager tripId={trip.id} cities={trip.cities} places={trip.places} />
        </Card>
      </div>
      <Card className="trip-notes-card trip-editorial-card">
        <p className="eyebrow">Reflective writing</p>
        <h2>Memories</h2>
        <p className="mt-4 whitespace-pre-wrap text-muted">{trip.notes || "No notes have been added to this trip yet."}</p>
      </Card>
      <Card className="trip-editorial-card" id="photos">
        <div className="trip-section-heading">
          <div>
            <p className="eyebrow">Archival prints</p>
            <h2>Photo memories</h2>
          </div>
          <span className="trip-section-count">{trip.photoCount} curated {trip.photoCount === 1 ? "print" : "prints"}</span>
        </div>
        <p className="mt-4 text-muted">{trip.photoCount === 0 ? "Photos will appear here once you upload them." : `${trip.photoCount} photo${trip.photoCount === 1 ? "" : "s"} are attached to this trip.`}</p>
        <PhotoGallery tripId={trip.id} photos={trip.photos} />
        <PhotoUploadForm tripId={trip.id} places={trip.places} />
      </Card>
    </section>
  );
}
