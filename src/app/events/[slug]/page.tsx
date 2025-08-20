// Server Component
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { headers } from 'next/headers';
import { getEventBySlug } from '@/services/mongo-service';
import { getEventStatus } from '@/types';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import { FullPageLoader } from '@/components/LoadingPlaceholders';

// Her istekte yeniden değerlendir, hiç önbellek kullanma
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// Lazy load the client component 
const EventDetailContent = dynamicImport(
  () => import('./components/EventDetailContent').then(mod => ({ default: mod.EventDetailContent })),
  {
    loading: () => <FullPageLoader />
  }
);

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
  // In Next.js App Router, params object is already resolved and doesn't need to be awaited
  // Accessing slug property directly is safe, but we'll use a separate variable for clarity
  const slugValue = params.slug;
  const event = await getEventBySlug(slugValue, { cache: 'no-store' });

  if (!event) {
    return {
      title: 'Event Not Found | DeF1 Club',
    };
  }

  return {
    title: `${event.title.en} | DeF1 Club`,
    description: event.description.en,
    openGraph: {
      title: `${event.title.en} | DeF1 Club`,
      description: event.description.en,
      images: [{ url: event.bannerImage, width: 1200, height: 630, alt: event.title.en }],
      type: 'website',
    },
  };
}

// Server component main page function
export default async function EventDetailPage({ params }: Props) {
  // In Next.js App Router, params object is already resolved and doesn't need to be awaited
  // Accessing slug property directly is safe, but we'll use a separate variable for clarity
  const slugValue = params.slug;
  
  // Her istek için yeni veri çek, hiç önbellek kullanma
  const event = await getEventBySlug(slugValue, { cache: 'no-store' });
  const locale = await getLocaleFromHeaders();

  if (!event) {
    notFound();
  }

  // Etkinlik durumunu (geçmiş, bugün, yaklaşan) kontrol et
  const eventStatus = getEventStatus(event.date);
  
  // Sayfa URL'si
  const pageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://DeF1Club.com'}/events/${slugValue}`;

  // We'll pass the data to a client component for theme handling
  return (
    <Suspense fallback={<FullPageLoader />}>
      <EventDetailContent 
        event={event} 
        eventStatus={eventStatus} 
        pageUrl={pageUrl} 
        locale={locale} 
        slug={slugValue}
      />
    </Suspense>
  );
}
