'use client';

import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export function EventPageHeader() {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className="mb-8 px-4 md:px-8 lg:px-12">
      <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {language === 'tr' ? 'Etkinlikler' : 'Events'}
      </h1>
      <p className={`mt-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
        {language === 'tr' 
          ? 'Motorsport tutkunları için yaklaşan etkinlikler ve aktiviteler'
          : 'Upcoming events and activities for motorsport enthusiasts'}
      </p>
    </div>
  );
}
