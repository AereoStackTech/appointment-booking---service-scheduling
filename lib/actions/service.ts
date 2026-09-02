"use server";

import { serviceSchema, ServiceInput } from "@/lib/validations/service";
import {
  createService,
  updateService,
  toggleServiceStatus,
  getServiceById,
} from "@/lib/data-service";
import { requireAdminUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createServiceAction(rawInput: ServiceInput) {
  try {
    await requireAdminUser();
    const validated = serviceSchema.parse(rawInput);
    const created = await createService(validated);

    revalidatePath("/services");
    revalidatePath("/book");

    return {
      success: true,
      service: created,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to create service offering.",
    };
  }
}

export async function updateServiceAction(id: string, rawInput: ServiceInput) {
  try {
    await requireAdminUser();
    const validated = serviceSchema.parse(rawInput);
    const updated = await updateService(id, validated);

    revalidatePath("/services");
    revalidatePath(`/services/${id}/edit`);
    revalidatePath("/book");

    return {
      success: true,
      service: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to update service.",
    };
  }
}

export async function toggleServiceStatusAction(id: string, isActive: boolean) {
  try {
    await requireAdminUser();
    const updated = await toggleServiceStatus(id, isActive);

    revalidatePath("/services");
    revalidatePath("/book");

    return {
      success: true,
      service: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to update service visibility.",
    };
  }
}
