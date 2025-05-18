import { prisma } from './prisma';
import type { Event } from '@prisma/client';
import { createFixedDate, generateUniqueId, getEventStatus } from '../../data/events/utils';

type LocalizedText = {
  tr: string;
  en: string;
};

type EventTicket = {
  id: string;
  name: LocalizedText;
  price: number;
  description: LocalizedText;
};

export async function getAllEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });
  
  return events.map(event => ({
    ...event,
    status: getEventStatus(event.date.toISOString())
  }));
}

export async function getFeaturedEvents() {
  return prisma.event.findMany({
    where: { isFeatured: true },
    orderBy: { date: 'asc' }
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug }
  });
}

export async function createEvent(eventData: {
  slug: string;
  bannerImage?: string;
  squareImage?: string;
  isFeatured?: boolean;
  date: Date | string;
  location: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  category: string;
  tickets: EventTicket[];
  rules?: { tr: string[]; en: string[] };
  gallery?: string[];
}) {
  return prisma.event.create({
    data: {
      ...eventData,
      date: typeof eventData.date === 'string' 
        ? new Date(eventData.date) 
        : eventData.date,
      status: getEventStatus(eventData.date.toString())
    }
  });
}

export async function updateEvent(slug: string, eventData: Partial<Event>) {
  return prisma.event.update({
    where: { slug },
    data: eventData
  });
}

export async function deleteEvent(slug: string) {
  return prisma.event.delete({
    where: { slug }
  });
}

export async function importEventsFromFiles(events: any[]) {
  await prisma.event.deleteMany();
  
  const importPromises = events.map(eventData => {
    return prisma.event.create({
      data: {
        slug: eventData.slug,
        bannerImage: eventData.bannerImage,
        squareImage: eventData.squareImage,
        isFeatured: eventData.isFeatured || false,
        date: new Date(eventData.date),
        location: eventData.location,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        tickets: eventData.tickets,
        rules: eventData.rules || null,
        gallery: eventData.gallery || [],
        status: getEventStatus(eventData.date)
      }
    });
  });
  
  return Promise.all(importPromises);
}