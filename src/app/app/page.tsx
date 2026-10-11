import { Card } from "@/components/ui/card";
import { getOwnProfile } from "@/features/auth/server";
import { WorldMap } from "@/features/map/components/world-map";
import { getPlacePins, getTripPins, getVisitedCountryCodes } from "@/features/map/server";

export const metadata = { title: "Map | Travel Memory Map" };

export default async function AppPage() {
  const [profile, visitedCountryCodes, tripPins, placePins] = await Promise.all([
    getOwnProfile(),
    getVisitedCountryCodes(),
    getTripPins(),
    getPlacePins(),
  ]);
  return <section>
    <p className="eyebrow mb-4">Explore the world you have visited</p>
    <h1 className="break-words text-4xl sm:text-5xl">Welcome{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">Some places stay with you. This is where you will find them again.</p>
    <Card className="map-card">
      <WorldMap
        visitedCountryCodes={visitedCountryCodes}
        tripPins={tripPins}
        placePins={placePins}
      />
    </Card>
  </section>;
}
