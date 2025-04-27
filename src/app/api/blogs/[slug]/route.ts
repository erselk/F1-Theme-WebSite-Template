import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';

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

export async function PUT(
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
    
    // Önce blogun var olup olmadığını kontrol et
    const existingBlog = await Blog.findOne({ slug });
    
    if (!existingBlog) {
      return NextResponse.json({ 
        message: 'Güncellenecek blog bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    // Gönderilen güncellemeleri al
    const updates = await request.json();
    
    // Önceki yazar bilgisini sakla
    const previousAuthor = existingBlog.author ? existingBlog.author.name : null;
    const newAuthor = updates.author ? updates.author.name : null;
    const authorChanged = previousAuthor !== newAuthor && newAuthor;
    
    // Slug'un değiştirilmesine izin verme - tutarlılık için mevcut slug değerini koru
    updates.slug = slug;
    
    // updatedAt alanını güncelle
    const now = new Date();
    updates.updatedAt = now;
    
    // Blogu güncelle
    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    // Eğer yazar değiştiyse, eski yazardan slug'ı kaldır ve yeni yazara ekle
    if (authorChanged) {
      try {
        // MongoDB bağlantısı üzerinden test veritabanına eriş
        const testDb = mongoose.connection.useDb('test');
        
        // Eski yazardan blogu kaldır
        if (previousAuthor) {
          const oldAuthorRegex = new RegExp(`^${previousAuthor.trim()}$`, 'i');
          await testDb.collection('authors').updateOne(
            { name: oldAuthorRegex },
            { 
              $pull: { articles: slug },
              $set: { updatedAt: now }
            }
          );
          console.log(`Blog slug'ı "${slug}" eski yazardan (${previousAuthor}) kaldırıldı. (test veritabanı)`);
        }
        
        // Yeni yazara blogu ekle
        if (newAuthor) {
          const newAuthorName = newAuthor.trim();
          const newAuthorRegex = new RegExp(`^${newAuthorName}$`, 'i');
          const author = await testDb.collection('authors').findOne({ name: newAuthorRegex });
          
          if (author) {
            // Yazarın articles dizisine slug'ı ekle (eğer yoksa)
            const articles = author.articles || [];
            
            if (!articles.includes(slug)) {
              await testDb.collection('authors').updateOne(
                { _id: author._id },
                { 
                  $push: { articles: slug },
                  $set: { updatedAt: now }
                }
              );
              console.log(`Blog slug'ı "${slug}" yeni yazarın (${newAuthorName}) articles dizisine eklendi. (test veritabanı)`);
            }
          } else {
            // Yeni yazar yoksa, oluştur
            console.log(`Yeni yazar bulunamadı: ${newAuthorName}, oluşturuluyor... (test veritabanı)`);
            const newAuthorDoc = {
              name: newAuthorName,
              profileImage: updates.author.avatar || '/images/avatar.webp',
              articles: [slug],
              createdAt: now,
              updatedAt: now
            };
            await testDb.collection('authors').insertOne(newAuthorDoc);
            console.log(`Yeni yazar oluşturuldu ve blog slug'ı "${slug}" yazarın articles dizisine eklendi. (test veritabanı)`);
          }
        }
      } catch (authorError) {
        // Yazar güncellemesi başarısız olsa bile, blog güncelleme işlemi başarılı olduğu için
        // sadece hatayı günlüğe kaydediyoruz
        console.error('Yazar bilgisi güncellenirken hata oluştu:', authorError);
      }
    }
    
    return NextResponse.json({ 
      blog: updatedBlog,
      message: 'Blog başarıyla güncellendi',
      success: true 
    });
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    return NextResponse.json({ 
      message: 'Blog güncellenirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}

export async function DELETE(
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
    
    // Blogun var olup olmadığını kontrol et
    const existingBlog = await Blog.findOne({ slug });
    
    if (!existingBlog) {
      return NextResponse.json({ 
        message: 'Silinecek blog bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    // Yazarın articles dizisinden blog slug'ını kaldır
    try {
      if (existingBlog.author && existingBlog.author.name) {
        const authorName = existingBlog.author.name.trim();
        const db = mongoose.connection.db;
        
        // Yazarı adına göre bul 
        const authorRegex = new RegExp(`^${authorName}$`, 'i');
        
        // Yazarın articles dizisinden slug'ı kaldır
        const now = new Date();
        await db.collection('authors').updateOne(
          { name: authorRegex },
          { 
            $pull: { articles: slug },
            $set: { updatedAt: now }
          }
        );
        console.log(`Blog slug'ı "${slug}" yazarın (${authorName}) articles dizisinden kaldırıldı.`);
      }
    } catch (authorError) {
      // Yazar güncellemesi başarısız olsa bile, blog silme işlemi devam edecek
      console.error('Yazar bilgisi güncellenirken hata oluştu:', authorError);
    }
    
    // Blogu sil
    await Blog.deleteOne({ slug });
    
    return NextResponse.json({ 
      message: 'Blog başarıyla silindi',
      success: true 
    });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    return NextResponse.json({ 
      message: 'Blog silinirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}