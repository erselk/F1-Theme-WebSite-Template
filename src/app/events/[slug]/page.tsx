import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { headers } from 'next/headers';
import { CommentForm } from './components/comment-form';
import { getEventBySlug } from '@/services/mongo-service';
import { formatEventDate, getEventStatus } from '@/types';
import { CountdownTimer } from './components/CountdownTimer';
import { SocialShare } from './components/SocialShare';
import { ImageGallery } from './components/ImageGallery';
import { TicketSidebar } from './components/TicketSidebar';
import { EventSchedule } from './components/EventSchedule';
import { SmoothScrollNav } from './components/SmoothScrollNav';

// Server-side locale detection function
async function getLocaleFromHeaders(): Promise<LanguageType> {
  const headersList = await headers();
  // Try to get locale from Accept-Language header or cookies
  // Default to 'en' if not found
  const acceptLanguage = headersList.get('accept-language') || '';
  return acceptLanguage.includes('tr') ? 'tr' : 'en';
}

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found | Padok Club',
    };
  }

  return {
    title: `${event.title.en} | Padok Club`,
    description: event.description.en,
    openGraph: {
      title: `${event.title.en} | Padok Club`,
      description: event.description.en,
      images: [{ url: event.bannerImage, width: 1200, height: 630, alt: event.title.en }],
      type: 'website',
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const event = await getEventBySlug(params.slug);
  const locale = await getLocaleFromHeaders();

  if (!event) {
    notFound();
  }

  // Etkinlik durumunu (geçmiş, bugün, yaklaşan) kontrol et
  const eventStatus = getEventStatus(new Date(event.date));
  
  // Sayfa URL'si
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://padokclub.com'}/events/${params.slug}`;

  return (
    <main className="w-full bg-very-dark-grey">
      {/* Banner Image with overlay */}
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        <Image 
          src={event.bannerImage} 
          alt={event.title[locale]} 
          className="object-cover" 
          fill
          priority
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIEXYA9oAAAAABJRU5ErkJggg=="
          quality={95}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="container mx-auto p-6 md:p-12">
            {/* Etkinlik durum göstergesi ve geri sayım */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {eventStatus === 'upcoming' && (
                <>
                  <span className="bg-neon-green text-very-dark-grey px-3 py-1 rounded-full text-sm font-medium">
                    {locale === 'tr' ? 'Yaklaşan' : 'Upcoming'}
                  </span>
                  <CountdownTimer targetDate={event.date} locale={locale} />
                </>
              )}
              {eventStatus === 'today' && (
                <span className="bg-electric-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                  {locale === 'tr' ? 'Bugün' : 'Today'}
                </span>
              )}
              {eventStatus === 'past' && (
                <span className="bg-carbon-grey text-white px-3 py-1 rounded-full text-sm font-medium">
                  {locale === 'tr' ? 'Tamamlandı' : 'Completed'}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {event.title[locale]}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-white mb-6">
              <p className="bg-neon-red px-3 py-1 rounded-full">
                {event.category}
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {formatEventDate(event.date, locale)}
              </p>
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {event.location[locale]}
              </p>
            </div>
            
            {/* Sosyal paylaşım butonları */}
            <SocialShare url={pageUrl} title={event.title[locale]} locale={locale} />
          </div>
        </div>
      </div>

      {/* Sayfanın ana içeriği - 2 sütunlu grid yapısı */}
      <div className="container mx-auto px-4 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Ana içerik alanı - sol sütun */}
          <div className="flex-1">
            {/* Yapışkan (Sticky) Navigasyon - Yeni sıralama */}
            <SmoothScrollNav 
              locale={locale} 
              items={[
                { id: 'details', label: { en: 'Details', tr: 'Detaylar' } },
                { id: 'schedule', label: { en: 'Schedule', tr: 'Program' } },
                { id: 'rules', label: { en: 'Rules', tr: 'Kurallar' } },
                { id: 'gallery', label: { en: 'Gallery', tr: 'Galeri' } },
                { id: 'comments', label: { en: 'Comments', tr: 'Yorumlar' } }
              ]}
            />
            
            {/* Content Sections - İki sütun içinde düzenlenmiş */}
            <div className="mt-8">
              {/* Details Section */}
              <section id="details" className="mb-8">
                <div className="p-6 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                  <h2 className="text-3xl font-bold mb-6 flex items-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {locale === 'tr' ? 'Etkinlik Detayları' : 'Event Details'}
                  </h2>
                  <div className="prose max-w-none text-light-grey">
                    <p className="text-lg">{event.description[locale]}</p>
                  </div>
                </div>
              </section>

              {/* Grid layout for remaining sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Program/Ajanda Section */}
                <section id="schedule" className="col-span-1 md:col-span-2 mb-8">
                  <div className="p-6 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 flex items-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {locale === 'tr' ? 'Program Akışı' : 'Event Schedule'}
                    </h2>
                    
                    <EventSchedule 
                      schedule={event.schedule || [
                        { 
                          time: '08:00', 
                          title: { tr: 'Kayıt ve Karşılama', en: 'Registration & Welcome' },
                          description: { tr: 'Katılımcıların kayıt işlemleri ve hoş geldiniz kahvesi', en: 'Participant registration and welcome coffee' }
                        },
                        { 
                          time: '09:00', 
                          title: { tr: 'Açılış Konuşması', en: 'Opening Remarks' },
                          description: { tr: 'Etkinlik açılışı ve kuralların açıklanması', en: 'Event opening and rules explanation' }
                        },
                        { 
                          time: '10:00', 
                          title: { tr: 'Takımların Hazırlığı', en: 'Team Preparation' },
                          description: { tr: 'Pit stop ekipmanlarının hazırlanması', en: 'Setting up pit stop equipment' }
                        },
                        { 
                          time: '11:00', 
                          title: { tr: 'İlk Yarış Turu', en: 'First Round' },
                          description: { tr: 'Takımlar arası ilk yarışma', en: 'First competition round between teams' }
                        },
                        { 
                          time: '13:00', 
                          title: { tr: 'Öğle Yemeği', en: 'Lunch Break' },
                          description: { tr: 'Katılımcılar için öğle yemeği', en: 'Lunch for participants' }
                        }
                      ]} 
                      locale={locale}
                    />
                  </div>
                </section>

                {/* Rules Section */}
                <section id="rules" className="mb-8">
                  <div className="p-6 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className="text-3xl font-bold mb-6 flex items-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-neon-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {locale === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
                    </h2>
                    
                    {event.rules ? (
                      <ul className="list-disc pl-6 space-y-2 text-light-grey">
                        {event.rules[locale]?.map((rule, index) => (
                          <li key={index} className="text-lg">{rule}</li>
                        ))}
                      </ul>
                    ) : (
                      <ul className="list-disc pl-6 space-y-2 text-silver">
                        <li className="text-lg">
                          {locale === 'tr' 
                            ? 'Her takım 4 kişiden oluşmalıdır.' 
                            : 'Each team must consist of 4 members.'}
                        </li>
                        <li className="text-lg">
                          {locale === 'tr' 
                            ? 'Lastik değişimi sırasında tüm güvenlik prosedürlerine uyulmalıdır.' 
                            : 'All safety procedures must be followed during the tire change.'}
                        </li>
                        <li className="text-lg">
                          {locale === 'tr' 
                            ? 'Takımlar kendi ekipmanlarını kullanabilir.' 
                            : 'Teams may use their own equipment.'}
                        </li>
                        <li className="text-lg">
                          {locale === 'tr' 
                            ? 'Zaman, tüm lastikler değiştirilip araç yere indirildiğinde durdurulur.' 
                            : 'Time stops when all tires are changed and the car is lowered.'}
                        </li>
                        <li className="text-lg">
                          {locale === 'tr' 
                            ? 'Hakemlerin kararı kesindir.' 
                            : 'Judges\' decisions are final.'}
                        </li>
                      </ul>
                    )}
                  </div>
                </section>

                {/* Gallery Section */}
                <section id="gallery" className="mb-8">
                  <div className="p-6 bg-graphite rounded-lg border border-carbon-grey shadow-sm h-full">
                    <h2 className="text-3xl font-bold mb-6 flex items-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {locale === 'tr' ? 'Galeri' : 'Gallery'}
                    </h2>
                    
                    <ImageGallery 
                      images={event.gallery || [
                        "/images/events/gallery/event1.jpg",
                        "/images/events/gallery/event2.jpg",
                        "/images/events/gallery/event3.jpg"
                      ]} 
                      title={event.title[locale]} 
                      locale={locale} 
                    />
                  </div>
                </section>

                {/* Comments Section */}
                <section id="comments" className="col-span-1 md:col-span-2 mb-8">
                  <div className="p-6 bg-graphite rounded-lg border border-carbon-grey shadow-sm">
                    <h2 className="text-3xl font-bold mb-6 flex items-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-electric-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {locale === 'tr' ? 'Yorumlar' : 'Comments'}
                    </h2>
                    
                    {/* Yorum sıralama seçenekleri */}
                    <div className="flex justify-end mb-4">
                      <div className="relative inline-block">
                        <select className="appearance-none bg-dark-grey text-light-grey border border-carbon-grey rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue">
                          <option>{locale === 'tr' ? 'En Yeni' : 'Newest'}</option>
                          <option>{locale === 'tr' ? 'En Eski' : 'Oldest'}</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-silver">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Yorumlar Listesi */}
                    <div className="mb-8">
                      {event.comments && event.comments.length > 0 ? (
                        event.comments.map((comment) => (
                          <div key={comment.id} className="border-b border-carbon-grey pb-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-semibold text-light-grey">{comment.name}</h3>
                              <span className="text-sm text-silver">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-light-grey">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-silver italic">
                          {locale === 'tr' ? 'Henüz yorum yok. İlk yorum yapan siz olun!' : 
                           'No comments yet. Be the first to comment!'}
                        </p>
                      )}
                    </div>

                    {/* Yorum Formu */}
                    <CommentForm slug={params.slug} locale={locale} />
                  </div>
                </section>
              </div>
            </div>
          </div>
          
          {/* Sağ tarafta bilet satın alma bölümü */}
          <div className="w-full lg:w-[380px]">
            <TicketSidebar event={event} locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
