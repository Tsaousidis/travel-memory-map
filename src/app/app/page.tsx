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
    <div className="page-heading map-page-heading">
      <div>
        <p className="eyebrow mb-3">Explore the world you have visited</p>
        <h1 className="break-words">Welcome{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
        <p className="mt-3 max-w-xl text-muted">Some places stay with you. This is where you will find them again.</p>
      </div>
      <div className="map-page-badge">All journeys · {tripPins.length} stops</div>
    </div>
    <Card className="map-card map-editorial-card">
      <WorldMap
        visitedCountryCodes={visitedCountryCodes}
        tripPins={tripPins}
        placePins={placePins}
      />
    </Card>
    <div className="map-summary-strip">
      <div><strong>{visitedCountryCodes.length}</strong><span>Countries visited</span></div>
      <div><strong>{new Set(tripPins.map((pin) => pin.cityName)).size}</strong><span>Cities explored</span></div>
      <div><strong>{placePins.length}</strong><span>Places remembered</span></div>
    </div>
  </section>;
}
