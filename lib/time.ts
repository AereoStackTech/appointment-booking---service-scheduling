import { DayOfWeek } from "@prisma/client";

export const DAY_OF_WEEK_MAP: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

export const DAY_DISPLAY_NAMES: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export interface SlotCalculationParams {
  dateStr: string; // "YYYY-MM-DD"
  durationMin: number;
  bufferMin: number;
  operatingHours?: {
    startTime: string; // "09:00"
    endTime: string;   // "18:00"
    isActive: boolean;
  } | null;
  existingAppointments: {
    id?: string;
    startTime: Date | string;
    endTime: Date | string;
    bufferMin?: number;
    status: string;
  }[];
  blackoutPeriods?: {
    startDate: Date | string;
    endDate: Date | string;
    title: string;
  }[];
  stepIntervalMin?: number; // default 15 mins or 30 mins
}

export interface ComputedSlot {
  time: string; // "09:30"
  startTimeIso: string;
  endTimeIso: string;
  available: boolean;
  conflictReason?: string;
}

/**
 * Converts "YYYY-MM-DD" and "HH:mm" into a local Date object in business hours context
 */
export function parseDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

/**
 * Returns the DayOfWeek enum value for a given date
 */
export function getDayOfWeekEnum(date: Date): DayOfWeek {
  const dayIndex = date.getDay();
  return DAY_OF_WEEK_MAP[dayIndex];
}

/**
 * Formats a Date to "HH:mm" 24h string
 */
export function formatTime24(date: Date | string): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Formats a Date to "09:30 AM" 12h string
 */
export function formatTime12(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a time range, e.g. "09:30 - 10:15 (45m)"
 */
export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  include12h = true
): string {
  const s = new Date(start);
  const e = new Date(end);
  if (include12h) {
    return `${formatTime12(s)} – ${formatTime12(e)}`;
  }
  return `${formatTime24(s)} – ${formatTime24(e)}`;
}

/**
 * Formats a date to "Wednesday, Sep 2, 2026"
 */
export function formatDateFull(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date to "Sep 2, 2026"
 */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Formats a date to "YYYY-MM-DD"
 */
export function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates a unique, cryptographically random booking reference code e.g. "CP-89247"
 */
export function generateReferenceCode(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CP-${num}`;
}

/**
 * Core dynamic conflict-free slot calculation engine
 */
export function calculateAvailableSlots(params: SlotCalculationParams): {
  slots: ComputedSlot[];
  isClosed: boolean;
  closedReason?: string;
} {
  const {
    dateStr,
    durationMin,
    bufferMin,
    operatingHours,
    existingAppointments,
    blackoutPeriods = [],
    stepIntervalMin = 15,
  } = params;

  // 1. Check if date is invalid
  const targetDate = new Date(`${dateStr}T00:00:00`);
  if (isNaN(targetDate.getTime())) {
    return { slots: [], isClosed: true, closedReason: "Invalid date format" };
  }

  // 2. Check Blackout periods
  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59`);

  for (const blackout of blackoutPeriods) {
    const bStart = new Date(blackout.startDate);
    const bEnd = new Date(blackout.endDate);
    if (dayStart <= bEnd && dayEnd >= bStart) {
      return {
        slots: [],
        isClosed: true,
        closedReason: `Studio Closed: ${blackout.title}`,
      };
    }
  }

  // 3. Check Operating Hours
  if (!operatingHours || !operatingHours.isActive) {
    const dayOfWeek = getDayOfWeekEnum(dayStart);
    return {
      slots: [],
      isClosed: true,
      closedReason: `Closed on ${DAY_DISPLAY_NAMES[dayOfWeek]}s`,
    };
  }

  // 4. Parse opening & closing times
  const [openHour, openMin] = operatingHours.startTime.split(":").map(Number);
  const [closeHour, closeMin] = operatingHours.endTime.split(":").map(Number);

  const openTimeMs = (openHour * 60 + openMin) * 60 * 1000;
  const closeTimeMs = (closeHour * 60 + closeMin) * 60 * 1000;

  // Filter existing active appointments (ignore CANCELLED)
  const activeBookings = existingAppointments
    .filter((a) => a.status !== "CANCELLED")
    .map((a) => {
      const s = new Date(a.startTime).getTime();
      const e = new Date(a.endTime).getTime();
      const buf = (a.bufferMin ?? 15) * 60 * 1000;
      return {
        id: a.id,
        startMs: s,
        endMs: e,
        endWithBufferMs: e + buf,
      };
    });

  const nowMs = Date.now();
  const leadTimeMs = 30 * 60 * 1000; // 30 mins advance notice minimum
  const slots: ComputedSlot[] = [];

  // Generate slots in steps
  let currentMinuteOffset = openHour * 60 + openMin;
  const closeMinuteOffset = closeHour * 60 + closeMin;

  while (currentMinuteOffset + durationMin <= closeMinuteOffset) {
    const slotHour = Math.floor(currentMinuteOffset / 60);
    const slotMin = currentMinuteOffset % 60;
    const timeStr = `${String(slotHour).padStart(2, "0")}:${String(slotMin).padStart(2, "0")}`;

    const slotStartDate = parseDateTime(dateStr, timeStr);
    const slotStartMs = slotStartDate.getTime();
    const slotEndMs = slotStartMs + durationMin * 60 * 1000;
    const slotEndWithBufferMs = slotEndMs + bufferMin * 60 * 1000;
    const slotEndDate = new Date(slotEndMs);

    let isAvailable = true;
    let conflictReason: string | undefined = undefined;

    // Check if slot is in the past
    if (slotStartMs < nowMs + leadTimeMs) {
      isAvailable = false;
      conflictReason = "Past time window";
    }

    // Check conflict with existing bookings
    if (isAvailable) {
      for (const booking of activeBookings) {
        // Overlap condition:
        // Candidate slot window (including its required buffer) overlaps with existing booking window
        const overlaps =
          slotStartMs < booking.endWithBufferMs &&
          slotEndWithBufferMs > booking.startMs;

        if (overlaps) {
          isAvailable = false;
          conflictReason = "Slot reserved";
          break;
        }
      }
    }

    slots.push({
      time: timeStr,
      startTimeIso: slotStartDate.toISOString(),
      endTimeIso: slotEndDate.toISOString(),
      available: isAvailable,
      conflictReason,
    });

    currentMinuteOffset += stepIntervalMin;
  }

  return {
    slots,
    isClosed: false,
  };
}
