import { notFound } from "next/navigation";
import Link from "next/link";
import { getClientById } from "@/lib/data-service";
import { Header } from "@/components/shared/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { AppointmentStatusBadge } from "@/components/features/appointments/appointment-status-badge";
import { formatDateFull, formatTimeRange, formatDateShort } from "@/lib/time";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  const appointments = client.appointments || [];
  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const totalValue = completed.reduce((acc, curr) => acc + curr.service.price, 0);

  return (
    <div className="flex-1 flex flex-col">
      <Header
        title={`Client: ${client.fullName}`}
        subtitle="Comprehensive client profile, booking history, and contact details."
        actions={
          <Link href="/book" target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
              Schedule New Appointment
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-6xl space-y-6">
        <Breadcrumbs
          items={[
            { label: "Clients", href: "/clients" },
            { label: client.fullName },
          ]}
        />

        {/* Client Profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {client.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">{client.fullName}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1 font-mono">
                  <span className="flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1 text-stone-400" />
                    {client.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-stone-400" />
                    {client.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-2xl font-bold font-mono text-stone-900 mt-1 block">
                {appointments.length}
              </span>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Completed Sessions
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
                {completed.length}
              </span>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                Total Value Realized
              </span>
              <span className="text-2xl font-bold font-mono text-indigo-600 mt-1 block">
                ${totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Appointment History */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-stone-900">
                Appointment History ({appointments.length})
              </h3>
            </div>
          </div>

          <div className="p-4 divide-y divide-stone-100">
            {appointments.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">
                No past sessions recorded for this client.
              </p>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-stone-900">
                        {appt.referenceCode}
                      </span>
                      <AppointmentStatusBadge status={appt.status} />
                    </div>

                    <p className="font-semibold text-stone-800">
                      {appt.service.name} (${appt.service.price.toFixed(2)})
                    </p>

                    <p className="text-stone-500 font-mono text-[11px]">
                      {formatDateFull(appt.startTime)} •{" "}
                      {formatTimeRange(appt.startTime, appt.endTime)}
                    </p>
                  </div>

                  <Link href={`/appointments/${appt.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      View Session Details
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
