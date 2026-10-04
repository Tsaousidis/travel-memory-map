import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getOwnProfile } from "@/features/auth/server";

export const metadata = { title: "Map | Travel Memory Map" };

export default async function AppPage() {
  const profile = await getOwnProfile();
  return <section>
    <p className="eyebrow mb-4">Explore the world you have visited</p>
    <h1 className="break-words text-4xl sm:text-5xl">Welcome{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">Some places stay with you. This is where you will find them again.</p>
    <Card className="map-placeholder">
      <EmptyState title="Your world starts here" description="An interactive map of your travel memories is coming soon. Your trips and places will appear here." />
    </Card>
  </section>;
}
