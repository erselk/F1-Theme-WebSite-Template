'use client';

import { useState, useEffect } from 'react';
import { EventCard } from './EventCard';
import { EventFilter, EventFilters } from './EventFilter';
import { EventBanner } from './EventBanner';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getFeaturedEvents, getSortedEvents, Event, getEventStatus } from '@/data/events';

export function EventList() {
  const { language } = useThemeLanguage();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  // Etkinliklerin durumlarını güncelleyen fonksiyon
  const updateEventStatuses = async () => {
    try {
      const sortedEvents = await getSortedEvents();

      // Dinamik olarak her etkinliğin durumunu güncelle (saat bazlı)
      const updatedEvents = sortedEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });

      setAllEvents(updatedEvents);
      
      // Featured events için de güncelle
      const featured = updatedEvents.filter(event => event.isFeatured).slice(0, 10);
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