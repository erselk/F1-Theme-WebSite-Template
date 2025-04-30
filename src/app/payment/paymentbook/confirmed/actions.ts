'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { revalidatePath } from 'next/cache';

export async function createFreeBookingRecord(bookingData: any) {
  try {
    // MongoDB bağlantısı
    await connectToDatabase();
    
    // Date ve time string'lerini DateTime objelerine dönüştür
    const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}`);
    
    // Check if a booking with this reference number already exists
    const existingBooking = await Booking.findOne({ refNumber: bookingData.refNumber });
    
    if (existingBooking) {
      console.log('Booking already exists, skipping save operation');
      return { 
        success: true,
        message: 'Booking already exists'
      };
    }
    
    // Anonim email oluştur
    const anonymousEmail = `${bookingData.phone.replace(/\D/g, '')}@anonymous.user`;
    
    // Rezervasyon kaydını oluştur - ücretsiz etkinlikler için fiyat 0
    const booking = new Booking({
      refNumber: bookingData.refNumber,
      name: bookingData.name,
      email: anonymousEmail,
      phone: bookingData.phone,
      venue: bookingData.venue,
      startTime: startDateTime,
      endTime: endDateTime,
      people: Number(bookingData.people),
      totalPrice: 0, // Ücretsiz etkinlikler için fiyat 0
      status: 'CONFIRMED',
      notes: `Venue: ${bookingData.venue}`,
      paymentId: `FREE-${Math.random().toString(36).substring(2, 15)}`
    });
    
    // Veriyi MongoDB'ye kaydet
    await booking.save();
    
    console.log('Free booking saved successfully!');
    
    // İlgili sayfaları yenile
    revalidatePath('/admin/reservations');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error creating free booking:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create booking'
    };
  }
}