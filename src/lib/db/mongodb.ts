'use server';  // This marks the file as server-only code

import mongoose from 'mongoose';
import { MongoClient as MongoClientOriginal } from 'mongodb';

// Use a default MongoDB URI for builds if the environment variable is not set
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost/padokclub';

/**
 * Global değişkenler - varsa mevcut bağlantıyı saklar
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * MongoDB veritabanına bağlantı kurar
 * @returns MongoDB bağlantısı
 */
export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    try {
      cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Return null instead of throwing during build
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        return null;
      }
      throw error;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection failed:', e);
    // Return null instead of throwing during build
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return null;
    }
    throw e;
  }

  return cached.conn;
}

// Raw MongoDB client for GridFS and other operations
let cachedClient = global.mongoClient;
let cachedDb = global.mongoDb;

if (!cachedClient) {
  cachedClient = global.mongoClient = { conn: null, promise: null };
}

if (!cachedDb) {
  cachedDb = global.mongoDb = null;
}

export async function connectMongo() {
  if (cachedClient.conn) {
    return {
      client: cachedClient.conn,
      db: cachedDb
    };
  }

  if (!cachedClient.promise) {
    try {
      const client = new MongoClientOriginal(MONGODB_URI, {
        // Disable MongoDB features that use Node.js-specific modules
        monitorCommands: false,
        serverApi: {
          version: '1',
          strict: true,
          deprecationErrors: true,
        }
      });

      cachedClient.promise = client.connect()
        .then((client) => {
          const db = client.db();
          cachedDb = global.mongoDb = db;
          return client;
        });
    } catch (error) {
      console.error('MongoDB client connection error:', error);
      // Return empty objects instead of throwing during build
      if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
        return { client: null, db: null };
      }
      throw error;
    }
  }

  try {
    cachedClient.conn = await cachedClient.promise;
  } catch (e) {
    cachedClient.promise = null;
    console.error('MongoDB client connection failed:', e);
    // Return empty objects instead of throwing during build
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return { client: null, db: null };
    }
    throw e;
  }

  return {
    client: cachedClient.conn,
    db: cachedDb
  };
}

// Helper to get MongoDB database instance
export async function getMongoDb() {
  const { db } = await connectMongo();
  return db;
}