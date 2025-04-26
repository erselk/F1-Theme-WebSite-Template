import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import { getEventStatus } from '@/types';

export async function GET() {
  try {
    console.log('API: /api/events çağrısı alındı');
    
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
    
    // Tüm etkinlikleri getir
    console.log('API: Etkinlik verileri sorgulanıyor...');
    const events = await Event.find({});
    console.log(`API: ${events.length} etkinlik girdisi bulundu`);
    
    // Etkinlik durumlarını hesapla
    const eventsWithStatus = events.map(event => {
      const status = getEventStatus(event.date);
      return { ...event.toObject(), status };
    });
    
    return NextResponse.json({
      events: eventsWithStatus,
      success: true
    });
  } catch (error) {
    console.error('Etkinlik verilerini getirme hatası:', error);
    return NextResponse.json({ 
      message: 'Etkinlikler getirilirken bir hata oluştu', 
      error: error instanceof Error ? error.message : String(error),
      success: false 
    }, { status: 500 });
  }
}