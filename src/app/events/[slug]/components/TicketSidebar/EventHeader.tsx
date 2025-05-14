import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { Event } from '@/types';

interface EventHeaderProps {
  event: Event;
  locale: LanguageType;
}

export function EventHeader({ event, locale }: EventHeaderProps) {
  const { isDark } = useThemeLanguage();
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  
  // Helper function to check if a date is valid
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    const d = new Date(date);
    // Check if the date object is valid and not NaN
    return !isNaN(d.getTime());
  };
  
  // Format date with proper error handling
  const formatEventDate = (dateString: string): string => {
    try {
      if (!isValidDate(dateString)) {
        return locale === 'tr' ? 'Tarih belirtilmedi' : 'Date not specified';
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return locale === 'tr' ? 'Geçersiz tarih' : 'Invalid date';
    }
  };

  return (
    <div className={`mb-2 border-b ${borderColorClass} pb-2`}>
      <h2 className={`text-base font-bold ${headingColorClass}`}>{event.title[locale]}</h2>
      <p className={`${textColorClass} text-xs flex items-center mt-0.5`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-neon-red" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        {formatEventDate(event.date)}
      </p>
      <p className={`${textColorClass} text-xs flex items-center mt-0.5`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
        {event.location[locale]}
      </p>
    </div>
  );
} 