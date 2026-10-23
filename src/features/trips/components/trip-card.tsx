"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { TripSummary } from "@/features/map/types";
import { useLanguage } from "@/lib/i18n/context";

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

export function TripCard({ trip }: { trip: TripSummary }) {
  const { locale, t } = useLanguage();

  return (
    <Card className="trip-card">
      <div className="trip-card__cover" aria-hidden="true">
        <span>✦</span>
      </div>
      <div className="trip-card__body">
        <p className="eyebrow">{trip.countryName}</p>
        <h2 className="trip-card__title"><Link href={`/app/trips/${trip.id}`}>{trip.title}</Link></h2>
        <p className="trip-card__dates">
          {formatDate(trip.startDate, locale)} – {formatDate(trip.endDate, locale)}
        </p>
        <p className="trip-card__description">{trip.description}</p>
        <dl className="trip-card__stats">
          <div><dt>{t.tripsPage.tripCardDays}</dt><dd>{getTripDays(trip.startDate, trip.endDate)}</dd></div>
          <div><dt>{t.tripsPage.tripCardCities}</dt><dd>{trip.cityCount}</dd></div>
          <div><dt>{t.tripsPage.tripCardPlaces}</dt><dd>{trip.placeCount}</dd></div>
          <div><dt>{t.tripsPage.tripCardPhotos}</dt><dd>{trip.photoCount}</dd></div>
        </dl>
        <div className="trip-card__actions">
          <Link className="button button--primary" href={`/app/trips/${trip.id}`}>{t.tripsPage.tripCardExplore}</Link>
          <Link className="button button--secondary" href={`/app/trips/${trip.id}/edit`}>{t.tripsPage.tripCardEdit}</Link>
        </div>
      </div>
    </Card>
  );
}

