import { NextRequest, NextResponse } from 'next/server';
import { getAuthorById, updateAuthor, deleteAuthor } from '@/services/mongo-service';
import { ObjectId } from 'mongodb';

// GET /api/authors/[id] - Belirli bir yazarı getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { author } = await getAuthorById(id);
    
    if (!author) {
      return NextResponse.json(
        { error: 'Yazar bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ author }, { status: 200 });
  } catch (error) {
    console.error('Error fetching author:', error);
    return NextResponse.json(
      { error: 'Yazar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/authors/[id] - Yazarı güncelle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Gerekli alanları kontrol et
    if (!body.name) {
      return NextResponse.json(
        { error: 'Yazar adı gereklidir' },
        { status: 400 }
      );
    }
    
    const result = await updateAuthor(id, body);
    return NextResponse.json(
      { success: true, message: 'Yazar başarıyla güncellendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating author:', error);
    return NextResponse.json(
      { error: 'Yazar güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/authors/[id] - Bir yazarı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const result = await deleteAuthor(id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Yazar bulunamadı veya silinemedi' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Yazar başarıyla silindi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting author:', error);
    return NextResponse.json(
      { error: 'Yazar silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}