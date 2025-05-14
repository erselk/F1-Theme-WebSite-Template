'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EventCard } from './EventCard';
import { EventFilter, EventFilters } from './EventFilter';
import { EventBanner } from './EventBanner';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { Event, getEventStatus } from '@/types';
import useSWRFetch from '@/hooks/useSWRFetch';

export function EventList() {
  const { language } = useThemeLanguage();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentFilters, setCurrentFilters] = useState<EventFilters>({});
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);
  
  // SWR ile etkinlik verilerini çek
  const { data: eventsData, error: eventsError, isLoading: eventsLoading } = 
    useSWRFetch<{ events: Event[], success: boolean }>('/api/events');
  
  // SWR ile öne çıkan etkinlikleri çek
  const { data: featuredData, isLoading: featuredLoading } = 
    useSWRFetch<{ events: Event[], success: boolean }>('/api/events?featured=true');

  // Tüm etkinlikler için durum güncellemesi
  const updateEventStatuses = useCallback((events: Event[] = []) => {
    if (!events || events.length === 0) return [];
    
    return events.map(event => {
      const currentStatus = getEventStatus(event.date);
      return { ...event, status: currentStatus };
    });
  }, []);

  // IntersectionObserver ile bileşenin görünürlüğünü izle
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 } // %10'u görünür olduğunda tetikle
    );

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => {
      if (listRef.current) {
        observer.unobserve(listRef.current);
      }
    };
  }, []);

  // Etkinliklere filtre uygula
  useEffect(() => {
    if (eventsData?.events) {
      // Etkinliklere durum güncellemeyi uygula
      const eventsWithStatuses = updateEventStatuses(eventsData.events);
      
      // Filtreleri uygula
      let result = eventsWithStatuses;
      
      // Arama filtresi uygula
      if (currentFilters.search) {
        const searchLower = currentFilters.search.toLowerCase();
        result = result.filter(event => 
          event.title[language].toLowerCase().includes(searchLower) || 
          event.description[language].toLowerCase().includes(searchLower)
        );
      }
      
      // Kategori filtresi uygula
      if (currentFilters.category) {
        result = result.filter(event => event.category === currentFilters.category);
      }
      
      // Durum filtresi uygula
      if (currentFilters.status) {
        result = result.filter(event => event.status === currentFilters.status);
      }
      
      // Optimize edilmiş sıralama mantığı
      const now = new Date();
      result.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        const nowTime = now.getTime();
        
        // Önce gelecek-geçmiş durumunu karşılaştır
        const aIsFuture = dateA >= nowTime;
        const bIsFuture = dateB >= nowTime;
        
        if (aIsFuture !== bIsFuture) {
          return aIsFuture ? -1 : 1; // Gelecek etkinlikler önce
        }
        
        // Aynı durumda iseler (ikisi de gelecek veya geçmiş)
        if (aIsFuture) {
          return dateA - dateB; // Gelecek etkinlikler için kronolojik
        } else {
          return dateB - dateA; // Geçmiş etkinlikler için ters kronolojik
        }
      });
      
      setFilteredEvents(result);
    }
  }, [eventsData, currentFilters, language, updateEventStatuses]);

  // Filtreleme değişiklikleri
  const handleFilterChange = (filters: EventFilters) => {
    setCurrentFilters(filters);
  };

  // Hata mesajı
  if (eventsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">
          {language === 'tr' 
            ? 'Etkinlikleri yüklerken bir hata oluştu.' 
            : 'An error occurred while loading events.'}
        </p>
        <p className="text-sm text-gray-600">
          {language === 'tr' 
            ? 'Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.' 
            : 'Please refresh the page or try again later.'}
        </p>
      </div>
    );
  }

  // Yükleme durumu
  if (eventsLoading || featuredLoading) {
    return <EventListSkeleton />;
  }

  // Öne çıkan etkinlikleri hazırla - geçmiş etkinlikleri filtreleyerek
  const featuredEvents = featuredData?.events 
    ? updateEventStatuses(featuredData.events).filter(event => event.status !== 'past')
    : [];

  return (
    <div ref={listRef} className="space-y-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Featured Events Banner - sadece geçmiş OLMAYAN etkinlikleri göster */}
      {featuredEvents.length > 0 && <EventBanner events={featuredEvents} />}
      
      {/* Filters */}
      <EventFilter onFilterChange={handleFilterChange} />
      
      {/* Event Grid - Minimum 2 columns even on very small screens, with reduced spacing */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 md:py-8">
          <h3 className="text-sm md:text-base font-medium">
            {language === 'tr' ? 'Etkinlik bulunamadı' : 'No events found'}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {language === 'tr' 
              ? 'Filtrelerinizi ayarlayın veya yeni etkinlikler için daha sonra tekrar kontrol edin.' 
              : 'Try adjusting your filters or check back later for new events.'}
          </p>
        </div>
      )}
    </div>
  );
}

// Loading skeleton with reduced spacing to match updated design
function EventListSkeleton() {
  return (
    <div className="space-y-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Banner Loading Skeleton - 16:9 aspect ratio */}
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      
      {/* Filter Loading Skeleton */}
      <div className="h-8 md:h-10 w-24 md:w-full bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      
      {/* Events Grid Loading Skeleton - Minimum 2 columns */}
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col space-y-1 animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}