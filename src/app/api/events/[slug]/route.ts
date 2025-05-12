import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import { getEventStatus } from '@/types';

// Cache kontrollerini ayarla - önbelleğe almayı engelle
export const dynamic = 'force-dynamic'; // Statik önbelleğe almayı devre dışı bırak
export const revalidate = 0; // Her istekte yeniden doğrulama yap

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Fix: Await params before using its properties
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ 
        message: 'Etkinlik slug parametresi eksik', 
        success: false 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    // Slug'a göre etkinlik getir
    const event = await Event.findOne({ slug });
    
    if (!event) {
      return NextResponse.json({ 
        message: 'Etkinlik bulunamadı', 
        success: false 
      }, { status: 404 });
    }
    
    // Etkinlik durumunu hesapla
    const status = getEventStatus(event.date);
    
    // Etkinlik nesnesini ve ek bilgileri normalize et
    const eventWithStatus = { 
      ...event.toObject(), 
      status,
      id: event._id.toString(), // MongoDB _id'yi string id'ye çevir
      tickets: event.tickets || [], // Eğer tickets yoksa boş dizi kullan
      gallery: event.gallery || [], // Eğer gallery yoksa boş dizi kullan
    };
    
    return NextResponse.json({ 
      event: eventWithStatus,
      success: true 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Etkinlik verisi getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Etkinlik getirilirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}

// Etkinlik güncelleme için PUT metodu
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // Fix: Await params before using its properties
    const { slug } = await params;
    
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
    const existingEvent = await Event.findOne({ slug });
    
    if (!existingEvent) {
      return NextResponse.json({ 
        message: 'Güncellenecek etkinlik bulunamadı', 
        success: false 
      }, { status: 404 });
    }

    // Etkinliği güncelle (yeni özellikler ekleyerek)
    const updatedEvent = await Event.findOneAndUpdate(
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
    // Fix: Await params before using its properties
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ 
        message: 'Etkinlik slug parametresi eksik', 
        success: false 
      }, { status: 400 });
    }

    await connectToDatabase();
    
    // Etkinliği bul ve sil
    const result = await Event.findOneAndDelete({ slug });
    
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