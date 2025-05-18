'use server';

import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { connectMongo, getMongoDb } from '@/lib/db/mongodb';
import { getFileUrl } from '@/lib/file-utils';

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

export async function uploadFileToGridFS(buffer: Buffer, filename: string, contentType: string): Promise<string> {
  const { bucket } = await connectToGridFS();
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);
  const uniqueFilename = `${Date.now()}-${filename}`;
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(uniqueFilename, {
      contentType
    });
    uploadStream.on('error', (error) => {
      reject(error);
    });
    uploadStream.on('finish', () => {
      resolve(uploadStream.id.toString());
    });
    readableStream.pipe(uploadStream);
  });
}

export async function getFileFromGridFS(fileId: string): Promise<{
  buffer: Buffer,
  metadata: any,
  contentType: string
}> {
  const { bucket } = await connectToGridFS();
  const id = new ObjectId(fileId);
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

export async function deleteFileFromGridFS(fileId: string): Promise<void> {
  const { bucket } = await connectToGridFS();
  await bucket.delete(new ObjectId(fileId));
}

export async function listFilesByCategory(
  category: string,
  page: number = 1,
  pageSize: number = 20
): Promise<any[]> {
  try {
    const { db } = await connectToGridFS();
    const bucket = db.collection('uploads.files');
    let query = {};
    if (category && category !== 'all') {
      query = {
        filename: {
          $regex: `${category}_`,
          $options: 'i'
        }
      };
    }
    const skip = (page - 1) * pageSize;
    const files = await bucket.find(query)
                             .sort({ uploadDate: -1 })
                             .skip(skip)
                             .limit(pageSize)
                             .toArray();
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
