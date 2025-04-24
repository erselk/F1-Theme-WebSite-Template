'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/data/events';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export default function EventsListPage() {
  const router = useRouter();
  const { isDark, language } = useThemeLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Tüm etkinlikleri yükle
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        const data = await response.json();
        
        if (response.ok && data.events) {
          setEvents(data.events);
        } else {
          throw new Error(data.error || 'Etkinlikler yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Etkinlikler yüklenirken bir hata oluştu');
        console.error('Etkinlik yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Etkinlik silme işlemi
  const deleteEvent = async (slug: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      setIsDeleting(slug);
      setDeleteError(null);
      
      const response = await fetch(`/api/events?slug=${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Etkinlik silinirken bir hata oluştu');
      }
      
      // Başarılı ise listeden kaldır
      setEvents(events.filter(event => event.slug !== slug));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Etkinlik silinirken bir hata oluştu');
      console.error('Etkinlik silme hatası:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Tarih formatını yerelleştir
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Kategori adını yerelleştir
  const getCategoryName = (category: string) => {
    const categories = {
      workshop: { tr: 'Atölye Çalışması', en: 'Workshop' },
      meetup: { tr: 'Buluşma', en: 'Meetup' },
      conference: { tr: 'Konferans', en: 'Conference' },
      race: { tr: 'Yarış', en: 'Race' },
      other: { tr: 'Diğer', en: 'Other' }
    };
    
    return categories[category as keyof typeof categories]?.[language as 'tr' | 'en'] || category;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-medium-grey">Etkinlikler yükleniyor...</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Etkinlik Yönetimi</h1>
        <Link 
          href="/admin/events/add" 
          className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
        >
          Yeni Etkinlik Ekle
        </Link>
      </div>
      
      {deleteError && (
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
            {deleteError}
          </div>
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="bg-very-light-grey dark:bg-dark-grey rounded-md p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-medium-grey"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3 className="text-lg font-medium mb-2">Henüz etkinlik bulunmuyor</h3>
          <p className="text-medium-grey mb-4">İlk etkinliğinizi eklemek için "Yeni Etkinlik Ekle" butonuna tıklayın.</p>
          <Link 
            href="/admin/events/add" 
            className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
          >
            Yeni Etkinlik Ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Görsel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Öne Çıkan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Fiyat
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={event.squareImage}
                        alt={event.title[language as 'tr' | 'en']}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      {event.title[language as 'tr' | 'en']}
                    </div>
                    <div className="text-xs text-medium-grey">{event.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(event.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(event.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {event.isFeatured ? (
                      <span className="text-green-600">Evet</span>
                    ) : (
                      <span className="text-medium-grey">Hayır</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {event.price > 0 ? (
                      <span>{event.price.toLocaleString('tr-TR')} ₺</span>
                    ) : (
                      <span className="text-green-600">Ücretsiz</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-medium-grey hover:text-dark-grey mr-3"
                      target="_blank"
                    >
                      Görüntüle
                    </Link>
                    <Link
                      href={`/admin/events/edit/${event.slug}`}
                      className="text-electric-blue hover:text-electric-blue-dark mr-3"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.slug)}
                      disabled={isDeleting === event.slug}
                      className="text-f1-red hover:text-f1-red-dark disabled:opacity-50"
                    >
                      {isDeleting === event.slug ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}