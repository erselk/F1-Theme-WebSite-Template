'use server';  // This marks the file as server-only code

import { BlogPost, Event as EventType, getEventStatus } from '@/types';
import { MongoClient, Db, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB modelleri
import EventModel from '@/models/Event';
// import { connectToDatabase as connectMongooseToDatabase } from '@/lib/db/mongodb'; // Bu Mongoose için, şimdilik kalsın

// MongoDB connection for native driver
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

// Extend the NodeJS.Global interface to include _mongoClientPromise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function connectToDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  const mongoClient = await clientPromise;
  return mongoClient.db();
}

/**
 * MongoDB servislerini içeren yardımcı fonksiyonlar
 */

export async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    // Bu fonksiyon API fetch kullandığı için doğrudan connectToDatabase kullanmıyor.
    // Eğer bu da native driver kullanacaksa güncellenmeli. Şimdilik olduğu gibi bırakıyorum.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/blogs`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Blog verilerini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.blogs;
  } catch (error) {
    console.error('Error in getAllBlogs:', error);
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    // API fetch kullandığı için şimdilik olduğu gibi bırakıyorum.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/blogs/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Blog verisini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.blog;
  } catch (error) {
    console.error(`Error in getBlogBySlug for slug ${slug}:`, error);
    return null;
  }
}

export async function getAllEvents(): Promise<EventType[]> {
  try {
    // API fetch kullandığı için şimdilik olduğu gibi bırakıyorum.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const apiUrl = `${baseUrl}/api/events`;

    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });

    if (!res.ok) {
      console.error('Etkinlik verilerini getirme hatası (getAllEvents):', res.status, res.statusText);
      throw new Error('Etkinlik verilerini getirirken bir hata oluştu');
    }

    const data = await res.json();
    return data.events;
  } catch (error) {
    console.error('Etkinlik verilerini getirme hatası (getAllEvents catch):', error);
    return [];
  }
}

// getEventBySlug Mongoose kullanıyor, onu olduğu gibi bırakıyorum,
// çünkü Mongoose kendi bağlantı yönetimini yapıyor (lib/db/mongodb.ts üzerinden).
// Eğer tüm servisleri native MongoDB driver'a geçireceksek, bu da güncellenmeli.
// Şimdilik karışıklık olmaması için dokunmuyorum.
export async function getEventBySlug(
  slug: string, 
  options: { cache?: 'force-cache' | 'no-store' } = { cache: 'no-store' }
): Promise<EventType | null> {
  try {
    // Bu fonksiyon Mongoose kullanıyor. Mongoose kendi bağlantısını yönetir.
    // await connectToDatabase(); // Bu bizim native driver için olan bağlantı, burada gerekmiyor.
    // Mongoose için doğru bağlantı fonksiyonunu import edip kullanmak gerekebilir, ya da zaten globaldir.
    // Şimdilik orjinal Mongoose bağlantı mantığına dokunmuyorum.
    // Eğer Mongoose bağlantısı `lib/db/mongodb.ts` içinde yönetiliyorsa, o zaten çalışmalı.
    // Bu servis dosyasında hem native driver hem Mongoose olması kafa karıştırıcı olabilir.
    // Örnek olarak bu fonksiyonu Mongoose ile bırakıyorum.
    
    const { connectToDatabase: connectMongoose } = await import('@/lib/db/mongodb');
    await connectMongoose(); // Mongoose bağlantısını sağla

    const event = await EventModel.findOne({ slug });
    
    if (!event) {
      return null;
    }
    
    const eventData = event.toObject ? event.toObject() : JSON.parse(JSON.stringify(event));
    
    if (eventData._id) {
      eventData.id = eventData._id.toString();
      // delete eventData._id; // id olarak kopyaladık, _id'yi silmek isteğe bağlı
    }
    
    return eventData as EventType;
    
  } catch (error) {
    console.error(`Error fetching event by slug ${slug}:`, error);
    return null;
  }
}


export async function getFeaturedEvents(): Promise<EventType[]> {
  try {
    const allEvents = await getAllEvents(); // Bu API fetch kullanıyor
    const featured = allEvents.filter(event => event.isFeatured);
    
    if (featured.length >= 10) {
      return featured.slice(0, 10);
    } else {
      const nonFeatured = allEvents.filter(event => !event.isFeatured);
      const remaining = 10 - featured.length;
      return [...featured, ...nonFeatured.slice(0, remaining)].slice(0, 10);
    }
  } catch (error) {
    console.error('Error in getFeaturedEvents:', error);
    return [];
  }
}

