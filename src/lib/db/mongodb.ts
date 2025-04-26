'use server';  // This marks the file as server-only code

import mongoose from 'mongoose';

// MongoDB URI'yi daha yumuşak bir şekilde işle
const MONGODB_URI: string = process.env.MONGODB_URI || '';

/**
 * Global değişkenler - varsa mevcut bağlantıyı saklar
 */
let cached: any = global.mongoose;

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

  // MongoDB URI yoksa hata fırlat ama önce kontrol et
  if (!MONGODB_URI) {
    console.error('HATA: MongoDB URI çevre değişkeni tanımlanmamış!');
    throw new Error('MongoDB URI çevre değişkeni tanımlanmamış! .env.local dosyasını veya Netlify çevre değişkenlerini kontrol edin.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 saniye bağlantı zaman aşımı
      // Hata durumunu daha iyi yakalamak için diğer seçenekler
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB bağlantısı başarıyla kuruldu');
        return mongoose;
      })
      .catch(err => {
        console.error('MongoDB bağlantı hatası:', err);
        cached.promise = null; // Hata durumunda promise'i sıfırla
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB bağlantısı başarısız:', e);
    throw e;
  }

  return cached.conn;
}