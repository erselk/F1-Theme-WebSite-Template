'use client';

import { useState, useEffect, useCallback } from 'react';
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

  // Fetch events from MongoDB only once on initial load
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get all events from MongoDB
      const sortedEvents = await getSortedEvents();

      // Set initial status for each event
      const updatedEvents = sortedEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });

      setAllEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
      
      // Get featured events
      const featured = await getFeaturedEvents();
      setFeaturedEvents(featured);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update event statuses without making additional MongoDB requests
  const updateEventStatuses = useCallback(() => {
    setAllEvents(prevEvents => {
      const updatedEvents = prevEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });
      return updatedEvents;
    });
    
    setFilteredEvents(prevFilteredEvents => {
      return prevFilteredEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });
    });
    
    setFeaturedEvents(prevFeaturedEvents => {
      return prevFeaturedEvents.map(event => {
        const currentStatus = getEventStatus(event.date);
        return { ...event, status: currentStatus };
      });
    });
  }, []);

  useEffect(() => {
    // Fetch events only once on component mount
    fetchEvents();

    // Update statuses every minute without making MongoDB requests
    const statusInterval = setInterval(() => {
      updateEventStatuses();
    }, 60000); // Update every minute

    return () => clearInterval(statusInterval);
  }, [fetchEvents, updateEventStatuses]);

  const handleFilterChange = (filters: EventFilters) => {
    // Apply filters to the already loaded events
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
    <div className="space-y-4 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Featured Events Banner */}
      {featuredEvents.length > 0 && <EventBanner events={featuredEvents} />}
      
      {/* Removed duplicated title/subtitle section - will use the one from page.tsx */}
      
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