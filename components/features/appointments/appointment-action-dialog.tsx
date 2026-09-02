"use client";

import * as React from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AppointmentStatus } from "@prisma/client";
import { updateAppointmentStatusAction } from "@/lib/actions/appointment";
import { CheckCircle2, CheckCheck, XCircle, AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { formatTimeRange, formatDateFull } from "@/lib/time";

interface AppointmentActionDialogProps {
  appointment: {
    id: string;
    referenceCode: string;
    status: AppointmentStatus | string;
    startTime: Date | string;
    endTime: Date | string;
    service: { name: string; durationMin: number };
    client: { fullName: string; email: string; phone: string };
    internalNotes?: string | null;
  } | null;
  actionType: "CONFIRM" | "COMPLETE" | "CANCEL" | "NO_SHOW" | "NOTES" | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentActionDialog({
  appointment,
  actionType,
  onClose,
  onSuccess,
}: AppointmentActionDialogProps) {
  if (!appointment || !actionType) return null;

  return (
    <Dialog open={true} onOpenChange={(val) => !val && onClose()}>
      <AppointmentActionDialogForm
        key={`${appointment.id}-${actionType}`}
        appointment={appointment}
        actionType={actionType}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Dialog>
  );
}

function AppointmentActionDialogForm({
  appointment,
  actionType,
  onClose,
  onSuccess,
}: {
  appointment: NonNullable<AppointmentActionDialogProps["appointment"]>;
  actionType: NonNullable<AppointmentActionDialogProps["actionType"]>;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [notes, setNotes] = React.useState(appointment.internalNotes || "");
  const [cancellationReason, setCancellationReason] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let targetStatus: AppointmentStatus = appointment.status as AppointmentStatus;
    if (actionType === "CONFIRM") targetStatus = AppointmentStatus.CONFIRMED;
    if (actionType === "COMPLETE") targetStatus = AppointmentStatus.COMPLETED;
    if (actionType === "CANCEL") targetStatus = AppointmentStatus.CANCELLED;
    if (actionType === "NO_SHOW") targetStatus = AppointmentStatus.NO_SHOW;

    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: appointment.id,
        status: targetStatus,
        notes: notes.trim() || undefined,
        cancellationReason: actionType === "CANCEL" ? cancellationReason.trim() : undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to update appointment");
        setLoading(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    CONFIRM: "Confirm Appointment Booking",
    COMPLETE: "Complete Appointment Session",
    CANCEL: "Cancel Appointment",
    NO_SHOW: "Mark Appointment as No-Show",
    NOTES: "Update Staff Notes",
  };

  const descriptions = {
    CONFIRM: `Mark appointment ${appointment.referenceCode} for ${appointment.client.fullName} as Confirmed.`,
    COMPLETE: `Mark session as fulfilled and completed. Add private consultation follow-up notes.`,
    CANCEL: `Cancel this booking. Please specify a cancellation reason for the client record.`,
    NO_SHOW: `Flag that the client did not attend the scheduled session.`,
    NOTES: `Add internal operations or practitioner notes regarding this booking.`,
  };

  return (
    <Dialog open={!!actionType} onOpenChange={(open) => !open && onClose()}>
      <DialogClose onClick={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center space-x-2 text-stone-900">
            {actionType === "CONFIRM" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {actionType === "COMPLETE" && <CheckCheck className="w-5 h-5 text-sky-600" />}
            {actionType === "CANCEL" && <XCircle className="w-5 h-5 text-rose-600" />}
            {actionType === "NO_SHOW" && <AlertTriangle className="w-5 h-5 text-purple-600" />}
            {actionType === "NOTES" && <MessageSquare className="w-5 h-5 text-indigo-600" />}
            <DialogTitle>{titles[actionType]}</DialogTitle>
          </div>
          <DialogDescription>{descriptions[actionType]}</DialogDescription>
        </DialogHeader>

        {/* Appointment summary mini-card */}
        <div className="bg-stone-50 rounded-lg p-3.5 border border-stone-200 mb-4 text-xs space-y-1">
          <div className="flex justify-between font-mono font-medium text-stone-700">
            <span>Ref: {appointment.referenceCode}</span>
            <span>{formatTimeRange(appointment.startTime, appointment.endTime)}</span>
          </div>
          <p className="font-semibold text-stone-900">{appointment.service.name}</p>
          <p className="text-stone-500">
            Client: {appointment.client.fullName} ({appointment.client.phone})
          </p>
          <p className="text-stone-400">{formatDateFull(appointment.startTime)}</p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {actionType === "CANCEL" && (
          <div className="space-y-1.5 mb-4">
            <label className="text-xs font-semibold text-stone-800">
              Cancellation Reason <span className="text-rose-500">*</span>
            </label>
            <Input
              required
              placeholder="e.g., Client requested cancellation due to scheduling conflict"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-semibold text-stone-800">
            {actionType === "COMPLETE"
              ? "Follow-up & Outcome Notes"
              : "Internal Staff Notes"}
          </label>
          <Textarea
            placeholder="Add internal notes visible only to staff..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            variant={
              actionType === "CANCEL"
                ? "destructive"
                : actionType === "CONFIRM"
                ? "emerald"
                : actionType === "COMPLETE"
                ? "primary"
                : "default"
            }
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {actionType === "CONFIRM" && "Confirm Appointment"}
            {actionType === "COMPLETE" && "Mark Completed"}
            {actionType === "CANCEL" && "Confirm Cancellation"}
            {actionType === "NO_SHOW" && "Confirm No-Show"}
            {actionType === "NOTES" && "Save Notes"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
