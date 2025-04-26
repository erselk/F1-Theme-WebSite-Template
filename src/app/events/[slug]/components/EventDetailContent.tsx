'use client';

import React, { useEffect } from 'react';
import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { ScrollbarStyles } from './ScrollbarStyles';
import { EventBanner } from './EventBanner';
import { SmoothScrollNav } from './SmoothScrollNav';
import { ImageGallery } from './ImageGallery';
import { TicketSidebar } from './TicketSidebar';
import { EventSchedule } from './EventSchedule';
import { SimilarEvents } from './SimilarEvents';

interface EventDetailContentProps {
  event: any;
  eventStatus: string;
  pageUrl: string;
  locale: LanguageType;
}

export function EventDetailContent({ event, eventStatus, pageUrl, locale }: EventDetailContentProps) {
  const { language, isDark, setLanguage } = useThemeLanguage();
  
  // Only sync server locale once during initialization, not on every language change
  useEffect(() => {
    // Server hydration - only set once, then let the user control language
    if (locale) {
      setLanguage(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this only runs once during initialization
  
  // Text translations
  const translations = {
    tr: {
      details: 'Etkinlik Detayları',
      schedule: 'Program Akışı',
      rules: 'Etkinlik Kuralları',
      gallery: 'Galeri',
      similarEvents: 'Benzer Etkinlikler',
    },
    en: {
      details: 'Event Details',
      schedule: 'Event Schedule',
      rules: 'Event Rules',
      gallery: 'Gallery',
      similarEvents: 'Similar Events',
    }
  };
  
  // Use language from ThemeLanguageContext instead of passed locale
  const t = translations[language];
  
  // Theme-dependent color classes
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';

  return (
    <main className="w-full bg-very-dark-grey overflow-x-hidden">
      <ScrollbarStyles />
      
      {/* Banner kısmını client component olarak ayırdık */}
      <EventBanner 
        event={event}
        eventStatus={eventStatus}
        pageUrl={pageUrl}
      />

      {/* Yapışkan (Sticky) Navigasyon - Banner'ın hemen altında */}
      <SmoothScrollNav 
        items={[
          { id: 'details', label: { en: 'Details', tr: 'Detaylar' } },
          { id: 'schedule', label: { en: 'Schedule', tr: 'Program' } },
          { id: 'rules', label: { en: 'Rules', tr: 'Kurallar' } },
          { id: 'gallery', label: { en: 'Gallery', tr: 'Galeri' } },
        ]}
      />

      {/* Sayfanın ana içeriği - 2 sütunlu grid yapısı */}
      <div className="container mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Ana içerik alanı - sol sütun */}
          <div className="flex-1">
            {/* Content Sections */}
            <div className="mt-6">
              {/* Details Section */}
              <section id="details" className="mb-6">
                <div className="p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center ${headingColorClass}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.details}
                  </h2>
                  <div className="prose max-w-none">
                    <p className={`text-base ${textColorClass}`}>{event.description[language]}</p>
                  </div>
                </div>
              </section>

              {/* Schedule Section */}
              <section id="schedule" className="mb-6">
                <div className="p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center ${headingColorClass}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.schedule}
                  </h2>
                  
                  <EventSchedule 
                    schedule={event.schedule} 
                    locale={language}
                  />
                </div>
              </section>

              {/* Grid layout for Rules and Gallery sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rules Section */}
                <section id="rules" className="mb-6">
                  <div className="p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className={`text-2xl font-bold mb-4 flex items-center ${headingColorClass}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {t.rules}
                    </h2>
                    
                    {event.rules ? (
                      <ul className={`list-disc pl-5 space-y-2 ${textColorClass}`}>
                        {event.rules[language]?.map((rule, index) => (
                          <li key={index} className="text-base">{rule}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className={`list-disc pl-5 space-y-2 ${textColorClass}`}>
                        <li className="text-base">
                          {language === 'tr' 
                            ? 'Her takım 4 kişiden oluşmalıdır.' 
                            : 'Each team must consist of 4 members.'}
                        </li>
                        <li className="text-base">
                          {language === 'tr' 
                            ? 'Lastik değişimi sırasında tüm güvenlik prosedürlerine uyulmalıdır.' 
                            : 'All safety procedures must be followed during the tire change.'}
                        </li>
                        <li className="text-base">
                          {language === 'tr' 
                            ? 'Takımlar kendi ekipmanlarını kullanabilir.' 
                            : 'Teams may use their own equipment.'}
                        </li>
                        <li className="text-base">
                          {language === 'tr' 
                            ? 'Zaman, tüm lastikler değiştirilip araç yere indirildiğinde durdurulur.' 
                            : 'Time stops when all tires are changed and the car is lowered.'}
                        </li>
                        <li className="text-base">
                          {language === 'tr' 
                            ? 'Hakemlerin kararı kesindir.' 
                            : 'Judges\' decisions are final.'}
                        </li>
                      </ul>
                    )}
                  </div>
                </section>

                {/* Gallery Section */}
                <section id="gallery" className="mb-6">
                  <div className="p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className={`text-2xl font-bold mb-4 flex items-center ${headingColorClass}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.gallery}
                    </h2>
                    
                    <ImageGallery 
                      images={event.gallery || [
                        "/images/events/gallery/event1.jpg",
                        "/images/events/gallery/event2.jpg",
                        "/images/events/gallery/event3.jpg"
                      ]} 
                      title={event.title[language]} 
                      locale={language} 
                    />
                  </div>
                </section>
              </div>

              {/* Similar Events Section */}
              <section className="mb-6">
                <div className="p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className={`text-2xl font-bold mb-4 flex items-center ${headingColorClass}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                    {t.similarEvents}
                  </h2>
                  
                  <SimilarEvents 
                    currentEventId={event.id} 
                    category={event.category}
                    locale={language}
                    maxEvents={4}
                    showPastEvents={false}
                  />
                </div>
              </section>
            </div>
          </div>
          
          {/* Sağ tarafta bilet satın alma bölümü - sayfa kaydırılırken görünür kalacak */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="sticky top-24" style={{ height: 'max-content' }}>
              <TicketSidebar event={event} locale={language} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}