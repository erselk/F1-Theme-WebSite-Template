'use server';  // This marks the file as server-only code

import { BlogPost, Event as EventType, getEventStatus } from '@/types';
import { MongoClient, Db, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB modelleri
import EventModel from '@/models/Event';

// MongoDB connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (cachedDb) {
    db = cachedDb;
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
  db = cachedDb;
  
  return cachedDb;
}

/**
 * MongoDB servislerini içeren yardımcı fonksiyonlar
 */

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

export async function getAllEvents(): Promise<EventType[]> {
  try {
    // Önbelleğe almayı devre dışı bırak
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
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

export async function getEventBySlug(
  slug: string, 
  options: { cache?: 'force-cache' | 'no-store' } = { cache: 'no-store' }
): Promise<EventType | null> {
  try {
    // MongoDB'ye bağlan
    await connectToDatabase();
    
    // Mongoose modelini kullanarak etkinliği bul
    const event = await EventModel.findOne({ slug });
    
    if (!event) {
      return null;
    }
    
    // Etkinlik nesnesini POJO'ya dönüştür
    const eventData = event.toObject ? event.toObject() : JSON.parse(JSON.stringify(event));
    
    // MongoDB'nin ObjectId'sini string'e dönüştür
    if (eventData._id) {
      eventData.id = eventData._id.toString();
      delete eventData._id;
    }
    
    return eventData as EventType;
    
  } catch (error) {
    console.error('getEventBySlug hatası:', error);
    return null;
  }
}

export async function getFeaturedEvents(): Promise<EventType[]> {
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

export async function getSortedEvents(): Promise<EventType[]> {
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

// Author collection operations
export async function getAuthors() {
  try {
    await connectToDatabase();
    // Test veritabanını kullan
    const testDb = cachedClient!.db('test');
    const authors = await testDb.collection('authors').find().sort({ createdAt: -1 }).toArray();
    return { authors };
  } catch (error) {
    console.error('Error getting authors:', error);
    throw new Error('Failed to fetch authors');
  }
}

export async function getAuthorById(id: string) {
  try {
    await connectToDatabase();
    
    // Test veritabanını kullan
    const testDb = cachedClient!.db('test');
    
    // ObjectId oluşturmayı dene, geçersizse normal string olarak kullan
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      console.warn(`Invalid ObjectId format: ${id}, using as string`);
      query = { _id: id };
    }
    
    const author = await testDb.collection('authors').findOne(query);
    return { author };
  } catch (error) {
    console.error('Error getting author by id:', error);
    throw new Error('Failed to fetch author');
  }
}

export async function createAuthor(author: any) {
  try {
    await connectToDatabase();
    
    // Test veritabanını kullan
    const testDb = cachedClient!.db('test');
    
    const now = new Date();
    const authorToInsert = {
      ...author,
      articles: author.articles || [],
      createdAt: now,
      updatedAt: now
    };
    const result = await testDb.collection('authors').insertOne(authorToInsert);
    console.log(`Yazar "${author.name}" test veritabanına kaydedildi`);
    return { success: true, id: result.insertedId };
  } catch (error) {
    console.error('Error creating author:', error);
    throw new Error('Failed to create author');
  }
}

export async function updateAuthor(id: string, author: any) {
  try {
    await connectToDatabase();
    
    // Test veritabanını kullan
    const testDb = cachedClient!.db('test');
    
    const now = new Date();
    
    // ObjectId oluşturmayı dene, geçersizse normal string olarak kullan
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      console.warn(`Invalid ObjectId format: ${id}, using as string`);
      query = { _id: id };
    }
    
    const result = await testDb.collection('authors').updateOne(
      query,
      { 
        $set: { 
          ...author, 
          updatedAt: now 
        } 
      }
    );
    return { success: result.modifiedCount > 0 };
  } catch (error) {
    console.error('Error updating author:', error);
    throw new Error('Failed to update author');
  }
}

export async function deleteAuthor(id: string) {
  try {
    await connectToDatabase();
    
    // Test veritabanını kullan
    const testDb = cachedClient!.db('test');
    
    // ObjectId oluşturmayı dene, geçersizse normal string olarak kullan
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      console.warn(`Invalid ObjectId format: ${id}, using as string`);
      query = { _id: id };
    }
    
    const result = await testDb.collection('authors').deleteOne(query);
    return { success: result.deletedCount > 0 };
  } catch (error) {
    console.error('Error deleting author:', error);
    throw new Error('Failed to delete author');
  }
}