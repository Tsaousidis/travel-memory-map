"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { TripSummary } from "@/features/map/types";
import { TripCard } from "@/features/trips/components/trip-card";
import { TripRecordingCard } from "@/features/trips/components/trip-recording-card";
import { useLanguage } from "@/lib/i18n/context";

type Country = { code: string; name: string };

export function TripsPageContent({
  trips,
  countries,
}: {
  trips: TripSummary[];
  countries: Country[];
}) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-3">{t.tripsPage.eyebrow}</p>
          <h1>{t.tripsPage.heading}</h1>
          <p className="mt-3 max-w-xl text-muted">{t.tripsPage.subheading}</p>
        </div>
        <a className="button button--primary" href="#record-trip">
          {t.tripsPage.recordTripCta}
        </a>
      </div>

      <div className="trips-overview-strip">
        <div>
          <span className="eyebrow">{t.tripsPage.stripJourneys}</span>
          <strong>{trips.length}</strong>
          <small>{t.tripsPage.stripJourneysSub}</small>
        </div>
        <div>
          <span className="eyebrow">{t.tripsPage.stripCoordinates}</span>
          <strong>{trips.reduce((count, trip) => count + trip.placeCount, 0)}</strong>
          <small>{t.tripsPage.stripCoordinatesSub}</small>
        </div>
        <div>
          <span className="eyebrow">{t.tripsPage.stripDays}</span>
          <strong>
            {trips.reduce(
              (count, trip) =>
                count +
                Math.round((Date.parse(trip.endDate) - Date.parse(trip.startDate)) / 86400000) +
                1,
              0,
            )}
          </strong>
          <small>{t.tripsPage.stripDaysSub}</small>
        </div>
        <div>
          <span className="eyebrow">{t.tripsPage.stripPhotos}</span>
          <strong>{trips.reduce((count, trip) => count + trip.photoCount, 0)}</strong>
          <small>{t.tripsPage.stripPhotosSub}</small>
        </div>
      </div>

      <Card className="create-trip-card" id="record-trip">
        <p className="eyebrow mb-3">{t.tripsPage.newJourney}</p>
        <h2 className="mb-4">{t.tripsPage.recordTripHeading}</h2>
        <TripRecordingCard countries={countries} />
      </Card>

      {trips.length === 0 ? (
        <Card>
          <EmptyState
            title={t.tripsPage.emptyTitle}
            description={t.tripsPage.emptyDesc}
          />
        </Card>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </section>
  );
}
