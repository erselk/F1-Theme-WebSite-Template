'use client';

import Link from 'next/link';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export default function EventNotFound() {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {language === 'tr' ? 'Etkinlik Bulunamadı' : 'Event Not Found'}
      </h2>
      <p className={`mb-6 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
        {language === 'tr' 
          ? 'Aradığınız etkinlik bulunamadı veya kaldırılmış olabilir.'
          : 'The event you were looking for could not be found or may have been removed.'}
      </p>
      <Link 
        href="/events" 
        className={`inline-block px-4 py-2 rounded-md transition-colors ${
          isDark 
            ? 'bg-electric-blue hover:bg-electric-blue/90 text-white' 
            : 'bg-race-blue hover:bg-race-blue/90 text-white'
        }`}
      >
        {language === 'tr' ? 'Tüm Etkinlikler' : 'All Events'}
      </Link>
    </div>
  );
}
