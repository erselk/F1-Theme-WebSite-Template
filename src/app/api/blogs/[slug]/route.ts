import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Blog from '@/models/Blog';
import mongoose, { Types } from 'mongoose';

// Cache kontrollerini ayarla - önbelleğe almayı engelle
export const dynamic = 'force-dynamic'; // Statik önbelleğe almayı devre dışı bırak
export const revalidate = 0; // Her istekte yeniden doğrulama yap

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
    
    // Blogu slug'a göre bul ve yazar bilgilerini populate et
    const blog = await Blog.findOne({ slug }).populate('author', 'name profileImage _id');
    
    if (!blog) {
      return NextResponse.json({ 
        message: 'Blog bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      blog,
      success: true 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
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
    
    const updates = await request.json();
    
    // Önceki yazar ID'sini ve yeni yazar ID'sini al
    const previousAuthorId = existingBlog.author ? existingBlog.author._id.toString() : null;
    const newAuthorId = updates.author_id ? updates.author_id.toString() : null;
    const authorChanged = previousAuthorId !== newAuthorId && newAuthorId;
    
    // Slug'un değiştirilmesine izin verme
    updates.slug = slug;
    
    // updatedAt alanını güncelle
    const now = new Date();
    updates.updatedAt = now;
    
    // Veritabanına gönderilecek güncellemeleri hazırla
    const updatesToApply: any = { ...updates };
    if (updates.author_id) {
      updatesToApply.author = updates.author_id;
      delete updatesToApply.author_id;
    } else if (updates.hasOwnProperty('author_id') && updates.author_id === null) {
      updatesToApply.author = null;
      delete updatesToApply.author_id;
    }
    
    const updatedBlog = await Blog.findOneAndUpdate(
      { slug },
      { $set: updatesToApply },
      { new: true, runValidators: true }
    ).populate('author', 'name profileImage _id');

    // Yazarın articles dizisini güncelle (eğer yazar değiştiyse)
    if (authorChanged) {
      const testDb = mongoose.connection.useDb('test');
      const updateTimestamp = new Date();

      // 1. Eski yazardan slug'ı kaldır (eğer varsa)
      if (previousAuthorId) {
        await testDb.collection('authors').updateOne(
          { _id: new Types.ObjectId(previousAuthorId) },
          {
            $pull: { articles: slug } as any,
            $set: { updatedAt: updateTimestamp }
          }
        );
        console.log(`Blog slug'ı "${slug}" eski yazarın (ID: ${previousAuthorId}) articles dizisinden kaldırıldı.`);
      }

      // 2. Yeni yazara slug'ı ekle (eğer varsa ve slug daha önce eklenmemişse)
      if (newAuthorId) {
        const newAuthorDoc = await testDb.collection('authors').findOne({ _id: new Types.ObjectId(newAuthorId) });
        if (newAuthorDoc && !(newAuthorDoc.articles || []).includes(slug)) {
          await testDb.collection('authors').updateOne(
            { _id: new Types.ObjectId(newAuthorId) },
            {
              $push: { articles: slug } as any,
              $set: { updatedAt: updateTimestamp }
            }
          );
          console.log(`Blog slug'ı "${slug}" yeni yazarın (ID: ${newAuthorId}) articles dizisine eklendi.`);
        }
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
      const authorId = existingBlog.author ? existingBlog.author.toString() : null;

      if (authorId) {
        const testDb = mongoose.connection.useDb('test');
        const updateTimestamp = new Date();
        
        await testDb.collection('authors').updateOne(
          { _id: new Types.ObjectId(authorId) }, 
          {
            $pull: { articles: slug } as any,
            $set: { updatedAt: updateTimestamp }
          }
        );
        console.log(`Blog slug'ı "${slug}" yazarın (ID: ${authorId}) articles dizisinden kaldırıldı.`);
      }
    } catch (authorError) {
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