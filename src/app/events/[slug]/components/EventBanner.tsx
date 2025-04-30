'use client';

import React from 'react';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { CountdownTimer } from './CountdownTimer';
import { SocialShare } from './SocialShare';

interface EventBannerProps {
  event: any;
  eventStatus: string;
  pageUrl: string;
}

export function EventBanner({ event, eventStatus, pageUrl }: EventBannerProps) {
  const { language, isDark } = useThemeLanguage();
  
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
  
  // Enhanced text color classes based on theme - using exact hex codes from ContactContent.tsx
  const textColorClass = isDark ? 'text-white font-medium' : 'text-very-dark-grey font-medium';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const accentColorClass = isDark ? 'text-electric-blue' : 'text-neon-red';
  
  // Use the same color scheme as in ContactContent.tsx for category badge
  const categoryTextClass = 'text-white';  // Always keep text white for better contrast
  const categoryBgClass = isDark ? 'bg-[#00D766]' : 'bg-[#00A14B]';  // Green like in ContactContent
  
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
      
      {/* İçerik katmanı */}
      <div className="absolute inset-0 flex items-end">
        <div className="container mx-auto p-4 md:p-8 pl-4 sm:pl-8 md:pl-24">
          {/* Etkinlik durum göstergesi ve geri sayım */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {eventStatus === 'upcoming' && (
              <>
                <span className="bg-neon-green text-very-dark-grey px-3 py-1 rounded-full text-sm font-medium">
                  {t.upcoming}
                </span>
                <CountdownTimer targetDate={event.date} locale={language} />
              </>
            )}
            {eventStatus === 'ongoing' && (
              <span className="bg-electric-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                {t.ongoing}
              </span>
            )}
            {eventStatus === 'past' && (
              <span className="bg-carbon-grey text-light-grey px-3 py-1 rounded-full text-sm font-medium">
                {t.past}
              </span>
            )}
          </div>

          {/* Başlık */}
          <h1 className={`text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg ${headingColorClass}`}>
            {event.title[language]}
          </h1>

          {/* Etiketler */}
          <div className="flex flex-wrap gap-4 mb-5">
            <div className="flex flex-col items-start">
              <span className={`text-xs mb-1 ${accentColorClass}`}>
                {t.category}:
              </span>
              <p className="flex items-center text-sm">
                <span className={`${categoryBgClass} ${categoryTextClass} px-3 py-1 rounded-full font-medium`}>
                  {typeof event.category === 'object' ? event.category[language] : event.category}
                </span>
              </p>
            </div>
            
            <div className="flex flex-col items-start">
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
            
            <div className="flex flex-col items-start">
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
          <div className="flex flex-wrap items-center gap-2 text-sm mt-4">
            <SocialShare url={pageUrl} title={event.title[language]} locale={language} />
          </div>
        </div>
      </div>
    </div>
  );
}