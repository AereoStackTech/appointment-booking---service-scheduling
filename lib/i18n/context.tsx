"use client";

import * as React from "react";
import {
  Language,
  COMMON_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguage,
} from "./languages";
import {
  TranslationKey,
  getTranslation,
  en,
} from "./translations";

interface LanguageContextType {
  locale: string;
  language: Language;
  setLocale: (code: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  dir: "ltr" | "rtl";
  languages: Language[];
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "calenpulse_preferred_lang";

let memoryLocale = "en";
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && COMMON_LANGUAGES.some((l) => l.code === stored)) {
      return stored;
    }
    const browserLang = navigator.language?.split("-")[0]?.toLowerCase();
    if (browserLang && COMMON_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  } catch {
    // Ignore storage restrictions
  }
  return memoryLocale;
}

function getServerSnapshot(): string {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const currentLanguage = React.useMemo(() => {
    return getLanguage(locale);
  }, [locale]);

  const setLocale = React.useCallback((newCode: string) => {
    const valid = COMMON_LANGUAGES.find((l) => l.code === newCode);
    if (!valid) return;
    memoryLocale = newCode;
    try {
      localStorage.setItem(STORAGE_KEY, newCode);
    } catch {
      // Ignore storage errors
    }
    emitChange();

    // Update document lang and dir attributes
    if (typeof document !== "undefined") {
      document.documentElement.lang = newCode;
      document.documentElement.dir = valid.dir;
    }
  }, []);

  // Sync document element attributes when locale changes
  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = currentLanguage.dir;
    }
  }, [locale, currentLanguage.dir]);

  const t = React.useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const dict = getTranslation(locale);
      const text = dict[key];
      if (text !== undefined) return text;
      // Fallback to English dict or provided fallback string
      return en[key] || fallback || key;
    },
    [locale]
  );

  const formatDate = React.useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const defaultOptions: Intl.DateTimeFormatOptions = {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        };
        return new Intl.DateTimeFormat(
          currentLanguage.locale,
          options || defaultOptions
        ).format(d);
      } catch {
        return String(date);
      }
    },
    [currentLanguage.locale]
  );

  const formatTime = React.useCallback(
    (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
      try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return String(date);
        const defaultOptions: Intl.DateTimeFormatOptions = {
          hour: "numeric",
          minute: "2-digit",
        };
        return new Intl.DateTimeFormat(
          currentLanguage.locale,
          options || defaultOptions
        ).format(d);
      } catch {
        return String(date);
      }
    },
    [currentLanguage.locale]
  );

  const value = React.useMemo<LanguageContextType>(
    () => ({
      locale,
      language: currentLanguage,
      setLocale,
      t,
      dir: currentLanguage.dir,
      languages: COMMON_LANGUAGES,
      formatDate,
      formatTime,
    }),
    [locale, currentLanguage, setLocale, t, formatDate, formatTime]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = React.useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback context if rendered outside provider
    return {
      locale: "en",
      language: DEFAULT_LANGUAGE,
      setLocale: () => {},
      t: (key: TranslationKey, fallback?: string) => en[key] || fallback || key,
      dir: "ltr",
      languages: COMMON_LANGUAGES,
      formatDate: (d) => String(d),
      formatTime: (d) => String(d),
    };
  }
  return context;
}
