const dateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatReservationDateTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function getVisitDayDifference(value: string, now = new Date()): number {
  const visitDay = new Date(`${dayFormatter.format(new Date(value))}T00:00:00+09:00`);
  const today = new Date(`${dayFormatter.format(now)}T00:00:00+09:00`);
  return Math.ceil((visitDay.getTime() - today.getTime()) / 86_400_000);
}
