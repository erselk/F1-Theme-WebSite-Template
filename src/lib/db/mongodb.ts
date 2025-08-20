'use server';

import mongoose from 'mongoose';
import { MongoClient as MongoClientOriginal } from 'mongodb';

const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost/DeF1Club';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

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
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return null;
    }
    throw e;
  }

  return cached.conn;
}

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

export async function getMongoDb() {
  const { db } = await connectMongo();
  return db;
}