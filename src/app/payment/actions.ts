'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/db/mongodb';
import EventOrder from '@/models/EventOrder';
import Event from '@/models/Event';
import Booking from '@/models/Booking';

export async function saveEventOrder(orderData: {
  orderId: string;
  eventId: string;
  eventSlug: string;
  eventName: {
    tr: string;
    en: string;
  };
  eventLocation?: {
    tr: string;
    en: string;
  };
  eventSchedule?: {
    tr: string[];
    en: string[];
  };
  eventDate: string;
  fullName: string;
  email: string;
  phone: string;
  tickets: any[];
  amount: number;
  timestamp: string;
}) {
  try {
    await connectToDatabase();
    const existingOrder = await EventOrder.findOne({ orderId: orderData.orderId });
    if (existingOrder) {
      revalidatePath(`/events/${orderData.eventSlug}`);
      revalidatePath('/admin/reservations');
      revalidatePath(`/admin/reservations/events/${orderData.eventSlug}`);
      return { success: true, message: 'Order already exists' };
    }
    const eventOrder = new EventOrder({
      orderId: orderData.orderId,
      eventId: orderData.eventId,
      eventSlug: orderData.eventSlug,
      eventName: orderData.eventName,
      eventLocation: orderData.eventLocation,
      eventSchedule: orderData.eventSchedule,
      eventDate: new Date(orderData.eventDate),
      customerInfo: {
        fullName: orderData.fullName,
        email: orderData.email,
        phone: orderData.phone || ''
      },
      tickets: orderData.tickets.map(ticket => ({
        id: ticket.id,
        name: (typeof ticket.name === 'object' && ticket.name.tr && ticket.name.en) 
              ? { tr: ticket.name.tr, en: ticket.name.en } 
              : { tr: String(ticket.name), en: String(ticket.name) },
        price: ticket.price,
        quantity: ticket.quantity
      })),
      totalAmount: orderData.amount,
      orderPlacementTime: new Date(orderData.timestamp)
    });
    await eventOrder.save();
    revalidatePath(`/events/${orderData.eventSlug}`);
    revalidatePath('/admin/reservations');
    revalidatePath(`/admin/reservations/events/${orderData.eventSlug}`);
    return { success: true };
  } catch (error) {
    console.error('MongoDB error saving event order:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

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
  console.log('savePurchaseData is deprecated, redirecting to saveEventOrder');
  return saveEventOrder({
    orderId: purchaseData.orderId,
    eventId: purchaseData.eventId,
    eventSlug: purchaseData.eventSlug,
    eventName: {
      tr: typeof purchaseData.eventTitle === 'object' ? (purchaseData.eventTitle.tr || 'Etkinlik') : 'Etkinlik',
      en: typeof purchaseData.eventTitle === 'object' ? (purchaseData.eventTitle.en || 'Event') : 'Event'
    },
    eventDate: purchaseData.timestamp,
    fullName: purchaseData.fullName,
    email: purchaseData.email,
    phone: purchaseData.phone,
    tickets: purchaseData.tickets,
    amount: purchaseData.amount,
    timestamp: purchaseData.timestamp
  });
}

export async function getEventOrderById(orderId: string) {
  try {
    await connectToDatabase();
    const order = await EventOrder.findOne({ orderId: orderId }).lean();
    if (!order) {
      return { success: false, error: 'Event order not found' };
    }
    const sanitizedOrder = JSON.parse(JSON.stringify(order));
    return { success: true, data: sanitizedOrder };
  } catch (error) {
    console.error('Error fetching event order by ID:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error fetching event order' };
  }
}

export async function createBookingRecord(bookingData: any) {
  try {
    await connectToDatabase();
    const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
    const endDateTime = new Date(`${bookingData.date}T${bookingData.endTime}`);
    const existingBooking = await Booking.findOne({ refNumber: bookingData.refNumber });
    if (existingBooking) {
      return { success: true, message: 'Booking already exists' };
    }
    const phoneDigits = typeof bookingData.phone === 'string' ? bookingData.phone.replace(/\D/g, '') : '';
    const anonymousEmail = `${phoneDigits || 'anonymous'}@anonymous.user`;

    const venueData = typeof bookingData.venue === 'object' && bookingData.venue.tr
      ? { tr: bookingData.venue.tr, en: bookingData.venue.en || bookingData.venue.tr } 
      : { tr: String(bookingData.venue || ''), en: String(bookingData.venue || '') };

    const booking = new Booking({
      refNumber: bookingData.refNumber,
      name: bookingData.name,
      email: anonymousEmail,
      phone: bookingData.phone,
      venue: venueData,
      startTime: startDateTime,
      endTime: endDateTime,
      people: Number(bookingData.people),
      totalPrice: Number(bookingData.totalPrice),
      status: 'CONFIRMED',
      notes: `Venue: ${venueData.tr}`,
      paymentId: `PAID-${Math.random().toString(36).substring(2, 15)}`
    });
    await booking.save();
    revalidatePath('/admin/reservations');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message || 'Failed to create booking' };
  }
}

export async function getBookingByRef(refNumber: string) {
  try {
    await connectToDatabase();
    const booking = await Booking.findOne({ refNumber: refNumber }).lean();
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    const sanitizedBooking = JSON.parse(JSON.stringify(booking));
    return { success: true, data: sanitizedBooking };
  } catch (error) {
    console.error('Error fetching booking by refNumber:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error fetching booking' };
  }
} 