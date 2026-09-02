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
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { rescheduleAppointmentAction } from "@/lib/actions/appointment";
import { formatDateIso, formatTime12 } from "@/lib/time";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RescheduleDialogProps {
  appointment: {
    id: string;
    referenceCode: string;
    service: { id: string; name: string; durationMin: number };
    client: { fullName: string };
  } | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AppointmentRescheduleDialog({
  appointment,
  open,
  onClose,
  onSuccess,
}: RescheduleDialogProps) {
  const [date, setDate] = React.useState(formatDateIso(new Date()));
  const [slot, setSlot] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("Client requested reschedule");
  const [slots, setSlots] = React.useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !appointment) return;

    let isMounted = true;
    fetch(`/api/availability?serviceId=${appointment.service.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!isMounted) return;
        if (d.slots) setSlots(d.slots);
        else setSlots([]);
      })
      .catch(() => {
        if (isMounted) setSlots([]);
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, appointment, date]);

  if (!appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await rescheduleAppointmentAction({
        appointmentId: appointment.id,
        date,
        slotTime: slot,
        reason: reason.trim() || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to reschedule appointment.");
        setSubmitting(false);
        return;
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogClose onClick={onClose} />
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </div>
          <DialogDescription>
            Select a new date and open time slot for {appointment.client.fullName} (
            {appointment.referenceCode}).
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 mb-4 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-stone-700 block mb-1.5">
              Select New Date
            </label>
            <Calendar selectedDate={date} onSelectDate={setDate} />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1.5">
              Select Open Time Slot
            </label>
            {loadingSlots ? (
              <div className="p-4 text-center text-stone-400">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1" />
                <span>Checking availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="p-4 text-center text-stone-500 bg-stone-50 rounded-lg">
                No open slots for this date.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlot(s.time)}
                    className={cn(
                      "h-8 rounded-md text-[11px] font-mono font-medium transition-all",
                      slot === s.time
                        ? "bg-indigo-600 text-white font-bold"
                        : s.available
                        ? "bg-stone-50 border border-stone-200 text-stone-800 hover:bg-stone-100"
                        : "bg-stone-50 text-stone-300 line-through opacity-40"
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">
              Reschedule Note / Reason
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Client requested afternoon slot"
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!slot || submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
