function requireHttpUrl(value: string, name: string): string {
  try {
    const url = new URL(value);
    if (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
    ) {
      return value;
    }
  } catch {
    // Report only the variable name, never its contents.
  }
  throw new Error(`${name} must be an absolute HTTP(S) URL without credentials.`);
}

// Use direct references so Next.js can inline public values in browser bundles.
// Validate on use: the initial app can run before Supabase is configured.
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local before using Supabase.",
    );
  }

  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable key (sb_publishable_...), not a secret or legacy key.",
    );
  }

  return {
    url: requireHttpUrl(url, "NEXT_PUBLIC_SUPABASE_URL"),
    publishableKey,
  };
}

export function getMapConfig() {
  const styleUrl =
    process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim() ||
    "https://demotiles.maplibre.org/style.json";

  return {
    styleUrl: requireHttpUrl(styleUrl, "NEXT_PUBLIC_MAP_STYLE_URL"),
    // MapLibre coordinates are [longitude, latitude].
    center: [0, 20] as [number, number],
    zoom: 1.5,
  };
}
