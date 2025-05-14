import { getDay, format, addHours, isToday } from 'date-fns';

export const OPENING_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 10, close: 20 }, // Sunday
  1: { open: 10, close: 22 }, // Monday
  2: { open: 10, close: 22 }, // Tuesday
  3: { open: 10, close: 22 }, // Wednesday
  4: { open: 10, close: 22 }, // Thursday
  5: { open: 10, close: 22 }, // Friday
  6: { open: 9, close: 23 },  // Saturday
};

export const getInitialTimeValues = () => {
  const initialDate = new Date();
  const initialDayOfWeek = getDay(initialDate);
  const openingConfig = OPENING_HOURS[initialDayOfWeek];
  const initialOpeningHour = openingConfig ? openingConfig.open : 10;
  const initialClosingHour = openingConfig ? openingConfig.close : 22;
  let initialEndHour = initialOpeningHour + 1;
  if (initialEndHour > initialClosingHour) {
    initialEndHour = initialClosingHour;
    if (initialOpeningHour >= initialClosingHour) {
        initialEndHour = initialOpeningHour;
    }
  }

  const initialStartHourStr = String(initialOpeningHour).padStart(2, '0');
  const initialEndHourStr = String(initialEndHour).padStart(2, '0');
  
  return {
    initialDate,
    initialFormattedDate: format(initialDate, 'yyyy-MM-dd'),
    initialTimeRange: [`${initialStartHourStr}:00`, `${initialEndHourStr}:00`] as [string, string],
    initialStartHour: initialStartHourStr,
    initialEndHour: initialEndHourStr,
    initialDuration: Math.max(1, initialEndHour - initialOpeningHour)
  };
};

// These might also be considered config or derived in the main component
export const TODAY_DATE = new Date();
export const FORMATTED_TODAY_DATE = format(TODAY_DATE, 'yyyy-MM-dd');
export const MIN_TIME_TODAY = isToday(TODAY_DATE) ? format(addHours(TODAY_DATE, 3), 'HH') : '09'; 

export const styleOverrides = `
  :root {
    --f1-red: #E10600;
    --f1-red-bright: #FF0000;
    --white: #FFFFFF;
    --light-grey: #F0F0F0;
    --very-light-grey: #FAFAFA;
    --dark-grey: #333333;
    --very-dark-grey: #121212;
    --medium-grey: #777777;
    --light-text-grey: #999999;
    --race-blue: #0090D0;
    --race-green: #00A14B;
    --metallic-silver: #C0C0C0;
    --electric-blue: #00B2FF;
    --neon-green: #00D766;
    --shadow-color: rgba(0, 0, 0, 0.1);
  }

  .dark {
    --f1-red: #FF0000;
    --shadow-color: rgba(0, 0, 0, 0.25);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Titillium Web', sans-serif;
    font-weight: 600;
  }

  body, p, li, a, input, select, button {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .technical-data, .race-numbers, .stats {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 500;
  }

  .bg-primary {
    background-color: var(--f1-red) !important;
  }

  .text-primary {
    color: var(--f1-red) !important;
  }

  .border-primary {
    border-color: var(--f1-red) !important;
  }

  .venue-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .bg-primary-hover:hover {
    background-color: var(--f1-red-bright) !important;
  }

  /* Calendar customization */
  /* React-datepicker stilleri kütüphane varsayılanına döndürüldü. */

  /* Success animation */
  @keyframes checkmark {
    0% {
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  .checkmark {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: checkmark 1s ease-in-out forwards;
  }

  /* Button primary style */
  .btn-primary {
    background-color: var(--f1-red);
    color: var(--white);
    border-radius: 0.375rem;
    padding: 0.75rem 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background-color: var(--f1-red-bright);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`; 