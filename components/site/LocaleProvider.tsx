"use client";

import * as React from "react";
import type { CopyOverrides } from "@/lib/copy-overrides";
import { htmlLang, localeCookieName, type Locale } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copyOverrides: CopyOverrides;
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, copyOverrides = {}, children }: { initialLocale: Locale; copyOverrides?: CopyOverrides; children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  React.useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${localeCookieName}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    window.localStorage.setItem(localeCookieName, next);
  }, []);

  const value = React.useMemo(() => ({ locale, setLocale, copyOverrides }), [copyOverrides, locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = React.useContext(LocaleContext);
  if (!value) {
    throw new Error("useLocale must be used inside LocaleProvider");
  }
  return value;
}
