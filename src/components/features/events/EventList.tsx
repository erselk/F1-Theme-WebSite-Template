'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // SWR ile etkinlik verilerini çek
  const { data: eventsData, error: eventsError, isLoading: eventsLoading, mutate: refreshEvents } = 
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
      
      // Özel sıralama: Şu anki saatten geleceğe ve sonra geçmişe doğru sırala
      const now = new Date();
      const futureEvents = result
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const pastEvents = result
        .filter(event => new Date(event.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Önce gelecek sonra geçmiş etkinlikler
      result = [...futureEvents, ...pastEvents];
      
      setFilteredEvents(result);
    }
  }, [eventsData, currentFilters, language, updateEventStatuses]);

  // Her dakikada bir durum güncelle
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setFilteredEvents(prev => updateEventStatuses(prev));
    }, 60000); // Her dakika güncelle

    return () => clearInterval(statusInterval);
  }, [updateEventStatuses]);

  // Filtreleme değişiklikleri
  const handleFilterChange = (filters: EventFilters) => {
    setCurrentFilters(filters);
  };

  // Verileri yenile
  const handleRefresh = () => {
    refreshEvents();
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
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 rounded bg-red-500 text-white"
        >
          {language === 'tr' ? 'Tekrar Dene' : 'Try Again'}
        </button>
      </div>
    );
  }

  // Yükleme durumu
  if (eventsLoading || featuredLoading) {
    return <EventListSkeleton />;
  }

  // Öne çıkan etkinlikleri hazırla
  const featuredEvents = featuredData?.events 
    ? updateEventStatuses(featuredData.events)
    : [];

  return (
    <div className="space-y-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Yenileme butonu */}
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          className="text-xs sm:text-sm text-medium-grey dark:text-silver hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {language === 'tr' ? 'Yenile' : 'Refresh'}
        </button>
      </div>
      
      {/* Featured Events Banner */}
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
      {/* Yükleme animasyonu */}
      <div className="flex justify-end">
        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
      
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