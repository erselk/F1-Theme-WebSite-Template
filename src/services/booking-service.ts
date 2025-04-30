'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { revalidatePath } from 'next/cache';

// Mongoose nesnelerini düz JSON'a dönüştüren ve veriyi normalize eden yardımcı fonksiyon
function normalizeBookingData(booking: any) {
  if (!booking) return null;

  // MongoDB ObjectId'leri ile ilgili sorunları önlemek için düz objeye çeviriyoruz
  // MongoDB ObjectId'yi doğrudan string olarak çeviriyoruz
  const rawBooking = booking.toObject ? booking.toObject({ getters: true }) : booking;
  
  // _id alanını doğrudan string'e çeviriyoruz
  const normalizedBooking = {
    ...rawBooking,
    _id: rawBooking._id ? rawBooking._id.toString() : null,
  };
  
  // Tutarı numeric olduğundan emin olalım
  const totalPrice = typeof normalizedBooking.totalPrice === 'number' ? normalizedBooking.totalPrice : 0;
  
  // İsteğe bağlı alanlar için varsayılan değerler
  const result = {
    ...normalizedBooking,
    refNumber: normalizedBooking.refNumber || 'unknown',
    name: normalizedBooking.name || 'Bilinmeyen Müşteri',
    email: normalizedBooking.email || '',
    phone: normalizedBooking.phone || '',
    venue: normalizedBooking.venue || 'Bilinmeyen Alan',
    startTime: normalizedBooking.startTime || new Date(),
    endTime: normalizedBooking.endTime || new Date(),
    people: typeof normalizedBooking.people === 'number' ? normalizedBooking.people : 1,
    status: normalizedBooking.status || 'CONFIRMED',
    totalPrice: totalPrice,
    notes: normalizedBooking.notes || '',
    paymentId: normalizedBooking.paymentId || '',
    createdAt: normalizedBooking.createdAt || new Date(),
    updatedAt: normalizedBooking.updatedAt || new Date()
  };

  return result;
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
    console.error('Error fetching bookings:', error);
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
    console.error(`Error fetching booking ${refNumber}:`, error);
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
    console.error(`Error fetching bookings for venue ${venue}:`, error);
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
    console.error(`Error deleting booking ${refNumber}:`, error);
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
    console.error('Error fetching booking statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İstatistikler alınırken bir hata oluştu'
    };
  }
}