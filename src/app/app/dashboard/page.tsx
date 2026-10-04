import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/features/auth/server";

export const metadata = { title: "Dashboard | Travel Memory Map" };

export default async function DashboardPage() {
  await requireUser();
  return <section>
    <p className="eyebrow mb-4">A different perspective</p>
    <h1 className="text-4xl sm:text-5xl">Your travel story</h1>
    <p className="mb-10 mt-5 max-w-xl text-muted">The places you have visited, seen together.</p>
    <Card><EmptyState title="Your world, in perspective" description="Travel statistics are coming soon. They will be calculated from your saved trips." /></Card>
  </section>;
}
