'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllEvents, deleteEvent } from '@/services/admin-service';
import { EyeIcon, PencilSquareIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/lib/admin-utils';

// Event tipi
type Event = {
  id: string;
  slug: string;
  title: { [key: string]: string };
  date: string;
  category: string;
  price?: number;
  tickets?: { name: string | { [key: string]: string }; price: number }[];
  squareImage: string;
};

export default function EventsListPage() {
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
        const result = await getAllEvents();
        
        if (result.success && result.data) {
          // Bugünün tarihini alıyoruz (saat, dakika, saniye olmadan)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Etkinlikleri gelecek ve geçmiş olarak ayırıyoruz
          const futureEvents: Event[] = [];
          const pastEvents: Event[] = [];
          
          result.data.forEach((event: Event) => {
            const eventDate = new Date(event.date);
            if (eventDate >= today) {
              futureEvents.push(event);
            } else {
              pastEvents.push(event);
            }
          });
          
          // Gelecek etkinlikleri tarihe göre artan sırada sıralıyoruz (en yakın olan önce)
          futureEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          // Geçmiş etkinlikleri tarihe göre azalan sırada sıralıyoruz (en son olan önce)
          pastEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // İki listeyi birleştiriyoruz: önce gelecek sonra geçmiş etkinlikler
          setEvents([...futureEvents, ...pastEvents]);
        } else {
          throw new Error(result.error || 'Etkinlikler yüklenirken bir hata oluştu');
        }
      } catch (err: any) {
        setError(err.message || 'Etkinlikler yüklenirken bir hata oluştu');
        console.error('Etkinlik yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  // Etkinlik silme işlemi
  const handleDeleteEvent = async (slug: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      setIsDeleting(slug);
      setDeleteError(null);
      
      const result = await deleteEvent(slug);
      
      if (!result.success) {
        throw new Error(result.error || 'Etkinlik silinirken bir hata oluştu');
      }
      
      // Başarılı ise listeden kaldır
      setEvents(events.filter(event => event.slug !== slug));
    } catch (err: any) {
      setDeleteError(err.message || 'Etkinlik silinirken bir hata oluştu');
      console.error('Etkinlik silme hatası:', err);
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Mobil için kısaltılmış tarih formatı
  const formatMobileDate = (dateString: string) => {
    const date = new Date(dateString);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Kategori adını yerelleştir
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: { tr: string; en: string } } = {
      workshop: { tr: 'Atölye Çalışması', en: 'Workshop' },
      meetup: { tr: 'Buluşma', en: 'Meetup' },
      conference: { tr: 'Konferans', en: 'Conference' },
      race: { tr: 'Yarış', en: 'Race' },
      party: { tr: 'Parti', en: 'Party' },
      other: { tr: 'Diğer', en: 'Other' }
    };
    
    return categories[category]?.[language as 'tr' | 'en'] || category;
  };

  // Etkinliğin en düşük bilet fiyatını bul
  const getMinTicketPrice = (event: Event) => {
    if (!event.tickets || !event.tickets.length) {
      return event.price || 0;
    }
    
    const prices = event.tickets.map((ticket) => ticket.price);
    return Math.min(...prices);
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
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Etkinlik Yönetimi</h1>
        <Link 
          href="/admin/events/add" 
          className="md:text-base px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors md:flex md:items-center md:gap-2 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden md:inline">Yeni Etkinlik Ekle</span>
        </Link>
      </div>
      
      {deleteError && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <span className="truncate">{deleteError}</span>
          </div>
        </div>
      )}
      
      {events.length === 0 ? (
        <div className="bg-very-light-grey dark:bg-dark-grey rounded-md p-4 md:p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 md:mb-4 text-medium-grey"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3 className="text-base md:text-lg font-medium mb-2">Henüz etkinlik bulunmuyor</h3>
          <p className="text-medium-grey text-sm mb-3 md:mb-4">İlk etkinliğinizi eklemek için ekleme butonuna tıklayın.</p>
          <Link 
            href="/admin/events/add" 
            className="text-sm px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors flex items-center gap-1 inline-flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Yeni Etkinlik Ekle</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 md:mx-0 rounded-md">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Görsel
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Tarih
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Kategori
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Fiyat
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider w-16 md:w-auto">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <div className="w-10 h-10 md:w-16 md:h-16 relative">
                      <Image
                        src={event.squareImage}
                        alt={event.title[language as 'tr' | 'en']}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">
                      {event.title[language as 'tr' | 'en']}
                    </div>
                    <div className="text-xs text-medium-grey truncate">{event.slug}</div>
                    {/* Mobil görünümde tarihi göster */}
                    <div className="text-xs text-medium-grey mt-1 md:hidden flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {formatMobileDate(event.date)}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {formatDate(event.date, language)}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(event.category)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {getMinTicketPrice(event) > 0 ? (
                      <span>{getMinTicketPrice(event).toLocaleString('tr-TR')} ₺</span>
                    ) : (
                      <span className="text-green-600">Ücretsiz</span>
                    )}
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                    <div className="flex justify-end space-x-1 md:space-x-3">
                      <Link
                        href={`/events/${event.slug}`}
                        className="text-medium-grey hover:text-dark-grey"
                        target="_blank"
                        title="Görüntüle"
                      >
                        <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                      <Link
                        href={`/admin/reservations/events?event=${event.slug}`}
                        className="text-blue-500 hover:text-blue-700"
                        title="Satışlar"
                      >
                        <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                      <Link
                        href={`/admin/events/edit/${event.slug}`}
                        className="text-electric-blue hover:text-electric-blue-dark"
                        title="Düzenle"
                      >
                        <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteEvent(event.slug)}
                        disabled={isDeleting === event.slug}
                        className="text-f1-red hover:text-f1-red-dark disabled:opacity-50"
                        title="Sil"
                      >
                        {isDeleting === event.slug ? (
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-f1-red border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                        )}
                      </button>
                    </div>
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