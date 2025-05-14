import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import EventModel from '@/models/Event';
import { getEventStatus } from '@/types';
import { getEventBySlug } from '@/services/mongo-service';

// Cache kontrollerini ayarla - önbelleğe almayı engelle
export const dynamic = 'force-dynamic'; // Statik önbelleğe almayı devre dışı bırak
export const revalidate = 0; // Her istekte yeniden doğrulama yap

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Doğrudan MongoDB'den en güncel veriyi alıyoruz
    const slug = params.slug;
    const event = await getEventBySlug(slug, { cache: 'no-store' });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Etkinlik bulunamadı' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('API etkinlik getirme hatası:', error);
    return NextResponse.json(
      { error: 'Etkinlik verisi getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Etkinlik güncelleme için PUT metodu
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json({ 
        message: 'Etkinlik slug parametresi eksik', 
        success: false 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    // İstek gövdesini JSON olarak parse et
    const eventData = await request.json();
    
    // Slug değişikliğini engelle
    eventData.slug = slug;
    
    // MongoDB'de etkinliği kontrol et
    const existingEvent = await EventModel.findOne({ slug });
    
    if (!existingEvent) {
      return NextResponse.json({ 
        message: 'Güncellenecek etkinlik bulunamadı', 
        success: false 
      }, { status: 404 });
    }

    // Etkinliği güncelle (yeni özellikler ekleyerek)
    const updatedEvent = await EventModel.findOneAndUpdate(
      { slug },
      { $set: eventData },
      { new: true, runValidators: true }
    );
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi',
      event: updatedEvent
    });
  } catch (error: any) {
    console.error('Etkinlik güncelleme hatası:', error);
    
    // Hata detaylarını döndür
    return NextResponse.json({
      success: false,
      message: 'Etkinlik güncellenirken bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
}

// Etkinlik silme için DELETE metodu
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    
    if (!slug) {
      return NextResponse.json({ 
        message: 'Etkinlik slug parametresi eksik', 
        success: false 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    // Etkinliği bul ve sil
    const result = await EventModel.findOneAndDelete({ slug });
    
    if (!result) {
      return NextResponse.json({ 
        message: 'Silinecek etkinlik bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla silindi'
    });
  } catch (error: any) {
    console.error('Etkinlik silme hatası:', error);
    
    // Hata detaylarını döndür
    return NextResponse.json({
      success: false,
      message: 'Etkinlik silinirken bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
}