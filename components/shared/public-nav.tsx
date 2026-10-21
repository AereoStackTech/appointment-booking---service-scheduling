"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { LanguageSelector } from "@/components/shared/language-selector";
import { useLanguage } from "@/lib/i18n/context";

interface PublicHeaderProps {
  showBackToBooking?: boolean;
}

export function PublicHeader({ showBackToBooking = false }: PublicHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center space-x-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            CP
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-stone-900 block leading-tight">
              {t("brandName")}
            </span>
            <span className="text-[10px] text-stone-500 font-medium">
              {t("brandTagline")}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {showBackToBooking ? (
            <Link
              href="/book"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1 text-stone-400" />
              <span className="hidden sm:inline">{t("bookNewAppointment")}</span>
              <span className="sm:hidden">{t("back")}</span>
            </Link>
          ) : (
            <Link
              href="/lookup"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center px-2.5 sm:px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
            >
              <Search className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
              <span className="hidden sm:inline">{t("findMyBooking")}</span>
              <span className="sm:hidden">{t("findMyBooking").split(" ")[0]}</span>
            </Link>
          )}

          {/* Prominent Language Changer */}
          <LanguageSelector variant="light" />

          <Link
            href="/dashboard"
            className="text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg transition-colors hidden sm:flex items-center shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
            {t("staffDashboard")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-400">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t("encryptedBadge")}</span>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link href="/login" className="hover:text-stone-700 font-medium transition-colors">
            {t("staffConsole")}
          </Link>
          <span>•</span>
          <Link href="/lookup" className="hover:text-stone-700 transition-colors">
            {t("findMyBooking")}
          </Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} {t("allRightsReserved")}</span>
        </div>
      </div>
    </footer>
  );
}
