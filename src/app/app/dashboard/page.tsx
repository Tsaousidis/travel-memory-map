import { Card } from "@/components/ui/card";
import { getDashboardStats } from "@/features/dashboard/server";
import { TakeMeSomewhere } from "@/features/dashboard/components/take-me-somewhere";

export const metadata = { title: "Dashboard | Travel Memory Map" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <section>
    <div className="page-heading">
      <div>
        <p className="eyebrow mb-3">Your travel story</p>
        <h1>Your travel footprint</h1>
        <p className="mt-3 max-w-xl text-muted">Reflections and statistics drawn from your recorded journeys across the globe.</p>
      </div>
    </div>
    <TakeMeSomewhere />
    <div className="dashboard-section-heading"><h2>Life atlas metrics</h2><span className="eyebrow">Updated automatically</span></div>
    <div className="dashboard-stat-grid dashboard-stat-grid--editorial">
      <StatCard label="Countries" value={stats.countriesVisited} />
      <StatCard label="Cities" value={stats.citiesVisited} />
      <StatCard label="Trips" value={stats.tripsCount} />
      <StatCard label="Places" value={stats.placesCount} />
      <StatCard label="Photos" value={stats.photosCount} />
      <StatCard label="Continents" value={stats.continentsVisited} />
    </div>
    <div className="dashboard-content-grid">
      <Card className="dashboard-editorial-card">
        <p className="eyebrow mb-4">Highlights</p>
        <h2>Your travel patterns</h2>
        <dl className="dashboard-list">
          <div><dt>Most visited country</dt><dd>{stats.mostVisitedCountry ?? "Not enough data yet"}</dd></div>
          <div><dt>Most visited city</dt><dd>{stats.mostVisitedCity ?? "Not enough data yet"}</dd></div>
          <div><dt>Longest trip</dt><dd>{stats.longestTrip ? `${stats.longestTrip.title} · ${stats.longestTrip.days} days` : "Not enough data yet"}</dd></div>
          <div><dt>World visited</dt><dd>{stats.percentageOfWorld}%</dd></div>
        </dl>
      </Card>
      <Card className="dashboard-editorial-card">
        <p className="eyebrow mb-4">Timeline</p>
        <h2>Trips per year</h2>
        {stats.tripsPerYear.length === 0 ? <p className="mt-4 text-muted">Your trip timeline will appear here.</p> : (
          <div className="year-chart" aria-label="Trips per year">
            {stats.tripsPerYear.map((item) => <div className="year-chart__item" key={item.year}><span className="year-chart__bar" style={{ height: `${Math.max(24, item.count * 42)}px` }}><b>{item.count}</b></span><strong>{item.year}</strong><small>{item.count} trip{item.count === 1 ? "" : "s"}</small></div>)}
          </div>
        )}
      </Card>
    </div>
  </section>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <Card className="dashboard-stat-card"><span className="eyebrow">{label}</span><strong>{value}</strong></Card>;
}
