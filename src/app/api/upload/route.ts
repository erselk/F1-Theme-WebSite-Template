import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongo-service';
import { ObjectId } from 'mongodb';

// POST /api/upload - Dosya yüklemek için endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
    }
    
    // Dosya türünü kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece resim dosyaları yüklenebilir' }, { status: 400 });
    }
    
    // Maximum dosya boyutu (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Dosya boyutu 2MB\'dan küçük olmalıdır' }, { status: 400 });
    }
    
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const base64data = Buffer.from(bytes).toString('base64');
    const fileData = `data:${file.type};base64,${base64data}`;
    
    // MongoDB'ye bağlan
    const db = await connectToDatabase();
    
    // images koleksiyonuna kaydet
    const result = await db.collection('images').insertOne({
      name: file.name,
      type: file.type,
      size: file.size,
      data: fileData,
      createdAt: new Date()
    });
    
    const imageUrl = `/api/images/${result.insertedId}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      id: result.insertedId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu' }, { status: 500 });
  }
}