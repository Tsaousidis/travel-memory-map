"use client";

import { createContext, useContext, useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dictionaries } from "./dictionaries";
import type { Dictionary, Locale } from "./types";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
  isPending: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "travel_memory_map_locale";
const COOKIE_NAME = "NEXT_LOCALE";

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Synchronize document attribute with active locale
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);


  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    setLocaleState(newLocale);

    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch {
      // Ignore storage errors
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const t = dictionaries[locale] ?? dictionaries.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components rendered outside the provider
    return {
      locale: "en",
      setLocale: () => {},
      t: dictionaries.en,
      isPending: false,
    };
  }
  return context;
}
