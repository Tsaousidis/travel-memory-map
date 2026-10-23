import { notFound } from "next/navigation";
import { getTripDetails } from "@/features/map/server";
import { TripDetailsContent } from "@/features/trips/components/trip-details-content";

export const metadata = { title: "Trip details | Travel Memory Map" };

export default async function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripDetails(id);
  if (!trip) notFound();

  return <TripDetailsContent trip={trip} />;
}

