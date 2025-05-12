'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import EventOrder from '@/models/EventOrder';
import { revalidatePath } from 'next/cache';
import { serializeMongoData } from '@/lib/utils';

// Mongoose nesnelerini düz JSON'a dönüştüren ve veriyi normalize eden yardımcı fonksiyon
function normalizeOrderData(order: any): any {
  if (!order) return null;
  
  // Eğer dizi ise dizi elemanlarını ayrı ayrı normalize et
  if (Array.isArray(order)) {
    return order.map(item => normalizeOrderData(item));
  }

  // Utils'deki serileştirme fonksiyonunu kullanarak buffer sorununu çöz
  const serializedOrder = serializeMongoData(order);
  
  // Biletlerin dönüşümü için güvenli işlem
  const tickets = Array.isArray(serializedOrder.tickets) ? serializedOrder.tickets.map((ticket: any) => ({
    id: ticket.id || 'unknown-ticket',
    name: ticket.name || 'Unknown Ticket',
    price: typeof ticket.price === 'number' ? ticket.price : 0,
    quantity: typeof ticket.quantity === 'number' ? ticket.quantity : 0
  })) : [];

  // Biletlerin gerçek toplam değerini hesapla
  const calculatedTotalAmount = tickets.reduce((total: number, ticket: any) => {
    return total + (ticket.price * ticket.quantity);
  }, 0);
  
  // Eksik alanlar için varsayılan değerler ile tamamla
  return {
    ...serializedOrder,
    orderId: serializedOrder.orderId || 'unknown',
    eventSlug: serializedOrder.eventSlug || 'unknown-event',
    eventName: typeof serializedOrder.eventName === 'object' ? serializedOrder.eventName : { tr: 'Bilinmeyen Etkinlik', en: 'Unknown Event' },
    customerInfo: serializedOrder.customerInfo || { fullName: 'Unknown', email: 'unknown@example.com', phone: '' },
    tickets: tickets,
    totalAmount: calculatedTotalAmount,
    orderDate: serializedOrder.orderDate || new Date().toISOString()
  };
}

/**
 * Get all event orders
 */
export async function getAllEventOrders() {
  try {
    await connectToDatabase();
    const orders = await EventOrder.find({}).sort({ orderDate: -1 });
    
    // Verileri normalize ediyoruz
    const normalizedOrders = orders.map(order => normalizeOrderData(order));
    
    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error('Error fetching event orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get orders for a specific event
 * @param eventSlug The slug of the event
 */
export async function getEventOrdersBySlug(eventSlug: string) {
  try {
    await connectToDatabase();
    const orders = await EventOrder.find({ eventSlug }).sort({ orderDate: -1 });
    
    // Verileri normalize ediyoruz
    const normalizedOrders = orders.map(order => normalizeOrderData(order));
    
    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error(`Error fetching orders for event ${eventSlug}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get order by ID
 * @param orderId The ID of the order
 */
export async function getEventOrderById(orderId: string) {
  try {
    await connectToDatabase();
    const order = await EventOrder.findOne({ orderId });
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    // Veriyi normalize ediyoruz
    const normalizedOrder = normalizeOrderData(order);
    
    return { success: true, data: normalizedOrder };
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Delete an event order
 * @param orderId The ID of the order to delete
 */
export async function deleteEventOrder(orderId: string) {
  try {
    await connectToDatabase();
    await EventOrder.deleteOne({ orderId });
    
    revalidatePath('/admin/reservations/events');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get event orders statistics
 */
export async function getEventOrdersStats() {
  try {
    await connectToDatabase();
    
    const totalOrders = await EventOrder.countDocuments({});
    
    // Güvenli bir şekilde toplam geliri ve bilet sayısını hesaplayalım
    let totalRevenue = 0;
    let totalTickets = 0;
    
    // Tüm siparişleri alıp manuel hesaplama yapalım
    const allOrders = await EventOrder.find({});
    
    // Bilet bazlı gerçek toplam geliri hesaplama
    totalRevenue = allOrders.reduce((sum, order) => {
      if (!order.tickets || !Array.isArray(order.tickets)) return sum;
      
      // Her siparişin gerçek tutarını bilet fiyatı x adedine göre hesapla
      const orderTotal = order.tickets.reduce((ticketSum: number, ticket: any) => {
        const price = typeof ticket.price === 'number' ? ticket.price : 0;
        const quantity = typeof ticket.quantity === 'number' ? ticket.quantity : 0;
        return ticketSum + (price * quantity);
      }, 0);
      
      return sum + orderTotal;
    }, 0);
    
    // Toplam bilet sayısını hesapla
    totalTickets = allOrders.reduce((sum, order) => {
      if (!order.tickets || !Array.isArray(order.tickets)) return sum;
      return sum + order.tickets.reduce((ticketSum: number, ticket: any) => {
        return ticketSum + (typeof ticket.quantity === 'number' ? ticket.quantity : 0);
      }, 0);
    }, 0);
    
    const stats = {
      totalOrders,
      totalRevenue,
      totalTickets,
    };
    
    return { success: true, data: stats };
  } catch (error) {
    console.error('Error fetching event orders statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}