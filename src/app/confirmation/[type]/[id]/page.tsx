import { getEventOrderById } from '@/app/payment/actions';
import { getBookingByRef } from '@/app/payment/actions';
import ConfirmationDisplay from '@/components/features/confirmation/ConfirmationDisplay';
import { notFound } from 'next/navigation';

interface ConfirmationPageProps {
  params: {
    type: string; // 'event' or 'booking'
    id: string;    // orderId or refNumber
  };
}

export default async function DynamicConfirmationPage({ params }: ConfirmationPageProps) {
  const { type, id } = params;
  let result;
  // const locale = 'tr'; // locale bilgisi ConfirmationDisplay içinde yönetilecek

  if (type === 'event') {
    result = await getEventOrderById(id);
  } else if (type === 'booking') {
    result = await getBookingByRef(id);
  } else {
    return notFound();
  }

  if (!result || !result.success || !result.data) {
    return <ConfirmationDisplay error={`Onay bilgileri bulunamadı (Tip: ${type}, ID: ${id}). ${result?.error || ''}`} />;
  }

  let displayData: any;

  if (type === 'event') {
    const order = result.data;
    displayData = {
      type: 'event',
      orderId: order.orderId,
      eventSlug: order.eventSlug,
      eventName: order.eventName, // Doğrudan {tr, en} objesi
      eventDate: order.eventDate,
      eventLocation: order.eventLocation, // Doğrudan {tr, en} objesi veya undefined
      eventSchedule: order.eventSchedule, // YENİ ALAN
      fullName: order.customerInfo.fullName,
      email: order.customerInfo.email,
      phone: order.customerInfo.phone,
      tickets: order.tickets, // Biletlerin name alanı da {tr,en} ise bu da ona göre işlenmeli
      amount: order.totalAmount,
      timestamp: order.eventDate,
    };
  } else { // type === 'booking'
    const booking = result.data;
    // venue bilgisi artık doğrudan {tr, en} objesi olarak modelden geliyor varsayıyoruz.
    displayData = {
      type: 'booking',
      orderId: booking.refNumber,
      amount: booking.totalPrice,
      timestamp: booking.createdAt || booking.startTime,
      bookingDetails: {
        venueName: booking.venue, // Doğrudan {tr, en} objesi (Booking modeline göre)
        customerName: booking.name,
        contactPhone: booking.phone,
        reservationDate: booking.startTime,
        // reservationTime ConfirmationDisplay içinde locale'e göre formatlanabilir veya burada {tr,en} formatında hazırlanabilir.
        // Şimdilik ConfirmationDisplay'e bırakalım.
        reservationTimeRaw: { startTime: booking.startTime, endTime: booking.endTime }, // Ham saatler
        numberOfPeople: booking.people,
        totalAmount: booking.totalPrice,
        rawFormData: { // Bu kısım PDF/ICS için gerekebilir, ConfirmationDisplay'de işlenir.
          dateRaw: new Date(booking.startTime).toISOString().split('T')[0],
          startTime: new Date(booking.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), // Geçici, ConfirmationDisplay'de yönetilmeli
          endTime: new Date(booking.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), // Geçici, ConfirmationDisplay'de yönetilmeli
          venue: booking.venue, // Doğrudan {tr, en} objesi
        }
      }
    };
  }

  return <ConfirmationDisplay paymentResultData={displayData} />;
} 