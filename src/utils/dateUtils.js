const NEW_YORK_TIME_ZONE = "America/New_York";

function getNewYorkDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: NEW_YORK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function toUtcDay({ year, month, day }) {
  return Date.UTC(year, month - 1, day);
}

export function normalizeDateString(dateString) {
  if (!dateString || typeof dateString !== "string") return "";

  const trimmed = dateString.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return trimmed;

  if (!/[12]\d{3}/.test(trimmed)) return "";

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNewYorkDayDifference(dateString) {
  const normalizedDate = normalizeDateString(dateString);
  if (!normalizedDate) return null;

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const targetUtcDay = toUtcDay({ year, month, day });
  const todayUtcDay = toUtcDay(getNewYorkDateParts());

  return Math.round((targetUtcDay - todayUtcDay) / 86400000);
}

export function getDaysUntil(dateString) {
  const difference = getNewYorkDayDifference(dateString);
  if (difference === null) return "Date not set";
  if (difference === 0) return "Today";

  const absoluteDifference = Math.abs(difference);
  const dayLabel = absoluteDifference === 1 ? "day" : "days";

  if (difference > 0) return `${absoluteDifference} ${dayLabel} left`;
  return `${absoluteDifference} ${dayLabel} ago`;
}

export function isDateUnlocked(dateString) {
  const difference = getNewYorkDayDifference(dateString);
  return difference !== null && difference <= 0;
}
