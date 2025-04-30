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
  const db = await getMongoDb();
  
  // Step 1: Get files from both collections
  const results = await Promise.all([
    // Get files from uploads.files (GridFS)
    getGridFSFiles(db, category),
    // Get files from images collection (base64)
    getDirectImages(db, category)
  ]);
  
  // Combine and sort by creation date (newest first)
  const combinedFiles = [...results[0], ...results[1]].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
  
  return combinedFiles;
}

/**
 * Get files from GridFS by category
 */
async function getGridFSFiles(db: any, category: string): Promise<any[]> {
  const bucket = db.collection('uploads.files');
  
  let query = {};
  
  // Apply category filtering
  if (category && category !== 'all') {
    switch(category) {
      case 'banner':
        query = { 
          filename: { 
            $regex: '(banner|header|carousel|slider)', 
            $options: 'i' 
          } 
        };
        break;
      case 'event':
        query = { 
          filename: { 
            $regex: '(event|etkinlik)', 
            $options: 'i' 
          } 
        };
        break;
      case 'blog':
        query = { 
          filename: { 
            $regex: '(blog|article|makale)', 
            $options: 'i' 
          } 
        };
        break;
      case 'other':
        // Files that don't match the above categories
        query = { 
          filename: { 
            $not: { 
              $regex: '(banner|header|carousel|slider|event|etkinlik|blog|article|makale)', 
              $options: 'i' 
            } 
          } 
        };
        break;
    }
  }
  
  const files = await bucket.find(query).sort({ uploadDate: -1 }).toArray();
  
  // Map the files to a simpler format with URLs
  return files.map(file => {
    const fileId = file._id.toString();
    const url = getFileUrl(fileId);
    const publicPath = `/images/${fileId}`;
    
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
}

/**
 * Get images directly from the images collection by category
 */
async function getDirectImages(db: any, category: string): Promise<any[]> {
  const imagesCollection = db.collection('images');
  
  let query = {};
  
  // Apply category filtering for direct images
  if (category && category !== 'all') {
    switch(category) {
      case 'banner':
        query = { 
          name: { 
            $regex: '(banner|header|carousel|slider)', 
            $options: 'i' 
          } 
        };
        break;
      case 'event':
        query = { 
          name: { 
            $regex: '(event|etkinlik)', 
            $options: 'i' 
          } 
        };
        break;
      case 'blog':
        query = { 
          name: { 
            $regex: '(blog|article|makale)', 
            $options: 'i' 
          } 
        };
        break;
      case 'other':
        // Images that don't match the above categories
        query = { 
          name: { 
            $not: { 
              $regex: '(banner|header|carousel|slider|event|etkinlik|blog|article|makale)', 
              $options: 'i' 
            } 
          } 
        };
        break;
    }
  }
  
  const images = await imagesCollection.find(query).sort({ createdAt: -1 }).toArray();
  
  // Map the direct images to match the same format as GridFS files
  return images.map(image => {
    const fileId = image._id.toString();
    // For direct images, the data is already stored as base64
    const url = image.data || `/api/images/${fileId}`;
    
    return {
      id: fileId,
      filename: image.name,
      contentType: image.type,
      size: image.size,
      createdAt: image.createdAt,
      url: url,
      publicPath: url,
      thumbnailUrl: url,
      source: 'direct'
    };
  });
}