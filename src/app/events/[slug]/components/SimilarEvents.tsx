'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Event, formatEventDate } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface SimilarEventsProps {
  currentEventId: string;
  category: string;
  locale: LanguageType;
}

export function SimilarEvents({ currentEventId, category, locale }: SimilarEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Benzer etkinlikleri yükle
  useEffect(() => {
    const fetchSimilarEvents = async () => {
      try {
        setIsLoading(true);
        
        // API'den aynı kategorideki etkinlikleri getir
        const res = await fetch(`/api/events?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        
        if (data.success && data.events) {
          // Mevcut etkinliği liste dışı tut ve en çok 4 etkinlik göster
          const similarEvents = data.events
            .filter((event: Event) => event.id !== currentEventId)
            .slice(0, 4);
          
          setEvents(similarEvents);
        }
      } catch (error) {
        console.error('Benzer etkinlikler yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSimilarEvents();
  }, [currentEventId, category]);
  
  // Animasyon varyantları
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-64"></div>
        ))}
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-gray-500 italic py-4"
      >
        {locale === 'tr' 
          ? 'Bu kategoride başka etkinlik bulunamadı.' 
          : 'No other events found in this category.'
        }
      </motion.p>
    );
  }
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      {events.map((event) => (
        <motion.div
          key={event.id}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="bg-background border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <Link href={`/events/${event.slug}`} className="block">
            <div className="relative h-40">
              <Image
                src={event.squareImage || '/images/events/default.jpg'}
                alt={event.title[locale]}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIEXYA9oAAAAABJRU5ErkJggg=="
              />
              
              {/* Etkinlik etiketi */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full text-white ${
                  event.status === 'today' 
                    ? 'bg-yellow-500' 
                    : event.status === 'upcoming' 
                      ? 'bg-green-500' 
                      : 'bg-gray-500'
                }`}>
                  {event.status === 'today' 
                    ? (locale === 'tr' ? 'Bugün' : 'Today') 
                    : event.status === 'upcoming' 
                      ? (locale === 'tr' ? 'Yaklaşan' : 'Upcoming') 
                      : (locale === 'tr' ? 'Geçmiş' : 'Past')
                  }
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold truncate">{event.title[locale]}</h3>
              <p className="text-sm text-gray-600 mt-1">{formatEventDate(event.date, locale)}</p>
              <p className="text-sm text-gray-600">{event.location[locale]}</p>
              
              <div className="mt-3 flex justify-between items-center">
                <span className="text-primary font-semibold">{event.price} TL</span>
                <button className="text-sm text-primary hover:underline">
                  {locale === 'tr' ? 'Detaylar' : 'Details'} &rarr;
                </button>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}