import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "./types";
import { dictionaries } from "./dictionaries";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value;
  return raw === "el" ? "el" : "en";
}

export async function getServerDictionary() {
  const locale = await getServerLocale();
  return { locale, t: dictionaries[locale] };
}
