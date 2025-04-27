import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

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
    const requiredFields = ['title', 'excerpt', 'content', 'author', 'publishDate', 'category'];
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
    data.createdAt = now;
    data.updatedAt = now;
    
    // Yeni blog oluştur
    const newBlog = new Blog(data);
    await newBlog.save();
    
    // Yazarın articles dizisine blog slug'ını ekle
    if (data.author && data.author.name) {
      try {
        // MongoDB bağlantısı üzerinden test veritabanına eriş
        // Önceden db = mongoose.connection.db kullanılıyordu, test veritabanını açıkça belirt
        const testDb = mongoose.connection.useDb('test');
        
        // Yazarı adına göre bul (büyük/küçük harf duyarlılığını azaltmak için regex kullanıyoruz)
        const authorName = data.author.name.trim();
        const authorRegex = new RegExp(`^${authorName}$`, 'i');
        const author = await testDb.collection('authors').findOne({ name: authorRegex });
        
        if (author) {
          // Yazarın articles dizisine slug'ı ekle (eğer yoksa)
          const articles = author.articles || [];
          
          if (!articles.includes(data.slug)) {
            await testDb.collection('authors').updateOne(
              { _id: author._id },
              { 
                $push: { articles: data.slug },
                $set: { updatedAt: now }
              }
            );
            console.log(`Blog slug'ı "${data.slug}" yazarın (${author.name}) articles dizisine eklendi. (test veritabanı)`);
          }
        } else {
          console.log(`Yazar bulunamadı: ${authorName}`);
          // Yeni yazar oluştur (test veritabanında)
          const newAuthor = {
            name: authorName,
            profileImage: data.author.avatar || '/images/avatar.webp',
            articles: [data.slug],
            createdAt: now,
            updatedAt: now
          };
          await testDb.collection('authors').insertOne(newAuthor);
          console.log(`Yeni yazar oluşturuldu ve blog slug'ı "${data.slug}" yazarın articles dizisine eklendi. (test veritabanı)`);
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