import { NextRequest, NextResponse } from 'next/server';
import { connectToGridFS } from '@/services/file-upload-service';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToGridFS();
    const bucket = db.collection('uploads.files');
    
    // Tüm dosyaları çek, kategoriye göre filtreleme yapma
    const files = await bucket.find({}).sort({ uploadDate: -1 }).toArray();
    
    // Map the files to a simpler format with URLs
    const mappedFiles = files.map(file => {
      const fileId = file._id.toString();
      const url = `/api/files/${fileId}`;
      
      return {
        id: fileId,
        filename: file.filename || 'Unnamed file',
        contentType: file.contentType,
        size: file.length,
        createdAt: file.uploadDate,
        url,
        publicPath: `/images/${fileId}`, // Default public path
        thumbnailUrl: url
      };
    });
    
    return NextResponse.json({
      success: true,
      files: mappedFiles
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}