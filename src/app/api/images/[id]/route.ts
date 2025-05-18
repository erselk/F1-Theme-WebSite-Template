import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongo-service';
import { ObjectId } from 'mongodb';

// GET /api/images/[id] - Resim görüntüleme endpoint'i
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // MongoDB'ye bağlan
    const db = await connectToDatabase();
    
    // Resmi bul
    const image = await db.collection('images').findOne({ _id: new ObjectId(id) });
    
    if (!image) {
      return NextResponse.json({ error: 'Resim bulunamadı' }, { status: 404 });
    }
    
    // Base64 formatındaki data:image/jpeg;base64,... şeklindeki veriyi ayrıştır
    const dataUrlParts = image.data.split(';base64,');
    const mimeType = dataUrlParts[0].split(':')[1];
    const base64Data = dataUrlParts[1];
    
    // Base64'ten Buffer'a dönüştür
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Resmi doğrudan response olarak döndür
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 yıl cache
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Resim getirme hatası' },
      { status: 500 }
    );
  }
}