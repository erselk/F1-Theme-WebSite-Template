'use client';

import { useState, useEffect } from 'react';
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import dynamic from 'next/dynamic';

// EventsSection bileşenini tamamen istemci tarafında render edilecek şekilde dinamik import ediyoruz
const EventsSectionClient = dynamic(() => import('./EventsSectionClient'), {
  ssr: false, // Sunucu tarafında render edilmesini önlüyoruz
  loading: () => <EventsSectionLoading /> // Yükleme durumunda gösterilecek
});

type EventsSectionProps = {
  translations: {
    eventsTitle: string;
    eventsSubtitle: string;
    eventsCta: string;
    eventDetails: string;
  };
};

// Yükleme durumunda gösterilecek basit bir bileşen
function EventsSectionLoading() {
  const { isDark } = useThemeLanguage();
  
  return (
    <section className={`py-6 sm:py-10 ${isDark ? 'bg-[#262626]' : 'bg-gray-50'} relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto animate-pulse">
          <div className={`h-8 w-64 mx-auto rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          <div className={`mt-2 h-4 w-80 mx-auto rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
        </div>
        
        <div className="flex gap-6 mt-8 w-full overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-[280px] h-[380px] rounded-xl animate-pulse bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800"></div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ana komponent - sadece istemci tarafında render edilecek EventsSectionClient'ı döndürür
export default function EventsSection(props: EventsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Hydration sorunlarını önlemek için sadece client tarafında render ediyoruz
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return <EventsSectionLoading />;
  }
  
  return <EventsSectionClient {...props} />;
}