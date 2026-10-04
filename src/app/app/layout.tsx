import type { ReactNode } from "react";
import { requireUser } from "@/features/auth/server";
import { ApplicationShell } from "@/features/navigation/components/application-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user } = await requireUser();
  const name = typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name.trim().slice(0, 100) || "Traveler" : "Traveler";
  return <ApplicationShell name={name} email={user.email ?? ""}>{children}</ApplicationShell>;
}
