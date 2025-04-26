import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Tüm blogları getir ve tarihe göre tersinden sırala (en yenisi önce)
    const blogs = await Blog.find({}).sort({ publishDate: -1 });
    
    return NextResponse.json({ 
      blogs,
      success: true 
    });
  } catch (error) {
    console.error('Blog verilerini getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Bloglar getirilirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}