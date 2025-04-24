import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getEventBySlug } from '@/data/events';
import { formatEventDate } from '@/data/events';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { headers } from 'next/headers';
import { CommentForm } from './components/comment-form';

interface EventDetailPageProps {
  params: {
    slug: string;
  };
}

// Server-side locale detection function
function getLocaleFromHeaders(): LanguageType {
  const headersList = headers();
  // Try to get locale from Accept-Language header or cookies
  // Default to 'en' if not found
  const acceptLanguage = headersList.get('accept-language') || '';
  return acceptLanguage.includes('tr') ? 'tr' : 'en';
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found | Padok Club',
    };
  }

  return {
    title: `${event.title.en} | Padok Club`,
    description: event.description.en,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventBySlug(params.slug);
  const locale = getLocaleFromHeaders();

  if (!event) {
    notFound();
  }

  return (
    <main className="w-full">
      {/* Banner Image */}
      <div className="relative w-full h-[50vh] md:h-[70vh]">
        <Image 
          src={event.bannerImage} 
          alt={event.title[locale]} 
          className="object-cover" 
          fill
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto p-6 md:p-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {event.title[locale]}
            </h1>
            <div className="flex flex-wrap gap-4 text-white mb-6">
              <p className="bg-primary px-3 py-1 rounded-full">
                {event.category}
              </p>
              <p>
                {formatEventDate(event.date, locale)}
              </p>
              <p>
                {event.location[locale]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-background border-b">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto whitespace-nowrap">
            <a href="#details" className="py-4 px-6 font-medium hover:text-primary">
              {locale === 'tr' ? 'Detaylar' : 'Details'}
            </a>
            <a href="#tickets" className="py-4 px-6 font-medium hover:text-primary">
              {locale === 'tr' ? 'Biletler' : 'Tickets'}
            </a>
            <a href="#comments" className="py-4 px-6 font-medium hover:text-primary">
              {locale === 'tr' ? 'Yorumlar' : 'Comments'}
            </a>
            <a href="#rules" className="py-4 px-6 font-medium hover:text-primary">
              {locale === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
            </a>
            <a href="#gallery" className="py-4 px-6 font-medium hover:text-primary">
              {locale === 'tr' ? 'Galeri' : 'Gallery'}
            </a>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="w-full">
        {/* Details Section */}
        <section id="details" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'tr' ? 'Detaylar' : 'Details'}
            </h2>
            <div className="prose max-w-none">
              <p className="text-lg">{event.description[locale]}</p>
            </div>
          </div>
        </section>

        {/* Tickets Section */}
        <section id="tickets" className="py-12 bg-secondary bg-opacity-5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'tr' ? 'Biletler' : 'Tickets'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.tickets ? (
                event.tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="border rounded-lg p-6 bg-background shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold mb-2">{ticket.name[locale]}</h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {ticket.price} TL
                    </p>
                    {ticket.description && (
                      <p className="text-gray-600 mb-4">{ticket.description[locale]}</p>
                    )}
                    <button 
                      className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition"
                    >
                      {locale === 'tr' ? 'Satın Al' : 'Purchase'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="border rounded-lg p-6 bg-background shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">
                    {locale === 'tr' ? 'Standart Bilet' : 'Standard Ticket'}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-4">{event.price} TL</p>
                  <button 
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition"
                  >
                    {locale === 'tr' ? 'Satın Al' : 'Purchase'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section id="comments" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'tr' ? 'Yorumlar' : 'Comments'}
            </h2>
            
            {/* Comments List */}
            <div className="mb-8">
              {event.comments && event.comments.length > 0 ? (
                event.comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{comment.name}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  {locale === 'tr' ? 'Henüz yorum yok. İlk yorum yapan siz olun!' : 
                   'No comments yet. Be the first to comment!'}
                </p>
              )}
            </div>

            {/* Comment Form */}
            <CommentForm slug={params.slug} locale={locale} />
          </div>
        </section>

        {/* Event Rules Section */}
        <section id="rules" className="py-12 bg-secondary bg-opacity-5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
            </h2>
            
            {event.rules ? (
              <ul className="list-disc pl-6 space-y-2">
                {event.rules[locale]?.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                {locale === 'tr' ? 'Bu etkinlik için belirtilen kurallar bulunmamaktadır.' : 
                 'There are no specified rules for this event.'}
              </p>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              {locale === 'tr' ? 'Galeri' : 'Gallery'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {event.gallery ? (
                event.gallery.map((image, index) => (
                  <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={`${event.title[locale]} - ${index + 1}`}
                      className="object-cover hover:scale-110 transition-transform duration-300"
                      fill
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 italic">
                    {locale === 'tr' ? 'Bu etkinlik için galeri görüntüleri bulunmamaktadır.' : 
                     'There are no gallery images available for this event.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
