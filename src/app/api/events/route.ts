import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import { getEventStatus } from '@/types';

// Cache kontrollerini ayarla - önbelleğe almayı engelle
export const dynamic = 'force-dynamic'; // Statik önbelleğe almayı devre dışı bırak
export const revalidate = 0; // Her istekte yeniden doğrulama yap

export async function GET() {
  try {
    await connectToDatabase();
    
    // Tüm etkinlikleri getir
    const events = await Event.find({});
    
    // Etkinlik durumlarını hesapla
    const eventsWithStatus = events.map(event => {
      const status = getEventStatus(event.date);
      return { ...event.toObject(), status };
    });
    
    return NextResponse.json({
      events: eventsWithStatus,
      success: true
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Etkinlik verilerini getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Etkinlikler getirilirken bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}

// Yeni etkinlik oluşturmak için POST metodu
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    // İstek gövdesini JSON olarak parse et
    const eventData = await request.json();
    
    // Tarih ve ID kontrolü
    if (!eventData.date) {
      eventData.date = new Date().toISOString();
    }
    
    // ID kontrolü - eğer yoksa oluştur
    if (!eventData.id) {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear()).slice(2);
      const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      
      eventData.id = `${day}${month}${year}${randomNum}`;
    }

    // MongoDB'ye kaydet
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu',
      event: newEvent
    }, { status: 201 });
  } catch (error: any) {
    console.error('Etkinlik oluşturma hatası:', error);
    
    // Hata detaylarını döndür
    return NextResponse.json({
      success: false,
      message: 'Etkinlik oluşturulurken bir hata oluştu',
      error: error.message
    }, { status: 500 });
  }
}

// Etkinlik güncellemek için PUT metodu
export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    // İstek gövdesini JSON olarak parse et
    const eventData = await request.json();
    
    // ID kontrolü
    if (!eventData.id) {
      return NextResponse.json({
        success: false,
        message: 'Etkinlik ID\'si gerekli'
      }, { status: 400 });
    }

    // MongoDB'de güncelle
    const updatedEvent = await Event.findOneAndUpdate(
      { id: eventData.id }, 
      eventData, 
      { new: true } // güncellenmiş belgeyi döndür
    );
    
    if (!updatedEvent) {
      return NextResponse.json({
        success: false,
        message: 'Etkinlik bulunamadı'
      }, { status: 404 });
    }

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