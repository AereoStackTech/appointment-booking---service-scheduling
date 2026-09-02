"use server";

import { createBookingSchema, CreateBookingInput } from "@/lib/validations/booking";
import { createPublicBooking, getAppointmentByReference } from "@/lib/data-service";
import { revalidatePath } from "next/cache";

export async function createPublicBookingAction(rawInput: CreateBookingInput) {
  try {
    const validated = createBookingSchema.parse(rawInput);
    const appointment = await createPublicBooking(validated);

    revalidatePath("/(dashboard)/appointments", "page");
    revalidatePath("/(dashboard)/dashboard", "page");
    revalidatePath("/(dashboard)/clients", "page");

    return {
      success: true,
      referenceCode: appointment.referenceCode,
      appointment,
    };
  } catch (error: any) {
    console.error("Booking creation failed:", error);
    return {
      success: false,
      error: error?.message || "Failed to complete appointment booking. Please try again.",
    };
  }
}

export async function getBookingByReferenceAction(referenceCode: string) {
  try {
    const appt = await getAppointmentByReference(referenceCode);
    if (!appt) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, appointment: appt };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to fetch appointment record" };
  }
}
