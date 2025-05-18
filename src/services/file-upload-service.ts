'use server';  // Mark as server-only code

import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { connectMongo, getMongoDb } from '@/lib/db/mongodb';
import { getFileUrl } from '@/lib/file-utils';

/**
 * MongoDB'ye bağlanır ve GridFS bucket oluşturur
 */
export async function connectToGridFS() {
  const { client, db } = await connectMongo();
  
  const bucket = new GridFSBucket(db, {
    bucketName: 'uploads'
  });
  
  return {
    db,
    bucket,
    client
  };
}

/**
 * Buffer olarak verilen dosyayı MongoDB GridFS'e yükler
 * @param buffer Dosya verisi
 * @param filename Dosya adı
 * @param contentType MIME tipi
 * @returns Yüklenen dosyanın ID'si
 */
export async function uploadFileToGridFS(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { bucket } = await connectToGridFS();
  
  // Buffer'ı bir akışa dönüştür
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null); // Akışın sonunu işaretle
  
  // Dosya adını benzersiz yap
  const uniqueFilename = `${Date.now()}-${filename}`;
  
  return new Promise((resolve, reject) => {
    // GridFS stream oluştur
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      contentType
    });
    
    // Hata durumunda
    uploadStream.on('error', (error) => {
      reject(error);
    });
    
    // Yükleme tamamlandığında
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });
    
    // Verileri aktar
    readableStream.pipe(uploadStream);
  });
}

/**
 * GridFS'ten dosya indirme
 * @param fileId Dosya ID'si
 * @returns Dosya buffer'ı ve metadata
 */
export async function getFileFromGridFS(fileId: string): Promise<{
  buffer: Buffer,
  metadata: any,
  contentType: string
}> {
  const { bucket } = await connectToGridFS();
  
  // ObjectId oluştur
  const id = new ObjectId(fileId);
  
  // Dosya bilgilerini al
  const files = await bucket.find({ _id: id }).toArray();
  if (files.length === 0) {
    throw new Error('File not found');
  }
  
  const downloadStream = bucket.openDownloadStream(id);
  
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    downloadStream.on('error', (error) => {
      reject(error);
    });
    
    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve({
        buffer,
        metadata: files[0],
        contentType: files[0].contentType
      });
    });
  });
}

/**
 * Dosya silme
 * @param fileId Dosya ID'si
 */
export async function deleteFileFromGridFS(fileId: string): Promise<void> {
  const { bucket } = await connectToGridFS();
  await bucket.delete(new ObjectId(fileId));
}

/**
 * List files by category
 * @param category File category (all, banner, event, blog, other)
 * @returns Array of file info objects
 */
export async function listFilesByCategory(category: string): Promise<any[]> {
  try {
    const { db } = await connectToGridFS();
    const bucket = db.collection('uploads.files');
    
    let query = {};
    
    // Apply category filtering only if not "all"
    if (category && category !== 'all') {
      // Kategori bilgisinin dosya adında olması bekleniyor
      query = { 
        filename: { 
          $regex: `${category}_`, 
          $options: 'i' 
        } 
      };
    }
    
    // Dosyaları çek ve sırala (en yeni ilk)
    const files = await bucket.find(query).sort({ uploadDate: -1 }).toArray();
    
    // Map the files to a simpler format with URLs
    return files.map(file => {
      const fileId = file._id.toString();
      const url = getFileUrl(fileId);
      const publicPath = `/api/files/${fileId}`;
      
      return {
        id: fileId,
        filename: file.filename,
        contentType: file.contentType,
        size: file.length,
        createdAt: file.uploadDate,
        url,
        publicPath,
        thumbnailUrl: url,
        source: 'gridfs'
      };
    });
  } catch (error) {
    return [];
  }
} 