'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event, LanguageType, getEventStatus } from '@/types';

interface SimilarEventsProps {
  currentEventId: string;
  category: string;
  locale: LanguageType;
  maxEvents?: number;
  showPastEvents?: boolean;
}

export function SimilarEvents({ 
  currentEventId, 
  category, 
  locale,
  maxEvents = 4,
  showPastEvents = false
}: SimilarEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarEvents = async () => {
      try {
        setIsLoading(true);
        
        // Fetch events with query parameters for MongoDB filtering
        const params = new URLSearchParams({
          category: category,
          excludeId: currentEventId,
          showPastEvents: showPastEvents.toString(),
          limit: maxEvents.toString()
        });
        
        const response = await fetch(`/api/events/similar?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const similarEvents = await response.json();
        setEvents(similarEvents);
      } catch (err) {
        setError('Failed to load similar events');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarEvents();
  }, [currentEventId, category, maxEvents, showPastEvents]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg bg-dark-grey h-48"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neon-red/10 p-4 rounded-lg text-neon-red text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-graphite/50 p-6 rounded-lg text-center border border-carbon-grey">
        <p className="text-silver">
          {locale === 'tr' 
            ? 'Bu kategoride başka etkinlik bulunamadı.' 
            : 'No other events found in this category.'
          }
        </p>
      </div>
    );
  }

  const getEventStatusClass = (date: string) => {
    const status = getEventStatus(new Date(date));
    switch (status) {
      case 'upcoming': return 'bg-neon-green text-very-dark-grey';
      case 'today': return 'bg-electric-blue text-white';
      default: return 'bg-carbon-grey text-light-grey';
    }
  };

  const getEventStatusLabel = (date: string) => {
    const status = getEventStatus(new Date(date));
    switch (status) {
      case 'upcoming': return locale === 'tr' ? 'Yaklaşan' : 'Upcoming';
      case 'today': return locale === 'tr' ? 'Bugün' : 'Today';
      default: return locale === 'tr' ? 'Tamamlandı' : 'Past';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((event) => (
        <Link 
          href={`/events/${event.slug}`} 
          key={event.id}
          className="group"
        >
          <div className="flex flex-col h-full rounded-lg overflow-hidden bg-dark-grey border border-carbon-grey hover:border-electric-blue transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-electric-blue/20">
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={event.bannerImage || "/images/events/banner/default.jpg"}
                alt={event.title[locale]}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventStatusClass(event.date)}`}>
                  {getEventStatusLabel(event.date)}
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-very-dark-grey to-transparent opacity-70"></div>
            </div>

            <div className="p-4 flex-grow flex flex-col justify-between">
              <h3 className="font-bold text-white group-hover:text-electric-blue transition-colors mb-2">
                {event.title[locale]}
              </h3>
              
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center text-silver text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(event.date)}
                </div>
                
                <span className="bg-neon-red/80 text-white text-xs px-2 py-0.5 rounded">
                  {event.category}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}