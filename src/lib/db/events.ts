import { prisma } from './prisma';
import type { Event } from '@prisma/client';
import { createFixedDate, generateUniqueId, getEventStatus } from '../../data/events/utils';

// Types for type-safe operations
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

// Get all events
export async function getAllEvents() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' }
  });
  
  // Update status for each event
  return events.map(event => ({
    ...event,
    status: getEventStatus(event.date.toISOString())
  }));
}

// Get featured events
export async function getFeaturedEvents() {
  return prisma.event.findMany({
    where: { isFeatured: true },
    orderBy: { date: 'asc' }
  });
}

// Get event by slug
export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug }
  });
}

// Create new event
export async function createEvent(eventData: {
  slug: string;
  bannerImage?: string;
  squareImage?: string;
  price: number;
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
      comments: [],
      status: getEventStatus(eventData.date.toString())
    }
  });
}

// Update event
export async function updateEvent(slug: string, eventData: Partial<Event>) {
  return prisma.event.update({
    where: { slug },
    data: eventData
  });
}

// Delete event
export async function deleteEvent(slug: string) {
  return prisma.event.delete({
    where: { slug }
  });
}

// Add comment to event
export async function addCommentToEvent(
  slug: string, 
  comment: { id: string; userId: string; text: string; createdAt: Date }
) {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { comments: true }
  });
  
  if (!event) throw new Error('Event not found');
  
  const comments = [...event.comments, comment];
  
  return prisma.event.update({
    where: { slug },
    data: { comments }
  });
}

// Import events from file system
export async function importEventsFromFiles(events: any[]) {
  // First clear all existing events
  await prisma.event.deleteMany();
  
  // Then import all events from files
  const importPromises = events.map(eventData => {
    return prisma.event.create({
      data: {
        slug: eventData.slug,
        bannerImage: eventData.bannerImage,
        squareImage: eventData.squareImage,
        price: eventData.price,
        isFeatured: eventData.isFeatured || false,
        date: new Date(eventData.date),
        location: eventData.location,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        tickets: eventData.tickets,
        rules: eventData.rules || null,
        gallery: eventData.gallery || [],
        comments: [],
        status: getEventStatus(eventData.date)
      }
    });
  });
  
  return Promise.all(importPromises);
}