import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { TripSummary } from "@/features/map/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

function getTripDays(startDate: string, endDate: string) {
  return Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1;
}

export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Card className="trip-card">
      <div className="trip-card__cover" aria-hidden="true">
        <span>✦</span>
      </div>
      <div className="trip-card__body">
        <p className="eyebrow">{trip.countryName}</p>
        <h2 className="trip-card__title"><Link href={`/app/trips/${trip.id}`}>{trip.title}</Link></h2>
        <p className="trip-card__dates">
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
        </p>
        <p className="trip-card__description">{trip.description}</p>
        <dl className="trip-card__stats">
          <div><dt>Days</dt><dd>{getTripDays(trip.startDate, trip.endDate)}</dd></div>
          <div><dt>Cities</dt><dd>{trip.cityCount}</dd></div>
          <div><dt>Places</dt><dd>{trip.placeCount}</dd></div>
          <div><dt>Photos</dt><dd>{trip.photoCount}</dd></div>
        </dl>
        <div className="trip-card__actions">
          <Link className="button button--primary" href={`/app/trips/${trip.id}`}>Explore trip</Link>
          <Link className="button button--secondary" href={`/app/trips/${trip.id}/edit`}>Edit trip</Link>
        </div>
      </div>
    </Card>
  );
}
