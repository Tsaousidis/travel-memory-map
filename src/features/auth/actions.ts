"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/server";
import { validateCredentials } from "./validation";
import type { AuthState } from "./validation";

export async function login(_previous: AuthState, form: FormData): Promise<AuthState> {
  const values = validateCredentials(form, false);
  if (!values.valid) return { error: "Check the highlighted fields.", fields: values.fields };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) return { error: error.status === 429 ? "Too many attempts. Please wait and try again." : "Unable to sign in. Check your email, password, and email confirmation." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect("/app");
}

export async function signup(_previous: AuthState, form: FormData): Promise<AuthState> {
  const values = validateCredentials(form, true);
  if (!values.valid) return { error: "Check the highlighted fields.", fields: values.fields };
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
        emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      },
    });
    if (error) return { error: error.status === 429 ? "Too many attempts. Please wait before trying again." : "Unable to complete signup. Try a stronger password, or sign in if you already have an account." };
    signedIn = Boolean(data.session);
  } catch {
    return { error: "Signup is temporarily unavailable. Please try again." };
  }
  if (signedIn) {
    revalidatePath("/", "layout");
    redirect("/app");
  }
  return { message: "If this address can be registered, a confirmation email will arrive shortly. Open it in this browser, then sign in. If you already have an account, use Sign in." };
}

export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "Unable to sign out. Please try again." };
  } catch {
    return { error: "Unable to sign out. Check your connection and try again." };
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
