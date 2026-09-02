"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarX,
  Save,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  updateWeeklyAvailabilityAction,
  createBlackoutPeriodAction,
  deleteBlackoutPeriodAction,
} from "@/lib/actions/availability";
import { DayOfWeek } from "@prisma/client";
import { DAY_DISPLAY_NAMES, formatDateShort } from "@/lib/time";

interface WeeklyItem {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface BlackoutItem {
  id: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
}

interface AvailabilityManagerProps {
  initialWeekly: WeeklyItem[];
  initialBlackout: BlackoutItem[];
  isAdmin: boolean;
}

const ORDERED_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

export function AvailabilityManagerClient({
  initialWeekly,
  initialBlackout,
  isAdmin,
}: AvailabilityManagerProps) {
  const router = useRouter();

  // Sort initial schedule in proper day order
  const [schedule, setSchedule] = React.useState<WeeklyItem[]>(() => {
    return ORDERED_DAYS.map((day) => {
      const match = initialWeekly.find((w) => w.dayOfWeek === day);
      return (
        match || {
          id: `wa-${day}`,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "18:00",
          isActive: day !== DayOfWeek.SUNDAY,
        }
      );
    });
  });

  const [blackouts, setBlackouts] = React.useState<BlackoutItem[]>(initialBlackout);

  // Blackout dialog
  const [blackoutDialogOpen, setBlackoutDialogOpen] = React.useState(false);
  const [blackoutTitle, setBlackoutTitle] = React.useState("");
  const [blackoutStart, setBlackoutStart] = React.useState("");
  const [blackoutEnd, setBlackoutEnd] = React.useState("");
  const [blackoutLoading, setBlackoutLoading] = React.useState(false);
  const [blackoutError, setBlackoutError] = React.useState<string | null>(null);

  // Weekly save state
  const [savingWeekly, setSavingWeekly] = React.useState(false);
  const [weeklySuccess, setWeeklySuccess] = React.useState(false);
  const [weeklyError, setWeeklyError] = React.useState<string | null>(null);

  const handleDayToggle = (day: DayOfWeek) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === day ? { ...item, isActive: !item.isActive } : item
      )
    );
    setWeeklySuccess(false);
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayOfWeek === day ? { ...item, [field]: value } : item
      )
    );
    setWeeklySuccess(false);
  };

  const handleSaveWeekly = async () => {
    setSavingWeekly(true);
    setWeeklyError(null);
    setWeeklySuccess(false);

    try {
      const res = await updateWeeklyAvailabilityAction({
        schedule: schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isActive: s.isActive,
        })),
      });

      if (!res.success) {
        setWeeklyError(res.error || "Failed to save weekly schedule.");
        setSavingWeekly(false);
        return;
      }

      setWeeklySuccess(true);
      setTimeout(() => setWeeklySuccess(false), 4000);
    } catch (err: any) {
      setWeeklyError(err?.message || "An unexpected error occurred.");
    } finally {
      setSavingWeekly(false);
    }
  };

  const handleAddBlackout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blackoutTitle.trim() || !blackoutStart || !blackoutEnd) return;

    setBlackoutLoading(true);
    setBlackoutError(null);

    try {
      const res = await createBlackoutPeriodAction({
        title: blackoutTitle.trim(),
        startDate: blackoutStart,
        endDate: blackoutEnd,
      });

      if (!res.success) {
        setBlackoutError(res.error || "Failed to create blackout period.");
        setBlackoutLoading(false);
        return;
      }

      if (res.blackoutPeriod) {
        setBlackouts((prev) => [...prev, res.blackoutPeriod as BlackoutItem]);
      }
      setBlackoutDialogOpen(false);
      setBlackoutTitle("");
      setBlackoutStart("");
      setBlackoutEnd("");
      router.refresh();
    } catch (err: any) {
      setBlackoutError(err?.message || "An unexpected error occurred.");
    } finally {
      setBlackoutLoading(false);
    }
  };

  const handleDeleteBlackout = async (id: string) => {
    try {
      const res = await deleteBlackoutPeriodAction(id);
      if (res.success) {
        setBlackouts((prev) => prev.filter((b) => b.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Weekly Operating Hours Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-stone-900">
                Weekly Operating Windows
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Defines the standard open booking slots available for each day of the week.
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveWeekly}
              disabled={savingWeekly}
              className="text-xs"
            >
              {savingWeekly ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  Save Schedule
                </>
              )}
            </Button>
          )}
        </div>

        {weeklySuccess && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Weekly schedule saved successfully. Public booking slots are updated.</span>
          </div>
        )}

        {weeklyError && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{weeklyError}</span>
          </div>
        )}

        <div className="p-5 divide-y divide-stone-100">
          {schedule.map((item) => {
            const dayName = DAY_DISPLAY_NAMES[item.dayOfWeek];

            return (
              <div
                key={item.dayOfWeek}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Day toggle */}
                <div className="flex items-center space-x-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${item.dayOfWeek}`}
                    checked={item.isActive}
                    disabled={!isAdmin}
                    onChange={() => handleDayToggle(item.dayOfWeek)}
                    className="rounded border-stone-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label
                    htmlFor={`day-${item.dayOfWeek}`}
                    className={`font-bold cursor-pointer select-none ${
                      item.isActive ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {dayName}
                  </label>
                </div>

                {/* Time Pickers */}
                {item.isActive ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-stone-500">Opens:</span>
                      <Input
                        type="time"
                        value={item.startTime}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, "startTime", e.target.value)
                        }
                        className="w-28 h-8 text-xs font-mono"
                      />
                    </div>

                    <span className="text-stone-300">—</span>

                    <div className="flex items-center space-x-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-stone-500">Closes:</span>
                      <Input
                        type="time"
                        value={item.endTime}
                        disabled={!isAdmin}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, "endTime", e.target.value)
                        }
                        className="w-28 h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-stone-400 font-medium italic">
                    Studio Closed / Not Operating
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blackout Periods Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarX className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-sm text-stone-900">
                Studio Blackout Dates & Holidays
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Specific calendar dates where all booking slots are automatically disabled (e.g. vacations, studio maintenance).
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBlackoutDialogOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Blackout Period
            </Button>
          )}
        </div>

        <div className="p-5">
          {blackouts.length === 0 ? (
            <div className="py-8 text-center text-stone-400">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-stone-300" />
              <p className="text-xs font-medium text-stone-600">
                No active blackout periods
              </p>
              <p className="text-[11px] text-stone-400">
                All regular operating hours are open for booking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {blackouts.map((period) => (
                <div
                  key={period.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-stone-900">{period.title}</h4>
                    <p className="text-stone-500 font-mono text-[11px]">
                      {formatDateShort(period.startDate)} — {formatDateShort(period.endDate)}
                    </p>
                  </div>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBlackout(period.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-8 px-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Blackout Period Dialog */}
      <Dialog
        open={blackoutDialogOpen}
        onOpenChange={(open) => !open && setBlackoutDialogOpen(false)}
      >
        <DialogClose onClick={() => setBlackoutDialogOpen(false)} />
        <form onSubmit={handleAddBlackout}>
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <CalendarX className="w-5 h-5 text-rose-600" />
              <DialogTitle>Add Studio Blackout Period</DialogTitle>
            </div>
            <DialogDescription>
              Block off dates to prevent customer bookings during holidays, travel, or maintenance.
            </DialogDescription>
          </DialogHeader>

          {blackoutError && (
            <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {blackoutError}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-800">
                Reason / Title <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                placeholder="e.g. Studio Annual Maintenance & Team Retreat"
                value={blackoutTitle}
                onChange={(e) => setBlackoutTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-800">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={blackoutStart}
                  onChange={(e) => setBlackoutStart(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-800">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  required
                  value={blackoutEnd}
                  onChange={(e) => setBlackoutEnd(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBlackoutDialogOpen(false)}
              disabled={blackoutLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={blackoutLoading}
            >
              {blackoutLoading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Save Blackout Dates
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
