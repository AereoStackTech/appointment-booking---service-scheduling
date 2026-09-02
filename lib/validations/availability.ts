import { z } from "zod";

export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const weeklyDayScheduleSchema = z
  .object({
    dayOfWeek: dayOfWeekEnum,
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm 24-hour format"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm 24-hour format"),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (!data.isActive) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "End time must be later than start time",
      path: ["endTime"],
    }
  );

export const updateWeeklyAvailabilitySchema = z.object({
  schedule: z.array(weeklyDayScheduleSchema).min(1, "Schedule must contain day configurations"),
});

export type WeeklyDayScheduleInput = z.infer<typeof weeklyDayScheduleSchema>;
export type UpdateWeeklyAvailabilityInput = z.infer<typeof updateWeeklyAvailabilitySchema>;

export const blackoutPeriodSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
    startDate: z.string().min(10, "Valid start date required"),
    endDate: z.string().min(10, "Valid end date required"),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export type BlackoutPeriodInput = z.infer<typeof blackoutPeriodSchema>;
