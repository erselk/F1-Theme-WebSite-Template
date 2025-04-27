// Server Component
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { headers } from 'next/headers';
import { getEventBySlug } from '@/services/mongo-service';
import { getEventStatus } from '@/types';
import { EventDetailContent } from './components/EventDetailContent';

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
  // Properly extract the slug parameter
  const { slug } = params;
  const event = await getEventBySlug(slug);

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

// Server component main page function
export default async function EventDetailPage({ params }: Props) {
  // Properly extract the slug parameter
  const { slug } = params;
  const event = await getEventBySlug(slug);
  const locale = await getLocaleFromHeaders();

  if (!event) {
    notFound();
  }

  // Etkinlik durumunu (geçmiş, bugün, yaklaşan) kontrol et
  const eventStatus = getEventStatus(new Date(event.date));
  
  // Sayfa URL'si
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://padokclub.com'}/events/${slug}`;

  // We'll pass the data to a client component for theme handling
  return <EventDetailContent event={event} eventStatus={eventStatus} pageUrl={pageUrl} locale={locale} />;
}
