"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CalendarPlus,
  Download,
  ArrowLeft,
  User,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppointmentStatusBadge } from "@/components/features/appointments/appointment-status-badge";
import { getBookingByReferenceAction } from "@/lib/actions/booking";
import { formatDateFull, formatTimeRange } from "@/lib/time";
import {
  generateGoogleCalendarUrl,
  generateIcsFile,
  downloadIcsFile,
} from "@/lib/calendar-export";

export default function LookupPage() {
  const [referenceCode, setReferenceCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [appointment, setAppointment] = React.useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceCode.trim()) return;

    setLoading(true);
    setError(null);
    setAppointment(null);

    try {
      const res = await getBookingByReferenceAction(referenceCode.trim());
      if (!res.success || !res.appointment) {
        setError("No appointment found matching reference code: " + referenceCode.trim().toUpperCase());
      } else {
        setAppointment(res.appointment);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to locate appointment record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/book" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              CP
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-stone-900 block leading-tight">
                CalenPulse
              </span>
              <span className="text-[10px] text-stone-500 font-medium">
                Appointment Reference Lookup
              </span>
            </div>
          </Link>

          <Link
            href="/book"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Book New Appointment
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Find Your Appointment
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Enter your 5-digit booking reference code (e.g. <strong>CP-89247</strong>) provided at time of scheduling.
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs flex gap-2 mb-6"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input
              required
              placeholder="e.g. CP-89247"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              className="pl-9 font-mono text-sm uppercase"
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading} className="px-5 text-xs font-semibold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
          </Button>
        </form>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Record Not Found</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Appointment Result Card */}
        {appointment && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-6 space-y-5 animate-in fade-in-90 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block">
                  Reference Code
                </span>
                <span className="text-lg font-mono font-bold text-stone-900">
                  {appointment.referenceCode}
                </span>
              </div>
              <AppointmentStatusBadge status={appointment.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2">
                <h4 className="font-bold text-sm text-stone-900">
                  {appointment.service.name}
                </h4>
                <div className="flex items-center text-stone-600">
                  <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                  <span>{formatDateFull(appointment.startTime)}</span>
                </div>
                <div className="flex items-center text-stone-600">
                  <Clock className="w-4 h-4 mr-2 text-stone-400" />
                  <span>
                    {formatTimeRange(appointment.startTime, appointment.endTime)} (
                    {appointment.service.durationMin} mins)
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-100 space-y-1.5 text-stone-600">
                <div className="flex items-center">
                  <User className="w-3.5 h-3.5 mr-2 text-stone-400" />
                  <span>{appointment.client.fullName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-2 text-stone-400" />
                  <span>{appointment.client.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-2 text-stone-400" />
                  <span>{appointment.client.phone}</span>
                </div>
              </div>

              {appointment.clientNotes && (
                <div className="p-3 bg-stone-50 rounded-lg text-stone-600 text-xs">
                  <p className="font-semibold text-stone-800 mb-0.5">Your Notes:</p>
                  <p>{appointment.clientNotes}</p>
                </div>
              )}
            </div>

            {/* Calendar Actions */}
            <div className="pt-2 border-t border-stone-100">
              <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Sync to Calendar
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={generateGoogleCalendarUrl({
                    title: `Appointment: ${appointment.service.name}`,
                    description: `Booking Reference: ${appointment.referenceCode}`,
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
                      title: `Appointment: ${appointment.service.name}`,
                      description: `Booking Reference: ${appointment.referenceCode}`,
                      startTime: appointment.startTime,
                      endTime: appointment.endTime,
                    });
                    downloadIcsFile(`booking-${appointment.referenceCode}.ics`, icsContent);
                  }}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  Download .ics
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CalenPulse Appointment Management System</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} CalenPulse Studio.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
