import { NextRequest, NextResponse } from 'next/server';
import { createAuthor, getAuthors } from '@/services/mongo-service';

// GET /api/authors - Tüm yazarları getir
export async function GET() {
  try {
    const { authors } = await getAuthors();
    return NextResponse.json({ authors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Yazarlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/authors - Yeni yazar oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.name || !body.profileImage) {
      return NextResponse.json(
        { error: 'Yazar adı ve profil resmi gereklidir' },
        { status: 400 }
      );
    }
    
    const result = await createAuthor(body);
    return NextResponse.json(
      { success: true, message: 'Yazar başarıyla oluşturuldu', id: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: 'Yazar oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}