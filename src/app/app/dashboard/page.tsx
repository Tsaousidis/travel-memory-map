import { DashboardPageContent } from "@/features/dashboard/components/dashboard-page-content";
import { getDashboardStats } from "@/features/dashboard/server";

export const metadata = { title: "Dashboard | Travel Memory Map" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardPageContent stats={stats} />;
}

