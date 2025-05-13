import { NextRequest, NextResponse } from 'next/server';
import { getAuthorById, updateAuthor } from '@/services/mongo-service';

// POST /api/authors/[id]/add-article - Yazarın makale listesine makale ekle
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    if (!body.slug) {
      return NextResponse.json(
        { error: 'Makale slug değeri gereklidir' },
        { status: 400 }
      );
    }
    
    // Önce yazarı getir
    const { author } = await getAuthorById(id);
    
    if (!author) {
      return NextResponse.json(
        { error: 'Yazar bulunamadı' },
        { status: 404 }
      );
    }
    
    // Articles dizisi yoksa oluştur
    const articles = author.articles || [];
    
    // Makale zaten yazarın listesinde var mı kontrol et
    if (!articles.includes(body.slug)) {
      articles.push(body.slug);
    }
    
    // Yazarı güncelle
    const result = await updateAuthor(id, {
      ...author,
      articles
    });
    
    return NextResponse.json(
      { success: true, message: 'Makale yazara eklendi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding article to author:', error);
    return NextResponse.json(
      { error: 'Makale yazara eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 