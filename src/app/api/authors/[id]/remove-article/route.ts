import { NextRequest, NextResponse } from 'next/server';
import { getAuthorById, updateAuthor } from '@/services/mongo-service';

// POST /api/authors/[id]/remove-article - Yazarın makale listesinden makale çıkar
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
    
    // Articles dizisi yoksa boş dizi oluştur
    const articles = author.articles || [];
    
    // Makaleyi yazarın listesinden çıkar
    const updatedArticles = articles.filter(slug => slug !== body.slug);
    
    // Yazarı güncelle
    const result = await updateAuthor(id, {
      ...author,
      articles: updatedArticles
    });
    
    return NextResponse.json(
      { success: true, message: 'Makale yazardan çıkarıldı' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing article from author:', error);
    return NextResponse.json(
      { error: 'Makale yazardan çıkarılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 