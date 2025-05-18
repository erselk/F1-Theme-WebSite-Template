import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

// Cache kontrollerini ayarla - önbelleğe almayı engelle
export const dynamic = 'force-dynamic'; // Statik önbelleğe almayı devre dışı bırak
export const revalidate = 0; // Her istekte yeniden doğrulama yap

export async function GET() {
  try {
    await connectToDatabase();
    
    // Tüm blogları getir, tarihe göre tersinden sırala ve yazar bilgilerini populate et
    const blogs = await Blog.find({}).sort({ publishDate: -1 }).populate('author', 'name profileImage _id');
    
    // Cache-Control başlıklarını ayarla
    return NextResponse.json({ 
      blogs,
      success: true 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Blog verilerini getirme hatası:', error);
    // Hata mesajını güvenli bir şekilde string yap
    const errorMessage = error instanceof Error ? error.message : 'Bloglar yüklenirken bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ 
      message: 'Bloglar getirilirken bir hata oluştu: ' + errorMessage, 
      error: errorMessage, // Sadece string mesajı gönderelim
      success: false 
    }, { status: 500 });
  }
}

// Blog eklendiğinde POST isteği
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    
    // Slug kontrolü - slug yoksa veya geçersizse hata döndür
    if (!data.slug || data.slug === 'undefined' || data.slug.includes('undefined')) {
      return NextResponse.json({ 
        message: 'Geçersiz blog slug değeri', 
        success: false 
      }, { status: 400 });
    }
    
    // Blogda olması gereken zorunlu alanları kontrol et
    const requiredFields = ['title', 'excerpt', 'content', 'author_id', 'publishDate', 'category'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          message: `Blog için gerekli alan eksik: ${field}`, 
          success: false 
        }, { status: 400 });
      }
    }
    
    // Slug'un benzersiz olup olmadığını kontrol et
    const existingBlog = await Blog.findOne({ slug: data.slug });
    if (existingBlog) {
      return NextResponse.json({ 
        message: 'Bu slug ile bir blog zaten mevcut. Benzersiz bir başlık kullanın.', 
        success: false 
      }, { status: 400 });
    }
    
    // Şimdi ve createdAt ve updatedAt ekle
    const now = new Date();
    // data.createdAt = now; // Mongoose timestamps:true bunu otomatik yapar
    // data.updatedAt = now;
    
    // Yeni blog oluştururken author alanına author_id atanacak
    const blogDataForModel: any = { ...data };
    if (data.author_id) {
      blogDataForModel.author = data.author_id; // Şemadaki 'author' alanına ata
      delete blogDataForModel.author_id; // Orijinal author_id anahtarını kaldır
    }

    const newBlog = new Blog(blogDataForModel);
    await newBlog.save();
    
    // Yazarın articles dizisine blog slug'ını ekle
    // data.author nesnesi yerine data.author_id kullanılacak
    if (data.author_id) { // author_id varsa devam et
      try {
        const testDb = mongoose.connection.useDb('test'); // 'test' veritabanı adı doğru mu kontrol edilmeli
        
        // Yazarı ID'sine göre bul
        const author = await testDb.collection('authors').findOne({ _id: new Types.ObjectId(data.author_id) });
        
        if (author) {
          const articles = author.articles || [];
          if (!articles.includes(data.slug)) {
            await testDb.collection('authors').updateOne(
              { _id: author._id },
              { 
                $push: { articles: data.slug },
                $set: { updatedAt: new Date() } // updatedAt timestamp'ini güncelle
              }
            );
          }
        } else {
          
          // Bu durumda yeni yazar oluşturmak yerine hata loglamak daha doğru olabilir,
          // çünkü yazarın formda seçilmesi beklenir.
        }
      } catch (authorError) {
        // Yazar güncellemesi başarısız olsa bile, blog oluşturma işlemi başarılı olduğu için
        // sadece hatayı günlüğe kaydediyoruz, ancak genel olarak başarılı bir yanıt dönüyoruz
        console.error('Yazar bilgisi güncellenirken hata oluştu:', authorError);
      }
    }
    
    return NextResponse.json({ 
      blog: newBlog,
      message: 'Blog başarıyla oluşturuldu',
      success: true 
    });
  } catch (error) {
    console.error('Blog ekleme hatası:', error);
    return NextResponse.json({ 
      message: 'Blog eklenirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}