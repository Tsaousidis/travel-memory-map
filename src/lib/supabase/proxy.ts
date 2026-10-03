import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/config/public-env";
import { getSiteUrl } from "@/lib/config/site";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        previousCookies.forEach((cookie) => response.cookies.set(cookie));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  // getUser validates with Auth (including revoked/deleted accounts) and lets
  // the SSR client refresh cookies. Never trust getSession() for authorization.
  let signedIn = false;
  try {
    const { data, error } = await supabase.auth.getUser();
    signedIn = !error && Boolean(data.user);
  } catch {
    // Fail closed; the page/action rechecks identity before accessing data.
  }
  const pathname = request.nextUrl.pathname;
  const protectedPath = pathname === "/app" || pathname.startsWith("/app/");
  const guestPath = pathname === "/login" || pathname === "/signup";
  let destination: string | undefined;
  if (protectedPath && !signedIn) destination = "/login";
  if (guestPath && signedIn && request.method === "GET") destination = "/app";
  if (destination) {
    const target = new URL(destination, getSiteUrl());
    const redirected = NextResponse.redirect(target);
    response.cookies.getAll().forEach((cookie) => redirected.cookies.set(cookie));
    response = redirected;
  }
  // Auth responses and redirects must never be shared across users by a cache.
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
