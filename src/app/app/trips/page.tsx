import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/server";

export const metadata = { title: "Trips | Travel Memory Map" };

export default async function TripsPage() {
  await requireUser();
  return <section>
    <p className="eyebrow mb-4">The journeys behind the pins</p>
    <h1 className="text-4xl sm:text-5xl">Your trips</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">Every journey deserves a place of its own.</p>
    <Card><EmptyState title="A home for every journey" description="Your trip collection will live here. Trip browsing and creation are coming soon." /></Card>
  </section>;
}
