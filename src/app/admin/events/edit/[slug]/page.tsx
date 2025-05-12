'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';
import { Event } from '@/data/events';
import { useTheme } from 'next-themes';
import { use } from 'react';

// Client component'ler için params tipini böyle tanımlamalıyız
export default function EditEventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  // Unwrap params using React.use() before accessing properties
  const { slug } = use(params);
  const { setTheme } = useTheme();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force dark theme on mount - for consistent admin UI
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events/${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Etkinlik bilgileri yüklenirken bir hata oluştu');
        }
        
        // Ensure rules property exists and is an array to prevent "rules?.map is not a function" error
        const eventData = data.event;

        // Debug: Log the event data to see what we're getting from the API
        console.log('API Response - Event Data:', eventData);
        console.log('Schedule data:', eventData.schedule);
        console.log('Rules data:', eventData.rules);
        
        if (eventData && !Array.isArray(eventData.rules)) {
          // If rules is not an array but still exists in the right format
          if (eventData.rules && typeof eventData.rules === 'object' && 
              (Array.isArray(eventData.rules.tr) || Array.isArray(eventData.rules.en))) {
            console.log('Rules is in correct format, no conversion needed');
          } else {
            // Convert rules to array format if needed
            console.log('Converting rules to array format');
            eventData.rules = eventData.rules ? [eventData.rules] : [];
          }
        }
        
        setEvent(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Etkinlik bilgileri yüklenirken bir hata oluştu');
        console.error('Etkinlik yükleme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const handleSubmit = async (eventData: Partial<Event>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Slug değişikliğini engelle - API'de de kontrol ediliyor
      eventData.slug = slug;
      
      // Ensure rules is an array
      if (eventData.rules && !Array.isArray(eventData.rules)) {
        eventData.rules = [eventData.rules];
      }
      
      // Veriyi API'ye gönder
      const response = await fetch(`/api/events/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Etkinlik güncellenirken bir hata oluştu');
      }
      
      // Başarılı ise etkinlik listesine yönlendir
      router.push('/admin/events');
      router.refresh(); // Listeyi yenilemek için refresh çağır
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlik güncellenirken bir hata oluştu');
      console.error('Etkinlik güncelleme hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-medium-grey">Etkinlik bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {error}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80 transition-colors"
            onClick={() => router.push('/admin/events')}
          >
            Etkinlik Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            Etkinlik bulunamadı
          </div>
          <button
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80 transition-colors"
            onClick={() => router.push('/admin/events')}
          >
            Etkinlik Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Etkinliği Düzenle</h1>
        <p className="text-xs sm:text-sm text-medium-grey">&quot;{event.title?.tr || event.title?.en}&quot; etkinliğini düzenliyorsunuz.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <EventForm 
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}