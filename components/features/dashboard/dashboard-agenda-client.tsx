"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  ChevronRight,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentStatusBadge } from "@/components/features/appointments/appointment-status-badge";
import { AppointmentActionDialog } from "@/components/features/appointments/appointment-action-dialog";
import { formatTimeRange } from "@/lib/time";
import { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AppointmentItem {
  id: string;
  referenceCode: string;
  status: AppointmentStatus | string;
  startTime: Date | string;
  endTime: Date | string;
  clientNotes: string | null;
  internalNotes: string | null;
  cancellationReason: string | null;
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
    email: string;
    phone: string;
  };
}

interface DashboardAgendaClientProps {
  todayAgenda: AppointmentItem[];
  recentPending: AppointmentItem[];
  services: { id: string; name: string }[];
}

export function DashboardAgendaClient({
  todayAgenda: initialToday,
  recentPending: initialPending,
  services,
}: DashboardAgendaClientProps) {
  const [todayAgenda, setTodayAgenda] = React.useState(initialToday);
  const [pendingList, setPendingList] = React.useState(initialPending);

  const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentItem | null>(null);
  const [actionType, setActionType] = React.useState<"CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES" | null>(null);

  const handleAction = (appt: AppointmentItem, type: "CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES") => {
    setSelectedAppointment(appt);
    setActionType(type);
  };

  const handleActionSuccess = () => {
    if (selectedAppointment && actionType) {
      let targetStatus: AppointmentStatus = selectedAppointment.status as AppointmentStatus;
      if (actionType === "CONFIRM") targetStatus = AppointmentStatus.CONFIRMED;
      if (actionType === "COMPLETE") targetStatus = AppointmentStatus.COMPLETED;
      if (actionType === "CANCEL") targetStatus = AppointmentStatus.CANCELLED;
      if (actionType === "NO_SHOW") targetStatus = AppointmentStatus.NO_SHOW;

      setTodayAgenda((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id ? { ...a, status: targetStatus } : a
        )
      );

      setPendingList((prev) =>
        prev.filter((a) => a.id !== selectedAppointment.id)
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Today's Run of Show */}
      <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col min-h-[480px]">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="font-bold text-sm text-stone-800">
              Today&apos;s Agenda
            </h2>
          </div>
          <span className="text-xs font-medium text-indigo-600">
            {todayAgenda.length} {todayAgenda.length === 1 ? "Session" : "Sessions"} Scheduled
          </span>
        </div>

        <div className="p-4 flex-1">
          {todayAgenda.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-stone-400" />
              <p className="text-sm font-medium text-stone-700">
                No appointments scheduled for today
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                The schedule is clear. Bookings made via the client portal will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAgenda.map((appt) => {
                const isPending = appt.status === AppointmentStatus.PENDING;
                const isConfirmed = appt.status === AppointmentStatus.CONFIRMED;

                return (
                  <div
                    key={appt.id}
                    className={cn(
                      "flex items-start sm:items-center gap-3 p-3 rounded-lg border transition-all justify-between",
                      isPending
                        ? "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                        : "bg-stone-50/50 border-stone-200 hover:border-stone-300"
                    )}
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: appt.service.colorTag || "#6366F1",
                    }}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          {formatTimeRange(appt.startTime, appt.endTime)}
                        </span>
                        <span className="text-xs text-stone-300">•</span>
                        <Link
                          href={`/clients/${appt.client.id}`}
                          className="text-xs font-bold text-stone-900 hover:text-indigo-600 truncate"
                        >
                          {appt.client.fullName}
                        </Link>
                        <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-600">
                          {appt.referenceCode}
                        </span>
                        <AppointmentStatusBadge status={appt.status} />
                      </div>

                      <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-1.5">
                        <span className="font-medium text-stone-700">
                          {appt.service.name}
                        </span>
                        <span>•</span>
                        <span>{appt.service.durationMin}m</span>
                        <span>•</span>
                        <span>{appt.client.phone}</span>
                      </div>

                      {appt.clientNotes && (
                        <p className="text-[11px] text-stone-500 bg-white/80 p-1.5 rounded border border-stone-150 line-clamp-1">
                          <strong className="text-stone-700">Note:</strong> {appt.clientNotes}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1.5 shrink-0 self-start sm:self-center">
                      {isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(appt, "CONFIRM")}
                          className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 border-emerald-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                          Confirm
                        </Button>
                      )}

                      {isConfirmed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(appt, "COMPLETE")}
                          className="h-7 text-xs text-sky-700 hover:bg-sky-50 hover:border-sky-300 border-sky-200"
                        >
                          <CheckCheck className="w-3 h-3 mr-1 text-sky-600" />
                          Complete
                        </Button>
                      )}

                      <Link href={`/appointments/${appt.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
                        >
                          Details
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
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

      {/* Right Column: Pending Triage & System Insights */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Pending Intake Requests Card */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 flex-1">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
            <div className="flex items-center space-x-2">
              <Inbox className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-stone-800">
                Pending Intake Requests
              </h3>
            </div>
            {pendingList.length > 0 && (
              <Badge variant="pending" className="text-[10px] py-0 px-1.5">
                {pendingList.length} Requires Review
              </Badge>
            )}
          </div>

          <div>
            {pendingList.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <CheckCircle className="w-6 h-6 mx-auto mb-1.5 text-emerald-500 opacity-60" />
                <p className="text-xs font-semibold text-stone-700">All caught up</p>
                <p className="text-[11px] text-stone-400">No pending intake requests require staff action.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingList.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">
                        {item.client.fullName}
                      </span>
                      <span className="font-mono text-[10px] text-amber-800 font-semibold bg-white/70 px-1 py-0.2 rounded">
                        {item.referenceCode}
                      </span>
                    </div>

                    <p className="text-stone-600 font-medium">
                      {item.service.name}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-100">
                      <span className="text-[10px] text-stone-500 font-mono">
                        {formatTimeRange(item.startTime, item.endTime)}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAction(item, "CONFIRM")}
                        className="h-6 px-2 text-[11px]"
                      >
                        Confirm Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Insights Dark Card */}
        <div className="bg-stone-900 rounded-xl p-6 text-white shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold tracking-tight">System Operations Insights</h3>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Slot utilization is performing at optimal efficiency. Buffer intervals between services prevent practitioner fatigue and scheduling overlaps.
          </p>
          <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-center">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">
              Automation: Active
            </span>
            <Link href="/availability" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Configure Hours <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <AppointmentActionDialog
        appointment={selectedAppointment}
        actionType={actionType}
        onClose={() => {
          setSelectedAppointment(null);
          setActionType(null);
        }}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
