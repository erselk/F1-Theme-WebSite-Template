'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { createBookingRecord, saveEventOrder } from './actions'; // Varsayılan olarak ./actions, src/app/payment/actions.ts dosyasını işaret eder

// Loading component
function PaymentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-t-electric-blue border-r-electric-blue border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Yükleniyor / Loading...</p>
      </div>
    </div>
  );
}

// Main component content
function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: locale, isDark } = useThemeLanguage();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format date and time consistently
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) { return dateString; }
  };
  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    // Assuming timeString is already HH:mm or can be parsed by Date for toLocaleTimeString
    try {
       // If it's a full ISO string, parse it, otherwise assume it's a time string that Date can handle for time part.
       if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
       } else {
        // If only HH:mm, Date parsing might be tricky directly for toLocaleTimeString. 
        // For HH:mm, just return as is.
        return timeString; 
       }
    } catch (e) { return timeString; }
  };

  useEffect(() => {
    const storedPaymentDataString = localStorage.getItem('pendingPayment');
    if (storedPaymentDataString) {
      try {
        const storedPayment = JSON.parse(storedPaymentDataString);
        const now = Date.now();
        const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

        if (storedPayment.timestamp && (now - storedPayment.timestamp > FIVE_MINUTES_IN_MS)) {
          localStorage.removeItem('pendingPayment');
          setError(locale === 'tr' ? 'Ödeme oturumunuzun süresi doldu. Lütfen işleme baştan başlayın.' : 'Your payment session has expired. Please start over.');
          setPaymentData(null);
          // İsteğe bağlı: Kullanıcıyı ana sayfaya veya önceki adıma yönlendir
          // setTimeout(() => router.push('/'), 3000); // Örn: 3 saniye sonra ana sayfaya
          return;
        }

        setPaymentData(storedPayment);
        if (storedPayment.type === 'booking' && storedPayment.bookingDetails) {
          setIsBooking(true);
        } else {
          setIsBooking(false);
        }
      } catch (err) {
        console.error('Error processing payment data from localStorage:', err);
        setError(locale === 'tr' ? 'Ödeme verileri okunurken bir hata oluştu.' : 'Error reading payment data.');
        localStorage.removeItem('pendingPayment'); // Hatalı veriyi temizle
        setPaymentData(null);
      }
    } else {
      setError(locale === 'tr' ? 'Bekleyen bir ödeme bulunamadı. Lütfen işleme baştan başlayın.' : 'No pending payment found. Please start the process again.');
      // İsteğe bağlı: Kullanıcıyı ana sayfaya veya önceki adıma yönlendir
      // setTimeout(() => router.push('/'), 3000);
    }
  }, [locale, router]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError(null);
    
    if (isBooking && paymentData?.bookingDetails) {
      try {
        const bookingPayload = {
          refNumber: paymentData.orderId,
          name: paymentData.customerName, 
          phone: paymentData.customerPhone, 
          date: paymentData.bookingDetails.date, 
          startTime: paymentData.bookingDetails.startTime, 
          endTime: paymentData.bookingDetails.endTime, 
          people: parseInt(paymentData.bookingDetails.numberOfPeople, 10) || 1,
          totalPrice: paymentData.totalAmount, 
          venue: paymentData.bookingDetails.venueName, // venueId yerine venueName objesini kullan
        };

        const response = await createBookingRecord(bookingPayload);

        if (response.success) {
          localStorage.setItem('paymentResult', JSON.stringify({
            status: 'success',
            orderId: paymentData.orderId,
            type: 'booking',
            timestamp: Date.now(),
            amount: paymentData.totalAmount,
            bookingDetails: paymentData.bookingDetails
          }));
          router.push(`/confirmation/booking/${paymentData.orderId}`);
        } else {
          setError(response.error || (locale === 'tr' ? 'Rezervasyon oluşturulurken bir hata oluştu.' : 'Error creating booking.'));
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Booking creation error:', err);
        setError(err.message || (locale === 'tr' ? 'Rezervasyon sırasında beklenmedik bir hata.' : 'Unexpected error during booking.'));
        setLoading(false);
      }
    } else if (paymentData && paymentData.type === 'event') {
      try {
        const orderPayload = {
          orderId: paymentData.orderId,
          eventId: paymentData.eventId,
          eventSlug: paymentData.eventSlug,
          eventName: paymentData.eventTitle, 
          eventLocation: paymentData.eventLocation, 
          eventDate: paymentData.eventDate, // Etkinliğin kendi tarihi ve saati
          fullName: paymentData.fullName,
          email: paymentData.email,
          phone: paymentData.phone,
          tickets: paymentData.tickets,
          amount: paymentData.amount, 
          timestamp: new Date(paymentData.timestamp).toISOString(), // Siparişin oluşturulma zamanı
        };

        const response = await saveEventOrder(orderPayload);

        if (response.success) {
          localStorage.setItem('paymentResult', JSON.stringify({
            ...paymentData,
            status: 'success',
            timestamp: Date.now(),
          }));
          router.push(`/confirmation/event/${paymentData.orderId}`);
        } else {
          setError(response.error || (locale === 'tr' ? 'Etkinlik siparişi oluşturulurken bir hata oluştu.' : 'Error creating event order.'));
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Event order creation error:', err);
        setError(err.message || (locale === 'tr' ? 'Etkinlik siparişi sırasında beklenmedik bir hata.' : 'Unexpected error during event order.'));
        setLoading(false);
      }
    } else {
      console.error('Payment data is missing or type is not defined', paymentData);
      setError(locale === 'tr' ? 'Ödeme verileri eksik veya geçersiz.' : 'Payment data is missing or invalid.');
      setLoading(false);
    }
  };

  const handleRejectPayment = () => {
    setLoading(true);
    
    if (isBooking) {
      localStorage.setItem('paymentResult', JSON.stringify({
        status: 'rejected',
        type: 'booking',
        orderId: paymentData?.orderId,
        reason: locale === 'tr' ? 'Kullanıcı tarafından reddedildi (Rezervasyon)' : 'Rejected by user (Booking)',
        timestamp: Date.now()
      }));
      if (paymentData && paymentData.bookingDetails && paymentData.bookingDetails.rawFormData && paymentData.bookingDetails.rawFormData.venue) {
        const venueSlug = paymentData.bookingDetails.rawFormData.venue;
        router.push(`/book?venue=${venueSlug}&step=confirmation`);
      } else {
        router.push('/book');
      }
    } else {
      localStorage.setItem('paymentResult', JSON.stringify({
        status: 'rejected',
        type: 'event',
        orderId: paymentData?.orderId,
        reason: locale === 'tr' ? 'Kullanıcı tarafından reddedildi (Etkinlik)' : 'Rejected by user (Event)',
        timestamp: Date.now()
      }));
      
      if (paymentData && paymentData.returnUrl) {
        try {
          const url = new URL(paymentData.returnUrl);
          const pathParts = url.pathname.split('/');
          const eventSlug = pathParts[pathParts.length - 1];
          router.push(`/events/${eventSlug}`);
        } catch (error) {
          console.error('Error parsing return URL for event:', error);
          router.push('/events');
        }
      } else {
        router.push('/events');
      }
    }
  };

  const bgClass = isDark ? 'bg-graphite' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full ${cardBgClass} rounded-lg shadow-lg border ${borderClass} p-6`}>
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold ${textClass} mb-2`}>
            {isBooking 
              ? (locale === 'tr' ? 'Rezervasyon Onayı' : 'Booking Confirmation')
              : (locale === 'tr' ? 'Ödeme Onayı' : 'Payment Confirmation')}
          </h1>
          <p className={`${secondaryTextClass} text-sm`}>
            {locale === 'tr' 
              ? 'Bu bir ödeme simülasyon ekranıdır. Gerçek bir ödeme işlemi gerçekleştirilmeyecektir.' 
              : 'This is a payment simulation screen. No actual payment will be processed.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">{locale === 'tr' ? 'Hata' : 'Error'}</p>
            <p>{error}</p>
          </div>
        )}

        <div className={`bg-opacity-50 rounded-md p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className={`font-medium ${textClass} mb-3 text-sm`}>
            {isBooking
              ? (locale === 'tr' ? 'Rezervasyon Detayları' : 'Booking Details')
              : (locale === 'tr' ? 'Sipariş Bilgileri' : 'Order Details')}
          </h2>
          
          <div className="space-y-2 text-sm">
            {isBooking && paymentData?.bookingDetails ? (
              <>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Rezervasyon No:' : 'Booking No:'}</span>
                  <span className={textClass}>#{(paymentData.orderId || '-').substring(0, 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Mekan:' : 'Venue:'}</span>
                  <span className={textClass}>
                    {paymentData.bookingDetails.venueName
                      ? (typeof paymentData.bookingDetails.venueName === 'object'
                        ? paymentData.bookingDetails.venueName[locale] || paymentData.bookingDetails.venueName.tr
                        : paymentData.bookingDetails.venueName)
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Müşteri:' : 'Customer:'}</span>
                  <span className={textClass}>{paymentData.customerName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Tarih:' : 'Date:'}</span>
                  <span className={textClass}>{formatDate(paymentData.bookingDetails.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Saat:' : 'Time:'}</span>
                  <span className={textClass}>
                    {paymentData.bookingDetails.startTime && paymentData.bookingDetails.endTime 
                      ? `${paymentData.bookingDetails.startTime} - ${paymentData.bookingDetails.endTime}`
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Kişi Sayısı:' : 'Guests:'}</span>
                  <span className={textClass}>{paymentData.bookingDetails.numberOfPeople || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'İletişim:' : 'Contact:'}</span>
                  <span className={textClass}>{paymentData.customerPhone || '-'}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Toplam Tutar:' : 'Total Amount:'}</span>
                  <span className="text-electric-blue font-medium">
                    {paymentData.totalAmount != null ? (paymentData.totalAmount).toFixed(2) : '0.00'} ₺
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Sipariş ID:' : 'Order ID:'}</span>
                  <span className={textClass}>#{(paymentData?.orderId || searchParams.get('orderId') || '-').substring(0, 8)}</span>
                </div>
                
                {paymentData && !isBooking && (
                  <>
                    <div className="flex justify-between">
                      <span className={secondaryTextClass}>{locale === 'tr' ? 'Etkinlik:' : 'Event:'}</span>
                      <span className={textClass}>
                        {paymentData.eventTitle 
                          ? (typeof paymentData.eventTitle === 'object' 
                            ? paymentData.eventTitle[locale] || paymentData.eventTitle.tr
                            : paymentData.eventTitle)
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={secondaryTextClass}>{locale === 'tr' ? 'Etkinlik Tarihi:' : 'Event Date:'}</span>
                      <span className={textClass}>{formatDate(paymentData.eventDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={secondaryTextClass}>{locale === 'tr' ? 'Etkinlik Saati:' : 'Event Time:'}</span>
                      <span className={textClass}>{formatTime(paymentData.eventDate)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={secondaryTextClass}>{locale === 'tr' ? 'Ad Soyad:' : 'Full Name:'}</span>
                      <span className={textClass}>{paymentData.fullName || '-'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={secondaryTextClass}>{locale === 'tr' ? 'Toplam:' : 'Total:'}</span>
                      <span className="text-electric-blue font-medium">
                        {paymentData.amount ? (paymentData.amount / 100).toFixed(2) : '0.00'} ₺
                      </span>
                    </div>
                  </>
                )}
                 {!paymentData && !isBooking && (
                    <div className="flex justify-between">
                        <span className={secondaryTextClass}>{locale === 'tr' ? 'Toplam:' : 'Total:'}</span>
                        <span className="text-electric-blue font-medium">
                        N/A 
                        </span>
                    </div>
                 )}
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white text-sm font-medium transition-colors ${
              loading 
                ? 'bg-green-600 opacity-70 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
              </span>
            ) : (
              <>{locale === 'tr' ? 'Ödemeyi Onayla' : 'Confirm Payment'}</>
            )}
          </button>
          
          <button
            onClick={handleRejectPayment}
            disabled={loading}
            className={`w-full py-3 rounded-md text-sm font-medium transition-colors ${
              loading 
                ? 'bg-red-600 opacity-70 cursor-not-allowed text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {locale === 'tr' ? 'Ödemeyi Reddet' : 'Reject Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
} 