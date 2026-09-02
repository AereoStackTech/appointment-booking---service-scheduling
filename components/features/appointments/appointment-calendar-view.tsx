"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Plus, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { formatTime12, formatTimeRange, formatDateFull, formatDateIso } from "@/lib/time";
import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AppointmentItem {
  id: string;
  referenceCode: string;
  status: AppointmentStatus | string;
  startTime: Date | string;
  endTime: Date | string;
  service: {
    id: string;
    name: string;
    durationMin: number;
    price: number;
    colorTag?: string;
  };
  client: {
    id: string;
    fullName: string;
    phone: string;
  };
}

export function AppointmentCalendarView({
  appointments,
}: {
  appointments: AppointmentItem[];
}) {
  const [selectedDate, setSelectedDate] = React.useState<string>(
    formatDateIso(new Date())
  );

  const currentDateObj = new Date(`${selectedDate}T00:00:00`);

  const prevDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateIso(d));
  };

  const nextDay = () => {
    const d = new Date(currentDateObj);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateIso(d));
  };

  const setToday = () => {
    setSelectedDate(formatDateIso(new Date()));
  };

  // Filter for currently selected day
  const dayAppointments = React.useMemo(() => {
    return appointments
      .filter((a) => formatDateIso(new Date(a.startTime)) === selectedDate)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [appointments, selectedDate]);

  // Operating timeline hours (08:00 to 19:00)
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
      {/* Calendar Header Bar */}
      <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/50">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={setToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h3 className="text-sm font-bold text-stone-900 ml-2">
            {formatDateFull(currentDateObj)}
          </h3>
        </div>

        <div className="text-xs text-stone-500 flex items-center gap-3">
          <span className="font-semibold text-stone-800">
            {dayAppointments.length} Appointments scheduled
          </span>
        </div>
      </div>

      {/* Daily Visual Timeline Schedule */}
      <div className="p-6">
        {dayAppointments.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
            <p className="text-sm font-medium text-stone-600">
              No appointments scheduled for this date
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Available slots remain open for booking in the client portal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayAppointments.map((appt) => {
              const start = new Date(appt.startTime);
              const end = new Date(appt.endTime);
              const isCancelled = appt.status === AppointmentStatus.CANCELLED;

              return (
                <div
                  key={appt.id}
                  className={cn(
                    "flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all hover:shadow-xs",
                    isCancelled
                      ? "bg-stone-50 border-stone-200 opacity-60"
                      : "bg-white border-stone-200 hover:border-stone-300"
                  )}
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: appt.service.colorTag || "#3B82F6",
                  }}
                >
                  <div className="flex items-start space-x-3 mb-2 sm:mb-0">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex flex-col items-center justify-center shrink-0 border border-stone-200">
                      <span className="text-[10px] font-mono font-semibold text-stone-500 leading-none">
                        {start.getHours()}:{String(start.getMinutes()).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/appointments/${appt.id}`}
                          className="text-sm font-bold text-stone-900 hover:text-indigo-600 hover:underline"
                        >
                          {appt.client.fullName}
                        </Link>
                        <span className="text-xs font-mono text-stone-400">
                          ({appt.referenceCode})
                        </span>
                        <AppointmentStatusBadge status={appt.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500">
                        <span className="font-medium text-stone-700">
                          {appt.service.name}
                        </span>
                        <span>•</span>
                        <span className="font-mono">
                          {formatTimeRange(start, end)} ({appt.service.durationMin}m)
                        </span>
                        <span>•</span>
                        <span>{appt.client.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link href={`/appointments/${appt.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
