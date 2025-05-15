import { format, parseISO, getDay, addHours, isToday } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { OPENING_HOURS } from './reservationForm.config'; // Config dosyasından OPENING_HOURS import edilecek

// Helper function to get initial dynamic values
// This function is used in reservationForm.config.ts, so it's better to keep it there or duplicate if truly needed here for other helpers.
// For now, assuming it's not directly used by other helpers here.

// Get formatted time string
export const getFormattedTimeString = (hour: string, minute: string): string => {
  return `${hour}:${minute}`;
};

// Get venue display name
export const getVenueName = (id: string, venueOptions: { id: string; title: { tr: string; en: string } }[], language: 'tr' | 'en'): string => {
  const venue = venueOptions.find(v => v.id === id);
  if (venue && venue.title && venue.title[language]) {
    return venue.title[language];
  } else if (venue && venue.title && venue.title.tr) { // Fallback to Turkish if specific language title not found
    return venue.title.tr;
  }
  return id; // Fallback to id if venue or title is not found
};

// Get formatted date string for confirmation based on language
export const getFormattedDate = (dateString: string, language: string = 'tr'): string => {
  try {
    const date = parseISO(dateString); // or new Date(dateString)
    return format(date, 'PPPP', { locale: language === 'tr' ? tr : enUS });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Return original string in case of error
  }
};

// Get the opening/closing hours for a specific date
export const getDayOpeningHours = (date: Date): { open: number; close: number } => {
  const dayOfWeek = getDay(date);
  return OPENING_HOURS[dayOfWeek] || { open: 10, close: 22 }; // Default if not found
};

// Get the opening hour for a specific date
export const getOpeningHourForDate = (date: Date): number => {
  return getDayOpeningHours(date).open;
};

// Determine if venue needs payment
export const venueNeedsPayment = (venueId: string): boolean => {
  return ["f1", "vr", "computers"].includes(venueId);
};

// Check if date and time selections are valid
export const isDateTimeValid = (date: string, timeRange: [string, string] | null): boolean => {
  if (!date || !timeRange) return false;
  // Basic check: end time must be after start time. More complex validation (e.g., min duration) can be added.
  return timeRange[1] > timeRange[0]; 
};

// Check if name fields are valid
export const isNameValid = (name: string, surname: string): boolean => {
  return name.trim() !== "" && surname.trim() !== "";
};

// Check if phone number is valid (basic check for 10 or 11 digits)
export const isPhoneValid = (phone: string): boolean => {
  // Updated regex to accept +xxxxxxxxxxxx, xxxxxxxxxxxx, xxxxxxxxxxx, xxxxxxxxxx
  const cleanedPhone = phone.replace(/\D/g, ''); // Remove non-digits first if + is kept for display only
  // If keeping + for validation, the regex needs to handle it optionally at the beginning.
  // Regex for: optional +, followed by 10 to 12 digits.
  return /^(\+)?\d{10,12}$/.test(phone.replace(/\s/g, '')); // Allow + and 10-12 digits, remove spaces
};

// Generate hour options for dropdowns based on opening/closing times and selected date
export const generateHourOptions = (
  selectedDate: Date,
  isStartTime: boolean,
  currentStartHour?: string, // Only for end time calculation
  currentStartMinute?: string // Only for end time calculation, if same hour
): string[] => {
  const { open, close } = getDayOpeningHours(selectedDate);
  const options: string[] = [];
  let startHourForDropdown = open;

  if (!isStartTime && currentStartHour) {
    // For end time, start from selected startHour.
    // If start minute is 45, next hour must be available.
    // If start minute is less than 45, same hour might be available for end time.
    startHourForDropdown = Math.max(open, parseInt(currentStartHour));
  }
  
  // If today, and current time is later than opening, adjust start for dropdown
  if (isToday(selectedDate)) {
      const nowHour = new Date().getHours();
      // Consider a buffer, e.g., user can't book for the immediate past hour or current hour without enough lead time
      // This logic was partially in the main component with addHours(today, 3) for minTime
      // For simplicity here, we use the general opening hours. More complex logic can be integrated.
      startHourForDropdown = Math.max(startHourForDropdown, nowHour + 1); // Example: at least 1 hour from now
  }


  for (let hour = startHourForDropdown; hour <= close; hour++) {
    if (isStartTime) {
      // Allow selection up to one hour before closing time to ensure a minimum 1-hour slot can be completed.
      if (hour < close) {
        options.push(String(hour).padStart(2, '0'));
      }
    } else { // For End Time
      if (currentStartHour) {
        const startH = parseInt(currentStartHour);
        if (hour > startH) { // End hour must be greater than start hour
          if (hour <= close) { // And not exceed closing time
             options.push(String(hour).padStart(2, '0'));
          }
        } else if (hour === startH && currentStartMinute) {
          // If end hour is same as start hour, ensure minutes allow for a valid range
          // This is primarily handled by minute options, but as a safe-guard for hour itself:
          // If start minute is e.g. '45', this hour shouldn't be an option for end time if min duration is 1hr.
          // However, if we allow 15-min slots, it might be.
          // Given previous logic, we'll allow same hour, minute logic will refine.
          if (hour <= close) { // Check against closing time
            options.push(String(hour).padStart(2, '0'));
          }
        }
      }
    }
  }

  // Ensure there's at least one option if possible
  if (isStartTime && options.length === 0 && open < close) {
    options.push(String(open).padStart(2, '0')); // Default to opening if no other valid start time
  }
  if (!isStartTime && options.length === 0 && currentStartHour) {
    const nextHourAfterStart = parseInt(currentStartHour) + 1;
    if (nextHourAfterStart <= close) {
      options.push(String(nextHourAfterStart).padStart(2, '0'));
    }
  }
   // If still no options for end time, and start time is the last possible hour (close -1)
   // and we require at least 1 hr booking, then it's an invalid state handled by disabling submission.
   // If start time is 'close', then no end time options will appear.

  return options;
};

