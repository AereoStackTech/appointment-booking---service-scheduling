"use server";

import {
  updateWeeklyAvailabilitySchema,
  UpdateWeeklyAvailabilityInput,
  blackoutPeriodSchema,
  BlackoutPeriodInput,
} from "@/lib/validations/availability";
import {
  updateWeeklyAvailability,
  createBlackoutPeriod,
  deleteBlackoutPeriod,
} from "@/lib/data-service";
import { requireAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateWeeklyAvailabilityAction(rawInput: UpdateWeeklyAvailabilityInput) {
  try {
    await requireAdminUser();
    const validated = updateWeeklyAvailabilitySchema.parse(rawInput);
    const updated = await updateWeeklyAvailability(validated.schedule);

    revalidatePath("/availability");
    revalidatePath("/book");

    return {
      success: true,
      schedule: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to update weekly availability schedule.",
    };
  }
}

export async function createBlackoutPeriodAction(rawInput: BlackoutPeriodInput) {
  try {
    await requireAdminUser();
    const validated = blackoutPeriodSchema.parse(rawInput);
    const created = await createBlackoutPeriod(validated);

    revalidatePath("/availability");
    revalidatePath("/book");

    return {
      success: true,
      blackoutPeriod: created,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to add blackout period.",
    };
  }
}

export async function deleteBlackoutPeriodAction(id: string) {
  try {
    await requireAdminUser();
    const ok = await deleteBlackoutPeriod(id);

    revalidatePath("/availability");
    revalidatePath("/book");

    return {
      success: ok,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to remove blackout period.",
    };
  }
}
