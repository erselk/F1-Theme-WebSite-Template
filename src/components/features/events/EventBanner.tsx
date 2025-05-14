'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/data/events';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface EventBannerProps {
  events: Event[];
}

export function EventBanner({ events }: EventBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, isDark } = useThemeLanguage();
  
  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [events.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  if (!events.length) return null;

  return (
    <div className="relative w-full">
      {/* Main Banner - maintaining 16:9 aspect ratio */}
      <div className="relative w-full overflow-hidden rounded-lg aspect-video">
        {events.map((event, index) => (
          <div 
            key={event.id}
            className={`absolute w-full h-full transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={event.bannerImage || '/images/logouzun.png'}
              alt={event.title[language]}
              fill
              className="object-cover"
              priority={index === currentSlide}
              loading={index === currentSlide ? "eager" : "lazy"}
            />
            {/* Tema bazlı filigran (gradyan overlay) */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: isDark 
                  ? 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.4) 90%)'
                  : 'linear-gradient(to top, rgba(255,255,255,0.7), rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 90%)'
              }}
            ></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6">
              {/* Durum etiketi - renkler düzeltildi */}
              <div 
                className="inline-block px-2 py-1 mb-2 md:px-3 md:py-1.5 md:mb-3 text-xs md:text-sm rounded-full shadow-md text-white font-medium border-2"
                style={{ 
                  backgroundColor: isDark ? 'var(--f1-red)' : 'var(--f1-red)',
                  borderColor: isDark ? 'var(--f1-red)' : 'var(--f1-red)'
                }}
              >
                <span className="inline-block min-w-[40px] text-center whitespace-nowrap font-semibold">
                  {event.status === 'today' 
                    ? (language === 'tr' ? 'Bugün' : 'Today')
                    : event.status === 'tomorrow'
                    ? (language === 'tr' ? 'Yarın' : 'Tomorrow')
                    : event.status === 'this-week'
                    ? (language === 'tr' ? 'Bu Hafta' : 'This Week')
                    : event.status === 'this-month'
                    ? (language === 'tr' ? 'Bu Ay' : 'This Month')
                    : event.status === 'upcoming'
                    ? (language === 'tr' ? 'Yakında' : 'Upcoming')
                    : event.status === 'past'
                    ? (language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event')
                    : 'Status: ' + event.status
                  }
                </span>
              </div>
              {/* Başlık - light temada siyah, dark temada beyaz */}
              <h2 
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold mb-2 md:mb-4 drop-shadow-[0_2px_5px_rgba(0,0,0,0.4)] truncate"
                style={{ color: isDark ? 'white' : 'var(--dark-grey)' }}
              >
                {event.title[language]}
              </h2>
              {/* Açıklama - light temada siyah, dark temada beyaz */}
              <p 
                className="text-xs sm:text-sm md:text-base mb-4 md:mb-6 max-w-2xl font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] line-clamp-2 md:line-clamp-3"
                style={{ color: isDark ? 'white' : 'var(--dark-grey)' }}
              >
                {event.description[language]}
              </p>
              {/* Buton - durum etiketi ile aynı renk ve stil */}
              <Link 
                href={`/events/${event.slug}`} 
                className="inline-block px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-full shadow-md text-white font-medium border-2"
                style={{ 
                  backgroundColor: isDark ? 'var(--f1-red)' : 'var(--f1-red)',
                  borderColor: isDark ? 'var(--f1-red)' : 'var(--f1-red)'
                }}
              >
                {language === 'tr' ? 'Detayları Gör' : 'View Details'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Slayt geçiş butonları - gölge kaldırıldı */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center transition-colors"
        aria-label={language === 'tr' ? 'Önceki Slayt' : 'Previous Slide'}
      >
        {/* Left chevron SVG */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isDark ? "white" : "black"} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 flex items-center justify-center transition-colors"
        aria-label={language === 'tr' ? 'Sonraki Slayt' : 'Next Slide'}
      >
        {/* Right chevron SVG */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke={isDark ? "white" : "black"} 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
}
