"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  History,
  FileText,
  CalendarDays,
  CalendarPlus,
  Download,
  Share2,
  RefreshCw,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { AppointmentActionDialog } from "./appointment-action-dialog";
import { AppointmentRescheduleDialog } from "./appointment-reschedule-dialog";
import { formatDateFull, formatTimeRange, formatDateShort } from "@/lib/time";
import {
  generateGoogleCalendarUrl,
  generateIcsFile,
  downloadIcsFile,
} from "@/lib/calendar-export";
import { AppointmentStatus } from "@prisma/client";

interface AppointmentDetailProps {
  appointment: {
    id: string;
    referenceCode: string;
    status: AppointmentStatus | string;
    startTime: Date | string;
    endTime: Date | string;
    clientNotes: string | null;
    internalNotes: string | null;
    cancellationReason: string | null;
    createdAt: Date | string;
    service: {
      id: string;
      name: string;
      slug: string;
      description: string;
      durationMin: number;
      bufferMin: number;
      price: number;
      colorTag?: string;
    };
    client: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      notes: string | null;
      appointments?: any[];
    };
    statusAudits?: Array<{
      id: string;
      fromStatus: string;
      toStatus: string;
      notes: string | null;
      timestamp: Date | string;
      changedBy?: { name: string; email: string } | null;
    }>;
  };
}

export function AppointmentDetailClient({
  appointment: initialData,
}: AppointmentDetailProps) {
  const router = useRouter();
  const [appointment, setAppointment] = React.useState(initialData);

  // Dialog states
  const [actionType, setActionType] = React.useState<"CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES" | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = React.useState(false);

  const isPending = appointment.status === AppointmentStatus.PENDING;
  const isConfirmed = appointment.status === AppointmentStatus.CONFIRMED;
  const isCancelled = appointment.status === AppointmentStatus.CANCELLED;
  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;

  const handleActionSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Main Banner Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-start space-x-3">
            <div
              className="w-4 h-12 rounded-full shrink-0"
              style={{ backgroundColor: appointment.service.colorTag || "#3B82F6" }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs uppercase tracking-wider text-stone-400 font-semibold">
                  Reference Code
                </span>
                <span className="font-mono text-base font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {appointment.referenceCode}
                </span>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mt-1">
                {appointment.service.name}
              </h2>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isPending && (
              <Button
                variant="emerald"
                size="sm"
                onClick={() => setActionType("CONFIRM")}
                className="text-xs"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Confirm Booking
              </Button>
            )}

            {isConfirmed && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActionType("COMPLETE")}
                className="text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                Mark Completed
              </Button>
            )}

            {!isCancelled && !isCompleted && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRescheduleOpen(true)}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                  Reschedule
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActionType("CANCEL")}
                  className="text-xs text-rose-600 hover:bg-rose-50"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionType("NOTES")}
              className="text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
              Staff Notes
            </Button>
          </div>
        </div>

        {/* Date & Service Spec details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Date & Schedule
              </p>
              <p className="text-sm font-bold text-stone-900">
                {formatDateFull(appointment.startTime)}
              </p>
              <p className="text-xs font-mono text-stone-600 mt-0.5">
                {formatTimeRange(appointment.startTime, appointment.endTime)}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Service Duration
              </p>
              <p className="text-sm font-bold text-stone-900">
                {appointment.service.durationMin} minutes
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                +{appointment.service.bufferMin}m buffer allowance
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-stone-400 font-mono font-bold shrink-0 mt-0.5">
              $
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Financial Rate
              </p>
              <p className="text-sm font-bold font-mono text-stone-900">
                ${appointment.service.price.toFixed(2)}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                Single session rate
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Client Details & Notes */}
        <div className="lg:col-span-6 space-y-6">
          {/* Client Profile Card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-stone-900">
                  Client Information
                </h3>
              </div>
              <Link
                href={`/clients/${appointment.client.id}`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View Full Client Profile →
              </Link>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-400">Full Name</span>
                <span className="font-semibold text-stone-900">
                  {appointment.client.fullName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Email Address</span>
                <span className="font-mono text-stone-900">
                  {appointment.client.email}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Phone</span>
                <span className="font-mono text-stone-900">
                  {appointment.client.phone}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-400">Total Studio Visits</span>
                <span className="font-semibold text-stone-900">
                  {appointment.client.appointments?.length || 1} sessions
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
              <FileText className="w-4 h-4 text-stone-500" />
              <h3 className="font-bold text-sm text-stone-900">
                Notes & Consultation Record
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                  Client Submitted Intake Notes:
                </p>
                <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  {appointment.clientNotes || "No intake notes provided by client."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Internal Staff & Practitioner Notes:
                  </p>
                  <button
                    type="button"
                    onClick={() => setActionType("NOTES")}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    Edit Notes
                  </button>
                </div>
                <p className="text-xs text-stone-800 bg-amber-50/50 p-3 rounded-lg border border-amber-200/80">
                  {appointment.internalNotes || "No internal staff notes recorded yet."}
                </p>
              </div>

              {appointment.cancellationReason && (
                <div>
                  <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">
                    Cancellation Reason:
                  </p>
                  <p className="text-xs text-rose-800 bg-rose-50 p-3 rounded-lg border border-rose-200">
                    {appointment.cancellationReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Log & Calendar Integrations */}
        <div className="lg:col-span-6 space-y-6">
          {/* Calendar Export Bar */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500">
              Calendar Integration
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={generateGoogleCalendarUrl({
                  title: `${appointment.service.name} — ${appointment.client.fullName}`,
                  description: `Booking Reference: ${appointment.referenceCode}\nClient: ${appointment.client.fullName} (${appointment.client.phone})\nEmail: ${appointment.client.email}`,
                  startTime: appointment.startTime,
                  endTime: appointment.endTime,
                })}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Google Calendar
              </a>

              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const icsContent = generateIcsFile({
                    title: `${appointment.service.name} — ${appointment.client.fullName}`,
                    description: `Booking Reference: ${appointment.referenceCode}\nClient: ${appointment.client.fullName}`,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                  });
                  downloadIcsFile(`appt-${appointment.referenceCode}.ics`, icsContent);
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Export .ics
              </Button>
            </div>
          </div>

          {/* Status Audit Log */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-stone-100 pb-3">
              <History className="w-4 h-4 text-stone-500" />
              <h3 className="font-bold text-sm text-stone-900">
                Status Lifecycle Audit Log
              </h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {!appointment.statusAudits || appointment.statusAudits.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">
                  No lifecycle transitions recorded yet.
                </p>
              ) : (
                appointment.statusAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <AppointmentStatusBadge status={audit.toStatus} showIcon={false} />
                      </div>
                      <span className="font-mono text-[10px] text-stone-400">
                        {new Date(audit.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-stone-700 font-medium">{audit.notes}</p>

                    {audit.changedBy && (
                      <p className="text-[10px] text-stone-400">
                        Recorded by: {audit.changedBy.name}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <AppointmentActionDialog
        appointment={appointment as any}
        actionType={actionType}
        onClose={() => setActionType(null)}
        onSuccess={handleActionSuccess}
      />

      {/* Reschedule Dialog */}
      <AppointmentRescheduleDialog
        appointment={appointment as any}
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
