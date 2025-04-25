import { BlogPost, Event, getEventStatus } from '@/types';

/**
 * MongoDB servislerini içeren yardımcı fonksiyonlar
 */

// Blog servisleri
export async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/blogs`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/blogs/${slug}`, {
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

// Etkinlik servisleri
export async function getAllEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events/${slug}`, {
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

// Öne çıkan etkinlikleri getir
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

// Etkinlikleri sıralı olarak getir
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