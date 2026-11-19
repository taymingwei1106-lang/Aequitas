/*
 * A monthly calendar reminder for the check-in day, without any account
 * or server: an .ics file (Apple Calendar, Outlook, most phones) or a
 * pre-filled Google Calendar link.
 */

const TITLE = "Aequitas monthly check-in";

function pad(n) {
  return String(n).padStart(2, "0");
}

/* Next date (today or later) that falls on `day` of a month. */
function nextOccurrence(day, today = new Date()) {
  const d = new Date(today.getFullYear(), today.getMonth(), day);
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) d.setMonth(d.getMonth() + 1);
  return d;
}

function stamp(date, hour, minute) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(hour)}${pad(minute)}00`;
}

function appUrl() {
  return typeof window !== "undefined" ? `${window.location.origin}/home` : "";
}

function description() {
  return `Record last month's rent, instalment, expenses and loan balance in Aequitas. ${appUrl()}`.trim();
}

export function reminderIcs(day) {
  const start = nextOccurrence(day);
  const now = new Date();
  const created = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  // Floating times (no time zone): 9:00 am wherever the phone is.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Aequitas//Check-in reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:aequitas-checkin-${day}@aequitas.app`,
    `DTSTAMP:${created}`,
    `DTSTART:${stamp(start, 9, 0)}`,
    `DTEND:${stamp(start, 9, 15)}`,
    `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`,
    `SUMMARY:${TITLE}`,
    `DESCRIPTION:${description().replace(/[,;]/g, (c) => `\\${c}`)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${TITLE}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function downloadReminder(day) {
  const blob = new Blob([reminderIcs(day)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Aequitas-check-in-reminder.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(day) {
  const start = nextOccurrence(day);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kuala_Lumpur";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: TITLE,
    dates: `${stamp(start, 9, 0)}/${stamp(start, 9, 15)}`,
    ctz: zone,
    recur: `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`,
    details: description(),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
