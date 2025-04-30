'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { jsPDF } from 'jspdf';

// PDF'lerde Türkçe karakter desteği için font ekleme
import 'jspdf-autotable';

export default function PaymentBookConfirmed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: locale, isDark } = useThemeLanguage();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Load reservation data from localStorage
  useEffect(() => {
    setTimeout(() => {
      const storedPaymentData = localStorage.getItem('pendingPayment');
      if (storedPaymentData) {
        try {
          const data = JSON.parse(storedPaymentData);
          setPaymentData(data);
          localStorage.removeItem('pendingPayment');
        } catch (error) {
          console.error('Error parsing payment data:', error);
        }
      }
      setLoading(false);
    }, 1000);
  }, []);

  // Theme-dependent color classes
  const bgClass = isDark ? 'bg-graphite' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  // Translations
  const t = {
    tr: {
      loading: 'Yükleniyor...',
      notFound: 'Rezervasyon Bilgisi Bulunamadı',
      notFoundDesc: 'Rezervasyon bilgileriniz bulunamadı veya süresi dolmuş olabilir. Lütfen tekrar deneyiniz.',
      backToHome: 'Ana Sayfaya Dön',
      reservationConfirmed: 'Rezervasyonunuz Onaylandı!',
      successMsg: 'Ödemeniz başarıyla alındı ve rezervasyonunuz tamamlandı.',
      reservationDetails: 'Rezervasyon Detayları',
      venue: 'Alan',
      date: 'Tarih',
      time: 'Saat',
      guests: 'Kişi Sayısı',
      customerInfo: 'Müşteri Bilgileri',
      name: 'İsim',
      phone: 'Telefon',
      amount: 'Toplam Tutar',
      free: 'Ücretsiz',
      refNumber: 'Rezervasyon Numarası',
      contactUs: 'Rezervasyon ile ilgili sorularınız için bize ulaşabilirsiniz.',
      note: 'Not',
      arriveEarly: 'Lütfen rezervasyon saatinizden 10 dakika önce merkezimizde bulunmayı unutmayınız.',
      downloadTicket: 'Bileti İndir',
      generatingTicket: 'Bilet oluşturuluyor...',
      pdfTitle: 'PADOK CLUB REZERVASYON',
      ticketTitle: 'REZERVASYON BİLETİ',
      printAndBring: 'Lütfen bu bileti yazdırın veya dijital olarak gösterin.',
      addressTitle: 'ADRES',
      address: 'Çamlıca Mah. Anadolu Blv. No:27, Üsküdar, İstanbul',
      important: 'ÖNEMLİ',
      seeYou: 'Sizi merkezimizde görmekten mutluluk duyacağız.'
    },
    en: {
      loading: 'Loading...',
      notFound: 'Reservation Information Not Found',
      notFoundDesc: 'Your reservation information could not be found or may have expired. Please try again.',
      backToHome: 'Back to Home',
      reservationConfirmed: 'Your Reservation is Confirmed!',
      successMsg: 'Your reservation is complete.',
      reservationDetails: 'Reservation Details',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      guests: 'Number of Guests',
      customerInfo: 'Customer Information',
      name: 'Name',
      phone: 'Phone',
      amount: 'Total Amount',
      free: 'Free',
      refNumber: 'Reservation Number',
      contactUs: 'You can contact us for any questions about your reservation.',
      note: 'Note',
      arriveEarly: 'Please remember to be at our center 10 minutes before your reservation time.',
      downloadTicket: 'Download Ticket',
      generatingTicket: 'Generating ticket...',
      pdfTitle: 'PADOK CLUB RESERVATION',
      ticketTitle: 'RESERVATION TICKET',
      printAndBring: 'Please print this ticket or show it digitally.',
      addressTitle: 'ADDRESS',
      address: 'Camlica Mah. Anadolu Blv. No:27, Uskudar, Istanbul',
      important: 'IMPORTANT',
      seeYou: 'We look forward to seeing you at our center.'
    }
  };

  // Use the translations based on locale
  const strings = locale === 'en' ? t.en : t.tr;

  // Format date for display in PDF
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate and download PDF ticket
  const downloadTicket = () => {
    if (!paymentData) return;
    
    setGeneratingPdf(true);
    
    setTimeout(() => {
      try {
        // Bilet için A5 boyutunda PDF oluştur (landscape)
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5'
        });
        
        // Türkçe karakter desteği için encodingini belirt
        doc.setFont('helvetica');
        doc.setLanguage('tr'); // Türkçe dil desteğini etkinleştir
        
        // Başlık ve logo alanı
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, 210, 25, 'F');
        
        // Başlık
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(strings.pdfTitle, 20, 15);
        
        // Referans numarası
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(`#${paymentData.refNumber || paymentData.orderId}`, 180, 15, { align: 'right' });
        
        // Ana içerik alanı
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(24);
        doc.text(strings.ticketTitle, 105, 40, { align: 'center' });
        
        // Unicode karakter kodlaması için değer dönüştürmelerini uygula
        const unicodify = (text: string) => {
          // Latin-1 karakterleri Unicode ile değiştir
          return text
            .replace(/ı/g, 'i')
            .replace(/İ/g, 'I')
            .replace(/ğ/g, 'g')
            .replace(/Ğ/g, 'G')
            .replace(/ü/g, 'u')
            .replace(/Ü/g, 'U')
            .replace(/ş/g, 's')
            .replace(/Ş/g, 'S')
            .replace(/ö/g, 'o')
            .replace(/Ö/g, 'O')
            .replace(/ç/g, 'c')
            .replace(/Ç/g, 'C');
        };
        
        // Bilet detayları - sol sütun
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${unicodify(strings.venue)}:`, 20, 60);
        doc.text(`${unicodify(strings.date)}:`, 20, 70);
        doc.text(`${unicodify(strings.time)}:`, 20, 80);
        doc.text(`${unicodify(strings.guests)}:`, 20, 90);
        doc.text(`${unicodify(strings.amount)}:`, 20, 100);
        
        // Bilet detayları - sağ sütun
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(unicodify(paymentData.venue), 80, 60);
        doc.text(unicodify(formatDate(paymentData.eventDate || paymentData.date || paymentData.startTime)), 80, 70);
        doc.text(`${paymentData.time || `${paymentData.startTime} - ${paymentData.endTime}`}`, 80, 80);
        doc.text(`${paymentData.people}`, 80, 90);
        
        // Fiyat - ücretsiz veya ücretli
        if (paymentData.isFree || paymentData.amount === 0 || paymentData.totalPrice === 0) {
          doc.setTextColor(0, 180, 0);
          doc.text(unicodify(strings.free), 80, 100);
        } else {
          doc.setTextColor(0, 0, 0);
          doc.text(`${paymentData.totalPrice || (paymentData.amount / 100)} TL`, 80, 100);
        }
        
        // Müşteri bilgileri
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${unicodify(strings.name)}:`, 120, 60);
        doc.text(`${unicodify(strings.phone)}:`, 120, 70);
        
        doc.setTextColor(0, 0, 0);
        doc.text(unicodify(paymentData.fullName || paymentData.name), 160, 60);
        doc.text(paymentData.phone, 160, 70);
        
        // Alt taraf - adres ve notlar
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 115, 190, 115);
        
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.text(unicodify(strings.printAndBring), 20, 125);
        
        // Adres
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(unicodify(strings.addressTitle) + ':', 20, 135);
        doc.setTextColor(0, 0, 0);
        doc.text(unicodify(strings.address), 20, 142);
        
        // Not - iki satıra bölünmüş şekilde (önce kelimesinden itibaren alt satır)
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(unicodify(strings.important) + ':', 120, 135);
        doc.setTextColor(0, 0, 0);
        
        // Önemli notu iki satıra bölme
        // Türkçe için "önce" veya "before" kelimesinden böl
        const arriveEarlyText = unicodify(strings.arriveEarly);
        let line1, line2;
        
        if (locale === 'tr') {
          const parts = arriveEarlyText.split(/önce/i);
          if (parts.length > 1) {
            line1 = parts[0] + 'önce';
            line2 = parts.slice(1).join('önce').trim();
          } else {
            line1 = arriveEarlyText;
            line2 = '';
          }
        } else {
          const parts = arriveEarlyText.split(/before/i);
          if (parts.length > 1) {
            line1 = parts[0] + 'before';
            line2 = parts.slice(1).join('before').trim();
          } else {
            line1 = arriveEarlyText;
            line2 = '';
          }
        }
        
        doc.text(line1, 120, 142);
        if (line2) {
          doc.text(line2, 120, 148);
        }
        
        // Alt bilgi
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(unicodify(strings.seeYou), 105, 158, { align: 'center' });
        
        // PDF'i indir
        const fileName = `padokclub-reservation-${paymentData.refNumber || paymentData.orderId}.pdf`;
        doc.save(fileName);
        
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        setGeneratingPdf(false);
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={`${textClass} font-medium`}>
            {strings.loading}
          </p>
        </div>
      </div>
    );
  }

  // If no payment data is found
  if (!paymentData) {
    return (
      <div className={`min-h-screen ${bgClass} py-16 px-4`}>
        <div className={`max-w-2xl mx-auto ${cardBgClass} rounded-lg shadow-lg p-6 border ${borderClass}`}>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className={`text-2xl font-bold ${textClass}`}>
              {strings.notFound}
            </h1>
            <p className={`${secondaryTextClass} max-w-md`}>
              {strings.notFoundDesc}
            </p>
            <Link 
              href="/" 
              className="px-5 py-3 mt-4 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
            >
              {strings.backToHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Update success message if it's a free venue
  const successMessage = paymentData.isFree || paymentData.amount === 0 || paymentData.totalPrice === 0 ? 
    locale === 'tr' ? 'Rezervasyonunuz onaylandı.' : 'Your reservation has been confirmed.' :
    strings.successMsg;

  // Successful reservation confirmation
  return (
    <div className={`min-h-screen ${bgClass} py-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="inline-block">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className={`mt-4 text-3xl font-bold ${textClass}`}>
            {strings.reservationConfirmed}
          </h1>
          <p className={`mt-2 ${secondaryTextClass} text-lg`}>
            {successMessage}
          </p>
        </div>

        {/* Reservation details */}
        <div className={`${cardBgClass} rounded-lg shadow-lg border ${borderClass} overflow-hidden mb-8`}>
          <div className="flex flex-col md:flex-row border-b border-dashed">
            <div className="flex-1 p-6 md:border-r border-dashed">
              <h2 className={`text-xl font-bold ${textClass} mb-4`}>
                {strings.reservationDetails}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.venue}:</span>
                  <span className={`${textClass} font-medium`}>{paymentData.venue}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.date}:</span>
                  <span className={`${textClass} font-medium`}>
                    {typeof paymentData.eventDate === 'string' 
                      ? new Date(paymentData.eventDate).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : paymentData.date || formatDate(paymentData.startTime)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.time}:</span>
                  <span className={`${textClass} font-medium`}>
                    {paymentData.time || `${paymentData.startTime} - ${paymentData.endTime}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.guests}:</span>
                  <span className={`${textClass} font-medium`}>{paymentData.people}</span>
                </div>
                
                <div className="flex justify-between pt-3 mt-3 border-t">
                  <span className={`${secondaryTextClass}`}>{strings.refNumber}:</span>
                  <span className={`${textClass} font-mono font-bold`}>{paymentData.refNumber || paymentData.orderId}</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <h2 className={`text-xl font-bold ${textClass} mb-4`}>
                {strings.customerInfo}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.name}:</span>
                  <span className={`${textClass} font-medium`}>{paymentData.fullName || paymentData.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`${secondaryTextClass}`}>{strings.phone}:</span>
                  <span className={`${textClass} font-medium`}>{paymentData.phone}</span>
                </div>
                
                <div className="flex justify-between pt-3 mt-3 border-t">
                  <span className={`${secondaryTextClass}`}>{strings.amount}:</span>
                  <span className="text-neon-green font-bold">
                    {paymentData.isFree || paymentData.amount === 0 || paymentData.totalPrice === 0 
                      ? strings.free
                      : (paymentData.totalPrice ? `${paymentData.totalPrice} TL` : 
                        `${(paymentData.amount / 100).toFixed(2)} TL`)}
                  </span>
                </div>
                
                {/* PDF indirme butonu - toplam tutarın altında */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={downloadTicket}
                    disabled={generatingPdf}
                    className={`w-full px-4 py-2 bg-f1-red text-white rounded-md hover:opacity-90 transition-colors flex items-center justify-center ${generatingPdf ? 'opacity-70' : ''}`}
                  >
                    {generatingPdf && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {generatingPdf ? strings.generatingTicket : strings.downloadTicket}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Note section */}
          <div className={`p-6 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-electric-blue' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`font-bold ${textClass}`}>{strings.note}</h3>
                <p className={`${secondaryTextClass} mt-1`}>
                  {strings.arriveEarly}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="order-2 md:order-1">
            <Link 
              href="/" 
              className="px-5 py-2.5 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {strings.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}