import { formatDateWithTimezone } from "@workspace/lib/utils";

type DateValue = Date | string | number;

const DAY_MS = 24 * 60 * 60 * 1000;

export function chatDayKey(value: DateValue, timezone?: string | null) {
  return formatDateWithTimezone(value, "yyyy-MM-dd", timezone);
}

export function formatMessageTime(value: DateValue, timezone?: string | null) {
  return formatDateWithTimezone(value, "p", timezone);
}

export function formatMessageDay(value: DateValue, timezone?: string | null) {
  const key = chatDayKey(value, timezone);
  const now = new Date();
  const todayKey = chatDayKey(now, timezone);
  const yesterdayKey = chatDayKey(new Date(now.getTime() - DAY_MS), timezone);

  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";

  return formatDateWithTimezone(value, "EEEE, MMM d", timezone);
}

export function formatConversationTime(
  value: DateValue,
  timezone?: string | null
) {
  const key = chatDayKey(value, timezone);
  const now = new Date();
  const todayKey = chatDayKey(now, timezone);
  const yesterdayKey = chatDayKey(new Date(now.getTime() - DAY_MS), timezone);

  if (key === todayKey) return formatMessageTime(value, timezone);
  if (key === yesterdayKey) return "Yesterday";

  return formatDateWithTimezone(value, "MMM d", timezone);
}

export function formatLastSeen(value: DateValue, timezone?: string | null) {
  return formatDateWithTimezone(value, "PP p", timezone);
}
