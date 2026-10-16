import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getTripDetails } from "@/features/map/server";
import { TripMap } from "@/features/map/components/trip-map";
import { PlacesManager } from "@/features/trips/components/places-manager";

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
    <section className="trip-details-page">
      <p className="eyebrow mb-4">{trip.countryName}</p>
      <div className="trip-details-heading">
        <div>
          <h1 className="text-4xl sm:text-5xl">{trip.title}</h1>
          <p className="mt-5 max-w-2xl text-muted">{trip.description || "A journey worth remembering."}</p>
        </div>
        <a className="button button--secondary" href={`/app/trips/${trip.id}/edit`}>Edit trip</a>
      </div>
      <Card className="trip-map-card">
        <p className="eyebrow mb-4">Trip map</p>
        <h2>Places along the way</h2>
        {trip.cities.length === 0 && trip.places.length === 0
          ? <p className="mt-4 text-muted">Add a city or place to see this trip on a map.</p>
          : <TripMap trip={trip} />}
      </Card>
      <dl className="trip-details-stats">
        <div><dt>Dates</dt><dd>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</dd></div>
        <div><dt>Days</dt><dd>{getTripDays(trip.startDate, trip.endDate)}</dd></div>
        <div><dt>Cities</dt><dd>{trip.cities.length}</dd></div>
        <div><dt>Places</dt><dd>{trip.places.length}</dd></div>
        <div><dt>Photos</dt><dd>{trip.photoCount}</dd></div>
      </dl>
      <div className="trip-details-grid">
        <Card>
          <p className="eyebrow mb-4">Route</p>
          <h2>Cities visited</h2>
          {trip.cities.length === 0 ? <p className="mt-4 text-muted">No cities have been added yet.</p> : (
            <ul className="trip-details-list">
              {trip.cities.map((city) => <li key={city.id}><strong>{city.name}</strong><span>{city.countryCode}</span></li>)}
            </ul>
          )}
        </Card>
        <Card className="places-card">
          <p className="eyebrow mb-4">Places</p>
          <h2>Places remembered</h2>
          <PlacesManager tripId={trip.id} cities={trip.cities} places={trip.places} />
        </Card>
      </div>
      <Card>
        <p className="eyebrow mb-4">Notes</p>
        <h2>Memories</h2>
        <p className="mt-4 whitespace-pre-wrap text-muted">{trip.notes || "No notes have been added to this trip yet."}</p>
      </Card>
      <Card>
        <p className="eyebrow mb-4">Photos</p>
        <h2>Photo memories</h2>
        <p className="mt-4 text-muted">{trip.photoCount === 0 ? "Photos will appear here once you upload them." : `${trip.photoCount} photo${trip.photoCount === 1 ? "" : "s"} are attached to this trip.`}</p>
      </Card>
    </section>
  );
}
