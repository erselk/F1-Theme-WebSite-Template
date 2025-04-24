'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/data/events';
import { formatEventDate } from '@/data/events';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const { language, isDark } = useThemeLanguage();
  
  const { 
    slug, 
    title, 
    squareImage,
    date, 
    description, 
    price,
    status
  } = event;

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
    const baseClasses = "absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium z-10 shadow-md";
    
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
      case 'upcoming': return language === 'tr' ? 'Yakında' : 'Upcoming';
      case 'past': return language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event';
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
        <div className="relative aspect-video">
          {/* Status Badge */}
          <div className={getStatusClasses()}>
            {getStatusLabel()}
          </div>
          
          {/* Price Badge - Geçmiş etkinlikler için gösterme */}
          {status !== 'past' && (
            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md ${
              isDark 
                ? 'bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50' 
                : 'bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50'
            }`}>
              {price === 0 
                ? (language === 'tr' ? 'Ücretsiz' : 'Free') 
                : `${price} ₺`
              }
            </div>
          )}
          
          {/* Image - Add overlay for past events */}
          <div className="relative w-full h-full">
            <Image
              src={squareImage || '/images/events/default.jpg'}
              alt={title[language]}
              fill
              className={`object-cover group-hover:scale-105 transition-transform duration-300 ${status === 'past' ? 'brightness-75' : ''}`}
            />
            
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
        
        <div className="p-3">
          {/* Title */}
          <h3 className={`font-semibold text-base mb-1 line-clamp-1 ${
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
}