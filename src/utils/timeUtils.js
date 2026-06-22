const NEW_YORK_TIME_ZONE = "America/New_York";

export function getGreetingByNewYorkTime(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: NEW_YORK_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(date),
  );

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}
