'use server';  // This marks the file as server-only code

import { BlogPost, Event, getEventStatus } from '@/types';
import { MongoClient, Db } from 'mongodb';

// MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// API URL fonksiyonu - çalışma ortamına göre URL oluşturur
function getApiUrl() {
  // Server-side: Göreceli URL kullan 
  if (typeof window === 'undefined') {
    return '';
  }
  // Client-side: Tam URL kullan
  return process.env.NEXT_PUBLIC_API_URL || '';
}

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI || '';
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined in environment variables');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  const dbName = process.env.MONGODB_DB || 'padokclub';
  cachedDb = cachedClient.db(dbName);
  
  return cachedDb;
}

/**
 * MongoDB servislerini içeren yardımcı fonksiyonlar
 */

export async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/blogs`, {
      cache: 'no-store' // Verileri her zaman yeniden çek
    });

    if (!res.ok) {
      throw new Error('Blog verilerini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.blogs;
  } catch (error) {
    console.error('Blog verilerini getirme hatası:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/blogs/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Blog verisini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.blog;
  } catch (error) {
    console.error('Blog verisini getirme hatası:', error);
    return null;
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/events`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Etkinlik verilerini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.events;
  } catch (error) {
    console.error('Etkinlik verilerini getirme hatası:', error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const baseUrl = getApiUrl();
    const res = await fetch(`${baseUrl}/api/events/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Etkinlik verisini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.event;
  } catch (error) {
    console.error('Etkinlik verisini getirme hatası:', error);
    return null;
  }
}

export async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const allEvents = await getAllEvents();
    const featured = allEvents.filter(event => event.isFeatured);
    
    if (featured.length >= 10) {
      return featured.slice(0, 10);
    } else {
      const nonFeatured = allEvents.filter(event => !event.isFeatured);
      const remaining = 10 - featured.length;
      return [...featured, ...nonFeatured.slice(0, remaining)].slice(0, 10);
    }
  } catch (error) {
    console.error('Öne çıkan etkinlikleri getirme hatası:', error);
    return [];
  }
}

export async function getSortedEvents(): Promise<Event[]> {
  try {
    const events = await getAllEvents();
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const now = new Date().getTime();
      
      // Gelecekteki etkinlikler (tarihe göre artan sırada)
      if (dateA >= now && dateB >= now) {
        return dateA - dateB;
      }
      // Geçmiş etkinlikler (tarihe göre azalan sırada)
      else if (dateA < now && dateB < now) {
        return dateB - dateA;
      }
      // Gelecek etkinlikler her zaman geçmiş etkinliklerden önce gelir
      else {
        return dateA >= now ? -1 : 1;
      }
    });
  } catch (error) {
    console.error('Sıralı etkinlikleri getirme hatası:', error);
    return [];
  }
}