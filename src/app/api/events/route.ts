import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import { getEventStatus } from '@/types';

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