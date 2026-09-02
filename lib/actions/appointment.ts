"use server";

import {
  updateAppointmentStatusSchema,
  UpdateAppointmentStatusInput,
  rescheduleAppointmentSchema,
  RescheduleAppointmentInput,
} from "@/lib/validations/booking";
import { updateAppointmentStatus, getAppointmentById } from "@/lib/data-service";
import { requireAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { AppointmentStatus } from "@prisma/client";

export async function updateAppointmentStatusAction(rawInput: UpdateAppointmentStatusInput) {
  try {
    const user = await requireAuthUser();
    const validated = updateAppointmentStatusSchema.parse(rawInput);

    const updated = await updateAppointmentStatus(
      validated.appointmentId,
      validated.status as AppointmentStatus,
      validated.notes,
      validated.cancellationReason,
      user.id
    );

    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath(`/appointments/${validated.appointmentId}`);
    revalidatePath("/clients");

    return {
      success: true,
      appointment: updated,
    };
  } catch (error: any) {
    console.error("Status update error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update appointment status.",
    };
  }
}

export async function rescheduleAppointmentAction(rawInput: RescheduleAppointmentInput) {
  try {
    const user = await requireAuthUser();
    const validated = rescheduleAppointmentSchema.parse(rawInput);

    const current = await getAppointmentById(validated.appointmentId);
    if (!current) throw new Error("Appointment not found");

    // Compute new times
    const [year, month, day] = validated.date.split("-").map(Number);
    const [hours, minutes] = validated.slotTime.split(":").map(Number);
    const newStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const duration = current.service.durationMin;
    const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

    const updated = await updateAppointmentStatus(
      validated.appointmentId,
      AppointmentStatus.CONFIRMED,
      `Rescheduled to ${validated.date} ${validated.slotTime}. Reason: ${validated.reason || "Client request"}`,
      undefined,
      user.id
    );

    // Update start & end times
    if (updated) {
      updated.startTime = newStart;
      updated.endTime = newEnd;
    }

    revalidatePath("/dashboard");
    revalidatePath("/appointments");
    revalidatePath(`/appointments/${validated.appointmentId}`);

    return {
      success: true,
      appointment: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to reschedule appointment.",
    };
  }
}
