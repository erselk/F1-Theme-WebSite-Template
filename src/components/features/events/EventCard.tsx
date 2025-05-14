'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/data/events';
import { formatEventDate } from '@/data/events';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import React from 'react';

type EventCardProps = {
  event: Event;
};

// React.memo ile sarmalayarak gereksiz yeniden render'ları önleme
export const EventCard = React.memo(function EventCard({ event }: EventCardProps) {
  const { language, isDark } = useThemeLanguage();
  
  const { 
    slug, 
    title, 
    squareImage,
    date, 
    description, 
    tickets,
    status
  } = event;

  // Find minimum price from tickets array
  const getMinPrice = () => {
    if (!tickets || tickets.length === 0) return 0;
    
    // Extract all price values from tickets
    const prices = tickets.map(ticket => ticket.price);
    
    // Find the minimum price
    return Math.min(...prices);
  };
  
  const minPrice = getMinPrice();

  // EventCard için özel tarih formatı - yıl ve saat bilgisi olmadan
  const formatCardDate = (dateString: string, lang: LanguageType): string => {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
    };
    
    return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Status label styles - Fiyat badge'i ile aynı stil
  const getStatusClasses = () => {
    const baseClasses = "absolute top-2 left-2 md:top-4 md:left-4 px-1 py-0.5 md:px-2 md:py-0.5 rounded-full text-[8px] md:text-[10px] font-medium z-10 shadow-sm";
    
    if (status === 'past') {
      return `${baseClasses} bg-gray-400 text-white`;
    } else {
      // Aynı fiyat badge'i gibi düzenle
      return isDark 
        ? `${baseClasses} bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50` 
        : `${baseClasses} bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50`;
    }
  };

  // Status label content
  const getStatusLabel = () => {
    switch (status) {
      case 'today': return language === 'tr' ? 'Bugün' : 'Today';
      case 'tomorrow': return language === 'tr' ? 'Yarın' : 'Tomorrow';
      case 'this-week': return language === 'tr' ? 'Bu Hafta' : 'This Week';
      case 'this-month': return language === 'tr' ? 'Bu Ay' : 'This Month';
      case 'upcoming': return language === 'tr' ? 'Yakında' : 'Upcoming';
      case 'past': return language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event';
      default: return 'Status: ' + status; // Hata ayıklama için status değerini gösterelim
    }
  };

  // Kategori label fonksiyonu
  const getCategoryLabel = () => {
    switch (event.category) {
      case 'workshop': return language === 'tr' ? 'Atölye Çalışması' : 'Workshop';
      case 'meetup': return language === 'tr' ? 'Buluşma' : 'Meetup';
      case 'conference': return language === 'tr' ? 'Konferans' : 'Conference';
      case 'race': return language === 'tr' ? 'Yarış' : 'Race';
      case 'party': return language === 'tr' ? 'Parti' : 'Party';
      case 'other': return language === 'tr' ? 'Diğer' : 'Other';
      default: return '';
    }
  };

  // Buton metni için özel fonksiyon
  const getButtonLabel = () => {
    if (status === 'past') {
      return language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Ended';
    }
    return language === 'tr' ? 'Bilet Al' : 'Buy Ticket';
  };

  // Buton stili için özel fonksiyon - matched with EventDetail
  const getButtonClasses = () => {
    const baseClasses = "w-full py-1.5 text-xs font-medium rounded-md transition-colors shadow-md";
    
    if (status === 'past') {
      return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
    }
    
    // Tüm diğer durumlar için f1-red veya f1-red-bright - matched with EventDetail
    if (isDark) {
      return `${baseClasses} bg-[#FF0000]/70 hover:bg-[#FF0000]/80 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50`;
    } else {
      return `${baseClasses} bg-[#E10600]/70 hover:bg-[#E10600]/80 text-white shadow-[#E10600]/30 border border-[#E10600]/50`;
    }
  };

  // Get the card background style for past events
  const getCardBackgroundStyle = () => {
    if (status === 'past') {
      return isDark 
        ? 'bg-graphite/70 border border-carbon-grey opacity-80'  
        : 'bg-card/70 border border-light-grey opacity-80';
    }
    return isDark 
      ? 'bg-graphite border border-carbon-grey' 
      : 'bg-card border border-light-grey';
  };

  return (
    <Link href={`/events/${slug}`} className="block group">
      <div className={`rounded-lg overflow-hidden shadow-md transition-shadow hover:shadow-lg ${getCardBackgroundStyle()}`}>
        <div className="relative aspect-square">
          {/* Status Badge */}
          <div className={getStatusClasses()}>
            {/* Daha kompakt badge stillemesi */}
            <span className="inline-block min-w-[30px] text-center whitespace-nowrap">
              {getStatusLabel()}
            </span>
          </div>
          
          {/* Price Badge - Geçmiş etkinlikler için gösterme */}
          {status !== 'past' && (
            <div className={`absolute top-2 right-2 md:top-4 md:right-4 px-1 py-0.5 md:px-2 md:py-0.5 rounded-full text-[8px] md:text-[10px] font-bold z-10 shadow-sm ${
              isDark 
                ? 'bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50' 
                : 'bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50'
            }`}>
              {minPrice === 0 
                ? (language === 'tr' ? 'Ücretsiz' : 'Free') 
                : `${minPrice} ₺`
              }
            </div>
          )}
          
          {/* Image - Add overlay for past events */}
          <div className="relative w-full h-full">
            <Image
              src={squareImage || '/images/logokare.png'}
              alt={title[language]}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${status === 'past' ? 'brightness-75' : ''}`}
            />
            
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <div className="p-2 sm:p-3">
          {/* Title */}
          <h3 className={`font-semibold text-sm sm:text-base mb-1 line-clamp-1 ${
            isDark ? 'text-light-grey' : 'text-dark-grey'
          }`}>
            {title[language]}
          </h3>
          
          {/* Date */}
          <div className={`flex items-center text-xs mb-1 ${
            isDark ? 'text-silver' : 'text-medium-grey'
          }`}>
            <span className={`mr-1 ${
              isDark ? 'text-electric-blue' : 'text-race-blue'
            }`}>📅</span>
            <span className={`${
              isDark ? 'text-silver font-medium' : 'text-medium-grey font-medium'
            }`}>{formatCardDate(date, language)}</span>
          </div>
          
          {/* Description */}
          <p className={`text-xs line-clamp-2 mb-2 ${
            isDark ? 'text-silver' : 'text-medium-grey'
          }`}>
            {description[language]}
          </p>
          
          {/* Button - Geçmiş etkinlikler için farklı stil ve metin */}
          <button disabled={status === 'past'} className={getButtonClasses()}>
            {getButtonLabel()}
          </button>
        </div>
      </div>
    </Link>
  );
});