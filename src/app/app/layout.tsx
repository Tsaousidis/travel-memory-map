import type { ReactNode } from "react";
import { requireUser } from "@/features/auth/server";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return children;
}
