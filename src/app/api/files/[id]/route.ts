import { NextRequest, NextResponse } from 'next/server';
import { getFileFromGridFS } from '@/lib/file-uploader';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // MongoDB GridFS'ten dosyayı al
    const { buffer, contentType } = await getFileFromGridFS(fileId);

    // Dosyayı doğrudan yanıt olarak gönder
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000', // 1 yıl önbelleğe al
      },
    });
  } catch (error) {
    console.error('File fetch error:', error);

    // Dosya bulunamazsa 404 hatası döndür
    if (error instanceof Error && error.message === 'File not found') {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'File fetch failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}