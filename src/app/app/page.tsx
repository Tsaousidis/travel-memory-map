import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getOwnProfile } from "@/features/auth/server";

export const metadata = { title: "Your space | Travel Memory Map" };

export default async function AppPage() {
  const profile = await getOwnProfile();
  return <main className="py-16"><Container>
    <div className="mb-12 flex flex-wrap items-center justify-between gap-5"><span className="font-display text-xl">◎ Travel Memory Map</span><LogoutButton /></div>
    <Card className="max-w-2xl">
      <p className="eyebrow mb-5">Your personal space</p>
      <h1 className="break-words text-4xl">Welcome{profile.display_name ? `, ${profile.display_name}` : ""}.</h1>
      <p className="mt-6 text-muted">You are signed in. Your travel collection will grow here.</p>
    </Card>
  </Container></main>;
}
