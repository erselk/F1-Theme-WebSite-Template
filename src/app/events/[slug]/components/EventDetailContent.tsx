'use client';

import React, { useEffect } from 'react';
import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { getThemeColors, getCategoryTranslation } from '@/lib/ThemeColors';
import { 
  ImagePlaceholder, 
  ContentPlaceholder, 
  TicketPlaceholder, 
  BannerPlaceholder,
  SocialSharePlaceholder
} from '@/components/LoadingPlaceholders';
import { getEventStatus } from '@/types';

// Lazy loaded components
const ImageGallery = dynamic(() => import('./ImageGallery').then(mod => ({ default: mod.ImageGallery })), { 
  loading: () => <ImagePlaceholder />
});

const TicketSidebar = dynamic(() => import('./TicketSidebar').then(mod => ({ default: mod.TicketSidebar })), {
  loading: () => <TicketPlaceholder />
});

const EventSchedule = dynamic(() => import('./EventSchedule').then(mod => ({ default: mod.EventSchedule })), {
  loading: () => <ContentPlaceholder height="h-32" />
});

const EventBanner = dynamic(() => import('./EventBanner').then(mod => ({ default: mod.EventBanner })), {
  loading: () => <BannerPlaceholder />
});

// SocialShare bileşenini de lazy loading ile yükleyelim
const SocialShare = dynamic(() => import('./SocialShare'), {
  loading: () => <SocialSharePlaceholder />
});

interface EventDetailContentProps {
  event: any;
  eventStatus: string;
  pageUrl: string;
  locale: LanguageType;
  slug: string;
}

