import { Card } from "@/components/ui/card";
import { getDashboardStats } from "@/features/dashboard/server";

export const metadata = { title: "Dashboard | Travel Memory Map" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <section>
    <p className="eyebrow mb-4">A different perspective</p>
    <h1 className="text-4xl sm:text-5xl">Your travel story</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">The places you have visited, seen together.</p>
    <div className="dashboard-stat-grid">
      <StatCard label="Countries" value={stats.countriesVisited} />
      <StatCard label="Cities" value={stats.citiesVisited} />
      <StatCard label="Trips" value={stats.tripsCount} />
      <StatCard label="Places" value={stats.placesCount} />
      <StatCard label="Photos" value={stats.photosCount} />
      <StatCard label="Continents" value={stats.continentsVisited} />
    </div>
    <div className="dashboard-content-grid">
      <Card>
        <p className="eyebrow mb-4">Highlights</p>
        <h2>Your travel patterns</h2>
        <dl className="dashboard-list">
          <div><dt>Most visited country</dt><dd>{stats.mostVisitedCountry ?? "Not enough data yet"}</dd></div>
          <div><dt>Most visited city</dt><dd>{stats.mostVisitedCity ?? "Not enough data yet"}</dd></div>
          <div><dt>Longest trip</dt><dd>{stats.longestTrip ? `${stats.longestTrip.title} · ${stats.longestTrip.days} days` : "Not enough data yet"}</dd></div>
          <div><dt>World visited</dt><dd>{stats.percentageOfWorld}%</dd></div>
        </dl>
      </Card>
      <Card>
        <p className="eyebrow mb-4">Timeline</p>
        <h2>Trips per year</h2>
        {stats.tripsPerYear.length === 0 ? <p className="mt-4 text-muted">Your trip timeline will appear here.</p> : (
          <ul className="dashboard-list">
            {stats.tripsPerYear.map((item) => <li key={item.year}><span>{item.year}</span><strong>{item.count} trip{item.count === 1 ? "" : "s"}</strong></li>)}
          </ul>
        )}
      </Card>
    </div>
  </section>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return <Card className="dashboard-stat-card"><span className="eyebrow">{label}</span><strong>{value}</strong></Card>;
}