// Generate minute options for dropdowns
export const minuteOptions: string[] = ['00', '15', '30', '45'];

export const generateMinuteOptions = (
  selectedDate: Date,
  selectedHour: string,
  isStartTime: boolean,
  currentStartHour?: string,
  currentStartMinute?: string
): string[] => {
  const { open, close } = getDayOpeningHours(selectedDate);
  const currentHourInt = parseInt(selectedHour);
  let availableMinutes = [...minuteOptions];

  // If it's the End Time dropdown and the selected end hour is the same as the start hour
  if (!isStartTime && currentStartHour === selectedHour && currentStartMinute) {
    const startMinuteIndex = minuteOptions.indexOf(currentStartMinute);
    if (startMinuteIndex !== -1) {
      availableMinutes = minuteOptions.slice(startMinuteIndex + 1);
    } else {
      // Start minute wasn't one of the options, problematic. Default to all.
    }
  }

  // If selected hour is the closing hour, only '00' is a valid minute for end time.
  // For start time at closing hour, no minutes should be available if min duration is >0.
  if (currentHourInt === close) {
    if (isStartTime) availableMinutes = []; // Cannot start at exact closing time
    else availableMinutes = availableMinutes.filter(minute => minute === '00'); // Can only end at :00 of closing time
  }
  
  // If selected hour is the opening hour, all minutes are potentially valid for start time
  // if (isStartTime && currentHourInt === open) {
      // Potentially, if it's today and current time is within this hour, filter past minutes.
      // This requires passing current minute of the day.
  // }

  // Ensure if start time is selected as (close - 1):45, then end time cannot be (close - 1):any or 'close:00' if min duration is 1hr.
  // This complex validation is tricky here. The `isDateTimeValid` and overall form validation should catch impossible selections.
  // The goal here is to provide reasonable options.

  // If no minutes are left (e.g. end hour = start hour, start minute = '45'), return empty or a default
  // This usually means the hour selection itself needs adjustment or validation elsewhere.
  return availableMinutes.length > 0 ? availableMinutes : (isStartTime ? [] : ['00']); // Default for end time if hour is valid but no minutes derived.
};

// Format current date to YYYY-MM-DD for min date in date picker
// This is more of a constant or initial setup value, might fit better in config or main component state init
export const getFormattedToday = (): string => format(new Date(), 'yyyy-MM-dd');

export const getMinTimeToday = (): string => {
    const today = new Date();
    // If it's today, earliest booking is 3 hours from now (as per original logic)
    // Otherwise, it's the standard opening time.
    // This function needs to know the selected date to be fully effective if not just for "today"
    if (isToday(today)) { // This check might be redundant if used for a date picker's minTime for *today*
        return format(addHours(today, 3), 'HH:mm'); // Return HH:mm for time picker
    }
    // For other days, minTime would be opening time. This function is too specific for "today".
    // Consider getMinTimeForDate(date)
    return '09:00'; // Default, should be dynamic based on selectedDate's opening.
}

// It seems `TODAY_DATE`, `FORMATTED_TODAY_DATE`, `MIN_TIME_TODAY` constants
// and `getInitialTimeValues` were already moved to `reservationForm.config.ts`.
// `OPENING_HOURS` is also there. We should import `OPENING_HOURS` from config. 