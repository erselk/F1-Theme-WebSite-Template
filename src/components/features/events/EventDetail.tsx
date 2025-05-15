'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event, formatEventDate, getEventStatus } from '@/data/events';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event: initialEvent }: EventDetailProps) {
  const { language, isDark } = useThemeLanguage();
  // Keep event state updated with real-time status
  const [event, setEvent] = useState(initialEvent);
  
  // Update event status based on current time
  useEffect(() => {
    const updateEventStatus = () => {
      const currentStatus = getEventStatus(initialEvent.date);
      if (currentStatus !== event.status) {
        setEvent(prev => ({ ...prev, status: currentStatus }));
      }
    };

    // Update status immediately and then every minute
    updateEventStatus();
    
    // Otomatik güncelleme kaldırıldı - sayfa yavaşlamaması için
  }, [initialEvent.date, event.status]);
  
  const getMinTicketPriceFromEvent = (currentEvent: Event) => {
    if (!currentEvent.tickets || currentEvent.tickets.length === 0) {
      return 0; // Bilet yoksa veya bilet dizisi boşsa ücretsiz kabul et
    }
    const prices = currentEvent.tickets.map(ticket => ticket.price);
    if (prices.length === 0) return 0; // Fiyat yoksa (beklenmez ama kontrol)
    return Math.min(...prices);
  };

  const displayPrice = getMinTicketPriceFromEvent(event);

  const getStatusLabel = () => {
    switch (event.status) {
      case 'today': return language === 'tr' ? 'Bugün' : 'Today';
      case 'tomorrow': return language === 'tr' ? 'Yarın' : 'Tomorrow';
      case 'this-week': return language === 'tr' ? 'Bu Hafta' : 'This Week';
      case 'upcoming': return language === 'tr' ? 'Yakında' : 'Upcoming';
      case 'past': return language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event';
      default: return '';
    }
  };

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

  // Status badge'leri için arka plan renkleri ve yazı renkleri - fiyat badge'i ile aynı stilde
  const getStatusColor = () => {
    if (event.status === 'past') {
      // Past event için gri arka plan
      return 'bg-gray-400 text-white'; 
    } else {
      // Past olmayan tüm durumlar için fiyat badge'i ile aynı stil
      return isDark 
        ? 'bg-[#FF0000]/70 shadow-[#FF0000]/30 border border-[#FF0000]/50 text-white' 
        : 'bg-[#E10600]/70 shadow-[#E10600]/30 border border-[#E10600]/50 text-white';
    }
  };

  // Calculate button and price styles - add consistent color highlighting
  const getButtonStyles = () => {
    if (event.status === 'past') {
      return `bg-gray-400 cursor-not-allowed`;
    }
    
    return isDark 
      ? 'bg-[#FF0000]/70 hover:bg-[#FF0000]/80 shadow-[#FF0000]/30 border border-[#FF0000]/50' 
      : 'bg-[#E10600]/70 hover:bg-[#E10600]/80 shadow-[#E10600]/30 border border-[#E10600]/50';
  };

  const getPriceStyles = () => {
    return isDark 
      ? 'bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50' 
      : 'bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50';
  };

  return (
    <div className={`max-w-4xl mx-auto ${isDark ? 'text-light-grey' : 'text-dark-grey'}`}>
      {/* Back Button */}
      <Link 
        href="/events" 
        className={`inline-flex items-center gap-1 mb-6 text-sm transition-colors ${
          isDark ? 'text-silver hover:text-light-grey' : 'text-medium-grey hover:text-dark-grey'
        }`}
      >
        {/* Arrow Left SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        {language === 'tr' ? 'Tüm Etkinlikler' : 'All Events'}
      </Link>
      
      {/* Main Content */}
      <div className={`rounded-lg overflow-hidden shadow-lg ${
        isDark ? 'bg-graphite border border-carbon-grey' : 'bg-white border border-light-grey'
      }`}>
        {/* Event Image */}
        <div className="relative h-[300px] md:h-[400px] w-full">
          <Image
            src={event.bannerImage || '/images/logouzun.png'}
            alt={event.title[language]}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10"></div>
          
          {/* Status Badge */}
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium shadow-md ${getStatusColor()}`}>
            {/* "upcoming" yazısı için inline stil eklendi */}
            <span className="inline-block">
              {getStatusLabel()}
            </span>
          </div>
          
          {/* Price Badge - Hide for past events */}
          {event.status !== 'past' ? (
            <div className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-bold shadow-md ${getPriceStyles()}`}>
              {displayPrice === 0 
                ? (language === 'tr' ? 'Ücretsiz' : 'Free') 
                : `${displayPrice} ₺`
              }
            </div>
          ) : null}
          
          {/* Title Overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-black/0">
            <h1 className="text-2xl md:text-4xl font-bold text-white">{event.title[language]}</h1>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="p-6">
          <div className="flex flex-wrap gap-6 mb-6">
            {/* Date */}
            <div className="flex items-center gap-2">
              {/* Calendar SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-electric-blue' : 'text-race-blue'}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>{formatEventDate(event.date, language)}</span>
            </div>
            
            {/* Location */}
            <div className="flex items-center gap-2">
              {/* Map Pin SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-electric-blue' : 'text-race-blue'}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{event.location[language]}</span>
            </div>
            
            {/* Category */}
            <div className="flex items-center gap-2">
              {/* Tag SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-electric-blue' : 'text-race-blue'}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>{getCategoryLabel()}</span>
            </div>
          </div>
          
          {/* Description */}
          <div className="prose max-w-none mb-8" style={{
            color: isDark ? '#E0E0E0' : '#333333'
          }}>
            <p>{event.description[language]}</p>
            {/* Add additional detailed content here if needed */}
            <p>
              {language === 'tr' 
                ? 'Bu etkinlik hakkında daha fazla detay yakında eklenecektir.' 
                : 'More details about this event will be added soon.'}
            </p>
          </div>
          
          {/* Action Button */}
          <button 
            className={`w-full py-3 px-4 text-center rounded-md text-white font-medium transition-colors shadow-md ${getButtonStyles()}`}
            disabled={event.status === 'past'}
          >
            {event.status === 'past'
              ? (language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Ended')
              : (language === 'tr' ? 'Bilet Al' : 'Buy Ticket')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
