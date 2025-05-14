'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import { createEvent } from 'ics';
// @ts-ignore - QR kod modülü için tip tanımı yok
import QRCode from 'qrcode';

// PDF'lerde Türkçe karakter desteği için font ekleme
import 'jspdf-autotable';
// Import custom fonts for PDF
import { addCustomFonts, safeText } from '@/lib/pdf-fonts';

// Loading fallback component
function PaymentConfirmationLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium">Yükleniyor / Loading...</p>
      </div>
    </div>
  );
}

// Main component content
function PaymentBookConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: locale, isDark } = useThemeLanguage();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [calendarAdded, setCalendarAdded] = useState(false);

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
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';  // Translations
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
      seeYou: 'Sizi merkezimizde görmekten mutluluk duyacağız.',
      addToCalendar: 'Takvim Dosyasını İndir'
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
      seeYou: 'We look forward to seeing you at our center.',
      addToCalendar: 'Download Calendar File'
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
  };  // Add to calendar functionality using ICS
  const addToCalendar = () => {
    if (!paymentData) return;
    
    try {
      // Parse event date and time
      const eventDate = paymentData.eventDate || paymentData.date || paymentData.startTime;
      const startTime = paymentData.startTime || paymentData.time?.split(' - ')?.[0] || '';
      const endTime = paymentData.endTime || paymentData.time?.split(' - ')?.[1] || '';
      
      // Create start and end datetime objects
      let startDateTime = new Date(eventDate);
      if (startTime) {
        const [hours, minutes] = startTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      }
      
      // Default duration of 1 hour if no end time specified
      let endDateTime = new Date(startDateTime);
      if (endTime) {
        const [hours, minutes] = endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      } else {
        endDateTime.setHours(endDateTime.getHours() + 1);
      }
      
      // Format dates for ICS
      // ICS expects [year, month, day, hour, minute]
      const startArray = [
        startDateTime.getFullYear(),
        startDateTime.getMonth() + 1, // ICS months are 1-indexed
        startDateTime.getDate(),
        startDateTime.getHours(),
        startDateTime.getMinutes()
      ] as [number, number, number, number, number];
      
      const endArray = [
        endDateTime.getFullYear(),
        endDateTime.getMonth() + 1,
        endDateTime.getDate(),
        endDateTime.getHours(),
        endDateTime.getMinutes()
      ] as [number, number, number, number, number];
      
      // Create event description
      const description = `${strings.venue}: ${paymentData.venue}\n${strings.guests}: ${paymentData.people}\n${strings.refNumber}: ${paymentData.refNumber || paymentData.orderId}`;
      
      // Create the calendar event
      createEvent(
        {
          title: `Padok Club: ${paymentData.venue}`,
          description,
          location: 'Çamlıca Mah. Anadolu Blv. No:27, Üsküdar, İstanbul',
          start: startArray,
          end: endArray,
          status: 'CONFIRMED',
          busyStatus: 'BUSY',
          organizer: { name: 'Padok Club', email: 'info@padokclub.com' }
        }, 
        (error, value) => {
          if (error) {
            console.error('Error creating ICS event:', error);
            return;
          }
          
          if (value) {
            // Create a Blob with the ICS data
            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            
            // Create a link element to trigger the download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `padokclub-${paymentData.refNumber || paymentData.orderId}.ics`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setCalendarAdded(true);
            
            // Reset status after 3 seconds
            setTimeout(() => setCalendarAdded(false), 3000);
          }
        }
      );
      
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  };  // Generate and download PDF ticket
  const downloadTicket = async () => {
    if (!paymentData) return;
    
    setGeneratingPdf(true);
    
    try {      // Create PDF in A4 portrait format
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        hotfixes: ["px_scaling"]
      });
      
      // Apply custom fonts with Turkish character support
      addCustomFonts(doc);
      
      // Set language for better character support
      doc.setLanguage("tr");
        // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      // Modern ticket design with brand colors
      // Header section with brand color background
      doc.setFillColor(225, 6, 0); // PADOK red
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo placeholder
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('Roboto', 'bold');
      doc.text("PADOK CLUB", margin, 25);
      
      // Ticket title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(safeText(strings.pdfTitle), pageWidth / 2, 25, { align: 'center' });
      
      // Reference number
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`#${paymentData.refNumber || paymentData.orderId}`, pageWidth - margin, 25, { align: 'right' });
      
      // Main content background
      doc.setFillColor(248, 249, 250); // Light gray background
      doc.rect(0, 40, pageWidth, pageHeight - 40, 'F');      // QR code section - Generate actual QR code (positioned at bottom left)
      const qrSize = 40;
      const qrCodeX = margin;
      const qrCodeY = pageHeight - margin - qrSize - 20;
      
      // QR code data - create a JSON object with the reservation details
      const qrCodeData = JSON.stringify({
        refNumber: paymentData.refNumber || paymentData.orderId,
        name: paymentData.fullName || paymentData.name,
        venue: paymentData.venue,
        datetime: `${formatDate(paymentData.eventDate || paymentData.date || paymentData.startTime)} ${paymentData.time || `${paymentData.startTime} - ${paymentData.endTime}`}`,
        guests: paymentData.people
      });
      
      try {
        // Generate QR code on canvas
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, qrCodeData, {
          width: 200,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Convert canvas to image data URL
        const qrCodeImage = canvas.toDataURL('image/png');
        
        // Add QR code to PDF
        doc.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrSize, qrSize);
          // QR code label
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          locale === 'tr' ? 'QR Kod' : 'QR Code', 
          qrCodeX + qrSize/2, 
          qrCodeY + qrSize + 5, 
          { align: 'center' }
        );      } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        // If QR code fails, show a placeholder
        doc.setDrawColor(0);
        doc.roundedRect(qrCodeX, qrCodeY, qrSize, qrSize, 3, 3, 'S');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('QR', qrCodeX + qrSize/2, qrCodeY + qrSize/2, { align: 'center' });
      }
        // Ticket title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('Roboto', 'bold');
      doc.text(safeText(strings.ticketTitle), pageWidth / 2, 60, { align: 'center' });
      
      // Draw a colored band
      doc.setFillColor(225, 6, 0);  // PADOK red accent
      doc.rect(margin, 65, pageWidth - (margin * 2), 2, 'F');
      
      // Draw boxes for each section
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      
      // Determine box sizes
      const boxWidth = (pageWidth - (margin * 3)) / 2;
      const boxHeight = 80;
      const boxY = 75;
      
      // Reservation box
      doc.roundedRect(margin, boxY, boxWidth, boxHeight, 3, 3, 'S');
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin, boxY, boxWidth, 10, 3, 3, 'F');
      
      // Customer box
      doc.roundedRect(margin * 2 + boxWidth, boxY, boxWidth, boxHeight, 3, 3, 'S');
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(margin * 2 + boxWidth, boxY, boxWidth, 10, 3, 3, 'F');
      
      // Box titles
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(14);
      doc.setFont('Roboto', 'bold');
      doc.text(safeText(strings.reservationDetails), margin + (boxWidth / 2), boxY + 7, { align: 'center' });
      doc.text(safeText(strings.customerInfo), margin * 2 + boxWidth + (boxWidth / 2), boxY + 7, { align: 'center' });
      
      // Reset font
      doc.setFont('Roboto', 'normal');
      
      // Reservation details
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      
      const xLabelReservation = margin + 5;
      const xValueReservation = margin + boxWidth - 5;
      const yStartReservation = boxY + 20;
      const lineHeightReservation = 12;
      
      // Reservation details - labels
      doc.text(safeText(`${strings.venue}:`), xLabelReservation, yStartReservation);
      doc.text(safeText(`${strings.date}:`), xLabelReservation, yStartReservation + lineHeightReservation);
      doc.text(safeText(`${strings.time}:`), xLabelReservation, yStartReservation + 2 * lineHeightReservation);
      doc.text(safeText(`${strings.guests}:`), xLabelReservation, yStartReservation + 3 * lineHeightReservation);
      doc.text(safeText(`${strings.amount}:`), xLabelReservation, yStartReservation + 4 * lineHeightReservation);
      
      // Reservation details - values
      doc.setTextColor(0, 0, 0);
      doc.setFont('Roboto', 'bold');
      doc.text(safeText(paymentData.venue), xValueReservation, yStartReservation, { align: 'right' });
      
      const formattedDate = formatDate(paymentData.eventDate || paymentData.date || paymentData.startTime);
      doc.text(safeText(formattedDate), xValueReservation, yStartReservation + lineHeightReservation, { align: 'right' });
      
      const timeValue = paymentData.time || `${paymentData.startTime} - ${paymentData.endTime}`;
      doc.text(safeText(timeValue), xValueReservation, yStartReservation + 2 * lineHeightReservation, { align: 'right' });
      
      doc.text(`${paymentData.people}`, xValueReservation, yStartReservation + 3 * lineHeightReservation, { align: 'right' });
      
      // Amount display
      if (paymentData.isFree || paymentData.amount === 0 || paymentData.totalPrice === 0) {
        doc.setTextColor(0, 150, 0); // Green for free
        doc.text(safeText(strings.free), xValueReservation, yStartReservation + 4 * lineHeightReservation, { align: 'right' });
      } else {
        doc.setTextColor(0, 0, 0);
        const price = paymentData.totalPrice ? `${paymentData.totalPrice} TL` : `${(paymentData.amount / 100).toFixed(2)} TL`;
        doc.text(price, xValueReservation, yStartReservation + 4 * lineHeightReservation, { align: 'right' });
      }
        // Customer information
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont('Roboto', 'normal');
      
      const xLabelCustomer = margin * 2 + boxWidth + 5;
      const xValueCustomer = margin * 2 + boxWidth * 2 - 5;
      const yStartCustomer = yStartReservation;
      
      // Customer info - labels
      doc.text(safeText(`${strings.name}:`), xLabelCustomer, yStartCustomer);
      doc.text(safeText(`${strings.phone}:`), xLabelCustomer, yStartCustomer + lineHeightReservation);
      doc.text(safeText(`${strings.refNumber}:`), xLabelCustomer, yStartCustomer + 2 * lineHeightReservation);
      
      // Customer info - values
      doc.setTextColor(0, 0, 0);
      doc.setFont('Roboto', 'bold');
      doc.text(safeText(paymentData.fullName || paymentData.name), xValueCustomer, yStartCustomer, { align: 'right' });
      doc.text(paymentData.phone, xValueCustomer, yStartCustomer + lineHeightReservation, { align: 'right' });
      doc.text(`${paymentData.refNumber || paymentData.orderId}`, xValueCustomer, yStartCustomer + 2 * lineHeightReservation, { align: 'right' });
      
      // Info section
      const infoSectionY = boxY + boxHeight + 20;
      
      // Horizontal divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, infoSectionY - 10, pageWidth - margin, infoSectionY - 10);
      
      // Section title
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(80, 80, 80);
      doc.text(safeText('Önemli Bilgiler / Important Information'), margin, infoSectionY);
      
      // Info boxes
      const infoBoxWidth = (pageWidth - (margin * 3)) / 2;
      const infoBoxY = infoSectionY + 10;
      
      // Address section
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(safeText(`${strings.addressTitle}:`), margin, infoBoxY);
      
      // Address content
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(safeText(strings.address), margin, infoBoxY + 10);
      
      // Important notes section
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(safeText(`${strings.important}:`), margin * 2 + infoBoxWidth, infoBoxY);
      
      // Split arrive early note into multiple lines
      const arriveEarlyText = strings.arriveEarly;
      const maxWidth = infoBoxWidth - 10;
        // Use splitTextToSize which handles text wrapping
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(100, 100, 100);
      const splitText = doc.splitTextToSize(safeText(arriveEarlyText), maxWidth);
      doc.text(splitText, margin * 2 + infoBoxWidth, infoBoxY + 10);
      
      // Footer message
      const footerY = pageHeight - 30;
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.setFont('Roboto', 'bold');
      doc.text(safeText(strings.seeYou), pageWidth / 2, footerY, { align: 'center' });
      
      // Small Padok Club branding at bottom
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.setFont('Roboto', 'normal');
      doc.text('PADOK CLUB © ' + new Date().getFullYear(), pageWidth - margin, pageHeight - 15, { align: 'right' });
      
      // Save the PDF
      const fileName = `padokclub-reservation-${paymentData.refNumber || paymentData.orderId}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
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
            </p>            <Link 
              href="/" 
              className="px-5 py-3 mt-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
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
                  {/* Buttons */}
                <div className="space-y-2 pt-4 mt-2">
                  {/* Download Ticket button */}
                  <button
                    onClick={downloadTicket}
                    disabled={generatingPdf}
                    className={`w-full px-4 py-2 bg-black text-white rounded-md hover:opacity-90 transition-colors flex items-center justify-center ${generatingPdf ? 'opacity-70' : ''}`}
                  >
                    {generatingPdf && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {generatingPdf ? strings.generatingTicket : strings.downloadTicket}
                  </button>
                  
                  {/* Add to Calendar button */}
                  <button
                    onClick={addToCalendar}
                    className={`w-full px-4 py-2 bg-black text-white rounded-md hover:opacity-90 transition-colors flex items-center justify-center`}
                  >                    {calendarAdded ? (
                      <>
                        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {locale === 'tr' ? 'Takvim İndirildi' : 'Calendar Downloaded'}
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {strings.addToCalendar}
                      </>
                    )}
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
              className="px-5 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >              {strings.backToHome}
            </Link>
          </div>
        </div>    </div>
    </div>  );
}

// Export the page component with Suspense boundary
export default function PaymentBookConfirmed() {
  return (
    <>
      <style jsx global>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 1.5rem !important;
          }
          h2 {
            font-size: 1.25rem !important;
          }
          h3, p {
            font-size: 0.875rem !important;
          }
          .w-20 {
            width: 4rem !important;
            height: 4rem !important;
          }
          .h-20 {
            height: 4rem !important;
          }
          .h-16 {
            height: 3.5rem !important;
          }
          .w-16 {
            width: 3.5rem !important;
          }
          .h-12 {
            height: 2.5rem !important;
          }
          .w-12 {
            width: 2.5rem !important;
          }
          .p-6 {
            padding: 1rem !important;
          }
          .py-12 {
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
          }
          .mb-10 {
            margin-bottom: 1.5rem !important;
          }
          .mb-8 {
            margin-bottom: 1.25rem !important;
          }
          .mb-4 {
            margin-bottom: 0.75rem !important;
          }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.75rem !important;
          }
          .space-y-3 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 0.5rem !important;
          }
          .px-5 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          .py-2\\.5 {
            padding-top: 0.5rem !important;
            padding-bottom: 0.5rem !important;
          }
          .px-4 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          .py-2 {
            padding-top: 0.375rem !important;
            padding-bottom: 0.375rem !important;
          }
        }
      `}</style>
      <Suspense fallback={<PaymentConfirmationLoading />}>
        <PaymentBookConfirmedContent />
      </Suspense>
    </>
  );
}