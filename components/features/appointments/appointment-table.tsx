"use client";

import * as React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AppointmentStatusBadge } from "./appointment-status-badge";
import { AppointmentActionDialog } from "./appointment-action-dialog";
import { formatTimeRange, formatDateShort } from "@/lib/time";
import { AppointmentStatus } from "@prisma/client";
import {
  Search,
  CheckCircle,
  CheckCheck,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

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

interface AppointmentTableProps {
  initialAppointments: AppointmentItem[];
  services: { id: string; name: string }[];
}

export function AppointmentTable({
  initialAppointments,
  services,
}: AppointmentTableProps) {
  const [appointments, setAppointments] = React.useState(initialAppointments);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [serviceFilter, setServiceFilter] = React.useState("ALL");
  const [dateFilter, setDateFilter] = React.useState("");

  // Dialog state
  const [selectedAppointment, setSelectedAppointment] = React.useState<AppointmentItem | null>(null);
  const [actionType, setActionType] = React.useState<"CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES" | null>(null);

  const filteredAppointments = React.useMemo(() => {
    return appointments.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesRef = item.referenceCode.toLowerCase().includes(q);
        const matchesName = item.client.fullName.toLowerCase().includes(q);
        const matchesEmail = item.client.email.toLowerCase().includes(q);
        const matchesPhone = item.client.phone.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesEmail && !matchesPhone) {
          return false;
        }
      }

      // Status
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Service
      if (serviceFilter !== "ALL" && item.service.id !== serviceFilter) {
        return false;
      }

      // Date
      if (dateFilter) {
        const itemDate = new Date(item.startTime).toISOString().slice(0, 10);
        if (itemDate !== dateFilter) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, search, statusFilter, serviceFilter, dateFilter]);

  const handleActionClick = (
    appt: AppointmentItem,
    type: "CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES"
  ) => {
    setSelectedAppointment(appt);
    setActionType(type);
  };

  const handleActionSuccess = () => {
    // In next action revalidation will occur, but let's also update optimistic state
    if (selectedAppointment && actionType) {
      let targetStatus: AppointmentStatus = selectedAppointment.status as AppointmentStatus;
      if (actionType === "CONFIRM") targetStatus = AppointmentStatus.CONFIRMED;
      if (actionType === "COMPLETE") targetStatus = AppointmentStatus.COMPLETED;
      if (actionType === "CANCEL") targetStatus = AppointmentStatus.CANCELLED;
      if (actionType === "NO_SHOW") targetStatus = AppointmentStatus.NO_SHOW;

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id ? { ...a, status: targetStatus } : a
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search by client name, email, phone, or Ref code (e.g. CP-89247)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 text-xs h-10"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No-Show</option>
          </Select>

          {/* Service Filter */}
          <Select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="w-44 text-xs h-10"
          >
            <option value="ALL">All Services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>

          {/* Date Filter */}
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-36 text-xs h-10"
          />

          {(search || statusFilter !== "ALL" || serviceFilter !== "ALL" || dateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setServiceFilter("ALL");
                setDateFilter("");
              }}
              className="text-xs text-stone-500 hover:text-stone-900"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Ref Code</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-stone-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-stone-600">No appointments found</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Try adjusting your search criteria or date filter.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((appt) => (
                <TableRow key={appt.id} className="group">
                  {/* Reference Code */}
                  <TableCell className="font-mono text-xs font-semibold text-stone-900">
                    <Link
                      href={`/appointments/${appt.id}`}
                      className="hover:underline hover:text-indigo-600 flex items-center"
                    >
                      {appt.referenceCode}
                    </Link>
                  </TableCell>

                  {/* Date & Time */}
                  <TableCell>
                    <div className="text-xs font-medium text-stone-900">
                      {formatDateShort(appt.startTime)}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500">
                      {formatTimeRange(appt.startTime, appt.endTime)}
                    </div>
                  </TableCell>

                  {/* Client Info */}
                  <TableCell>
                    <Link
                      href={`/clients/${appt.client.id}`}
                      className="text-xs font-semibold text-stone-900 hover:text-indigo-600 hover:underline block"
                    >
                      {appt.client.fullName}
                    </Link>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>{appt.client.email}</span>
                      <span>•</span>
                      <span>{appt.client.phone}</span>
                    </div>
                  </TableCell>

                  {/* Service Info */}
                  <TableCell>
                    <div className="text-xs font-medium text-stone-900 flex items-center gap-1.5">
                      {appt.service.colorTag && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: appt.service.colorTag }}
                        />
                      )}
                      <span>{appt.service.name}</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {appt.service.durationMin}m • ${appt.service.price.toFixed(2)}
                    </div>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <AppointmentStatusBadge status={appt.status} />
                  </TableCell>

                  {/* Quick Action Controls */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {appt.status === AppointmentStatus.PENDING && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionClick(appt, "CONFIRM")}
                          className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                          title="Confirm Appointment"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Confirm
                        </Button>
                      )}

                      {appt.status === AppointmentStatus.CONFIRMED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActionClick(appt, "COMPLETE")}
                          className="h-7 px-2 text-xs text-sky-700 hover:bg-sky-50 hover:border-sky-300"
                          title="Mark Completed"
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Complete
                        </Button>
                      )}

                      {appt.status !== AppointmentStatus.CANCELLED &&
                        appt.status !== AppointmentStatus.COMPLETED && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleActionClick(appt, "CANCEL")}
                            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            title="Cancel Booking"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}

                      <Link href={`/appointments/${appt.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Count footer */}
        <div className="p-3 bg-stone-50/75 border-t border-stone-200 text-xs text-stone-500 flex justify-between items-center">
          <span>
            Showing <strong className="text-stone-800">{filteredAppointments.length}</strong> of{" "}
            {appointments.length} appointments
          </span>
          <span className="font-mono text-[11px] text-stone-400">
            Real-time synchronization active
          </span>
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
