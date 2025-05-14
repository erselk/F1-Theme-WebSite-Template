'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { saveEventOrder } from './actions';
import { createEvents } from 'ics';
// @ts-ignore - QR kod modülü için tip tanımı yok
import QRCode from 'qrcode';

// PDF için Türkçe karakter ve ₺ sembolü desteği için font yükleme
import 'jspdf/dist/polyfills.es.js';

// SearchParams wrapper component to handle useSearchParams with Suspense
function PaymentConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: locale, isDark } = useThemeLanguage();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedToDb, setSavedToDb] = useState(false);
  
  // Sayfa yüklendiğinde localStorage'dan ödeme verilerini al
  useEffect(() => {
    // Kısa bir yükleme gösterelim
    setTimeout(async () => {
      const storedPaymentData = localStorage.getItem('pendingPayment');
      if (storedPaymentData) {
        try {
          const data = JSON.parse(storedPaymentData);
          setPaymentData(data);
          
          // Save order data to MongoDB if not already saved
          if (!savedToDb && data) {
            // Get eventSlug from various possible sources in the data
            const eventSlug = data.slug || data.eventSlug || (typeof data.event === 'object' ? data.event.slug : null);
            
            // If still no eventSlug, try to extract it from other fields
            const fallbackSlug = eventSlug || 
              (data.eventId ? `event-${data.eventId}` : null) || 
              'unknown-event';
            
            console.log('Using event slug for order:', fallbackSlug);
            
            // Prepare data for saving to database
            const orderData = {
              orderId: data.orderId,
              eventId: data.eventId || '',
              eventSlug: fallbackSlug,
              eventName: {
                tr: typeof data.eventTitle === 'object' ? 
                  (data.eventTitle.tr || 'Etkinlik') : 'Etkinlik',
                en: typeof data.eventTitle === 'object' ? 
                  (data.eventTitle.en || 'Event') : 'Event'
              },
              fullName: data.fullName,
              email: data.email,
              phone: data.phone,
              tickets: data.tickets,
              amount: data.amount,
              timestamp: data.timestamp
            };
            
            // Save order to database using server action
            try {
              const result = await saveEventOrder(orderData);
              if (result.success) {
                console.log('Event order saved to database successfully');
                setSavedToDb(true);
              } else {
                console.error('Failed to save event order to database:', result.error);
              }
            } catch (error) {
              console.error('Error saving event order:', error);
            }
          }
          
          // İşlem tamamlandıktan sonra pendingPayment'ı temizleyelim
          localStorage.removeItem('pendingPayment');
        } catch (error) {
          console.error('Error parsing payment data:', error);
        }
      }
      setLoading(false);
    }, 1000);
  }, [savedToDb]);

  // Format currency for Turkish locale with comma separator
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(locale === 'tr' ? 'tr-TR' : 'tr-TR', { // Using tr-TR for both to ensure comma separator
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(amount) + ' ₺';
  };

  // Format date consistently for both languages without "at" in English
  const formatDateTime = (dateString: string) => {
    if (!dateString) return locale === 'tr' ? 'Belirtilmedi' : 'Not specified';
    
    return new Date(dateString).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Update PDF generation
  const handleDownloadTicket = async () => {
    if (!paymentData) return;
    
    try {
      // PDF oluştur - A4 boyutu
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        hotfixes: ["px_scaling"]
      });
      
      // Türkçe karakter desteği için karakter kodlaması ayarlanıyor
      pdf.setLanguage("tr");
      
      // Türkçe karakterler için ASCII karşılıklarını tanımlama
      const trChars = {
        'ç': 'c', 'Ç': 'C', 
        'ğ': 'g', 'Ğ': 'G', 
        'ı': 'i', 'İ': 'I', 
        'ö': 'o', 'Ö': 'O', 
        'ş': 's', 'Ş': 'S', 
        'ü': 'u', 'Ü': 'U',
        '₺': 'TL'
      };
      
      // Türkçe metinleri karakter karakter işleme işlevi
      const processText = (text: string) => {
        return text.replace(/[çÇğĞıİöÖşŞüÜ₺]/g, match => trChars[match as keyof typeof trChars] || match);
      };
      
      // PDF sayfa boyutları
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      
      // Bilet başlığı
      pdf.setFont("helvetica", 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(225, 6, 0); // PADOK kırmızısı
      
      // Başlığı düzgün görüntülemek için ASCII'ye yakın karakterler kullan
      const title = processText(locale === 'tr' ? 'PADOK ETKİNLİK BİLETİ' : 'PADOK EVENT TICKET');
      pdf.text(title, pageWidth / 2, margin + 10, { align: 'center' });
      
      // QR kod ekleyelim
      const qrSize = 30;
      const qrCodeX = pageWidth - margin - qrSize;
      const qrCodeY = margin;
      
      // QR kod için bilet bilgilerini içeren bir string oluştur
      const qrCodeData = JSON.stringify({
        orderId: paymentData.orderId,
        eventId: paymentData.eventId,
        fullName: paymentData.fullName,
        email: paymentData.email,
        ticketCount: paymentData.tickets?.length || 0
      });
      
      try {
        // QR kodu canvas'a oluştur
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, qrCodeData, {
          width: 200,
          margin: 0,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Canvas'ı base64 formatına çevir
        const qrCodeImage = canvas.toDataURL('image/png');
        
        // QR kodu PDF'e ekle
        pdf.addImage(qrCodeImage, 'PNG', qrCodeX, qrCodeY, qrSize, qrSize);
      } catch (error) {
        console.error('QR kod oluşturma hatası:', error);
        // QR kod oluşturulamazsa yer tutucu göster
        pdf.rect(qrCodeX, qrCodeY, qrSize, qrSize, 'S');
      }
      
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        processText(locale === 'tr' ? 'QR Kod' : 'QR Code'), 
        pageWidth - margin - qrSize/2, 
        margin + qrSize + 5, 
        { align: 'center' }
      );
      
      // Add event image if available
      let initialYPosition = margin + 20;
      if (paymentData.eventImage || paymentData.bannerImage || paymentData.squareImage) {
        // Image loading logic remains the same
        try {
          // Create an image element to load the image
          const img = document.createElement('img') as HTMLImageElement;
          img.crossOrigin = 'Anonymous';
          img.src = paymentData.eventImage || paymentData.bannerImage || paymentData.squareImage || "/images/logokare.png";
          
          // Wait for the image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          // Calculate image dimensions to maintain aspect ratio
          const imageWidth = 60; // width in mm
          const imageHeight = (img.height / img.width) * imageWidth;
          
          // Draw image centered at the top
          const imageX = (pageWidth - imageWidth) / 2;
          const imageY = margin + 15;
          
          // Convert image to data URL and add to PDF
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            pdf.addImage(dataUrl, 'JPEG', imageX, imageY, imageWidth, imageHeight);
          }
          
          // Adjust starting Y position after image
          initialYPosition = imageY + imageHeight + 10;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          // Continue without image if there's an error
        }
      }
      
      // Sipariş numarası
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(processText(`${locale === 'tr' ? 'Sipariş No' : 'Order No'}: #${paymentData.orderId?.substring(0, 8) || "N/A"}`), margin, initialYPosition);
      
      // Sipariş tarihi
      pdf.text(
        processText(`${locale === 'tr' ? 'Sipariş Tarihi' : 'Order Date'}: ${formatDateTime(paymentData.timestamp)}`), 
        margin, 
        initialYPosition + 6
      );
      
      // Etkinlik bilgileri başlığı
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      // eventTitle bir nesne olabileceği için locale'e göre doğru dili seçiyoruz
      const eventTitleText = typeof paymentData.eventTitle === 'object' 
        ? (paymentData.eventTitle[locale] || 'Event') 
        : paymentData.eventTitle || 'Event';
      
      pdf.text(processText(eventTitleText), margin, initialYPosition + 16);
      
      // Etkinlik tarihi ve yeri - paymentData'dan çekilmeli
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      
      // Etkinlik tarihini ve konumu paymentData'dan al
      const eventDate = paymentData.eventDate 
        ? formatDateTime(paymentData.eventDate)
        : locale === 'tr' ? "Belirtilmedi" : "Not specified";
      
      // Konum bilgisini nesne veya string olarak işleme
      const eventLocationText = paymentData.eventLocation
        ? (typeof paymentData.eventLocation === 'object'
          ? (paymentData.eventLocation[locale] || (locale === 'tr' ? 'Konum belirtilmedi' : 'Location not specified'))
          : paymentData.eventLocation)
        : (paymentData.location || (locale === 'tr' ? 'Konum belirtilmedi' : 'Location not specified'));
      
      pdf.text(processText(`${locale === 'tr' ? 'Tarih' : 'Date'}: ${eventDate}`), margin, initialYPosition + 22);
      pdf.text(processText(`${locale === 'tr' ? 'Konum' : 'Location'}: ${eventLocationText}`), margin, initialYPosition + 28);
      
      // Yatay çizgi
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, initialYPosition + 34, pageWidth - margin, initialYPosition + 34);
      
      // Müşteri bilgileri
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(processText(locale === 'tr' ? 'Müşteri Bilgileri' : 'Customer Information'), margin, initialYPosition + 42);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.text(processText(`${locale === 'tr' ? 'İsim' : 'Name'}: ${paymentData.fullName}`), margin, initialYPosition + 48);
      pdf.text(processText(`${locale === 'tr' ? 'E-posta' : 'Email'}: ${paymentData.email}`), margin, initialYPosition + 54);
      
      let customerInfoYOffset = 60;
      if (paymentData.phone) {
        pdf.text(processText(`${locale === 'tr' ? 'Telefon' : 'Phone'}: ${paymentData.phone}`), margin, initialYPosition + customerInfoYOffset);
        customerInfoYOffset += 6;
      }
      
      // Yatay çizgi
      pdf.line(margin, initialYPosition + customerInfoYOffset + 6, pageWidth - margin, initialYPosition + customerInfoYOffset + 6);
      
      // Bilet detayları
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(processText(locale === 'tr' ? 'Bilet Bilgileri' : 'Ticket Information'), margin, initialYPosition + customerInfoYOffset + 14);
      
      let yPosition = initialYPosition + customerInfoYOffset + 20;
      
      if (paymentData.tickets && paymentData.tickets.length > 0) {
        paymentData.tickets.forEach((ticket: any) => {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          
          // Get the localized ticket name, falling back to English or Turkish if needed
          const ticketName = typeof ticket.name === 'object' ? 
            (ticket.name[locale] || ticket.name.en || ticket.name.tr || ticket.name) : 
            (typeof ticket.originalName === 'object' ? 
              (ticket.originalName[locale] || ticket.originalName.en || ticket.originalName.tr || ticket.originalName) : 
              ticket.name);
          
          pdf.text(processText(`${ticketName} x${ticket.quantity}`), margin, yPosition);
          
          const formattedPrice = formatPrice(ticket.price * ticket.quantity).replace('₺', 'TL');
          pdf.text(processText(formattedPrice), pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 6;
        });
      }
      
      // Yatay çizgi
      yPosition += 4;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;
      
      // Toplam fiyat bilgileri
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      
      // Ara toplam
      const subtotal = paymentData.amount / 100 / 1.20;
      pdf.text(processText(locale === 'tr' ? 'Ara Toplam:' : 'Subtotal:'), margin, yPosition);
      pdf.text(
        processText(formatPrice(subtotal).replace('₺', 'TL')), 
        pageWidth - margin, 
        yPosition, 
        { align: 'right' }
      );
      yPosition += 6;
      
      // KDV
      const tax = (paymentData.amount / 100) - subtotal;
      pdf.text(processText(`${locale === 'tr' ? 'KDV (%20):' : 'Tax (20%):'}`), margin, yPosition);
      pdf.text(
        processText(formatPrice(tax).replace('₺', 'TL')), 
        pageWidth - margin, 
        yPosition, 
        { align: 'right' }
      );
      yPosition += 6;
      
      // Toplam
      pdf.setFont('helvetica', 'bold');
      pdf.text(processText(locale === 'tr' ? 'Toplam:' : 'Total:'), margin, yPosition);
      pdf.setTextColor(225, 6, 0); // PADOK kırmızısı
      pdf.text(
        processText(formatPrice(paymentData.amount / 100).replace('₺', 'TL')), 
        pageWidth - margin, 
        yPosition, 
        { align: 'right' }
      );
      
      // Event Description Section - Add if available
      if (paymentData.eventDescription) {
        yPosition += 16;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(processText(locale === 'tr' ? 'Etkinlik Açıklaması' : 'Event Description'), margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        
        const descriptionText = typeof paymentData.eventDescription === 'object' 
          ? (paymentData.eventDescription[locale] || '') 
          : paymentData.eventDescription || '';
          
        // Split long text into multiple lines
        if (descriptionText) {
          const textLines = pdf.splitTextToSize(processText(descriptionText), pageWidth - (margin * 2));
          pdf.text(textLines, margin, yPosition);
          yPosition += (textLines.length * 5) + 5;
        }
      }
      
      // Event Details Section - Add if available
      if (paymentData.eventDetails) {
        yPosition += 16;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(processText(locale === 'tr' ? 'Etkinlik Detayları' : 'Event Details'), margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        
        const detailText = typeof paymentData.eventDetails === 'object' 
          ? (paymentData.eventDetails[locale] || '') 
          : paymentData.eventDetails || '';
          
        // Split long text into multiple lines
        if (detailText) {
          const textLines = pdf.splitTextToSize(processText(detailText), pageWidth - (margin * 2));
          pdf.text(textLines, margin, yPosition);
          yPosition += (textLines.length * 5) + 5;
        }
      }
      
      // Önemli Bilgiler - Only if there's enough space
      if ((yPosition + 40) < pageHeight - margin) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(processText(locale === 'tr' ? 'Önemli Bilgiler' : 'Important Information'), margin, yPosition);
        
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        
        // Use event rules if available, otherwise show default rules
        let rules: string[] = [];
        if (paymentData.eventRules) {
          rules = locale === 'tr' 
            ? (Array.isArray(paymentData.eventRules.tr) 
               ? paymentData.eventRules.tr 
               : typeof paymentData.eventRules === 'string' 
                 ? [paymentData.eventRules] 
                 : [])
            : (Array.isArray(paymentData.eventRules.en) 
               ? paymentData.eventRules.en 
               : typeof paymentData.eventRules === 'string' 
                 ? [paymentData.eventRules] 
                 : []);
        }
        
        // If no rules are provided, don't show default rules
        if (rules.length > 0) {
          rules.forEach((rule: string) => {
            if (yPosition < (pageHeight - margin - 10)) {
              pdf.text(processText(rule), margin, yPosition);
              yPosition += 6;
            }
          });
        }
      }
      
      // Etkinlik programı - Only if there's enough space
      if ((yPosition + 40) < pageHeight - margin) {
        yPosition += 10;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(processText(locale === 'tr' ? 'Etkinlik Programı' : 'Event Schedule'), margin, yPosition);
        
        // Etkinliğe özgü program bilgilerini paymentData'dan alın
        yPosition += 8;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        
        let schedule: string[] = [];
        if (paymentData.eventSchedule) {
          schedule = locale === 'tr' 
            ? (Array.isArray(paymentData.eventSchedule.tr) 
               ? paymentData.eventSchedule.tr 
               : typeof paymentData.eventSchedule === 'string' 
                 ? [paymentData.eventSchedule] 
                 : [])
            : (Array.isArray(paymentData.eventSchedule.en) 
               ? paymentData.eventSchedule.en 
               : typeof paymentData.eventSchedule === 'string' 
                 ? [paymentData.eventSchedule] 
                 : []);
        }
        
        // If no schedule is provided, don't show default schedule
        if (schedule.length > 0) {
          schedule.forEach((item: string) => {
            if (yPosition < (pageHeight - margin - 10)) {
              pdf.text(processText(item), margin, yPosition);
              yPosition += 6;
            }
          });
        }
      }
      
      // Altbilgi
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        processText(locale === 'tr' 
          ? 'Bu bilet Padok tarafından düzenlenmektedir. Tüm hakları saklıdır.'
          : 'This ticket is issued by Padok. All rights reserved.'),
        pageWidth / 2, 
        pageHeight - margin, 
        { align: 'center' }
      );
      
      // PDF'i oluştur ve indir
      const pdfName = `Padok_Ticket_${paymentData.orderId?.substring(0, 8) || Date.now()}.pdf`;
      pdf.save(pdfName);
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert(locale === 'tr' 
        ? 'Bilet oluşturulurken bir hata oluştu.'
        : 'An error occurred while generating the ticket.'
      );
    }
  };

  // Takvime ekleme işlevi
  const handleAddToCalendar = () => {
    if (!paymentData) return;
    
    try {
      // Etkinlik tarihi ve saati
      let startDate = new Date();
      let endDate = new Date();
      
      // Eğer eventDate varsa bu tarihi kullan
      if (paymentData.eventDate) {
        startDate = new Date(paymentData.eventDate);
        // Varsayılan olarak etkinlik süresini 2 saat olarak ayarla 
        // (gerçek bitiş saati yoksa)
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }
      
      // Eğer endDate varsa bitiş tarihi olarak kullan
      if (paymentData.eventEndDate) {
        endDate = new Date(paymentData.eventEndDate);
      }
      
      // Etkinlik adı
      const eventTitle = typeof paymentData.eventTitle === 'object'
        ? (paymentData.eventTitle[locale] || 'Etkinlik')
        : (paymentData.eventTitle || 'Etkinlik');
      
      // Etkinlik açıklaması
      const eventDescription = typeof paymentData.eventDescription === 'object'
        ? (paymentData.eventDescription[locale] || '')
        : (paymentData.eventDescription || '');
      
      // Konum bilgisi
      const eventLocation = typeof paymentData.eventLocation === 'object'
        ? (paymentData.eventLocation[locale] || '')
        : (paymentData.eventLocation || paymentData.location || '');
      
      // ICS olayı oluştur
      const event = {
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1, // Ay 0'dan başlar, 1 ekle
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        ] as [number, number, number, number, number], // DateTime tipine uygun olması için
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes()
        ] as [number, number, number, number, number], // DateTime tipine uygun olması için
        title: eventTitle,
        description: eventDescription,
        location: eventLocation,
        organizer: { name: 'Padok Club', email: 'info@padokclub.com' },
        url: window.location.href
      };
      
      // ICS dosyası oluştur
      createEvents([event], (error, value) => {
        if (error) {
          console.error('Takvim olayı oluşturma hatası:', error);
          alert(locale === 'tr' 
            ? 'Takvim olayı oluşturulurken bir hata oluştu.' 
            : 'An error occurred while creating the calendar event.');
          return;
        }
        
        // ICS dosyasını indir
        const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
        saveAs(blob, `padok_etkinlik_${paymentData.orderId?.substring(0, 8) || Date.now()}.ics`);
        
        // Ayrıca takvim uygulamasını açmayı dene
        const calendarUrl = `data:text/calendar;charset=utf8,${encodeURIComponent(value)}`;
        window.open(calendarUrl);
      });
      
    } catch (error) {
      console.error('Takvim olayı oluşturma hatası:', error);
      alert(locale === 'tr' 
        ? 'Takvim olayı oluşturulurken bir hata oluştu.'
        : 'An error occurred while creating the calendar event.');
    }
  };

  // Tema bağımlı sınıflar
  const bgClass = isDark ? 'bg-graphite' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  
  if (loading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-2`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={`${textClass} font-medium text-sm`}>
            {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }
  
  // Ödeme verileri yoksa hata mesajı göster
  if (!paymentData) {
    return (
      <div className={`min-h-screen ${bgClass} py-8 px-3`}>
        <div className={`max-w-2xl mx-auto ${cardBgClass} rounded-lg shadow-lg p-4 border ${borderClass}`}>
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className={`text-xl font-bold ${textClass}`}>
              {locale === 'tr' ? 'Ödeme Bilgisi Bulunamadı' : 'Payment Information Not Found'}
            </h1>
            <p className={`${secondaryTextClass} max-w-md text-sm`}>
              {locale === 'tr' 
                ? 'Ödeme bilgileriniz bulunamadı veya süresi dolmuş olabilir. Lütfen tekrar deneyiniz.' 
                : 'Your payment information could not be found or may have expired. Please try again.'}
            </p>
            <Link 
              href="/events" 
              className="px-4 py-2 mt-3 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors text-sm"
            >
              {locale === 'tr' ? 'Etkinliklere Dön' : 'Back to Events'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Başarılı ödeme ekranını göster
  return (
    <div className={`min-h-screen ${bgClass} py-6 px-3`}>
      <div className="max-w-3xl mx-auto">
        {/* Başlık ve başarı mesajı */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h1 className={`mt-3 text-2xl font-bold ${textClass}`}>
            {locale === 'tr' ? 'Rezervasyonunuz Onaylandı!' : 'Your Reservation is Confirmed!'}
          </h1>
          <p className={`mt-1 ${secondaryTextClass} text-base`}>
            {locale === 'tr' 
              ? 'Ödemeniz başarıyla alındı ve rezervasyonunuz tamamlandı.' 
              : 'Your payment has been received and your reservation is complete.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left side - Ticket and Operations */}
          <div className="lg:col-span-2">
            <div className={`${cardBgClass} rounded-lg shadow-lg border ${borderClass} overflow-hidden`}>
              {/* Event Title and Image */}
              <div className={`border-b ${borderClass} p-4`}>
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Event image - Using squareImage explicitly */}
                  <div className="flex-shrink-0 w-full md:w-16 h-16 mb-3 md:mb-0 md:mr-3 overflow-hidden rounded-md">
                    <Image 
                      src={paymentData.squareImage || paymentData.eventImage || paymentData.bannerImage || "/images/logokare.png"} 
                      alt={typeof paymentData.eventTitle === 'object' 
                        ? (paymentData.eventTitle[locale] || "Event") 
                        : (paymentData.eventTitle || "Event")}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <h2 className={`text-lg font-bold ${textClass}`}>
                      {typeof paymentData.eventTitle === 'object' 
                        ? (paymentData.eventTitle[locale] || (locale === 'tr' ? 'Etkinlik' : 'Event')) 
                        : (paymentData.eventTitle || (locale === 'tr' ? 'Etkinlik' : 'Event'))}
                    </h2>
                    <p className={`${secondaryTextClass} mt-1 flex items-center text-xs`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {formatDateTime(paymentData.eventDate)}
                    </p>
                    
                    {/* Location with current language only */}
                    <p className={`${secondaryTextClass} mt-1 flex items-center text-xs`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-neon-red" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {typeof paymentData.eventLocation === 'object' 
                        ? (paymentData.eventLocation[locale] || (locale === 'tr' ? 'Konum bilgisi yok' : 'Location not specified'))
                        : (paymentData.eventLocation || (locale === 'tr' ? 'Konum bilgisi yok' : 'Location not specified'))}
                    </p>
                  </div>
                  
                  <div className="bg-neon-green/10 text-neon-green py-0.5 px-2 rounded-full text-xs font-bold mt-3 md:mt-0 max-w-fit md:ml-3">
                    {locale === 'tr' ? 'Onaylandı' : 'Confirmed'}
                  </div>
                </div>
              </div>

              {/* Ticket Section */}
              <div className="p-4 relative">
                {paymentData.tickets && paymentData.tickets.map((ticket: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className={`relative ${cardBgClass} border ${borderClass} rounded-lg overflow-hidden`}>
                      {/* Zigzag edges */}
                      <div className="absolute top-0 left-0 w-full h-[8px] flex">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className={`flex-1 ${i % 2 === 0 ? bgClass : 'bg-transparent'}`}></div>
                        ))}
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-[8px] flex">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className={`flex-1 ${i % 2 === 0 ? bgClass : 'bg-transparent'}`}></div>
                        ))}
                      </div>
                      
                      {/* Ticket content */}
                      <div className="flex flex-col md:flex-row items-center p-3 mt-[8px] mb-[8px]">
                        <div className="flex-1 w-full md:w-auto text-center md:text-left mb-2 md:mb-0">
                          <p className={`text-xs ${secondaryTextClass}`}>{locale === 'tr' ? 'Bilet Türü' : 'Ticket Type'}</p>
                          {/* Show ticket name in current language only */}
                          {typeof ticket.originalName === 'object' ? (
                            <p className={`text-sm font-bold ${textClass}`}>
                              {ticket.originalName[locale] || ticket.name}
                            </p>
                          ) : typeof ticket.name === 'object' ? (
                            <p className={`text-sm font-bold ${textClass}`}>
                              {ticket.name[locale] || ticket.name}
                            </p>
                          ) : (
                            <p className={`text-sm font-bold ${textClass}`}>{ticket.name}</p>
                          )}
                          <div className="flex justify-center md:justify-start items-center mt-1">
                            <span className="bg-electric-blue/10 text-electric-blue text-xs py-0.5 px-1.5 rounded-md">
                              {ticket.quantity} {locale === 'tr' ? 'Adet' : 'Quantity'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-px h-12 bg-gray-200 mx-3 hidden md:block"></div>
                        
                        <div className="text-center">
                          <p className={`text-xs ${secondaryTextClass}`}>{locale === 'tr' ? 'Bilet Fiyatı' : 'Ticket Price'}</p>
                          <p className={`text-sm font-bold text-electric-blue`}>
                            {formatPrice(ticket.price * ticket.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Event schedule and rules section */}
              <div className={`border-t ${borderClass} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Schedule */}
                  <div>
                    <h3 className={`text-base font-medium ${textClass} mb-2`}>
                      {locale === 'tr' ? 'Etkinlik Programı' : 'Event Schedule'}
                    </h3>
                    {paymentData.eventSchedule && (
                      <div className="space-y-1">
                        <ul className="space-y-1">
                          {Array.isArray(paymentData.eventSchedule[locale]) && paymentData.eventSchedule[locale].length > 0 ? 
                            paymentData.eventSchedule[locale].map((item: string, index: number) => (
                              <li key={index} className={`${secondaryTextClass} text-xs`}>{item}</li>
                            )) : 
                            <li className={`${secondaryTextClass} text-xs`}>
                              {locale === 'tr' ? 'Program bilgisi bulunamadı' : 'Schedule information not available'}
                            </li>
                          }
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Important Information / Rules - show based on current language */}
                  <div>
                    <h3 className={`text-base font-medium ${textClass} mb-2`}>
                      {locale === 'tr' ? 'Önemli Bilgiler' : 'Important Information'}
                    </h3>
                    {paymentData.eventRules && (
                      <div className="space-y-1">
                        {typeof paymentData.eventRules === 'object' ? (
                          <ul className="space-y-1">
                            {paymentData.eventRules[locale]?.map((rule: string, index: number) => (
                              <li key={`rule-${index}`} className={`${secondaryTextClass} text-xs`}>{rule}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`${secondaryTextClass} text-xs`}>{paymentData.eventRules}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bilet İşlemleri */}
              <div className={`border-t ${borderClass} p-4 bg-opacity-50 ${isDark ? 'bg-dark-grey' : 'bg-white'}`}>
                <h3 className={`text-base font-medium ${textClass} mb-3`}>
                  {locale === 'tr' ? 'Bilet İşlemleri' : 'Ticket Operations'}
                </h3>
                <div className="flex flex-col space-y-2">
                  <button 
                    onClick={handleDownloadTicket} 
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 ${isDark ? 'bg-carbon-grey text-white' : 'bg-gray-200 text-gray-800'} rounded-md hover:opacity-90 transition-colors text-xs`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {locale === 'tr' ? 'Bileti İndir (PDF)' : 'Download Ticket (PDF)'}
                  </button>
                  
                  <button 
                    onClick={handleAddToCalendar} 
                    className={`w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 ${isDark ? 'bg-carbon-grey text-white' : 'bg-gray-200 text-gray-800'} rounded-md hover:opacity-90 transition-colors text-xs`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {locale === 'tr' ? 'Takvime Ekle' : 'Add to Calendar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Sipariş Özeti */}
          <div>
            <div className={`${cardBgClass} rounded-lg shadow-lg border ${borderClass} p-4`}>
              <h3 className={`text-base font-bold ${textClass} mb-2 pb-2 border-b ${borderClass}`}>
                {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
              </h3>
              
              <div className="space-y-2">
                <div>
                  <p className={`text-xs font-medium ${textClass}`}>
                    {locale === 'tr' ? 'Sipariş Numarası' : 'Order Number'}
                  </p>
                  <p className={`${secondaryTextClass} text-xs`}>
                    #{paymentData.orderId?.substring(0, 8) || "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className={`text-xs font-medium ${textClass}`}>
                    {locale === 'tr' ? 'Sipariş Tarihi' : 'Order Date'}
                  </p>
                  <p className={`${secondaryTextClass} text-xs`}>
                    {formatDateTime(paymentData.timestamp)}
                  </p>
                </div>
                
                <div>
                  <p className={`text-xs font-medium ${textClass}`}>
                    {locale === 'tr' ? 'İsim' : 'Name'}
                  </p>
                  <p className={`${secondaryTextClass} text-xs`}>
                    {paymentData.fullName || "N/A"}
                  </p>
                </div>
                
                <div>
                  <p className={`text-xs font-medium ${textClass}`}>
                    {locale === 'tr' ? 'E-posta' : 'Email'}
                  </p>
                  <p className={`${secondaryTextClass} text-xs`}>
                    {paymentData.email || "N/A"}
                  </p>
                </div>
                
                {paymentData.phone && (
                  <div>
                    <p className={`text-xs font-medium ${textClass}`}>
                      {locale === 'tr' ? 'Telefon' : 'Phone'}
                    </p>
                    <p className={`${secondaryTextClass} text-xs`}>
                      {paymentData.phone}
                    </p>
                  </div>
                )}
                
                <div className={`border-t ${borderClass} pt-2 mt-2`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${secondaryTextClass} text-xs`}>
                      {locale === 'tr' ? 'Ara Toplam' : 'Subtotal'}
                    </span>
                    <span className={`${textClass} text-xs`}>
                      {formatPrice(paymentData.amount / 100 / 1.20)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${secondaryTextClass} text-xs`}>
                      {locale === 'tr' ? 'KDV (%20)' : 'Tax (20%)'}
                    </span>
                    <span className={`${textClass} text-xs`}>
                      {formatPrice((paymentData.amount / 100) - (paymentData.amount / 100 / 1.20))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center font-bold mt-2 pt-1 border-t border-dashed">
                    <span className={`${textClass} text-sm`}>
                      {locale === 'tr' ? 'Toplam' : 'Total'}
                    </span>
                    <span className="text-neon-green text-sm">
                      {formatPrice(paymentData.amount / 100)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`mt-4 p-2 rounded-md bg-opacity-50 ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className={`ml-2 text-xs ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    {locale === 'tr' 
                      ? 'Ödemeniz başarıyla tamamlandı. Bilet bilgileriniz e-posta adresinize gönderildi.' 
                      : 'Your payment has been successfully completed. Your ticket information has been sent to your email address.'}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/events" 
                  className={`block w-full text-center py-2 rounded-md ${isDark ? 'bg-carbon-grey text-white hover:bg-dark-grey' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-colors text-xs`}
                >
                  {locale === 'tr' ? 'Etkinliklere Dön' : 'Back to Events'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function PaymentConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-graphite flex items-center justify-center p-3">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            Yükleniyor... / Loading...
          </p>
        </div>
      </div>
    }>
      <PaymentConfirmedContent />
    </Suspense>
  );
}