export function EventDetailContent({ event, eventStatus, pageUrl, locale, slug }: EventDetailContentProps) {
  const { language, isDark, setLanguage } = useThemeLanguage();
  
  // Only sync server locale once during initialization, not on every language change
  useEffect(() => {
    // Server hydration - only set once, then let the user control language
    if (locale) {
      setLanguage(locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this only runs once during initialization
  
  // Tema renklerini getThemeColors yardımcı fonksiyonuyla alalım
  const {
    headingColorClass,
    textColorClass,
    paragraphColorClass
  } = getThemeColors(isDark);
  
  // Text translations
  const translations = {
    tr: {
      details: 'Etkinlik Detayları',
      schedule: 'Program Akışı',
      rules: 'Etkinlik Kuralları',
      gallery: 'Galeri',
    },
    en: {
      details: 'Event Details',
      schedule: 'Event Schedule',
      rules: 'Event Rules',
      gallery: 'Gallery',
    }
  };
  
  // Use language from ThemeLanguageContext instead of passed locale
  const t = translations[language];

  // CheckMongoDB URL - Eğer bir MongoDB URL'si (/api/files ile başlıyorsa) doğrudan kullan
  const getImageUrl = (url: string) => {
    if (!url) return '/images/logouzun.jpg';
    return url;
  };

  return (
    <main className="w-full bg-very-dark-grey overflow-x-hidden">
      {/* Banner kısmını lazy loading olarak yükleyelim */}
      <Suspense fallback={<BannerPlaceholder />}>
        <EventBanner 
          event={{
            ...event,
            bannerImage: getImageUrl(event.bannerImage)
          }}
          eventStatus={eventStatus}
          pageUrl={pageUrl}
        />
      </Suspense>

      {/* Sayfanın ana içeriği */}
      <div className="container mx-auto px-3 md:px-8 py-4 md:py-6">
        {/* Mobil görünüm için bilet formunu üstte göster */}
        <div className="lg:hidden mb-4">
          {eventStatus === 'past' ? (
            <div className="p-4 rounded-lg border border-carbon-grey bg-graphite shadow-md">
              <div className="flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`text-center font-bold text-lg ${headingColorClass} mb-2`}>
                {language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Has Ended'}
              </h3>
              <p className={`text-center ${paragraphColorClass}`}>
                {language === 'tr' 
                  ? 'Bu etkinlik için bilet satışı artık mevcut değil.' 
                  : 'Ticket sales are no longer available for this event.'
                }
              </p>
            </div>
          ) : (
            <Suspense fallback={<div className="w-full h-64 bg-carbon-grey/50 animate-pulse rounded-lg"></div>}>
              <TicketSidebar event={event} locale={language} />
            </Suspense>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Ana içerik alanı - sol sütun */}
          <div className="flex-1">
            {/* Content Sections */}
            <div className="mt-4 lg:mt-6">
              {/* Details Section */}
              <section id="details" className="mb-4 lg:mb-6">
                <div className="p-4 lg:p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className={`text-xl lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center ${headingColorClass}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.details}
                  </h2>
                  <div className="prose max-w-none">
                    <p className={`text-sm lg:text-base ${textColorClass}`}>{event.description[language]}</p>
                  </div>
                </div>
              </section>

              {/* Schedule Section */}
              <section id="schedule" className="mb-4 lg:mb-6">
                <div className="p-4 lg:p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className={`text-xl lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center ${headingColorClass}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.schedule}
                  </h2>
                  
                  <Suspense fallback={<div className="w-full h-32 bg-carbon-grey/50 animate-pulse rounded-lg"></div>}>
                    <EventSchedule 
                      schedule={event.schedule} 
                      locale={language}
                    />
                  </Suspense>
                </div>
              </section>

              {/* Grid layout for Rules and Gallery sections - mobile responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                {/* Rules Section */}
                <section id="rules" className="mb-4 lg:mb-6">
                  <div className="p-4 lg:p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className={`text-xl lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center ${headingColorClass}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {t.rules}
                    </h2>
                    
                    {/* Check if rules exists and has the current language data */}
                    {event.rules && Array.isArray(event.rules) && event.rules.length > 0 ? (
                      <ul className={`list-disc pl-4 lg:pl-5 space-y-1.5 lg:space-y-2 ${textColorClass}`}>
                        {event.rules.map((rule: { id?: string | number, content?: Record<string, string> }, index: number) => (
                          <li key={rule.id || index} className="text-sm lg:text-base">{rule.content?.[language] || ""}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center py-3 lg:py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 lg:h-12 lg:w-12 text-gray-400 mb-2 lg:mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className={`${textColorClass} text-sm text-center`}>
                          {language === 'tr' 
                            ? 'Bu etkinlik için henüz kural belirtilmedi.' 
                            : 'No rules have been specified for this event yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Gallery Section */}
                <section id="gallery" className="mb-4 lg:mb-6">
                  <div className="p-4 lg:p-5 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className={`text-xl lg:text-2xl font-bold mb-3 lg:mb-4 flex items-center ${headingColorClass}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.gallery}
                    </h2>
                    
                    <Suspense fallback={<div className="w-full aspect-square bg-carbon-grey/50 animate-pulse rounded-lg"></div>}>
                      <ImageGallery 
                        images={event.gallery || [
                          "/images/about1.jpg",
                          "/images/about2.jpg",
                          "/images/about3.jpg"
                        ]} 
                        title={event.title[language]} 
                        locale={language} 
                      />
                    </Suspense>
                  </div>
                </section>
              </div>
            </div>
          </div>
          
          {/* Sağ sütun - bilet formu ile yan panel */}
          <div className="w-full lg:w-80 lg:flex-shrink-0 lg:sticky lg:top-24 self-start">
            {/* Ticket Sidebar Component - Only visible on desktop */}
            <div className="hidden lg:block">
              {eventStatus === 'past' ? (
                <div className="p-4 rounded-lg border border-carbon-grey bg-graphite shadow-md">
                  <div className="flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-center font-bold text-lg ${headingColorClass} mb-2`}>
                    {language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Has Ended'}
                  </h3>
                  <p className={`text-center ${paragraphColorClass}`}>
                    {language === 'tr' 
                      ? 'Bu etkinlik için bilet satışı artık mevcut değil.' 
                      : 'Ticket sales are no longer available for this event.'
                    }
                  </p>
                </div>
              ) : (
                <Suspense fallback={<div className="w-full h-64 bg-carbon-grey/50 animate-pulse rounded-lg"></div>}>
                  <TicketSidebar event={event} locale={language} />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        {/* Sosyal medya paylaşım butonları */}
        <div className="flex flex-wrap items-center gap-0.5 md:gap-2 text-xs md:text-sm mt-0.5 md:mt-4">
          <Suspense fallback={<div className="w-[100px] h-6 bg-carbon-grey/50 animate-pulse rounded-lg"></div>}>
            <SocialShare url={pageUrl} title={event.title[language]} locale={language} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}