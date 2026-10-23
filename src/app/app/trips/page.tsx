import { getTripSummaries } from "@/features/map/server";
import { TripsPageContent } from "@/features/trips/components/trips-page-content";
import { getCountries } from "@/features/trips/server";

export const metadata = { title: "Trips | Travel Memory Map" };

export default async function TripsPage() {
  const [trips, countries] = await Promise.all([getTripSummaries(), getCountries()]);
  return <TripsPageContent trips={trips} countries={countries} />;
}

