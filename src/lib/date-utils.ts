export const DEFAULT_TIMEZONE = 'Europe/Istanbul';

export function createTimezoneDate(date?: string | Date | null, timezone: string = DEFAULT_TIMEZONE): Date {
  const dateToUse = date ? new Date(date) : new Date();
  const dateString = dateToUse.toLocaleString('en-US', { timeZone: timezone });
  return new Date(dateString);
}

export function getCurrentDate(timezone: string = DEFAULT_TIMEZONE): Date {
  return createTimezoneDate(null, timezone);
}

export function formatDate(
  dateString: string | Date,
  locale: string = 'tr-TR',
  timezone: string = DEFAULT_TIMEZONE,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: DEFAULT_TIMEZONE
  }
): string {
  const date = new Date(dateString);
  if (!options.timeZone) {
    options.timeZone = timezone;
  }
  return date.toLocaleString(locale, options);
}

export function getStartOfDay(date: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const tzDate = createTimezoneDate(date, timezone);
  tzDate.setHours(0, 0, 0, 0);
  return tzDate;
}

export function toISOStringWithTimezone(date: Date | string, timezone: string = DEFAULT_TIMEZONE): string {
  const tzDate = createTimezoneDate(date, timezone);
  return tzDate.toISOString();
}