import { connectToDatabase } from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Veritabanı bağlantısı
    await connectToDatabase();
    
    // Date ve time string'lerini DateTime objelerine dönüştür
    const startDateTime = new Date(`${data.date}T${data.startTime}`);
    const endDateTime = new Date(`${data.date}T${data.endTime}`);
    
    // Check if a booking with this reference number already exists
    const existingBooking = await Booking.findOne({ refNumber: data.refNumber });
    
    if (existingBooking) {
      return NextResponse.json({ 
        success: true, 
        message: 'Booking already exists' 
      });
    }
    
    // Anonim email oluştur
    const anonymousEmail = `${data.phone.replace(/\D/g, '')}@anonymous.user`;
    
    // Rezervasyon kaydını oluştur - ücretsiz etkinlikler için fiyat 0
    const booking = new Booking({
      refNumber: data.refNumber,
      name: data.name,
      email: anonymousEmail,
      phone: data.phone,
      venue: data.venue,
      startTime: startDateTime,
      endTime: endDateTime,
      people: Number(data.people),
      totalPrice: 0,
      status: 'CONFIRMED',
      notes: `Free Venue: ${data.venue}`,
      paymentId: `FREE-${Math.random().toString(36).substring(2, 15)}`
    });
    
    // Veriyi MongoDB'ye kaydet
    await booking.save();
    
    console.log('Free booking saved successfully via API!');
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Error creating booking via API:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create booking' 
    }, { status: 500 });
  }
}