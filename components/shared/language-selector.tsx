"use client";

import * as React from "react";
import { Globe, Check, ChevronDown, Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { COMMON_LANGUAGES, Language } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "light" | "dark" | "pill";
  showLabel?: boolean;
  className?: string;
  align?: "left" | "right";
}

export function LanguageSelector({
  variant = "light",
  showLabel = true,
  className,
  align = "right",
}: LanguageSelectorProps) {
  const { locale, setLocale, language, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredLanguages = React.useMemo(() => {
    if (!search.trim()) return COMMON_LANGUAGES;
    const q = search.toLowerCase();
    return COMMON_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSelect = (lang: Language) => {
    setLocale(lang.code);
    setIsOpen(false);
    setSearch("");
  };

  // Button styles based on variant
  const buttonStyles = {
    light:
      "bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300 shadow-2xs focus:ring-2 focus:ring-indigo-500/20",
    dark:
      "bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700 shadow-2xs focus:ring-2 focus:ring-indigo-400/20",
    pill:
      "bg-stone-100 hover:bg-stone-200/80 text-stone-800 border-transparent rounded-full px-3 py-1 text-xs",
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer outline-hidden select-none",
          buttonStyles[variant]
        )}
        title={t("selectLanguage")}
      >
        <span className="text-sm leading-none" role="img" aria-label={language.name}>
          {language.flag}
        </span>
        <Globe className="w-3.5 h-3.5 text-stone-400" />
        {showLabel && (
          <span className="font-medium tracking-tight">
            {language.nativeName}
          </span>
        )}
        <span className="uppercase text-[10px] font-mono opacity-60">
          ({language.code})
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-stone-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t("commonLanguages")}
          className={cn(
            "absolute z-50 mt-1.5 w-64 rounded-xl bg-white shadow-xl border border-stone-200/90 py-1.5 text-stone-900 animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {/* Header & Search */}
          <div className="px-3 pt-2 pb-2 border-b border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {t("commonLanguages")}
              </span>
              <span className="text-[10px] text-indigo-600 font-mono font-medium">
                {COMMON_LANGUAGES.length} {t("language")}s
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                autoFocus
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Languages List */}
          <div className="max-h-64 overflow-y-auto py-1 scrollbar-thin">
            {filteredLanguages.length === 0 ? (
              <div className="py-4 text-center text-xs text-stone-400">
                No matching language found
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === locale;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(lang)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left",
                      isSelected
                        ? "bg-indigo-50/80 text-indigo-900 font-semibold"
                        : "text-stone-700 hover:bg-stone-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base leading-none shrink-0" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div className="truncate">
                        <div className="truncate flex items-center gap-1.5">
                          <span className="font-medium text-stone-900">{lang.nativeName}</span>
                          {lang.nativeName !== lang.name && (
                            <span className="text-[11px] text-stone-400 truncate">
                              ({lang.name})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono block">
                          {lang.code.toUpperCase()} • {lang.dir.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="px-3 py-1.5 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between text-[10px] text-stone-400">
            <span>Instant Translation</span>
            <span className="font-mono text-stone-500">Auto-saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
