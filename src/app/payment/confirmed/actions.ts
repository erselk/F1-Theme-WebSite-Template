'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db/mongodb';
import EventOrder from '@/models/EventOrder';
import Event from '@/models/Event';

export async function saveEventOrder(orderData: {
  orderId: string;
  eventId: string;
  eventSlug: string;
  eventName: {
    tr: string;
    en: string;
  };
  fullName: string;
  email: string;
  phone: string;
  tickets: any[];
  amount: number;
  timestamp: string;
}) {
  try {
    // MongoDB bağlantısı
    await connectToDatabase();
    
    console.log('Checking if event order exists with ID:', orderData.orderId);
    
    // Check if this order already exists in the database
    const existingOrder = await EventOrder.findOne({ orderId: orderData.orderId });
    
    if (existingOrder) {
      console.log('Order already exists, skipping save operation');
      // Still revalidate paths to ensure up-to-date data
      revalidatePath(`/events/${orderData.eventSlug}`);
      revalidatePath('/admin/reservations');
      revalidatePath(`/admin/reservations/events/${orderData.eventSlug}`);
      
      return { 
        success: true,
        message: 'Order already exists' 
      };
    }
    
    console.log('Creating event order with ID:', orderData.orderId);
    
    // EventOrder modeline uygun veri hazırlama
    const eventOrder = new EventOrder({
      orderId: orderData.orderId,
      eventId: orderData.eventId,
      eventSlug: orderData.eventSlug,
      eventName: orderData.eventName,
      customerInfo: {
        fullName: orderData.fullName,
        email: orderData.email,
        phone: orderData.phone || ''
      },
      tickets: orderData.tickets.map(ticket => ({
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.quantity
      })),
      totalAmount: orderData.amount,
      orderDate: new Date(orderData.timestamp)
    });
    
    // Veriyi MongoDB'ye kaydetme
    await eventOrder.save();
    
    console.log('Event order saved successfully!');
    
    // İlgili sayfaları yenileme
    revalidatePath(`/events/${orderData.eventSlug}`);
    revalidatePath('/admin/reservations');
    revalidatePath(`/admin/reservations/events/${orderData.eventSlug}`);
    
    return { success: true };
  } catch (error) {
    // Hata durumunda detaylı log kaydı
    console.error('MongoDB error saving event order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Eski fonksiyonu da tutuyoruz geçiş süreci için (sonradan kaldırılabilir)
export async function savePurchaseData(purchaseData: {
  eventId: string;
  eventSlug: string;
  orderId: string;
  fullName: string;
  email: string;
  phone: string;
  tickets: any[];
  amount: number;
  timestamp: string;
  eventTitle?: any;
}) {
  // Bu fonksiyon artık kullanılmıyor, yeni saveEventOrder fonksiyonu kullanılıyor
  console.log('savePurchaseData is deprecated, redirecting to saveEventOrder');
  
  return saveEventOrder({
    orderId: purchaseData.orderId,
    eventId: purchaseData.eventId,
    eventSlug: purchaseData.eventSlug,
    eventName: {
      tr: typeof purchaseData.eventTitle === 'object' ? 
        (purchaseData.eventTitle.tr || 'Etkinlik') : 'Etkinlik',
      en: typeof purchaseData.eventTitle === 'object' ? 
        (purchaseData.eventTitle.en || 'Event') : 'Event'
    },
    fullName: purchaseData.fullName,
    email: purchaseData.email,
    phone: purchaseData.phone,
    tickets: purchaseData.tickets,
    amount: purchaseData.amount,
    timestamp: purchaseData.timestamp
  });
}