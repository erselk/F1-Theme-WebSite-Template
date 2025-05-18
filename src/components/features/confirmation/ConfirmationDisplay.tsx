'use client';

import { useState } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { createEvents as createIcsEvents, EventAttributes as IcsEventAttributes } from 'ics';
// @ts-ignore
import QRCode from 'qrcode';
import 'jspdf/dist/polyfills.es.js';
import 'jspdf-autotable';
import { addCustomFonts, safeText } from '@/lib/pdf-fonts';

interface ConfirmationDisplayProps {
  paymentResultData?: any; // Sunucudan gelen birleştirilmiş veri
  error?: string; // Sunucudan gelen hata mesajı
}

export default function ConfirmationDisplay({ paymentResultData, error }: ConfirmationDisplayProps) {
  const { language: locale, isDark } = useThemeLanguage();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [errorMessage, setError] = useState<string | null>(null);

  const t = {
    tr: {
      loading: 'Yükleniyor...',
      notFound: 'Bilgi Bulunamadı',
      notFoundDesc: 'Onay bilgileriniz bulunamadı veya süresi dolmuş olabilir. Lütfen tekrar deneyiniz.',
      propError: 'Onay bilgileri yüklenirken bir sorun oluştu.',
      backToHome: 'Ana Sayfaya Dön',
      downloadTicket: 'Bileti İndir',
      generatingTicket: 'Bilet oluşturuluyor...',
      addToCalendar: 'Takvime Ekle',
      calendarAdded: 'Takvime Eklendi',
      eventConfirmed: 'Biletleriniz Onaylandı!',
      eventSuccessMsg: 'Ödemeniz başarıyla alındı ve biletleriniz oluşturuldu.',
      eventDetails: 'Etkinlik Detayları',
      ticketDetails: 'Bilet Detayları',
      eventName: 'Etkinlik Adı',
      eventDate: 'Etkinlik Tarihi',
      eventLocation: 'Etkinlik Yeri',
      orderId: 'Sipariş No',
      totalAmount: 'Toplam Tutar',
      customerName: 'Ad Soyad',
      reservationConfirmed: 'Rezervasyonunuz Onaylandı!',
      reservationSuccessMsg: 'Rezervasyonunuz tamamlandı.',
      reservationDetails: 'Rezervasyon Detayları',
      venue: 'Alan',
      date: 'Tarih',
      time: 'Saat',
      guests: 'Kişi Sayısı',
      customerInfo: 'Müşteri Bilgileri',
      phone: 'Telefon',
      amount: 'Toplam Tutar',
      free: 'Ücretsiz',
      refNumber: 'Rezervasyon Numarası',
      contactUs: 'Sorularınız için bize ulaşabilirsiniz.',
      note: 'Not',
      arriveEarly: 'Lütfen rezervasyon/etkinlik saatinizden 10 dakika önce merkezimizde bulunmayı unutmayınız.',
      pdfTitleBooking: 'PADOK CLUB REZERVASYON',
      ticketTitleBooking: 'REZERVASYON BİLETİ',
      pdfTitleEvent: 'PADOK ETKİNLİK BİLETİ',
      printAndBring: 'Lütfen bu bileti yazdırın veya dijital olarak gösterin.',
      addressTitle: 'ADRES',
      address: 'Çamlıca Mah. Anadolu Blv. No:27, Üsküdar, İstanbul',
      important: 'ÖNEMLİ',
      seeYou: 'Sizi merkezimizde görmekten mutluluk duyacağız.',
      eventTime: 'Etkinlik Saati'
    },
    en: {
      loading: 'Loading...',
      notFound: 'Information Not Found',
      notFoundDesc: 'Your confirmation information could not be found or may have expired. Please try again.',
      propError: 'There was an issue loading your confirmation details.',
      backToHome: 'Back to Home',
      downloadTicket: 'Download Ticket',
      generatingTicket: 'Generating ticket...',
      addToCalendar: 'Add to Calendar',
      calendarAdded: 'Added to Calendar',
      eventConfirmed: 'Your Tickets are Confirmed!',
      eventSuccessMsg: 'Your payment has been received and your tickets have been generated.',
      eventDetails: 'Event Details',
      ticketDetails: 'Ticket Details',
      eventName: 'Event Name',
      eventDate: 'Event Date',
      eventLocation: 'Event Location',
      orderId: 'Order ID',
      totalAmount: 'Total Amount',
      customerName: 'Full Name',
      reservationConfirmed: 'Your Reservation is Confirmed!',
      reservationSuccessMsg: 'Your reservation is complete.',
      reservationDetails: 'Reservation Details',
      venue: 'Venue',
      date: 'Date',
      time: 'Time',
      guests: 'Number of Guests',
      customerInfo: 'Customer Information',
      phone: 'Phone',
      amount: 'Total Amount',
      free: 'Free',
      refNumber: 'Reservation Number',
      contactUs: 'You can contact us for any questions about your reservation.',
      note: 'Note',
      arriveEarly: 'Please remember to be at our center 10 minutes before your reservation/event time.',
      pdfTitleBooking: 'PADOK CLUB RESERVATION',
      ticketTitleBooking: 'RESERVATION TICKET',
      pdfTitleEvent: 'PADOK EVENT TICKET',
      printAndBring: 'Please print this ticket or show it digitally.',
      addressTitle: 'ADDRESS',
      address: 'Camlica Mah. Anadolu Blv. No:27, Uskudar, Istanbul',
      important: 'IMPORTANT',
      seeYou: 'We look forward to seeing you at our center.',
      eventTime: 'Event Time'
    }
  };
  const strings = locale === 'en' ? t.en : t.tr;

  const getLocalizedValue = (field: any, fallback: string = 'N/A') => {
    if (typeof field === 'object' && field !== null) {
      return field[locale] || field.tr || fallback;
    }
    return field || fallback;
  };

  const formatPrice = (price: number, currency = 'TRY') => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatDateForDisplay = (dateStr: string | undefined, includeWeekday = false) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric',
    };
    if (includeWeekday) options.weekday = 'long';
    return dateObj.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  const formatEventTimeForDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const dateObj = new Date(dateStr);
      return dateObj.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'N/A';
    }
  };
  
  const formatReservationTime = (timeRaw: { startTime?: string, endTime?: string } | undefined) => {
    if (!timeRaw || !timeRaw.startTime || !timeRaw.endTime) return 'N/A';
    const startTime = new Date(timeRaw.startTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(timeRaw.endTime).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const handleAddToCalendarUnified = () => {
    if (!paymentResultData) return;
    setCalendarAdded(false);
    const commonEventDetails: Omit<IcsEventAttributes, 'start' | 'end' | 'title' | 'description'> = {
      location: strings.address, status: 'CONFIRMED', busyStatus: 'BUSY', organizer: { name: 'Padok Club', email: 'info@padokclub.com' },
    };
    let icsEvent: IcsEventAttributes;

    if (paymentResultData.type === 'booking' && paymentResultData.bookingDetails) {
      const details = paymentResultData.bookingDetails;
      const eventDate = details.rawFormData?.dateRaw || details.reservationDate;
      const startTimeStr = details.reservationTimeRaw?.startTime ? new Date(details.reservationTimeRaw.startTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : '00:00';
      const endTimeStr = details.reservationTimeRaw?.endTime ? new Date(details.reservationTimeRaw.endTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : '00:00';
      
      if (!eventDate || !startTimeStr) {
        setError('Rezervasyon tarihi/saati eksik');
        return;
      }
      let startDateTime = new Date(`${eventDate}T${startTimeStr}:00`);
      let endDateTime = endTimeStr ? new Date(`${eventDate}T${endTimeStr}:00`) : new Date(startDateTime.getTime() + 60 * 60 * 1000);
      
      const venueForCalendar = getLocalizedValue(details.venueName, 'Padok Club');
      icsEvent = {
        ...commonEventDetails,
        title: `${strings.reservationDetails}: ${venueForCalendar}`,
        description: `${strings.venue}: ${venueForCalendar}\n${strings.guests}: ${details.numberOfPeople}\n${strings.refNumber}: ${paymentResultData.orderId}`,
        start: [startDateTime.getFullYear(), startDateTime.getMonth() + 1, startDateTime.getDate(), startDateTime.getHours(), startDateTime.getMinutes()],
        end: [endDateTime.getFullYear(), endDateTime.getMonth() + 1, endDateTime.getDate(), endDateTime.getHours(), endDateTime.getMinutes()],
      };
    } else if (paymentResultData.type === 'event') {
      const data = paymentResultData;
      const eventDateStr = data.eventDate;
      if (!eventDateStr) {
        setError('Etkinlik tarihi eksik');
        return;
      }
      let startDateTime = new Date(eventDateStr);
      let endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
      if (data.eventSchedule && data.eventSchedule[locale] && data.eventSchedule[locale][0]) {
        const firstScheduleItemTime = data.eventSchedule[locale][0].match(/(\d{2}:\d{2})/);
        if (firstScheduleItemTime) {
            const [hours, minutes] = firstScheduleItemTime[0].split(':');
            startDateTime.setHours(parseInt(hours), parseInt(minutes));
            endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
        }
      }
      const eventNameForCalendar = getLocalizedValue(data.eventName, strings.eventName);
      icsEvent = {
        ...commonEventDetails,
        title: `${strings.eventName}: ${eventNameForCalendar}`,
        description: `${strings.orderId}: ${data.orderId}\n${strings.totalAmount}: ${formatPrice(data.amount / 100)}`,
        start: [startDateTime.getFullYear(), startDateTime.getMonth() + 1, startDateTime.getDate(), startDateTime.getHours(), startDateTime.getMinutes()],
        end: [endDateTime.getFullYear(), endDateTime.getMonth() + 1, endDateTime.getDate(), endDateTime.getHours(), endDateTime.getMinutes()],
      };
    } else {
      setError('Bilinmeyen veri tipi');
      return;
    }

    createIcsEvents([icsEvent], (err, val) => {
      if (err) {
        setError('ICS etkinliği oluşturulurken hata oluştu');
        return;
      }
      if (val) {
        const blob = new Blob([val], { type: 'text/calendar;charset=utf-8' });
        const fileName = `padokclub-${paymentResultData.type}-${paymentResultData.orderId}.ics`;
        saveAs(blob, fileName);
        setCalendarAdded(true);
        setTimeout(() => setCalendarAdded(false), 3000);
      }
    });
  };

  const handleDownloadTicketUnified = async () => {
    if (!paymentResultData) return;
    setGeneratingPdf(true);
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', putOnlyUsedFonts: true, hotfixes: ["px_scaling"] });
    addCustomFonts(doc); doc.setLanguage("tr");
    const pageWidth = doc.internal.pageSize.getWidth(); const margin = 15; let yPos = margin + 10;
    const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://padokclub.com';

    if (paymentResultData.type === 'booking' && paymentResultData.bookingDetails) {
      const details = paymentResultData.bookingDetails;
      doc.setFontSize(20); doc.text(safeText(strings.pdfTitleBooking), pageWidth / 2, yPos, { align: 'center' }); yPos += 10;
      doc.setFontSize(16); doc.text(safeText(strings.ticketTitleBooking), pageWidth / 2, yPos, { align: 'center' }); yPos += 10;
      doc.setDrawColor(isDark ? 80 : 200); doc.line(margin, yPos, pageWidth - margin, yPos); yPos += 10;
      const addRow = (label: string, value: string) => {
        doc.setFontSize(10); doc.setFont('Roboto', 'bold'); doc.text(safeText(label), margin, yPos);
        doc.setFont('Roboto', 'normal'); doc.text(safeText(value), margin + 60, yPos); yPos += 7;
      };
      addRow(strings.refNumber + ':', paymentResultData.orderId || 'N/A');
      addRow(strings.customerName + ':', details.customerName || 'N/A');
      addRow(strings.phone + ':', details.contactPhone || 'N/A');
      addRow(strings.venue + ':', getLocalizedValue(details.venueName));
      addRow(strings.date + ':', formatDateForDisplay(details.rawFormData?.dateRaw || details.reservationDate));
      addRow(strings.time + ':', formatReservationTime(details.reservationTimeRaw));
      addRow(strings.guests + ':', String(details.numberOfPeople) || 'N/A');
      const bookingAmount = paymentResultData.amount;
      const amountText = bookingAmount === 0 ? strings.free : formatPrice(bookingAmount);
      addRow(strings.totalAmount + ':', amountText);
      
      if (paymentResultData.orderId) {
        try {
          const qrUrl = `${baseUrl}/confirmation/booking/${paymentResultData.orderId}`;
          const qrCodeDataURL = await QRCode.toDataURL(qrUrl, { errorCorrectionLevel: 'H', width: 200 });
          const qrCodeSize = 40; const qrXPosition = (pageWidth - qrCodeSize) / 2; yPos += 5;
          doc.addImage(qrCodeDataURL, 'PNG', qrXPosition, yPos, qrCodeSize, qrCodeSize); yPos += qrCodeSize + 5;
        } catch (qrError) {
          setError('QR kod oluşturulurken hata oluştu');
        }
      }
    } else if (paymentResultData.type === 'event') {
      const data = paymentResultData;
      doc.setFontSize(24); doc.setTextColor(225, 6, 0); doc.text(safeText(strings.pdfTitleEvent), pageWidth / 2, yPos, { align: 'center' }); yPos += 15;
      const qrSize = 30; const qrCodeX = pageWidth - margin - qrSize; const qrCodeY = margin - 5;
      if (data.orderId) {
        try {
            const qrUrl = `${baseUrl}/confirmation/event/${data.orderId}`;
            const qrCodeDataURL = await QRCode.toDataURL(qrUrl, { errorCorrectionLevel: 'H', width: 200 });
            doc.addImage(qrCodeDataURL, 'PNG', qrCodeX, qrCodeY, qrSize, qrSize);
            doc.setFontSize(8); doc.setTextColor(128,128,128);
            doc.text(safeText(locale === 'tr' ? 'QR Kod' : 'QR Code'), qrCodeX + qrSize/2, qrCodeY + qrSize + 3, {align: 'center'});
        } catch (qrError) {
          setError('QR kod oluşturulurken hata oluştu');
        }
      }
      yPos = margin + 30;
      doc.setFontSize(12); doc.setTextColor(0,0,0);
      const addEventDetailRow = (label: string, value: string) => {
        doc.setFont('Roboto', 'bold'); doc.text(safeText(label) + ':', margin, yPos);
        doc.setFont('Roboto', 'normal'); doc.text(safeText(value), margin + 50, yPos, {maxWidth: pageWidth - margin - 60}); yPos += 7;
        if (yPos > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); yPos = margin; }
      };
      addEventDetailRow(strings.eventName, getLocalizedValue(data.eventName));
      addEventDetailRow(strings.eventDate, formatDateForDisplay(data.eventDate, true));
      addEventDetailRow(strings.eventTime, formatEventTimeForDisplay(data.eventDate));
      addEventDetailRow(strings.eventLocation, getLocalizedValue(data.eventLocation, 'Padok Club'));
      addEventDetailRow(strings.orderId, data.orderId || 'N/A');
      addEventDetailRow(strings.customerName, data.fullName || 'N/A');
      addEventDetailRow(strings.totalAmount, formatPrice(data.amount / 100)); 
      yPos += 5; doc.setFont('Roboto', 'bold'); doc.text(safeText(strings.ticketDetails) + ':', margin, yPos); yPos += 7;
      if (data.tickets && data.tickets.length > 0) {
        data.tickets.forEach((ticket: any) => {
          doc.setFont('Roboto', 'normal');
          const ticketName = getLocalizedValue(ticket.name, 'Bilet');
          doc.text(safeText(`- ${ticket.quantity} x ${ticketName} (${formatPrice(ticket.price)})`), margin + 5, yPos); yPos += 6;
           if (yPos > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); yPos = margin; }
        });
      } else { doc.setFont('Roboto', 'normal'); doc.text(safeText(locale === 'tr' ? 'Bilet bilgisi yok.':'No ticket info.'), margin + 5, yPos); yPos += 7; }
    } else { doc.setFontSize(12); doc.text(safeText(strings.notFound), margin, yPos); yPos += 10; }

    yPos = Math.max(yPos, doc.internal.pageSize.getHeight() - 60);
    if (yPos > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); yPos = margin; }
    doc.setFont('Roboto', 'bold'); doc.setFontSize(10); doc.text(safeText(strings.important), margin, yPos); yPos += 5;
    doc.setFont('Roboto', 'normal'); doc.setFontSize(9); doc.text(safeText(strings.arriveEarly), margin, yPos, { maxWidth: pageWidth - margin * 2 }); yPos += 10;
    doc.setFont('Roboto', 'bold'); doc.text(safeText(strings.addressTitle), margin, yPos); yPos += 5;
    doc.setFont('Roboto', 'normal'); doc.text(safeText(strings.address), margin, yPos, { maxWidth: pageWidth - margin * 2 }); yPos += 10;
    doc.setFontSize(10); doc.text(safeText(strings.printAndBring), pageWidth / 2, yPos, { align: 'center' }); yPos += 7;
    doc.text(safeText(strings.seeYou), pageWidth / 2, yPos, { align: 'center' });
    const fileName = `padokclub-${paymentResultData?.type || 'ticket'}-${paymentResultData?.orderId || 'onay'}.pdf`;
    doc.save(fileName);
    setGeneratingPdf(false);
  };

  if (error || !paymentResultData) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-graphite' : 'bg-gray-50'} flex flex-col items-center justify-center p-6 text-center`}>
        <div className={`${isDark ? 'bg-dark-grey' : 'bg-white'} p-8 rounded-xl shadow-2xl max-w-lg w-full border ${isDark ? 'border-carbon-grey' : 'border-gray-200'}`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{strings.notFound}</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-md`}>{error || strings.notFoundDesc}</p>
          <Link href="/" className="px-5 py-3 mt-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">{strings.backToHome}</Link>
        </div>
      </div>
    );
  }

  const isBooking = paymentResultData.type === 'booking';
  const details = isBooking ? paymentResultData.bookingDetails : paymentResultData;
  const headerTitle = isBooking ? strings.reservationConfirmed : strings.eventConfirmed;
  const successMessage = isBooking 
    ? (paymentResultData.amount === 0 ? strings.reservationSuccessMsg : strings.reservationSuccessMsg) 
    : strings.eventSuccessMsg;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-graphite' : 'bg-gray-50'} py-12 px-4`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neon-green" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <h1 className={`mt-4 text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{headerTitle}</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'} text-lg`}>{successMessage}</p>
        </div>
        <div className={`${isDark ? 'bg-dark-grey' : 'bg-white'} rounded-lg shadow-lg border ${isDark ? 'border-carbon-grey' : 'border-gray-200'} overflow-hidden mb-8`}>
          {isBooking && details ? (
            <>
              <div className="flex flex-col md:flex-row border-b border-dashed">
                <div className="flex-1 p-6 md:border-r border-dashed">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{strings.reservationDetails}</h2>
                  <div className="space-y-3">
                    <DetailItem label={strings.venue} value={getLocalizedValue(details.venueName)} />
                    <DetailItem label={strings.date} value={formatDateForDisplay(details.rawFormData?.dateRaw || details.reservationDate, true)} />
                    <DetailItem label={strings.time} value={formatReservationTime(details.reservationTimeRaw)} />
                    <DetailItem label={strings.guests} value={details.numberOfPeople} />
                    <DetailItem label={strings.refNumber} value={`#${paymentResultData.orderId}`} isMono />
                  </div>
                </div>
                <div className="flex-1 p-6">
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{strings.customerInfo}</h2>
                  <div className="space-y-3">
                    <DetailItem label={strings.customerName} value={details.customerName} />
                    <DetailItem label={strings.phone} value={details.contactPhone} />
                    <DetailItem label={strings.totalAmount} value={paymentResultData.amount === 0 ? strings.free : formatPrice(paymentResultData.amount)} valueClass="text-neon-green font-bold" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            details && (
            <div className="p-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>{strings.eventDetails}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <DetailItem label={strings.eventName} value={getLocalizedValue(details.eventName)} />
                  <DetailItem label={strings.eventDate} value={formatDateForDisplay(details.eventDate, true)} />
                  <DetailItem label={strings.eventTime} value={formatEventTimeForDisplay(details.eventDate)} />
                  <DetailItem label={strings.eventLocation} value={getLocalizedValue(details.eventLocation)} />
                  {details.eventSchedule && details.eventSchedule[locale] && details.eventSchedule[locale].length > 0 && (
                    <div className="mt-1">
                      <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{strings.time}:</span>
                      <ul className="list-none pl-0 mt-0.5">
                        {details.eventSchedule[locale].map((item: string, index: number) => (
                          <li key={index} className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <DetailItem label={strings.orderId} value={`#${details.orderId}`} isMono />
                  <DetailItem label={strings.customerName} value={details.fullName} />
                  <DetailItem label={strings.totalAmount} value={formatPrice(details.amount / 100)} valueClass="text-neon-green font-bold" />
                </div>
              </div>
              {details.tickets && details.tickets.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>{strings.ticketDetails}</h3>
                  <ul className="list-disc list-inside">
                    {details.tickets.map((ticket: any, index: number) => (
                      <li key={index} className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
                        {ticket.quantity} x {getLocalizedValue(ticket.name, 'Bilet')} ({formatPrice(ticket.price)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            )
          )}
          <div className={`p-6 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'} ${isBooking ? 'border-t border-dashed' : ''}`}>
            <div className="flex items-start space-x-3 mb-6">
                <div className="flex-shrink-0"> <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-electric-blue' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div> <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{strings.note}</h3> <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>{strings.arriveEarly}</p> </div>
            </div>
            <div className="space-y-2">
              <button onClick={handleDownloadTicketUnified} disabled={generatingPdf} className={`w-full px-4 py-2 bg-black text-white rounded-md hover:opacity-90 transition-colors flex items-center justify-center ${generatingPdf ? 'opacity-70' : ''}`}>
                {generatingPdf && ( <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>)} 
                {generatingPdf ? strings.generatingTicket : strings.downloadTicket}
              </button>
              <button onClick={handleAddToCalendarUnified} className={`w-full px-4 py-2 bg-black text-white rounded-md hover:opacity-90 transition-colors flex items-center justify-center`}>
                {calendarAdded ? (<><svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>{strings.calendarAdded}</>) : (<><svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{strings.addToCalendar}</>)} 
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="px-5 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">{strings.backToHome}</Link>
        </div>
      </div>
    </div>
  );
}

const DetailItem = ({ label, value, isMono = false, valueClass = '' }: { label: string, value: string | number | undefined, isMono?: boolean, valueClass?: string }) => {
  const { isDark } = useThemeLanguage();
  const textColorClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextColorClass = isDark ? 'text-gray-300' : 'text-gray-600';
  return (
    <div className="flex justify-between">
      <span className={`${secondaryTextColorClass}`}>{label}:</span>
      <span className={`${textColorClass} ${isMono ? 'font-mono' : 'font-medium'} ${valueClass}`}>{value ?? 'N/A'}</span>
    </div>
  );
}; 