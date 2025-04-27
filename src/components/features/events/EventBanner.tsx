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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!events.length) return null;

  return (
    <div className="relative w-full">
      {/* Main Banner */}
      <div className="relative w-full h-[300px] md:h-[380px] overflow-hidden rounded-lg">
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
            />
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-graphite via-transparent to-transparent' : 'bg-gradient-to-t from-dark-grey/70 via-transparent to-transparent'}`}></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className={`inline-block px-3 py-1 mb-3 rounded-full shadow-md ${
                isDark 
                  ? 'bg-neon-red shadow-neon-red/20' 
                  : 'bg-f1-red shadow-f1-red/20'
              }`}>
                {event.status === 'today' && (language === 'tr' ? 'Bugün' : 'Today')}
                {event.status === 'tomorrow' && (language === 'tr' ? 'Yarın' : 'Tomorrow')}
                {event.status === 'this-week' && (language === 'tr' ? 'Bu Hafta' : 'This Week')}
                {event.status === 'upcoming' && (language === 'tr' ? 'Yakında' : 'Upcoming')}
                {event.status === 'past' && (language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event')}
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">{event.title[language]}</h2>
              <p className="text-sm md:text-base mb-4 max-w-2xl drop-shadow-md">{event.description[language]}</p>
              <Link 
                href={`/events/${event.slug}`} 
                className={`inline-block px-4 py-2 rounded-md transition-colors shadow-md ${
                  isDark 
                    ? 'bg-electric-blue hover:bg-electric-blue/80 shadow-electric-blue/20' 
                    : 'bg-race-blue hover:bg-race-blue/90 shadow-race-blue/20'
                } text-white`}
              >
                {language === 'tr' ? 'Detayları Gör' : 'View Details'}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-[150px] md:top-[190px] -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label={language === 'tr' ? 'Önceki Slayt' : 'Previous Slide'}
      >
        {/* Left chevron SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-[150px] md:top-[190px] -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        aria-label={language === 'tr' ? 'Sonraki Slayt' : 'Next Slide'}
      >
        {/* Right chevron SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Thumbnail Navigation */}
      <div className="flex justify-center mt-4 space-x-2 overflow-x-auto py-2">
        {events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => goToSlide(index)}
            className={`relative w-16 h-16 rounded-full overflow-hidden transition-all ${
              index === currentSlide 
                ? 'ring-4 ring-offset-2 ' + (isDark ? 'ring-electric-blue' : 'ring-race-blue')
                : 'opacity-70'
            }`}
            aria-label={`${language === 'tr' ? 'Slayta git' : 'Go to slide'} ${index + 1}`}
          >
            <Image
              src={event.squareImage || '/images/logokare.png'}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
