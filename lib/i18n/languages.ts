export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: "ltr" | "rtl";
  locale: string;
}

export const COMMON_LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    dir: "ltr",
    locale: "en-US",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    locale: "es-ES",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    dir: "ltr",
    locale: "fr-FR",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    dir: "ltr",
    locale: "de-DE",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    dir: "ltr",
    locale: "pt-BR",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    dir: "ltr",
    locale: "it-IT",
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文 (简体)",
    flag: "🇨🇳",
    dir: "ltr",
    locale: "zh-CN",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    dir: "ltr",
    locale: "ja-JP",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    locale: "ar-SA",
  },
];

export const DEFAULT_LANGUAGE = COMMON_LANGUAGES[0];

export function getLanguage(code: string): Language {
  return COMMON_LANGUAGES.find((l) => l.code === code) || DEFAULT_LANGUAGE;
}
