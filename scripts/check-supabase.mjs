import { getSupabaseConfig } from "../src/lib/config/public-env.ts";

// Read-only connectivity checks; no tables, users, or uploads are created.
async function checkConnection() {
  const { url, publishableKey } = getSupabaseConfig();
  const checks = [
    { name: "Auth settings", path: "/auth/v1/settings", accept: "application/json" },
    // The OpenAPI root requires elevated keys. Probe a deliberately absent
    // table instead: PGRST205 proves the request reached PostgREST.
    { name: "Data API", path: "/rest/v1/__travel_memory_map_connection_probe__?select=*&limit=0", accept: "application/json" },
  ];

  for (const check of checks) {
    let response;
    try {
      response = await fetch(new URL(check.path, url), {
        headers: { apikey: publishableKey, Accept: check.accept },
        signal: AbortSignal.timeout(15_000),
        redirect: "error",
        cache: "no-store",
      });
    } catch {
      throw new Error(`${check.name}: network/timeout failure. Check the project URL, project status, and network access.`);
    }
    const data = await response.json().catch(() => null);
    if (check.name === "Data API" && response.status === 404 && data?.code === "PGRST205") {
      console.log("Data API: reachable; key accepted (expected missing-table response PGRST205).");
      continue;
    }
    if (!response.ok) {
      throw new Error(`${check.name}: HTTP ${response.status}. Check the project URL, publishable key, and service settings.`);
    }
    const valid = check.name === "Auth settings"
      ? data && typeof data.external === "object" && data.external !== null
      : Array.isArray(data) && data.length === 0;
    if (!valid) throw new Error(`${check.name}: unexpected response format.`);
    console.log(`${check.name}: connected (HTTP ${response.status}).`);
  }
  console.log("Supabase connectivity verified. Schema, RLS, sign-in, and Storage are verified in later steps.");
}

checkConnection().catch((error) => {
  console.error(error instanceof Error ? error.message : "Supabase connectivity check failed.");
  process.exitCode = 1;
});
