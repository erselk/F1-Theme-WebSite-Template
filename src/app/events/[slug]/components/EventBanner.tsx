'use client';

import React from 'react';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { getThemeColors, getCategoryTranslation } from '@/lib/ThemeColors';
import { SocialSharePlaceholder } from '@/components/LoadingPlaceholders';

// Lazy load SocialShare bileşeni
const SocialShare = dynamic(() => import('./SocialShare'), {
  loading: () => <SocialSharePlaceholder />
});

interface EventBannerProps {
  event: any;
  eventStatus: string;
  pageUrl: string;
}

export function EventBanner({ event, eventStatus, pageUrl }: EventBannerProps) {
  const { language, isDark } = useThemeLanguage();
  
  // Tema renklerini getThemeColors yardımcı fonksiyonuyla alalım
  const {
    headingColorClass,
    textColorClass,
    accentColorClass,
    categoryTextClass,
    categoryBgClass
  } = getThemeColors(isDark);
  
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
        return language === 'tr' ? 'Tarih belirtilmedi' : 'Date not specified';
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return language === 'tr' ? 'Geçersiz tarih' : 'Invalid date';
    }
  };
  
  // Text translations for dual language support
  const translations = {
    tr: {
      upcoming: 'Yaklaşan',
      ongoing: 'Devam Ediyor',
      past: 'Geçmiş Etkinlik',
      date: 'Tarih',
      location: 'Konum',
      category: 'Kategori'
    },
    en: {
      upcoming: 'Upcoming',
      ongoing: 'Happening Now',
      past: 'Past Event',
      date: 'Date',
      location: 'Location',
      category: 'Category'
    }
  };
  
  // Get translations for current language
  const t = translations[language];
  
  return (
    <div className="relative w-full aspect-video overflow-hidden">
      {/* Banner görseli */}
      <Image 
        src={event.bannerImage || "/images/logouzun.png"} 
        alt={event.title[language]} 
        className="object-cover" 
        fill
        priority
        sizes="100vw"
        placeholder="empty"
        quality={85}
        unoptimized={event.bannerImage?.startsWith('/api/files/')}
      />
      
      {/* Filigran etkisi yaratacak overlay - Tema durumuna göre beyaz veya siyah */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-b from-black/30 via-black/40 to-black/60' 
            : 'bg-gradient-to-b from-white/30 via-white/40 to-white/60'
        } backdrop-blur-[1px]`}
      ></div>
      
      {/* Kategori badge - sol üst köşede (sadece mobil görünümde) */}
      <div className="absolute top-3 left-3 md:hidden">
        <span className={`${categoryBgClass} ${categoryTextClass} px-2 py-0.5 rounded-full text-[10px] font-medium`}>
          {getCategoryTranslation(event.category, language)}
        </span>
      </div>
      
      {/* İçerik katmanı */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto p-3 md:p-8 pl-3 sm:pl-8 md:pl-24">
          {/* Etkinlik durum göstergesi ve geri sayım */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
            {eventStatus === 'upcoming' && (
              <>
                <span className="bg-neon-green text-very-dark-grey px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block min-w-[30px] text-center whitespace-nowrap">
                  {t.upcoming}
                </span>
              </>
            )}
            {eventStatus === 'this-month' && (
              <span className="bg-neon-green text-very-dark-grey px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block min-w-[30px] text-center whitespace-nowrap">
                {language === 'tr' ? 'Bu Ay' : 'This Month'}
              </span>
            )}
            {eventStatus === 'ongoing' && (
              <span className="bg-electric-blue text-white px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block min-w-[30px] text-center whitespace-nowrap">
                {t.ongoing}
              </span>
            )}
            {eventStatus === 'past' && (
              <span className="bg-carbon-grey text-light-grey px-1.5 py-0.5 rounded-full text-[10px] font-medium inline-block min-w-[30px] text-center whitespace-nowrap">
                {t.past}
              </span>
            )}
          </div>

          {/* Başlık */}
          <h1 className={`text-2xl md:text-5xl font-bold mb-1 md:mb-3 drop-shadow-lg ${headingColorClass}`}>
            {event.title[language]}
          </h1>

          {/* Etiketler */}
          <div className="flex flex-wrap gap-2 md:gap-4 mb-1 md:mb-5">
            {/* Kategori - sadece desktop görünümde */}
            <div className="hidden md:flex flex-col items-start">
              <span className={`text-xs mb-1 ${accentColorClass}`}>
                {t.category}:
              </span>
              <p className="flex items-center text-sm">
                <span className={`${categoryBgClass} ${categoryTextClass} px-3 py-1 rounded-full font-medium`}>
                  {getCategoryTranslation(event.category, language)}
                </span>
              </p>
            </div>
            
            {/* Tarih - sadece desktop görünümde */}
            <div className="hidden md:flex flex-col items-start">
              <span className={`text-xs mb-1 ${accentColorClass}`}>
                {t.date}:
              </span>
              <p className={`flex items-center text-sm ${textColorClass}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatEventDate(event.date)}
              </p>
            </div>
            
            {/* Konum - sadece desktop görünümde */}
            <div className="hidden md:flex flex-col items-start">
              <span className={`text-xs mb-1 ${accentColorClass}`}>
                {t.location}:
              </span>
              <p className={`flex items-center text-sm ${textColorClass}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {typeof event.location === 'object' ? event.location[language] : event.location}
              </p>
            </div>
          </div>

          {/* Sosyal medya paylaşım butonları */}
          <div className="flex flex-wrap items-center gap-0.5 md:gap-2 text-xs md:text-sm mt-0.5 md:mt-4">
            <Suspense fallback={<SocialSharePlaceholder />}>
              <SocialShare url={pageUrl} title={event.title[language]} locale={language} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}