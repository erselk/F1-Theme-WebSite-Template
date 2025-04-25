import mongoose from 'mongoose';

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