import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getTripSummaries } from "@/features/map/server";
import { TripCard } from "@/features/trips/components/trip-card";
import { CreateTripForm } from "@/features/trips/components/create-trip-form";
import { getCountries } from "@/features/trips/server";

export const metadata = { title: "Trips | Travel Memory Map" };

export default async function TripsPage() {
  const [trips, countries] = await Promise.all([getTripSummaries(), getCountries()]);
  return <section>
    <div className="page-heading">
      <div>
        <p className="eyebrow mb-3">Your journeys</p>
        <h1>Your saved trips</h1>
        <p className="mt-3 max-w-xl text-muted">A curated chronicle of the paths you have walked, preserved across seasons and borders.</p>
      </div>
      <a className="button button--primary" href="#record-trip">＋ Record a trip</a>
    </div>
    <div className="trips-overview-strip">
      <div><span className="eyebrow">Journeys bound</span><strong>{trips.length}</strong><small>Recorded volumes</small></div>
      <div><span className="eyebrow">Coordinates saved</span><strong>{trips.reduce((count, trip) => count + trip.placeCount, 0)}</strong><small>Places across your trips</small></div>
      <div><span className="eyebrow">Days wandered</span><strong>{trips.reduce((count, trip) => count + Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86400000) + 1, 0)}</strong><small>Archived time away</small></div>
      <div><span className="eyebrow">Film memories</span><strong>{trips.reduce((count, trip) => count + trip.photoCount, 0)}</strong><small>Visual prints preserved</small></div>
    </div>
    <Card className="create-trip-card" id="record-trip">
      <p className="eyebrow mb-3">New journey</p>
      <h2 className="mb-6">Record a trip</h2>
      <CreateTripForm countries={countries} />
    </Card>
    {trips.length === 0 ? (
      <Card><EmptyState title="A home for every journey" description="Your trip collection is empty for now. Your future journeys will appear here." /></Card>
    ) : (
      <div className="trip-grid">
        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </div>
    )}
  </section>;
}
