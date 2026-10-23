"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TripMap } from "@/features/map/components/trip-map";
import type { getTripDetails } from "@/features/map/server";
import { PhotoGallery } from "@/features/trips/components/photo-gallery";
import { PhotoUploadForm } from "@/features/trips/components/photo-upload-form";
import { PlacesManager } from "@/features/trips/components/places-manager";
import { useLanguage } from "@/lib/i18n/context";

type TripDetails = NonNullable<Awaited<ReturnType<typeof getTripDetails>>>;

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "el" ? "el-GR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getTripDays(startDate: string, endDate: string) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1;
}

export function TripDetailsContent({ trip }: { trip: TripDetails }) {
  const { locale, t } = useLanguage();
  const daysCount = getTripDays(trip.startDate, trip.endDate);

  return (
    <section className="trip-details-page trip-details-editorial">
      <div className="trip-breadcrumbs">
        <Link href="/app/trips">{t.tripDetails.breadcrumbTrips}</Link>
        <span aria-hidden="true">/</span>
        <strong>{trip.title}</strong>
        <span aria-hidden="true">/</span>
        <span>{trip.cities.map((city) => city.name).join(", ") || trip.countryName}</span>
      </div>

      <div className="trip-details-heading">
        <div className="trip-editorial-title">
          <p className="eyebrow">{t.tripDetails.fieldJournal} · {trip.countryName}</p>
          <h1>{trip.title}</h1>
          <div className="trip-meta-line">
            <span>{formatDate(trip.startDate, locale)} – {formatDate(trip.endDate, locale)}</span>
            <span aria-hidden="true">•</span>
            <span>{daysCount} {t.tripDetails.days}</span>
            <span aria-hidden="true">•</span>
            <span>{trip.cities.length} {trip.cities.length === 1 ? t.tripDetails.citySingle : t.tripDetails.cityPlural}</span>
            <span aria-hidden="true">•</span>
            <span>{trip.places.length} {trip.places.length === 1 ? t.tripDetails.placeSingle : t.tripDetails.placePlural}</span>
            <span aria-hidden="true">•</span>
            <span className="trip-meta-highlight">{trip.photoCount} {trip.photoCount === 1 ? t.tripDetails.photoSingle : t.tripDetails.photoPlural}</span>
          </div>
        </div>
        <div className="trip-action-suite">
          <Link className="button button--secondary" href={`/app/trips/${trip.id}/edit`}>
            {t.tripDetails.editDetails}
          </Link>
          <a className="button button--primary" href="#photos">
            {t.tripDetails.uploadPhotos}
          </a>
        </div>
      </div>

      <div className="trip-memory-banner">
        <span className="trip-memory-mark" aria-hidden="true">“</span>
        <div>
          <p>{trip.notes || trip.description || (locale === "el" ? "Ένα ταξίδι που αξίζει να θυμάσαι." : "A journey worth remembering.")}</p>
          <span className="eyebrow">{t.tripDetails.memoryAtlasBadge}</span>
        </div>
      </div>

      <dl className="trip-details-stats trip-editorial-stats">
        <div>
          <dt>{t.tripDetails.statDates}</dt>
          <dd>{formatDate(trip.startDate, locale)} – {formatDate(trip.endDate, locale)}</dd>
        </div>
        <div>
          <dt>{t.tripDetails.statDaysAway}</dt>
          <dd>{daysCount}</dd>
        </div>
        <div>
          <dt>{t.tripDetails.statCitiesVisited}</dt>
          <dd>{trip.cities.length}</dd>
        </div>
        <div>
          <dt>{t.tripDetails.statPlacesRemembered}</dt>
          <dd>{trip.places.length}</dd>
        </div>
        <div>
          <dt>{t.tripDetails.statPhotoMemories}</dt>
          <dd>{trip.photoCount}</dd>
        </div>
      </dl>

      <Card className="trip-map-card trip-editorial-map-card">
        <div className="trip-section-heading">
          <div>
            <p className="eyebrow">{t.tripDetails.mapSectionEyebrow}</p>
            <h2>{t.tripDetails.mapSectionHeading}</h2>
          </div>
          <span className="trip-section-count">{trip.cities.length} {t.tripDetails.stopsCount}</span>
        </div>
        {trip.cities.length === 0 && trip.places.length === 0 ? (
          <p className="mt-4 text-muted">{t.tripDetails.emptyMap}</p>
        ) : (
          <TripMap trip={trip} />
        )}
      </Card>

      <div className="trip-details-grid">
        <Card className="trip-editorial-card">
          <div className="trip-section-heading">
            <div>
              <p className="eyebrow">{t.tripDetails.routeEyebrow}</p>
              <h2>{t.tripDetails.routeHeading}</h2>
            </div>
          </div>
          {trip.cities.length === 0 ? (
            <p className="mt-4 text-muted">{t.tripDetails.emptyCities}</p>
          ) : (
            <ol className="trip-route-list">
              {trip.cities.map((city, index) => (
                <li key={city.id}>
                  <span className="trip-route-index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{city.name}</strong>
                  <span>{city.countryCode}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card className="places-card trip-editorial-card">
          <div className="trip-section-heading">
            <div>
              <p className="eyebrow">{t.tripDetails.waypointEyebrow}</p>
              <h2>{t.tripDetails.waypointHeading}</h2>
            </div>
            <span className="trip-section-count">{trip.places.length}</span>
          </div>
          <PlacesManager tripId={trip.id} cities={trip.cities} places={trip.places} />
        </Card>
      </div>

      <Card className="trip-notes-card trip-editorial-card">
        <p className="eyebrow">{t.tripDetails.memoriesEyebrow}</p>
        <h2>{t.tripDetails.memoriesHeading}</h2>
        <p className="mt-4 whitespace-pre-wrap text-muted">
          {trip.notes || t.tripDetails.emptyNotes}
        </p>
      </Card>

      <Card className="trip-editorial-card" id="photos">
        <div className="trip-section-heading">
          <div>
            <p className="eyebrow">{t.tripDetails.photosEyebrow}</p>
            <h2>{t.tripDetails.photosHeading}</h2>
          </div>
          <span className="trip-section-count">{trip.photoCount} {t.tripDetails.curatedPrints}</span>
        </div>
        <p className="mt-4 text-muted">
          {trip.photoCount === 0 ? t.tripDetails.emptyPhotos : `${trip.photoCount} ${t.tripDetails.photosAttached}`}
        </p>
        <PhotoGallery tripId={trip.id} photos={trip.photos} />
        <PhotoUploadForm tripId={trip.id} places={trip.places} />
      </Card>
    </section>
  );
}
