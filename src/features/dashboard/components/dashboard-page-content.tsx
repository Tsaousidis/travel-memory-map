"use client";

import { Card } from "@/components/ui/card";
import { TakeMeSomewhere } from "@/features/dashboard/components/take-me-somewhere";
import type { getDashboardStats } from "@/features/dashboard/server";
import { useLanguage } from "@/lib/i18n/context";

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export function DashboardPageContent({ stats }: { stats: DashboardStats }) {
  const { t } = useLanguage();

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow mb-3">{t.dashboard.eyebrow}</p>
          <h1>{t.dashboard.heading}</h1>
          <p className="mt-3 max-w-xl text-muted">{t.dashboard.subheading}</p>
        </div>
      </div>

      <TakeMeSomewhere />

      <div className="dashboard-section-heading">
        <h2>{t.dashboard.metricsHeading}</h2>
        <span className="eyebrow">{t.dashboard.updatedAutomatically}</span>
      </div>

      <div className="dashboard-stat-grid dashboard-stat-grid--editorial">
        <StatCard label={t.dashboard.countries} value={stats.countriesVisited} />
        <StatCard label={t.dashboard.cities} value={stats.citiesVisited} />
        <StatCard label={t.dashboard.trips} value={stats.tripsCount} />
        <StatCard label={t.dashboard.places} value={stats.placesCount} />
        <StatCard label={t.dashboard.photos} value={stats.photosCount} />
        <StatCard label={t.dashboard.continents} value={stats.continentsVisited} />
      </div>

      <div className="dashboard-content-grid">
        <Card className="dashboard-editorial-card">
          <p className="eyebrow mb-4">{t.dashboard.highlightsEyebrow}</p>
          <h2>{t.dashboard.patternsHeading}</h2>
          <dl className="dashboard-list">
            <div>
              <dt>{t.dashboard.mostVisitedCountry}</dt>
              <dd>{stats.mostVisitedCountry ?? t.dashboard.notEnoughData}</dd>
            </div>
            <div>
              <dt>{t.dashboard.mostVisitedCity}</dt>
              <dd>{stats.mostVisitedCity ?? t.dashboard.notEnoughData}</dd>
            </div>
            <div>
              <dt>{t.dashboard.longestTrip}</dt>
              <dd>
                {stats.longestTrip
                  ? `${stats.longestTrip.title} · ${stats.longestTrip.days} ${t.dashboard.daysSuffix}`
                  : t.dashboard.notEnoughData}
              </dd>
            </div>
            <div>
              <dt>{t.dashboard.worldVisited}</dt>
              <dd>{stats.percentageOfWorld}%</dd>
            </div>
          </dl>
        </Card>

        <Card className="dashboard-editorial-card">
          <p className="eyebrow mb-4">{t.dashboard.timelineEyebrow}</p>
          <h2>{t.dashboard.tripsPerYear}</h2>
          {stats.tripsPerYear.length === 0 ? (
            <p className="mt-4 text-muted">{t.dashboard.emptyTimeline}</p>
          ) : (
            <div className="year-chart" aria-label={t.dashboard.tripsPerYear}>
              {stats.tripsPerYear.map((item) => (
                <div className="year-chart__item" key={item.year}>
                  <span
                    className="year-chart__bar"
                    style={{ height: `${Math.max(24, item.count * 42)}px` }}
                  >
                    <b>{item.count}</b>
                  </span>
                  <strong>{item.year}</strong>
                  <small>
                    {item.count} {item.count === 1 ? t.dashboard.tripSingle : t.dashboard.tripPlural}
                  </small>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="dashboard-stat-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
    </Card>
  );
}
