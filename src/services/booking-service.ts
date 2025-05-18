'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { revalidatePath } from 'next/cache';
import { serializeMongoData } from '@/lib/utils';

// Mongoose nesnelerini düz JSON'a dönüştüren ve veriyi normalize eden yardımcı fonksiyon
function normalizeBookingData(booking: any) {
  if (!booking) return null;

  // Yeni genel serileştirme fonksiyonunu kullan - buffer sorununu çözer
  const serializedBooking = serializeMongoData(booking);
  
  // İsteğe bağlı alanlar için varsayılan değerler ekle
  return {
    ...serializedBooking,
    refNumber: serializedBooking.refNumber || 'unknown',
    name: serializedBooking.name || 'Bilinmeyen Müşteri',
    email: serializedBooking.email || '',
    phone: serializedBooking.phone || '',
    venue: serializedBooking.venue || 'Bilinmeyen Alan',
    people: typeof serializedBooking.people === 'number' ? serializedBooking.people : 1,
    status: serializedBooking.status || 'CONFIRMED',
    totalPrice: typeof serializedBooking.totalPrice === 'number' ? serializedBooking.totalPrice : 0,
    notes: serializedBooking.notes || '',
    paymentId: serializedBooking.paymentId || ''
  };
}

/**
 * Tüm rezervasyonları getir
 * Bugünden geleceğe ve geçmişten bugüne sıralı olacak şekilde
 */
export async function getAllBookings() {
  try {
    await connectToDatabase();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Gelecekteki rezervasyonları al (bugünden itibaren)
    const futureBookings = await Booking.find({
      startTime: { $gte: today }
    }).sort({ startTime: 1 }); // Tarih sırasına göre artan
    
    // Geçmişteki rezervasyonları al (bugünden önce)
    const pastBookings = await Booking.find({
      startTime: { $lt: today }
    }).sort({ startTime: -1 }); // Tarih sırasına göre azalan
    
    // İki listeyi birleştir: Önce gelecekteki rezervasyonlar, sonra geçmiştekiler
    const bookings = [...futureBookings, ...pastBookings];
    
    // Verileri normalize ediyoruz
    const normalizedBookings = bookings.map(booking => normalizeBookingData(booking));
    
    return { success: true, data: normalizedBookings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rezervasyonlar alınırken bir hata oluştu'
    };
  }
}

/**
 * Referans numarasına göre rezervasyon getir
 * @param refNumber Rezervasyon referans numarası
 */
export async function getBookingByRefNumber(refNumber: string) {
  try {
    await connectToDatabase();
    const booking = await Booking.findOne({ refNumber });
    
    if (!booking) {
      return { success: false, error: 'Rezervasyon bulunamadı' };
    }
    
    // Veriyi normalize ediyoruz
    const normalizedBooking = normalizeBookingData(booking);
    
    return { success: true, data: normalizedBooking };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bir hata oluştu'
    };
  }
}

/**
 * Belirli bir alandaki rezervasyonları getir
 * @param venue Alan adı
 */
export async function getBookingsByVenue(venue: string) {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({ venue });
    
    // Verileri normalize ediyoruz
    const normalizedBookings = bookings.map(booking => normalizeBookingData(booking));
    
    return { success: true, data: normalizedBookings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bir hata oluştu'
    };
  }
}

/**
 * Rezervasyon sil
 * @param refNumber Silinecek rezervasyonun referans numarası
 */
export async function deleteBooking(refNumber: string) {
  try {
    await connectToDatabase();
    await Booking.deleteOne({ refNumber });
    
    revalidatePath('/admin/reservations/books');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bir hata oluştu'
    };
  }
}

/**
 * Rezervasyon istatistiklerini al
 */
export async function getBookingsStats() {
  try {
    await connectToDatabase();
    
    const totalBookings = await Booking.countDocuments({});
    
    // Toplam geliri ve toplam kişi sayısını hesapla
    let totalRevenue = 0;
    let totalPeople = 0;
    
    const allBookings = await Booking.find({});
    
    // Toplam gelir
    totalRevenue = allBookings.reduce((sum, booking) => {
      const price = typeof booking.totalPrice === 'number' ? booking.totalPrice : 0;
      return sum + price;
    }, 0);
    
    // Toplam kişi sayısı
    totalPeople = allBookings.reduce((sum, booking) => {
      const people = typeof booking.people === 'number' ? booking.people : 0;
      return sum + people;
    }, 0);
    
    const stats = {
      totalBookings,
      totalRevenue,
      totalPeople,
    };
    
    return { success: true, data: stats };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İstatistikler alınırken bir hata oluştu'
    };
  }
}