import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Request-scoped memoization only. Never cache identities across requests.
export const requireUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  return { supabase, user: data.user };
});

export async function getOwnProfile() {
  const { supabase, user } = await requireUser();
  const { data: existing, error: readError } = await supabase
    .from("profiles").select("id, display_name").eq("id", user.id).maybeSingle();
  if (readError) throw new Error("Unable to load your profile. Please try again.");
  if (existing) return existing;

  // Provision only after Auth has verified the user. No admin key or Auth
  // trigger is needed, and a simultaneous request cannot overwrite a profile.
  const name = typeof user.user_metadata?.display_name === "string"
    ? user.user_metadata.display_name.trim().slice(0, 100) || null : null;
  const { error: insertError } = await supabase.from("profiles").upsert(
    { id: user.id, display_name: name },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (insertError) throw new Error("Unable to create your profile. Please try again.");
  const { data, error } = await supabase.from("profiles")
    .select("id, display_name").eq("id", user.id).single();
  if (error || !data) throw new Error("Unable to load your profile. Please try again.");
  return data;
}
