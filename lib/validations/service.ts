import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(3, "Service name must be at least 3 characters").max(80, "Name too long"),
  slug: z.string().trim().min(2, "Slug required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description too long"),
  durationMin: z.number().int().min(5, "Minimum duration is 5 minutes").max(480, "Maximum duration is 480 minutes")
    .refine((val) => val % 5 === 0, { message: "Duration must be divisible by 5 or 15 minutes" }),
  bufferMin: z.number().int().min(0, "Buffer minutes cannot be negative").max(120, "Maximum buffer is 120 minutes")
    .default(15),
  price: z.number().min(0, "Price must be non-negative"),
  isActive: z.boolean().default(true),
  colorTag: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code (e.g. #3B82F6)").default("#3B82F6"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
