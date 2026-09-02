/**
 * Generates an iCalendar (.ics) file string for downloading
 */
export function generateIcsFile({
  title,
  description,
  location = "CalenPulse Studio",
  startTime,
  endTime,
}: {
  title: string;
  description: string;
  location?: string;
  startTime: Date | string;
  endTime: Date | string;
}): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalenPulse//Appointment Scheduling//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cp-${Date.now()}@calenpulse.internal`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Triggers a direct browser download of an .ics file
 */
export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a Google Calendar Web Add URL
 */
export function generateGoogleCalendarUrl({
  title,
  description,
  location = "CalenPulse Studio",
  startTime,
  endTime,
}: {
  title: string;
  description: string;
  location?: string;
  startTime: Date | string;
  endTime: Date | string;
}): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatGCalDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatGCalDate(start)}/${formatGCalDate(end)}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
