'use server';  // This marks the file as server-only code

import mongoose from 'mongoose';
import { MongoClient as MongoClientOriginal } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MongoDB URI çevre değişkeni tanımlanmamış! .env.local dosyasını kontrol edin.');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

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

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
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
  }

  try {
    cachedClient.conn = await cachedClient.promise;
  } catch (e) {
    cachedClient.promise = null;
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