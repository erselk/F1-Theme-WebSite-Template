import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToGridFS } from '@/lib/file-uploader';

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
    
    // Dosyayı buffer'a dönüştür
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Kategoriye ait bilgi ekle (opsiyonel)
    const category = formData.get('category') as string || 'other';
    
    // Kategori bilgisini dosya adına ekle
    const filename = `${category}_${file.name}`;
    
    // GridFS'e yükle
    const fileId = await uploadFileToGridFS(buffer, filename, file.type);
    
    // API URL'sini oluştur
    const imageUrl = `/api/files/${fileId}`;
    
    return NextResponse.json({ 
      success: true, 
      url: imageUrl,
      id: fileId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Dosya yüklenirken bir hata oluştu' }, { status: 500 });
  }
}