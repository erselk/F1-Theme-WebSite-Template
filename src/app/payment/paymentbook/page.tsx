'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { motion } from 'framer-motion';
import { createBookingRecord } from './actions';

export default function PaymentBookPage() {
  const { isDark, language: locale } = useThemeLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get reservation details from URL parameters or localStorage
  const reservationRef = searchParams.get('ref') || localStorage.getItem('reservation_ref') || '';
  const venue = searchParams.get('venue') || localStorage.getItem('reservation_venue') || '';
  const name = searchParams.get('name') || localStorage.getItem('reservation_name') || '';
  const date = searchParams.get('date') || localStorage.getItem('reservation_date') || '';
  const time = searchParams.get('time') || localStorage.getItem('reservation_time') || '';
  const people = searchParams.get('people') || localStorage.getItem('reservation_people') || '';
  const price = searchParams.get('price') || localStorage.getItem('reservation_price') || '';
  const phone = searchParams.get('phone') || localStorage.getItem('reservation_phone') || '';
  const dateRaw = searchParams.get('dateRaw') || localStorage.getItem('reservation_date_raw') || '';
  const startTime = searchParams.get('startTime') || localStorage.getItem('reservation_startTime') || '';
  const endTime = searchParams.get('endTime') || localStorage.getItem('reservation_endTime') || '';

  // Theme-dependent color classes
  const bgColorClass = isDark ? 'bg-graphite' : 'bg-white';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  // Translations
  const t = {
    tr: {
      paymentTitle: 'Rezervasyon Ödeme Sayfası',
      reservationDetails: 'Rezervasyon Detayları',
      reservationNumber: 'Rezervasyon Numarası',
      customer: 'Müşteri Bilgisi',
      venue: 'Rezervasyon Alanı',
      date: 'Tarih',
      time: 'Saat',
      people: 'Kişi Sayısı',
      totalAmount: 'Toplam Tutar',
      contact: 'İletişim',
      approvePayment: 'Ödemeyi Onayla',
      rejectPayment: 'Ödemeyi Reddet',
      paymentProcessing: 'Ödeme işleminiz gerçekleştiriliyor...',
      paymentRejected: 'Ödemeyi reddettiniz',
      paymentSecureArea: 'Güvenli Ödeme Alanı',
      cardDetails: 'Kart Bilgileri',
      cardNumber: 'Kart Numarası',
      expires: 'Son Kullanma Tarihi',
      cvc: 'CVC',
    },
    en: {
      paymentTitle: 'Reservation Payment Page',
      reservationDetails: 'Reservation Details',
      reservationNumber: 'Reservation Number',
      customer: 'Customer Information',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      people: 'Number of People',
      totalAmount: 'Total Amount',
      contact: 'Contact',
      approvePayment: 'Approve Payment',
      rejectPayment: 'Reject Payment',
      paymentProcessing: 'Your payment is being processed...',
      paymentRejected: 'You rejected the payment',
      paymentSecureArea: 'Secure Payment Area',
      cardDetails: 'Card Details',
      cardNumber: 'Card Number',
      expires: 'Expires',
      cvc: 'CVC',
    }
  };

  // Use the translations based on locale
  const strings = locale === 'en' ? t.en : t.tr;

  // Get dual-language venue name
  const getDualLanguageVenueName = (venueName: string) => {
    const venueTranslations: Record<string, { tr: string; en: string }> = {
      'F1 Simulator': { tr: 'F1 Simulator', en: 'F1 Simulator' },
      'VR Alanı': { tr: 'VR Alanı', en: 'VR Area' },
      'Bilgisayar Odası': { tr: 'Bilgisayar Odası', en: 'Computer Room' },
      'PlayStation': { tr: 'PlayStation', en: 'PlayStation' },
      'Toplantı Salonu': { tr: 'Toplantı Salonu', en: 'Meeting Room' }
    };

    return venueTranslations[venueName] || { tr: venueName, en: venueName };
  };

  // Venue adını çift dilde göster
  const venueNameDual = getDualLanguageVenueName(venue);
  const displayVenueName = locale === 'en' ? venueNameDual.en : venueNameDual.tr;
  
  // Helper function to handle payment approval
  const handleApprovePayment = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData = {
        refNumber: reservationRef,
        name: name,
        phone: phone,
        date: dateRaw,
        startTime,
        endTime,
        people: parseInt(people, 10) || 1,
        totalPrice: parseFloat(price.replace(/[^\d.]/g, '')),
        // Her zaman veritabanına Türkçe venue adı kaydet
        venue: venueNameDual.tr
      };

      // Use server action to create booking
      const response = await createBookingRecord(bookingData);

      if (response.success) {
        // Redirect to the new confirmed page in paymentbook
        router.push(`/payment/paymentbook/confirmed?ref=${reservationRef}&amount=${price}`);
      } else {
        setError(response.error || 'Ödeme işlemi sırasında bir hata oluştu.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Ödeme işlemi sırasında bir hata oluştu.');
      setIsSubmitting(false);
    }
  };

  // Helper function to handle payment rejection
  const handleRejectPayment = () => {
    // Payment_error mesajını localStorage'a kaydet
    localStorage.setItem('payment_error', strings.paymentRejected);

    // Tüm form bilgilerini localStorage'da tut
    // "form_step" ile rezervasyon formunun son adıma (onaylama adımı) gitmesini sağla
    localStorage.setItem('form_step', '4');
    
    // Açık bir şekilde onay adımını belirt
    router.push('/book?step=confirmation');
  };

  // If any required data is missing, redirect to booking page
  useEffect(() => {
    if (!reservationRef || !venue || !name || !date || !time || !people || !price) {
      router.push('/book');
    }
  }, [reservationRef, venue, name, date, time, people, price, router]);

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className={`max-w-3xl w-full ${bgColorClass} rounded-lg border ${borderColorClass} p-8 shadow-lg`}>
        <h1 className={`text-2xl font-bold ${headingColorClass} text-center mb-6`}>
          {strings.paymentTitle}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Reservation Details */}
          <div>
            <h2 className={`text-xl font-semibold ${headingColorClass} mb-4`}>
              {strings.reservationDetails}
            </h2>

            <div className={`p-4 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'} rounded-lg mb-6`}>
              <div className="space-y-3">
                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.reservationNumber}:</span>
                  <span className="font-mono">{reservationRef}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.customer}:</span>
                  <span>{name}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.venue}:</span>
                  <span>{displayVenueName}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.date}:</span>
                  <span>{date}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.time}:</span>
                  <span>{time}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.people}:</span>
                  <span>{people}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center`}>
                  <span className="font-medium">{strings.contact}:</span>
                  <span>{phone}</span>
                </p>

                <p className={`${textColorClass} text-sm flex justify-between items-center mt-4 pt-3 border-t ${borderColorClass}`}>
                  <span className="font-medium">{strings.totalAmount}:</span>
                  <span className="font-bold text-f1-red">{price}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h2 className={`text-xl font-semibold ${headingColorClass} mb-4`}>
              {strings.paymentSecureArea}
            </h2>
            
            <div className={`p-4 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'} rounded-lg mb-6`}>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${textColorClass} mb-1`}>
                    {strings.cardDetails}
                  </label>
                  
                  <div className={`bg-white dark:bg-very-dark-grey border ${borderColorClass} rounded-md p-4 mb-4`}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {strings.cardNumber}
                        </label>
                        <div className="flex justify-between items-center">
                          <span className="font-mono">•••• •••• •••• 1234</span>
                          <div className="flex space-x-1">
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {strings.expires}
                          </label>
                          <span className="font-mono">05/26</span>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {strings.cvc}
                          </label>
                          <span className="font-mono">•••</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              {isSubmitting ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-t-f1-red border-r-f1-red border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                  <span>{strings.paymentProcessing}</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleApprovePayment}
                    className="w-full px-6 py-3 bg-f1-red text-white rounded-md hover:opacity-90 transition-colors"
                    disabled={isSubmitting}
                  >
                    {strings.approvePayment}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleRejectPayment}
                    className={`w-full px-6 py-3 ${isDark ? 'bg-carbon-grey text-silver' : 'bg-gray-200 text-gray-700'} rounded-md hover:opacity-90 transition-colors`}
                    disabled={isSubmitting}
                  >
                    {strings.rejectPayment}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}