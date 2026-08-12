const JST_OFFSET = "+09:00";

export const SLOT_DURATION_MINUTES = 15;

export function parseJstDateTime(date: string, time: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    throw new Error("Invalid date or time");
  }

  const value = new Date(`${date}T${time}:00${JST_OFFSET}`);
  if (Number.isNaN(value.getTime())) {
    throw new Error("Invalid date or time");
  }
  return value;
}

function jstParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute", string>;
}

export function formatJstDateTime(date: Date) {
  const { year, month, day, hour, minute } = jstParts(date);
  return `${year}/${month}/${day} ${hour}:${minute}`;
}

export function toJstDateString(date: Date) {
  const { year, month, day } = jstParts(date);
  return `${year}-${month}-${day}`;
}

export function toJstTimeString(date: Date) {
  const { hour, minute } = jstParts(date);
  return `${hour}:${minute}`;
}

export function isSlotAligned(date: Date) {
  return (
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0 &&
    date.getUTCMinutes() % SLOT_DURATION_MINUTES === 0
  );
}

export function isMinorRestrictedHour(date: Date) {
  const { hour } = jstParts(date);
  const hourNumber = Number(hour);
  return hourNumber >= 22 || hourNumber < 5;
}

export function isMinorAt(dateOfBirth: Date, referenceDate = new Date()) {
  const birth = jstParts(dateOfBirth);
  const reference = jstParts(referenceDate);
  const age =
    Number(reference.year) -
    Number(birth.year) -
    (Number(`${reference.month}${reference.day}`) <
    Number(`${birth.month}${birth.day}`)
      ? 1
      : 0);
  return age < 18;
}
