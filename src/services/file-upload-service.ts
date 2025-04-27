import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

// MongoDB bağlantı URI'si
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'padokclub';

// MongoDB bağlantısı için bir istemci oluştur
let client: MongoClient | null = null;

/**
 * MongoDB'ye bağlanır ve GridFS bucket oluşturur
 */
export async function connectToGridFS() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  
  const db = client.db(DB_NAME);
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
 * Dosya URL'i oluştur
 * @param fileId Dosya ID'si
 * @returns Dosya URL'i
 */
export function getFileUrl(fileId: string): string {
  return `/api/files/${fileId}`;
}

/**
 * List files by category
 * @param category File category (banner, square, gallery, all)
 * @returns Array of file info objects
 */
export async function listFilesByCategory(category: string): Promise<any[]> {
  const { db } = await connectToGridFS();
  const bucket = db.collection('uploads.files');
  
  let query = {};
  
  // If category is specified and not 'all', filter by category
  if (category && category !== 'all') {
    // In a production environment, you'd store category in metadata
    // For now we'll use this simple approach based on the file structure
    query = { filename: { $regex: category, $options: 'i' } };
  }
  
  const files = await bucket.find(query).sort({ uploadDate: -1 }).toArray();
  
  // Map the files to a simpler format with URLs
  const mappedFiles = files.map(file => {
    const fileId = file._id.toString();
    const url = `/api/files/${fileId}`;
    const publicPath = `/images/${fileId}`;
    
    return {
      id: fileId,
      filename: file.filename,
      contentType: file.contentType,
      size: file.length,
      createdAt: file.uploadDate,
      url,
      publicPath,
      thumbnailUrl: url
    };
  });
  
  return mappedFiles;
}