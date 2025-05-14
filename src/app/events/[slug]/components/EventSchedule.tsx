'use client';

import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface ScheduleItem {
  time: string;
  title: {
    tr: string;
    en: string;
  };
  description?: {
    tr: string;
    en: string;
  };
}

interface EventScheduleProps {
  schedule: ScheduleItem[];
  locale: LanguageType;
}

export function EventSchedule({ schedule, locale }: EventScheduleProps) {
  // Use theme context to get the current theme mode
  const { isDark } = useThemeLanguage();
  
  // Theme-dependent color classes
  const titleColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const descriptionColorClass = isDark ? 'text-silver' : 'text-slate-700';
  
  // Debug: Log the schedule prop to see what's being passed
  console.log('EventSchedule Component - Schedule prop:', schedule);
  
  // Check if schedule is undefined or not an array
  if (!Array.isArray(schedule) || schedule.length === 0) {
    console.log('Schedule is empty or not an array');
    return (
      <div className="text-center p-8 bg-dark-grey/40 rounded-lg border border-dashed border-carbon-grey">
        <p className="text-silver">
          {locale === 'tr' ? 'Program bilgisi henüz eklenmedi.' : 'Schedule information not available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="event-schedule">
      <div className="space-y-4">
        {schedule.map((item, index) => {
          // Debug: Check each item in schedule
          console.log(`Schedule Item ${index}:`, item);
          
          return (
            <div 
              key={index} 
              className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-dark-grey hover:bg-carbon-grey/40 transition-colors"
            >
              <div className="md:w-24 flex-shrink-0">
                <div className="flex items-center justify-start">
                  <span className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full font-mono text-sm font-bold">
                    {item.time}
                  </span>
                </div>
              </div>
              <div>
                <h3 className={`text-xl font-bold mb-1 ${titleColorClass}`}>
                  {item.title && item.title[locale] ? item.title[locale] : 'Untitled'}
                </h3>
                {item.description && item.description[locale] && (
                  <p className={descriptionColorClass}>{item.description[locale]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}