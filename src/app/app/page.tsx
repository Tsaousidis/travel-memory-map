import { getOwnProfile } from "@/features/auth/server";
import { MapPageContent } from "@/features/map/components/map-page-content";
import { getPlacePins, getTripPins, getVisitedCountryCodes } from "@/features/map/server";

export const metadata = { title: "Map | Travel Memory Map" };

export default async function AppPage() {
  const [profile, visitedCountryCodes, tripPins, placePins] = await Promise.all([
    getOwnProfile(),
    getVisitedCountryCodes(),
    getTripPins(),
    getPlacePins(),
  ]);

  return (
    <MapPageContent
      displayName={profile.display_name}
      visitedCountryCodes={visitedCountryCodes}
      tripPins={tripPins}
      placePins={placePins}
    />
  );
}

