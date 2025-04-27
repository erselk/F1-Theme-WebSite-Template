/**
 * Date utilities to handle timezone issues and ensure consistent date operations
 */

/**
 * Default timezone for the application
 * Turkey uses TRT (Turkey Time) which is UTC+3
 */
export const DEFAULT_TIMEZONE = 'Europe/Istanbul';

/**
 * Creates a date object with the specified timezone
 * @param date Date string or Date object
 * @param timezone Timezone string (e.g. 'Europe/Istanbul')
 * @returns Date object
 */
export function createTimezoneDate(date?: string | Date | null, timezone: string = DEFAULT_TIMEZONE): Date {
  // If no date is provided, use current time
  const dateToUse = date ? new Date(date) : new Date();
  
  // Create a date string with timezone info
  const dateString = dateToUse.toLocaleString('en-US', { timeZone: timezone });
  
  // Return a new Date object based on the timezone-adjusted string
  return new Date(dateString);
}

/**
 * Get the current date in the specified timezone
 * @param timezone Timezone string
 * @returns Current date in the specified timezone
 */
export function getCurrentDate(timezone: string = DEFAULT_TIMEZONE): Date {
  return createTimezoneDate(null, timezone);
}

/**
 * Format a date for display with proper timezone handling
 * @param dateString Date string
 * @param locale Locale string (e.g. 'tr-TR', 'en-US')
 * @param timezone Timezone string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
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
  
  // Ensure the timeZone is set in options
  if (!options.timeZone) {
    options.timeZone = timezone;
  }
  
  return date.toLocaleString(locale, options);
}

/**
 * Creates a date set to the beginning of the day (00:00:00) in the specified timezone
 * @param date Date to start with
 * @param timezone Timezone string
 * @returns Date object set to beginning of day
 */
export function getStartOfDay(date: Date | string, timezone: string = DEFAULT_TIMEZONE): Date {
  const tzDate = createTimezoneDate(date, timezone);
  tzDate.setHours(0, 0, 0, 0);
  return tzDate;
}

/**
 * Get ISO string representation of a date that correctly represents the timezone
 * @param date Date to convert
 * @param timezone Timezone string
 * @returns ISO string representing the date in the specified timezone
 */
export function toISOStringWithTimezone(date: Date | string, timezone: string = DEFAULT_TIMEZONE): string {
  const tzDate = createTimezoneDate(date, timezone);
  return tzDate.toISOString();
}