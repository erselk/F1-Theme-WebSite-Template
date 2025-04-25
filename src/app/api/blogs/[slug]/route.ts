import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({ 
        message: 'Blog slug parametresi eksik', 
        success: false 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    // Slug'a göre blog getir
    const blog = await Blog.findOne({ slug });
    
    if (!blog) {
      return NextResponse.json({ 
        message: 'Blog bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      blog,
      success: true 
    });
  } catch (error) {
    console.error('Blog verisi getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Blog getirilirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}