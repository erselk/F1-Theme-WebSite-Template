'use client';

import { LanguageType } from '@/lib/ThemeLanguageContext';

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
  if (!schedule?.length) {
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
        {schedule.map((item, index) => (
          <div 
            key={index} 
            className="flex flex-col md:flex-row gap-4 p-4 rounded-lg bg-dark-grey hover:bg-carbon-grey/40 transition-colors"
          >
            <div className="md:w-24 flex-shrink-0">
              <div className="flex items-center justify-center md:justify-start">
                <span className="bg-electric-blue/20 text-electric-blue px-3 py-1 rounded-full font-mono text-sm">
                  {item.time}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 text-white">{item.title[locale]}</h3>
              {item.description && (
                <p className="text-silver">{item.description[locale]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}