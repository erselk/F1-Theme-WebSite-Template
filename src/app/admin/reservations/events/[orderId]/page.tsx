'use client';

import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getEventOrderById, deleteEventOrder } from '@/services/event-orders-service';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import jsPDF from 'jspdf';

export default function OrderDetailPage() {
  // useParams hook kullanarak params'ı Promise problemi olmadan alıyoruz
  const params = useParams();
  
  // Güvenli bir şekilde params'a erişim
  // params bir Promise ise React.use() ile çözülür, değilse direkt olarak kullanılır
  const orderId = typeof params.orderId === 'object' && 'then' in params.orderId 
    ? React.use(params as any).orderId 
    : params.orderId as string;
  
  const router = useRouter();
  const { isDark, language } = useThemeLanguage();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format price with proper Turkish/English formatting
  const formatPrice = (amount: number) => {
    // Kuruş kısmı olmayan fiyatlar için minimumFractionDigits: 0 kullanıyoruz
    // Tam sayı değerlerde kuruş göstermeyen, ondalıklı değerlerde gösterecek şekilde ayarlıyoruz
    const hasDecimal = amount % 1 !== 0;
    
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Currency symbol için TL kullanacak şekilde formatla
  const formatPriceForPDF = (amount: number) => {
    // Kuruş kısmı olmayan fiyatlar için minimumFractionDigits: 0 kullanıyoruz
    const hasDecimal = amount % 1 !== 0;
    
    const formatted = new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'decimal',
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return `${formatted} TL`;
  };

  // Format date based on language
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch order data
  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const result = await getEventOrderById(orderId);
      if (result.success) {
        // Servis tarafından zaten normalize edilmiş veriyi doğrudan kullanıyoruz
        setOrder(result.data);
      } else {
        setError(result.error || 'Order not found');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching order data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  // Türkçe karakter sorunu için karakter transliterasyon fonksiyonu
  const turkishToLatin = (text: string): string => {
    if (!text) return '';
    
    const charMap: {[key: string]: string} = {
      'ç': 'c',
      'Ç': 'C',
      'ğ': 'g',
      'Ğ': 'G',
      'ı': 'i',
      'İ': 'I',
      'ö': 'o',
      'Ö': 'O',
      'ş': 's',
      'Ş': 'S',
      'ü': 'u',
      'Ü': 'U'
    };
    
    return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, match => charMap[match] || match);
  };

  // Generate PDF for order - Improved version
  const generateOrderPDF = () => {
    if (!order) return;
    
    // Get event name based on current language
    const eventName = typeof order.eventName === 'object' 
      ? (order.eventName[language] || order.eventName.en || order.eventName.tr || order.eventSlug)
      : order.eventSlug;
    
    // Calculate totals
    const totalTicketQuantity = order.tickets.reduce((acc: number, ticket: any) => acc + ticket.quantity, 0);
    const calculatedTotal = order.tickets.reduce((acc: number, ticket: any) => {
      return acc + (ticket.price * ticket.quantity);
    }, 0);
    const displayTotal = calculatedTotal;
    const subtotal = displayTotal / 1.20; // Assuming 20% tax
    const tax = displayTotal - subtotal;
    
    // PDF ayarları - A4 boyutu
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // PDF Style tanımları
    const margin = 15;
    const innerPadding = 10;
    const lineHeight = 8;
    
    // Font boyutları
    const titleSize = 22;
    const headerSize = 16;
    const subheaderSize = 14;
    const normalSize = 10;
    const smallSize = 8;
    
    // Renk tanımları - Padok Club brand renkleri
    const padokBlue = [35, 94, 233];
    const padokGreen = [39, 174, 96];
    const white = [255, 255, 255];
    const lightGray = [240, 240, 240];
    const mediumGray = [100, 100, 100];
    const darkGray = [60, 60, 60];
    const black = [0, 0, 0];
    
    // İlk sayfa arka planı (beyaz)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Üst başlık alanı (mavi kısım)
    doc.setFillColor(padokBlue[0], padokBlue[1], padokBlue[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Başlık - Bold görünüm için daha kalın font
    doc.setFontSize(titleSize);
    doc.setTextColor(255, 255, 255);
    doc.text('PADOK CLUB', margin, 25);
    
    // Sipariş no ve tarih bilgisi
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(normalSize);
    
    // Türkçe karakter konusunda transliterasyon kullanarak düzeltme yapıyoruz
    const orderInfo = `#${orderId.substring(0, 8)} | ${turkishToLatin(formatDate(order.orderDate))}`;
    doc.text(orderInfo, pageWidth - margin, 25, { align: 'right' });
    
    let yPos = 55;
    
    // Sipariş başlığı
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(headerSize);
    const title = language === 'tr' ? turkishToLatin('Sipariş Detayları') : 'Order Details';
    doc.text(title, margin, yPos);
    yPos += 15;
    
    // Müşteri bilgileri kutusu
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 30, 3, 3, 'F');
    
    // Müşteri bilgileri
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(normalSize);
    doc.text(language === 'tr' ? turkishToLatin('Müşteri Bilgileri') : 'Customer Information', margin + innerPadding, yPos + 10);
    
    doc.text(turkishToLatin(`${order.customerInfo.fullName}`), margin + innerPadding, yPos + 20);
    doc.text(`${order.customerInfo.email}`, pageWidth - margin - innerPadding, yPos + 20, { align: 'right' });
    
    yPos += 40;
    
    // Etkinlik bilgileri kutusu
    doc.setFillColor(248, 249, 250);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 30, 3, 3, 'F');
    
    // Etkinlik bilgileri
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(normalSize);
    doc.text(language === 'tr' ? turkishToLatin('Etkinlik Bilgileri') : 'Event Information', margin + innerPadding, yPos + 10);
    
    doc.text(turkishToLatin(eventName), margin + innerPadding, yPos + 20);
    
    // Tamamlandı durumu - yeşil badge
    doc.setFillColor(padokGreen[0], padokGreen[1], padokGreen[2]);
    const statusText = language === 'tr' ? turkishToLatin('Tamamlandı') : 'Completed';
    const statusWidth = doc.getTextWidth(statusText) + 10;
    doc.roundedRect(pageWidth - margin - innerPadding - statusWidth, yPos + 12, statusWidth, 8, 4, 4, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(smallSize);
    doc.text(statusText, pageWidth - margin - innerPadding - statusWidth/2, yPos + 17, { align: 'center' });
    
    yPos += 40;
    
    // Bilet tablosu başlığı
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(subheaderSize);
    doc.text(language === 'tr' ? turkishToLatin('Biletler') : 'Tickets', margin, yPos);
    yPos += 10;
    
    // Tablo başlıkları
    const tableTop = yPos;
    const tableWidth = pageWidth - (margin * 2);
    
    // Tablo başlık arkaplanı
    doc.setFillColor(padokBlue[0], padokBlue[1], padokBlue[2]);
    doc.rect(margin, yPos, tableWidth, 10, 'F');
    
    // Tablo kolonları
    const col1Width = tableWidth * 0.45; // Bilet Adı
    const col2Width = tableWidth * 0.20; // Fiyat
    const col3Width = tableWidth * 0.15; // Adet
    const col4Width = tableWidth * 0.20; // Toplam
    
    const col1X = margin;
    const col2X = col1X + col1Width;
    const col3X = col2X + col2Width;
    const col4X = col3X + col3Width;
    
    // Tablo başlık metinleri
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(normalSize);
    doc.text(language === 'tr' ? turkishToLatin('Bilet Tipi') : 'Ticket Type', col1X + 5, yPos + 7);
    doc.text(language === 'tr' ? turkishToLatin('Birim Fiyat') : 'Unit Price', col2X + 5, yPos + 7);
    doc.text(language === 'tr' ? turkishToLatin('Adet') : 'Quantity', col3X + 5, yPos + 7);
    doc.text(language === 'tr' ? turkishToLatin('Toplam') : 'Total', col4X + 5, yPos + 7);
    
    yPos += 10;
    
    // Bilet satırları
    doc.setTextColor(0, 0, 0);
    
    for (let i = 0; i < order.tickets.length; i++) {
      const ticket = order.tickets[i];
      const rowHeight = 12;
      
      // Satır arkaplanı (açık gri - alternatif)
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, tableWidth, rowHeight, 'F');
      }
      
      // Bilet adını al (dil tercihi ile) ve Türkçe karakterleri düzelt
      const ticketName = typeof ticket.name === 'object' 
        ? (ticket.name[language] || ticket.name.en || ticket.name.tr || 'Ticket')
        : ticket.name;
      
      // Bilet satır verileri - Türkçe karakter düzeltmesiyle
      doc.text(turkishToLatin(ticketName), col1X + 5, yPos + 8);
      doc.text(formatPriceForPDF(ticket.price), col2X + 5, yPos + 8);
      doc.text(ticket.quantity.toString(), col3X + 5, yPos + 8);
      
      // Toplam tutarı (normalde renkli yaparız ama PDF'de renk karmaşası olmaması için siyah)
      doc.text(formatPriceForPDF(ticket.price * ticket.quantity), col4X + 5, yPos + 8);
      
      yPos += rowHeight;
    }
    
    // Tablo çerçevesi
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(margin, tableTop, tableWidth, yPos - tableTop, 'S');
    
    // Dikey çizgiler
    doc.line(col2X, tableTop, col2X, yPos);
    doc.line(col3X, tableTop, col3X, yPos);
    doc.line(col4X, tableTop, col4X, yPos);
    
    yPos += 15;
    
    // Özet kısmı
    const summaryWidth = 80;
    const summaryX = pageWidth - margin - summaryWidth;
    
    // Ara toplam
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(normalSize);
    doc.text(language === 'tr' ? turkishToLatin('Ara Toplam:') : 'Subtotal:', summaryX, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.text(formatPriceForPDF(subtotal), pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;
    
    // KDV
    doc.setTextColor(100, 100, 100);
    doc.text(language === 'tr' ? turkishToLatin('KDV (%20):') : 'Tax (20%):', summaryX, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.text(formatPriceForPDF(tax), pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;
    
    // Ayırıcı çizgi
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(summaryX, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    // Genel Toplam
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(subheaderSize);
    doc.text(language === 'tr' ? turkishToLatin('Toplam:') : 'Total:', summaryX, yPos);
    
    doc.setTextColor(padokGreen[0], padokGreen[1], padokGreen[2]);
    doc.text(formatPriceForPDF(displayTotal), pageWidth - margin, yPos, { align: 'right' });
    
    // Footer
    const footerY = pageHeight - margin;
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(smallSize);
    doc.text(`Padok Club | ${turkishToLatin(formatDate(new Date().toISOString()))}`, pageWidth / 2, footerY, { align: 'center' });
    
    // Add QR Code or barcode placeholder (gelecekteki geliştirme için)
    
    // Save PDF
    const fileName = `padok-club-order-${orderId.substring(0, 8)}.pdf`;
    doc.save(fileName);
  };

  // Theme classes
  const textClass = isDark ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = isDark ? 'text-gray-300' : 'text-gray-500';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const cardClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const buttonSecondaryClass = isDark
    ? 'bg-carbon-grey hover:bg-graphite text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  const buttonPrimaryClass = 'bg-electric-blue hover:bg-blue-600 text-white';
  const buttonDangerClass = 'bg-red-600 hover:bg-red-700 text-white';

  if (loading) {
    return (
      <div className={`${cardClass} rounded-lg shadow p-8 flex items-center justify-center h-64`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={`mt-4 ${textClass}`}>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`${cardClass} rounded-lg shadow p-8`}>
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">{language === 'tr' ? 'Hata Oluştu' : 'Error Occurred'}</h2>
          <p>{error || (language === 'tr' ? 'Sipariş bulunamadı' : 'Order not found')}</p>
          <Link 
            href="/admin/reservations/events" 
            className="mt-4 inline-block px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600"
          >
            {language === 'tr' ? 'Tüm Siparişlere Dön' : 'Back to All Orders'}
          </Link>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalTicketQuantity = order.tickets.reduce((acc: number, ticket: any) => acc + ticket.quantity, 0);

  // Bilet bazlı gerçek toplam hesaplama (bilet adetleri x bilet fiyatlarına göre)
  const calculatedTotal = order.tickets.reduce((acc: number, ticket: any) => {
    return acc + (ticket.price * ticket.quantity);
  }, 0);

  // Sunucu verisini kullanmak yerine hesaplanmış değeri kullanıyoruz
  const displayTotal = calculatedTotal;
  const subtotal = displayTotal / 1.20; // Assuming 20% tax
  const tax = displayTotal - subtotal;

  // Get event name based on current language
  const eventName = typeof order.eventName === 'object' 
    ? (order.eventName[language] || order.eventName.en || order.eventName.tr || order.eventSlug)
    : order.eventSlug;

  return (
    <div className="space-y-4">
      {/* Page header with breadcrumb */}
      <div className="w-full bg-dark-grey dark:bg-carbon-grey rounded-lg shadow border border-carbon-grey p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className={`flex items-center space-x-1 ${textSecondaryClass} mb-1 text-xs whitespace-nowrap`}>
              <Link href="/admin/reservations/events" className="hover:underline">
                {language === 'tr' ? 'Etkinlik Siparişleri' : 'Event Orders'}
              </Link>
              <span>›</span>
              <span>#{orderId.substring(0, 8)}</span>
            </div>
            <h1 className={`text-xl font-bold ${textClass} whitespace-nowrap`}>
              {language === 'tr' ? 'Sipariş Detayları' : 'Order Details'}
            </h1>
          </div>
        </div>
      </div>

      <div className="w-full bg-dark-grey dark:bg-carbon-grey rounded-lg shadow border border-carbon-grey p-4">
        <div className="flex flex-row items-center justify-between">
          <div>
            <span className={`${textSecondaryClass} whitespace-nowrap text-xs`}>{language === 'tr' ? 'Sipariş No:' : 'Order ID:'}</span>
            <h2 className={`text-lg font-mono font-bold ${textClass} mt-1 whitespace-nowrap`}>#{orderId.substring(0, 8)}</h2>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs bg-neon-green/10 text-neon-green whitespace-nowrap`}>
            {language === 'tr' ? 'Tamamlandı' : 'Completed'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <h3 className={`text-xs font-medium ${textSecondaryClass} whitespace-nowrap`}>
              {language === 'tr' ? 'Sipariş Tarihi' : 'Order Date'}
            </h3>
            <p className={`${textClass} mt-1 text-xs whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
              {formatDate(order.orderDate)}
            </p>
          </div>
          <div>
            <h3 className={`text-xs font-medium ${textSecondaryClass} whitespace-nowrap`}>
              {language === 'tr' ? 'Toplam Tutar' : 'Total Amount'}
            </h3>
            <p className={`font-bold text-neon-green mt-1 whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.5vw)'}}>
              {formatPrice(displayTotal)}
            </p>
          </div>
          <div>
            <h3 className={`text-xs font-medium ${textSecondaryClass} whitespace-nowrap`}>
              {language === 'tr' ? 'Bilet Sayısı' : 'Ticket Count'}
            </h3>
            <p className={`${textClass} mt-1 text-xs whitespace-nowrap`}>
              {totalTicketQuantity}
            </p>
          </div>
        </div>
      </div>

      {/* Mobil ve masaüstü için farklı düzenler */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Etkinlik Bilgileri - mobilde 1. sıra */}
        <div className="sm:col-span-2 order-1">
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-4`}>
            <h3 className={`text-base font-medium ${textClass} mb-3 whitespace-nowrap`}>
              {language === 'tr' ? 'Etkinlik Bilgileri' : 'Event Details'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${textSecondaryClass} whitespace-nowrap`}>
                  {language === 'tr' ? 'Etkinlik Adı' : 'Event Name'}
                </p>
                <p className={`${textClass} font-medium whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                  {eventName}
                </p>
              </div>
              <div>
                <p className={`text-xs ${textSecondaryClass} whitespace-nowrap`}>
                  {language === 'tr' ? 'Etkinlik URL' : 'Event URL'}
                </p>
                <div className="mt-1 truncate">
                  <Link 
                    href={`/events/${order.eventSlug}`} 
                    target="_blank"
                    className="text-electric-blue hover:underline truncate block"
                    style={{fontSize: 'min(0.75rem, 2.2vw)'}}
                    title={`/events/${order.eventSlug}`}
                  >
                    /events/{order.eventSlug}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Müşteri Bilgileri - mobilde 2. sıra */}
        <div className="sm:col-span-1 order-2">
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-4`}>
            <h3 className={`text-base font-medium ${textClass} mb-3 whitespace-nowrap`}>
              {language === 'tr' ? 'Müşteri Bilgileri' : 'Customer Information'}
            </h3>
            <div className="space-y-3">
              <div>
                <p className={`text-xs ${textSecondaryClass} whitespace-nowrap`}>
                  {language === 'tr' ? 'İsim' : 'Name'}
                </p>
                <p className={`${textClass} font-medium whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.5vw)'}}>
                  {order.customerInfo.fullName}
                </p>
              </div>
              <div>
                <p className={`text-xs ${textSecondaryClass} whitespace-nowrap`}>
                  {language === 'tr' ? 'E-posta' : 'Email'}
                </p>
                <p className={`${textClass} whitespace-nowrap`} style={{fontSize: 'min(0.625rem, 2.2vw)'}}>
                  {order.customerInfo.email}
                </p>
              </div>
              {order.customerInfo.phone && (
                <div>
                  <p className={`text-xs ${textSecondaryClass} whitespace-nowrap`}>
                    {language === 'tr' ? 'Telefon' : 'Phone'}
                  </p>
                  <p className={`${textClass} whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.5vw)'}}>
                    {order.customerInfo.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bilet Bilgileri - mobilde 3. sıra */}
        <div className="sm:col-span-2 order-3">
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-4`}>
            <h3 className={`text-base font-medium ${textClass} mb-3 whitespace-nowrap`}>
              {language === 'tr' ? 'Bilet Bilgileri' : 'Ticket Details'}
            </h3>
            <div className="space-y-3">
              {order.tickets.map((ticket: any, index: number) => {
                // Get ticket name based on current language
                const ticketName = typeof ticket.name === 'object' 
                  ? (ticket.name[language] || ticket.name.en || ticket.name.tr || 'Ticket')
                  : ticket.name;
                
                return (
                  <div 
                    key={index} 
                    className={`flex flex-row items-center justify-between p-3 rounded-lg border ${borderClass} overflow-hidden`}
                  >
                    <div className="flex-grow min-w-0 mr-3">
                      <h4 className={`font-medium ${textClass} whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.5vw)'}}>
                        {ticketName}
                      </h4>
                      <div className={`mt-1 ${textSecondaryClass} whitespace-nowrap`} style={{fontSize: 'min(0.625rem, 2vw)'}}>
                        {language === 'tr' ? 'Birim Fiyat:' : 'Unit Price:'} {formatPrice(ticket.price)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <span className={`${textSecondaryClass} whitespace-nowrap`} style={{fontSize: 'min(0.625rem, 2vw)'}}>
                          {language === 'tr' ? 'Adet' : 'Quantity'}
                        </span>
                        <div className="text-center font-medium whitespace-nowrap" style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                          {ticket.quantity}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className={`${textSecondaryClass} whitespace-nowrap`} style={{fontSize: 'min(0.625rem, 2vw)'}}>
                          {language === 'tr' ? 'Toplam' : 'Total'}
                        </span>
                        <div className="text-center font-medium text-neon-green whitespace-nowrap" style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                          {formatPrice(ticket.price * ticket.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sipariş Özeti - mobilde 4. sıra */}
        <div className="sm:col-span-1 order-4">
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-4`}>
            <h3 className={`text-base font-medium ${textClass} mb-3 whitespace-nowrap`}>
              {language === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`${textSecondaryClass} whitespace-nowrap pr-2`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                  {language === 'tr' ? 'Ara Toplam' : 'Subtotal'}
                </span>
                <span className={`${textClass} whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`${textSecondaryClass} whitespace-nowrap pr-2`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                  {language === 'tr' ? 'KDV (%20)' : 'Tax (20%)'}
                </span>
                <span className={`${textClass} whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className={`font-bold ${textClass} whitespace-nowrap pr-2`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                  {language === 'tr' ? 'Toplam' : 'Total'}
                </span>
                <span className={`font-bold text-neon-green whitespace-nowrap`} style={{fontSize: 'min(0.75rem, 2.2vw)'}}>
                  {formatPrice(displayTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* PDF Generation button */}
          <div className="mt-4">
            <button
              className={`w-full px-3 py-2 rounded-md ${buttonPrimaryClass} flex justify-center items-center font-medium whitespace-nowrap`}
              style={{fontSize: 'min(0.75rem, 2.5vw)'}}
              onClick={generateOrderPDF}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {language === 'tr' ? 'Sipariş PDF İndir' : 'Download Order PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}