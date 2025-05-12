import { NextRequest, NextResponse } from 'next/server';
import { connectToGridFS, listFilesByCategory } from '@/lib/file-uploader';

export async function GET(request: NextRequest) {
  try {
    // URL'den parametreleri al
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    
    // Sayfalama parametrelerini al
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    
    console.log('Files listing requested with category:', category, 'page:', page, 'pageSize:', pageSize);
    
    // Dosyaları listele, sayfalama parametrelerini ilet
    const files = await listFilesByCategory(category, page, pageSize);
    
    console.log(`Returning ${files.length} files to client for page ${page}`);
    
    // Dönen dosya listesinin içeriğini örnekle (development için)
    if (files.length > 0) {
      console.log('First file example:', {
        id: files[0].id,
        filename: files[0].filename,
        url: files[0].url,
        createdAt: files[0].createdAt
      });
    }
    
    return NextResponse.json({
      success: true,
      files: files,
      pagination: {
        page,
        pageSize,
        hasMore: files.length === pageSize // Eğer tam pageSize kadar döndüyse muhtemelen daha fazla veri var
      }
    });
  } catch (error) {
    console.error('Error listing files:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to list files', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      }, 
      { status: 500 }
    );
  }
}