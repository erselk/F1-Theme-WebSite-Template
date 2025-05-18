'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';
import { Event } from '@/types';
import { useTheme } from 'next-themes';
import type { Event as PrismaEventPayload } from '@prisma/client';

// Helper function to convert local Event data (from form) to a payload suitable for the API (Prisma-like)
const convertLocalEventToApiPayload = (eventData: Partial<Event>): Partial<PrismaEventPayload> => {
  const payload: Partial<PrismaEventPayload> = {
    // Spread compatible fields
    // slug, id are typically handled by API or not part of form data directly for update
    bannerImage: eventData.bannerImage || null,
    squareImage: eventData.squareImage || null,
    price: typeof eventData.price === 'number' ? eventData.price : undefined,
    isFeatured: typeof eventData.isFeatured === 'boolean' ? eventData.isFeatured : undefined,
    date: eventData.date ? new Date(eventData.date) : undefined, // Convert ISO string to Date object
    // Localized fields in @/types Event are {tr, en}, Prisma expects JsonValue which can be the same object
    title: eventData.title as PrismaEventPayload['title'],
    location: eventData.location as PrismaEventPayload['location'],
    description: eventData.description as PrismaEventPayload['description'],
    category: eventData.category as PrismaEventPayload['category'], // Ensure local category type matches Prisma or is convertible
    // Rules: Local Event has Rule[], Prisma expects JsonValue (e.g., array of rule objects with id and content)
    // Pass rules directly to preserve IDs, assuming Prisma can handle this structure.
    rules: eventData.rules as PrismaEventPayload['rules'], 
    // Schedule: Pass schedule directly
    schedule: eventData.schedule as PrismaEventPayload['schedule'],
    // Tickets: Similar to rules, conversion depends on Prisma schema and form data structure.
    tickets: eventData.tickets as PrismaEventPayload['tickets'],
    // status from local Event type should be compatible with PrismaEventPayload status if it exists
    status: eventData.status as PrismaEventPayload['status'],
    // comments and gallery are also to be handled if they are part of the form and Prisma model
    gallery: eventData.gallery as PrismaEventPayload['gallery'],
    // comments: eventData.comments as PrismaEventPayload['comments'], // Assuming Prisma model has comments
  };

  // Remove fields that are undefined to avoid sending them in payload if not intended
  Object.keys(payload).forEach(key => {
    if ((payload as any)[key] === undefined) {
      delete (payload as any)[key];
    }
  });

  return payload;
};

export default function EditEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const { setTheme } = useTheme();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    if (!slug) {
      setError("Etkinlik kimliği (slug) bulunamadı.");
      return;
    }
    
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events/${slug}`);
        
        const responseData = await response.json(); // Always try to parse JSON

        if (!response.ok) {
          // API returned an error (e.g., 404, 500)
          // responseData might contain { error: "message" }
          const errorMessage = responseData?.error || `API Error: ${response.status}`;
          throw new Error(errorMessage);
        }
        
        // If response.ok is true, API should be returning the event object directly
        const eventDataFromApi = responseData as Event;
        
        if (!eventDataFromApi || typeof eventDataFromApi.id !== 'string') { // Basic validation
          setError('Alınan etkinlik verisi geçersiz veya eksik.');
          setEvent(null); // Clear any previous event state
        } else {
          setEvent(eventDataFromApi);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Etkinlik yüklenirken bilinmeyen bir hata oluştu');
        setEvent(null); // Clear event state on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
    
  }, [slug]);

  const handleSubmit = async (formData: Partial<Event>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = convertLocalEventToApiPayload(formData);
      payload.slug = slug; // Ensure slug is part of the payload for the PUT request

      const response = await fetch(`/api/events/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Etkinlik güncellenirken bir API hatası oluştu');
      }

      router.push('/admin/events');
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlik güncellenirken bilinmeyen bir hata oluştu');
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
    // This state can be reached if !isLoading and no error, but event is null (e.g. API returned valid but empty/invalid data that didn't pass validation)
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
            {error ? error : 'Etkinlik bulunamadı veya yüklenen veri geçersiz.'} 
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
  
  const displayTitle = event.title?.tr || event.title?.en || 'Etkinlik';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Etkinliği Düzenle</h1>
        <p className="text-xs sm:text-sm text-medium-grey">&quot;{displayTitle}&quot; etkinliğini düzenliyorsunuz.</p>
      </div>
      
      <EventForm 
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}