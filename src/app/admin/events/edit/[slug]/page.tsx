'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EventForm from '@/components/admin/EventForm';
import { Event } from '@/data/events';

export default function EditEventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events?slug=${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Etkinlik bilgileri yüklenirken bir hata oluştu');
        }
        
        setEvent(data.event);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Etkinlik bilgileri yüklenirken bir hata oluştu');
        console.error('Etkinlik yükleme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [slug]);

  const handleSubmit = async (eventData: Partial<Event>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch(`/api/events?slug=${slug}`, {
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
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
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
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Etkinliği Düzenle</h1>
        <p className="text-medium-grey">"{event.title.tr}" etkinliğini düzenlemek için formu kullanın.</p>
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