export async function getSortedEvents(): Promise<EventType[]> {
  try {
    const events = await getAllEvents(); // Bu API fetch kullanıyor
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      const now = new Date().getTime();
      
      if (dateA >= now && dateB >= now) {
        return dateA - dateB;
      }
      else if (dateA < now && dateB < now) {
        return dateB - dateA;
      }
      else {
        return dateA >= now ? -1 : 1;
      }
    });
  } catch (error) {
    console.error('Error in getSortedEvents:', error);
    return [];
  }
}

// Author collection operations
export async function getAuthors() {
  try {
    const currentDb = await connectToDatabase();
    const authors = await currentDb.collection('authors').find().sort({ createdAt: -1 }).toArray();
    // ObjectId'leri string'e dönüştür
    const serializedAuthors = authors.map(author => ({
      ...author,
      _id: author._id.toString(),
      // Eğer article ID'leri de ObjectId ise onları da dönüştürmek gerekebilir
      // articles: author.articles ? author.articles.map(id => id.toString()) : [],
    }));
    return { authors: serializedAuthors };
  } catch (error) {
    console.error('Failed to fetch authors:', error);
    // throw new Error('Failed to fetch authors'); // API route'da zaten hata yakalanıyor, burada sadece log yeterli olabilir.
    // Ya da daha spesifik bir hata mesajı döndürebiliriz.
    return { authors: [], error: 'Failed to fetch authors' }; 
  }
}

export async function getAuthorById(id: string) {
  try {
    const currentDb = await connectToDatabase();
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      // Eğer id geçerli bir ObjectId string değilse, findOne null dönecektir.
      // Bu genellikle istenen bir durumdur (yazar bulunamadı).
      console.warn(`Invalid ObjectId string for id in getAuthorById: ${id}. Querying by string id.`);
      query = { _id: id as any }; 
    }
    
    const author = await currentDb.collection('authors').findOne(query);
    if (author) {
      return { author: { ...author, _id: author._id.toString() } };
    }
    return { author: null };
  } catch (error) {
    console.error(`Failed to fetch author by id ${id}:`, error);
    return { author: null, error: 'Failed to fetch author' };
  }
}

export async function createAuthor(authorData: any) { // 'author' yerine 'authorData' daha açıklayıcı
  try {
    const currentDb = await connectToDatabase();
    const now = new Date();
    const authorToInsert = {
      ...authorData,
      articles: authorData.articles || [],
      createdAt: now,
      updatedAt: now
    };
    const result = await currentDb.collection('authors').insertOne(authorToInsert);
    return { success: true, id: result.insertedId.toString() };
  } catch (error) {
    console.error('Failed to create author:', error);
    return { success: false, error: 'Failed to create author' };
  }
}

export async function updateAuthor(id: string, authorData: any) {
  try {
    const currentDb = await connectToDatabase();
    const now = new Date();
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      console.warn(`Invalid ObjectId string for id in updateAuthor: ${id}. Querying by string id.`);
      query = { _id: id as any };
    }
    
    const { _id, ...dataToUpdate } = authorData; // Gelen _id'yi güncelleme verisinden çıkar
    
    const updateDoc = {
      $set: {
        ...dataToUpdate,
        updatedAt: now,
      },
    };
    
    const result = await currentDb.collection('authors').updateOne(query, updateDoc);
    
    if (result.matchedCount === 0) {
      // throw new Error('Author not found for update'); 
      return { success: false, error: 'Author not found for update' };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to update author ${id}:`, error);
    return { success: false, error: 'Failed to update author' };
  }
}

export async function deleteAuthor(id: string) {
  try {
    const currentDb = await connectToDatabase();
    let query = {};
    try {
      query = { _id: new ObjectId(id) };
    } catch (error) {
      console.warn(`Invalid ObjectId string for id in deleteAuthor: ${id}. Querying by string id.`);
      query = { _id: id as any };
    }
    
    const result = await currentDb.collection('authors').deleteOne(query);
    
    if (result.deletedCount === 0) {
      // throw new Error('Author not found for deletion');
      return { success: false, error: 'Author not found for deletion' };
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete author ${id}:`, error);
    return { success: false, error: 'Failed to delete author' };
  }
}

// testFetchSomeEvents Mongoose kullanıyor gibi duruyor,
// connectMongooseToDatabase importu yorum satırında olsa da.
// Bu fonksiyonun amacı net değil, şimdilik dokunmuyorum.
export async function testFetchSomeEvents() {
  try {
    // await connectMongooseToDatabase(); // Bu Mongoose için
  } catch (error) {
    // console.error('Error in testFetchSomeEvents:', error);
  }
}

// Global tip tanımını dosyanın en üstüne taşıdım.
// declare global {
//   namespace NodeJS {
//     interface Global {
//       _mongoClientPromise?: Promise<MongoClient>;
//     }
//   }
// }