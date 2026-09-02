"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Calendar, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateFull } from "@/lib/time";

export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const currentDateStr = React.useMemo(() => {
    return formatDateFull(new Date());
  }, []);

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-stone-800 tracking-tight">{title}</h1>
        <div className="hidden sm:inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          System Online
        </div>
        {subtitle && <span className="hidden xl:inline text-xs text-stone-400 font-normal ml-2 truncate max-w-md">• {subtitle}</span>}
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center text-xs font-medium text-stone-600 bg-stone-50 px-3 py-1.5 rounded-md border border-stone-200">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
          <span suppressHydrationWarning>{currentDateStr}</span>
        </div>

        {actions}
      </div>
    </header>
  );
}
