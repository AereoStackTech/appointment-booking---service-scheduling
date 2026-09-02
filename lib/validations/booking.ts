import { z } from "zod";

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  slotTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format (HH:mm)"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100, "Full name cannot exceed 100 characters"),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(20, "Phone number too long"),
  clientNotes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
  notes: z.string().max(1000).optional().or(z.literal("")),
  cancellationReason: z.string().max(500).optional().or(z.literal("")),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

export const rescheduleAppointmentSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  slotTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid time format"),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
