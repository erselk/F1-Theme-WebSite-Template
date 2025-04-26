import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    console.log('API: /api/blogs çağrısı alındı');
    
    try {
      await connectToDatabase();
      console.log('API: MongoDB bağlantısı başarılı');
    } catch (dbError) {
      console.error('API: MongoDB bağlantı hatası:', dbError);
      return NextResponse.json({ 
        message: 'Veritabanı bağlantısı başarısız oldu', 
        error: dbError instanceof Error ? dbError.message : String(dbError),
        success: false 
      }, { status: 500 });
    }
    
    // Tüm blogları getir ve tarihe göre tersinden sırala (en yenisi önce)
    console.log('API: Blog verileri sorgulanıyor...');
    const blogs = await Blog.find({}).sort({ publishDate: -1 });
    console.log(`API: ${blogs.length} blog girdisi bulundu`);
    
    return NextResponse.json({ 
      blogs,
      success: true 
    });
  } catch (error) {
    console.error('Blog verilerini getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Bloglar getirilirken bir hata oluştu', 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }, { status: 500 });
  }
}