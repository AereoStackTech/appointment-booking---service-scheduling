"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateIso } from "@/lib/time";
import { useLanguage } from "@/lib/i18n/context";

export interface CalendarProps {
  selectedDate?: string; // "YYYY-MM-DD"
  onSelectDate: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDaysOfWeek?: number[]; // 0 = Sunday, 1 = Monday...
  className?: string;
}

export function Calendar({
  selectedDate,
  onSelectDate,
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  className,
}: CalendarProps) {
  const { language } = useLanguage();
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const todayStr = formatDateIso(new Date());
  const effectiveMinDate = minDate ?? todayStr;

  const monthName = React.useMemo(() => {
    try {
      return currentMonth.toLocaleString(language.locale, {
        month: "long",
        year: "numeric",
      });
    } catch {
      return currentMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }, [currentMonth, language.locale]);

  // Calculate calendar grid days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  // Generate localized day headers starting Sunday
  const dayHeaders = React.useMemo(() => {
    try {
      const headers: string[] = [];
      // Pick a Sunday as base: 2026-01-04 is a Sunday
      for (let i = 0; i < 7; i++) {
        const d = new Date(2026, 0, 4 + i);
        const name = d.toLocaleDateString(language.locale, { weekday: "narrow" });
        headers.push(name);
      }
      return headers;
    } catch {
      return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    }
  }, [language.locale]);

  return (
    <div className={cn("p-4 bg-white rounded-xl border border-stone-200 select-none", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-stone-900">{monthName}</h4>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayHeaders.map((dh) => (
          <div
            key={dh}
            className="text-xs font-medium text-stone-400 py-1"
          >
            {dh}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          const dateObj = new Date(year, month, day);
          const dateStr = formatDateIso(dateObj);
          const isSelected = selectedDate === dateStr;
          const isToday = todayStr === dateStr;
          const dayOfWeek = dateObj.getDay();

          const isPast = effectiveMinDate ? dateStr < effectiveMinDate : false;
          const isTooFar = maxDate ? dateStr > maxDate : false;
          const isExplicitlyDisabled = disabledDates.includes(dateStr);
          const isDayOfWeekDisabled = disabledDaysOfWeek.includes(dayOfWeek);

          const isDisabled =
            isPast || isTooFar || isExplicitlyDisabled || isDayOfWeekDisabled;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "h-9 w-full rounded-md text-xs font-medium transition-all flex items-center justify-center relative cursor-pointer",
                isSelected
                  ? "bg-indigo-600 text-white font-semibold shadow-xs hover:bg-indigo-700"
                  : isDisabled
                  ? "text-stone-300 bg-stone-50 cursor-not-allowed line-through opacity-60"
                  : "text-stone-800 hover:bg-stone-100 hover:text-stone-900",
                isToday && !isSelected && "ring-1 ring-indigo-600/50 font-semibold"
              )}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
