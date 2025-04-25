'use client';

import { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { EventFilter, EventFilters } from './EventFilter';
import { EventBanner } from './EventBanner';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { Event, getEventStatus } from '@/types';
import { getAllEvents, getFeaturedEvents, getSortedEvents } from '@/services/mongo-service';

export function EventList() {
  const { language } = useThemeLanguage();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // MongoDB'den etkinlikleri çek ve durumlarını güncelle
  const updateEventStatuses = async () => {
    try {
      setIsLoading(true);
      
      // MongoDB'den tüm etkinlikleri çek
      const sortedEvents = await getSortedEvents();

      // Dinamik olarak her etkinliğin durumunu güncelle (saat bazlı)
      const updatedEvents = sortedEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });

      setAllEvents(updatedEvents);
      
      // Featured events için de çek ve güncelle
      const featured = await getFeaturedEvents();
      setFeaturedEvents(featured);
      
      setFilteredEvents(prevFiltered => {
        // Filtre kriterleri değişmeden sadece status değerlerini güncelle
        if (prevFiltered.length === 0) return updatedEvents;
        return updatedEvents.filter(event => 
          prevFiltered.some(e => e.id === event.id)
        );
      });
    } catch (error) {
      console.error("Error updating event statuses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Başlangıçta etkinliklerin durumlarını güncelle
    updateEventStatuses();

    // Her dakika durumları güncelle (örneğin saat geçişlerinde etkinlik durumları değişsin)
    const statusInterval = setInterval(() => {
      updateEventStatuses();
    }, 60000); // 60 saniyede bir güncelle

    return () => clearInterval(statusInterval);
  }, []);

  const handleFilterChange = (filters: EventFilters) => {
    let result = [...allEvents];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(event => 
        event.title[language].toLowerCase().includes(searchLower) || 
        event.description[language].toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.category) {
      result = result.filter(event => event.category === filters.category);
    }
    
    // Apply status filter
    if (filters.status) {
      result = result.filter(event => event.status === filters.status);
    }
    
    setFilteredEvents(result);
  };

  if (isLoading) {
    return <EventListSkeleton />;
  }

  return (
    <div className="space-y-8 px-4 md:px-8 lg:px-12">
      {/* Featured Events Banner */}
      {featuredEvents.length > 0 && <EventBanner events={featuredEvents} />}
      
      {/* Filters */}
      <EventFilter onFilterChange={handleFilterChange} />
      
      {/* Event Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">
            {language === 'tr' ? 'Etkinlik bulunamadı' : 'No events found'}
          </h3>
          <p className="text-muted-foreground mt-2">
            {language === 'tr' 
              ? 'Filtrelerinizi ayarlayın veya yeni etkinlikler için daha sonra tekrar kontrol edin.' 
              : 'Try adjusting your filters or check back later for new events.'}
          </p>
        </div>
      )}
    </div>
  );
}

// Yükleme durumu için iskelet bileşeni
function EventListSkeleton() {
  return (
    <div className="space-y-8 px-4 md:px-8 lg:px-12">
      {/* Banner Loading Skeleton */}
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      
      {/* Filter Loading Skeleton */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
      
      {/* Events Grid Loading Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {Array(12).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}