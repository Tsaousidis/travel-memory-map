import "server-only";

export function getSiteUrl() {
  const value = process.env.APP_URL?.trim() || "http://localhost:3000";
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error("APP_URL must be an HTTP(S) origin without credentials, path, query or hash.");
  }
  return url.origin;
}
