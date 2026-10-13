import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getTripSummaries } from "@/features/map/server";
import { TripCard } from "@/features/trips/components/trip-card";

export const metadata = { title: "Trips | Travel Memory Map" };

export default async function TripsPage() {
  const trips = await getTripSummaries();
  return <section>
    <p className="eyebrow mb-4">The journeys behind the pins</p>
    <h1 className="text-4xl sm:text-5xl">Your trips</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">Every journey deserves a place of its own.</p>
    {trips.length === 0 ? (
      <Card><EmptyState title="A home for every journey" description="Your trip collection is empty for now. Your future journeys will appear here." /></Card>
    ) : (
      <div className="trip-grid">
        {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </div>
    )}
  </section>;
}
