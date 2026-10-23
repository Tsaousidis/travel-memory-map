"use client";

import { Card } from "@/components/ui/card";
import { WorldMap } from "@/features/map/components/world-map";
import type { PlacePin, TripPin } from "@/features/map/types";
import { useLanguage } from "@/lib/i18n/context";

export function MapPageContent({
  displayName,
  visitedCountryCodes,
  tripPins,
  placePins,
}: {
  displayName?: string | null;
  visitedCountryCodes: string[];
  tripPins: TripPin[];
  placePins: PlacePin[];
}) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="page-heading map-page-heading">
        <div>
          <p className="eyebrow mb-3">{t.mapPage.eyebrow}</p>
          <h1 className="break-words">
            {t.mapPage.welcome}
            {displayName ? `, ${displayName}` : ""}
            .
          </h1>
          <p className="mt-3 max-w-xl text-muted">{t.mapPage.subheading}</p>
        </div>
        <div className="map-page-badge">
          {t.mapPage.badge.replace("{count}", String(tripPins.length))}
        </div>
      </div>

      <Card className="map-card map-editorial-card">
        <WorldMap
          visitedCountryCodes={visitedCountryCodes}
          tripPins={tripPins}
          placePins={placePins}
        />
      </Card>

      <div className="map-summary-strip">
        <div>
          <strong>{visitedCountryCodes.length}</strong>
          <span>{t.mapPage.countriesVisited}</span>
        </div>
        <div>
          <strong>{new Set(tripPins.map((pin) => pin.cityName)).size}</strong>
          <span>{t.mapPage.citiesExplored}</span>
        </div>
        <div>
          <strong>{placePins.length}</strong>
          <span>{t.mapPage.placesRemembered}</span>
        </div>
      </div>
    </section>
  );
}
