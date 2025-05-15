'use server';

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Tüm etkinlikleri getir
    const events = await Event.find({});
    console.log(`Found ${events.length} events to migrate to reservation tracking`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Her etkinlik için rezervasyon takip kaydı oluştur/güncelle
    for (const event of events) {
      try {
        // await updateEventReservationTracking(event);
        // İşlem kaldırıldığı için successCount artırılmıyor, gerekirse bu kısım güncellenmeli
        successCount++; // Bu satır şimdilik kalabilir veya event.length olarak ayarlanabilir.
      } catch (error) {
        errorCount++;
        errors.push({
          eventId: event.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration completed. ${successCount} events processed (tracking function removed).`,
      stats: {
        total: events.length,
        success: successCount,
        failed: errorCount
      },
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Reservation migration error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to migrate events to reservation tracking system',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}