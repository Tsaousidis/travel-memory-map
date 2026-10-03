import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/config/site";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let success = false;
  let reason = "missing-code";
  if (code && code.length <= 2048) {
    try {
      const supabase = await createClient();
      const flowId = request.nextUrl.searchParams.get("sb_flow_id");
      const { error } = await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
      success = !error;
      if (error) {
        reason = error.code === "pkce_code_verifier_not_found" || error.code === "bad_code_verifier"
          ? "browser-verification"
          : error.name === "AuthRetryableFetchError" ? "unavailable" : "exchange-rejected";
      }
    } catch {
      // Do not expose provider errors or authorization codes in the response.
      reason = "unavailable";
    }
  }
  // Fixed local destinations; never trust a next/redirect URL from the query.
  const target = new URL(success ? "/app" : "/auth/error", getSiteUrl());
  if (!success) target.searchParams.set("reason", reason);
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
