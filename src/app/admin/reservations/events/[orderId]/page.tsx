'use client';

import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getEventOrderById, deleteEventOrder } from '@/services/event-orders-service';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function OrderDetailPage() {
  // useParams hook kullanarak params'ı Promise problemi olmadan alıyoruz
  const params = useParams();
  const orderId = params.orderId as string;
  
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

  // Handle order deletion
  const handleDeleteOrder = async () => {
    if (confirm(language === 'tr' ? 'Bu siparişi silmek istediğinizden emin misiniz?' : 'Are you sure you want to delete this order?')) {
      try {
        const result = await deleteEventOrder(orderId);
        if (result.success) {
          router.push('/admin/reservations/events');
        } else {
          alert(result.error || 'Failed to delete order');
        }
      } catch (err: any) {
        alert(err.message || 'An error occurred while deleting the order');
      }
    }
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
    <div className="space-y-6">
      {/* Page header with breadcrumb and actions */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className={`flex items-center space-x-1 ${textSecondaryClass} mb-1`}>
              <Link href="/admin/reservations/events" className="hover:underline">
                {language === 'tr' ? 'Etkinlik Siparişleri' : 'Event Orders'}
              </Link>
              <span>›</span>
              <span>#{orderId.substring(0, 8)}</span>
            </div>
            <h1 className={`text-2xl font-bold ${textClass}`}>
              {language === 'tr' ? 'Sipariş Detayları' : 'Order Details'}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/admin/reservations/events')}
              className={`px-3 py-1.5 rounded-md text-sm ${buttonSecondaryClass}`}
            >
              {language === 'tr' ? 'Geri Dön' : 'Go Back'}
            </button>
            <button
              onClick={handleDeleteOrder}
              className={`px-3 py-1.5 rounded-md text-sm ${buttonDangerClass}`}
            >
              {language === 'tr' ? 'Siparişi Sil' : 'Delete Order'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order details */}
        <div className="lg:col-span-2">
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} overflow-hidden`}>
            <div className="p-6 border-b border-carbon-grey">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <span className={textSecondaryClass}>{language === 'tr' ? 'Sipariş No:' : 'Order ID:'}</span>
                  <h2 className={`text-xl font-mono font-bold ${textClass} mt-1`}>#{orderId.substring(0, 8)}</h2>
                </div>
                <div className={`inline-flex items-center px-3 py-1 mt-2 sm:mt-0 rounded-full text-sm ${
                  "bg-neon-green/10 text-neon-green"
                }`}>
                  {language === 'tr' ? 'Tamamlandı' : 'Completed'}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                <div>
                  <h3 className={`text-sm font-medium ${textSecondaryClass}`}>
                    {language === 'tr' ? 'Sipariş Tarihi' : 'Order Date'}
                  </h3>
                  <p className={`${textClass} mt-1`}>
                    {formatDate(order.orderDate)}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${textSecondaryClass}`}>
                    {language === 'tr' ? 'Toplam Tutar' : 'Total Amount'}
                  </h3>
                  <p className={`font-bold text-neon-green mt-1`}>
                    {formatPrice(displayTotal)}
                  </p>
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${textSecondaryClass}`}>
                    {language === 'tr' ? 'Bilet Sayısı' : 'Ticket Count'}
                  </h3>
                  <p className={`${textClass} mt-1`}>
                    {totalTicketQuantity}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-6 border-b border-carbon-grey">
              <h3 className={`text-lg font-medium ${textClass} mb-4`}>
                {language === 'tr' ? 'Etkinlik Bilgileri' : 'Event Details'}
              </h3>
              <div>
                <div className="flex flex-col">
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                    <div className="space-y-1.5">
                      <p className={`text-sm ${textSecondaryClass}`}>
                        {language === 'tr' ? 'Etkinlik Adı' : 'Event Name'}
                      </p>
                      <p className={`${textClass} font-medium`}>{eventName}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className={`text-sm ${textSecondaryClass}`}>
                        {language === 'tr' ? 'Etkinlik URL' : 'Event URL'}
                      </p>
                      <div>
                        <Link 
                          href={`/events/${order.eventSlug}`} 
                          target="_blank"
                          className="text-electric-blue hover:underline"
                        >
                          /events/{order.eventSlug}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="p-6">
              <h3 className={`text-lg font-medium ${textClass} mb-4`}>
                {language === 'tr' ? 'Bilet Bilgileri' : 'Ticket Details'}
              </h3>
              <div className="space-y-6">
                {order.tickets.map((ticket: any, index: number) => {
                  // Get ticket name based on current language
                  const ticketName = typeof ticket.name === 'object' 
                    ? (ticket.name[language] || ticket.name.en || ticket.name.tr || 'Ticket')
                    : ticket.name;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border ${borderClass}`}
                    >
                      <div>
                        <h4 className={`font-medium ${textClass}`}>{ticketName}</h4>
                        <div className={`mt-1 ${textSecondaryClass} text-sm`}>
                          {language === 'tr' ? 'Birim Fiyat:' : 'Unit Price:'} {formatPrice(ticket.price)}
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                        <div>
                          <span className={`${textSecondaryClass} text-sm`}>
                            {language === 'tr' ? 'Adet' : 'Quantity'}
                          </span>
                          <div className="mt-1 text-center font-medium">
                            {ticket.quantity}
                          </div>
                        </div>
                        <div>
                          <span className={`${textSecondaryClass} text-sm`}>
                            {language === 'tr' ? 'Toplam' : 'Total'}
                          </span>
                          <div className="mt-1 text-center font-medium text-neon-green">
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
        </div>

        {/* Customer info and order summary */}
        <div>
          {/* Customer Info */}
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-6 mb-6`}>
            <h3 className={`text-lg font-medium ${textClass} mb-4`}>
              {language === 'tr' ? 'Müşteri Bilgileri' : 'Customer Information'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>
                  {language === 'tr' ? 'İsim' : 'Name'}
                </p>
                <p className={`${textClass} font-medium`}>{order.customerInfo.fullName}</p>
              </div>
              <div>
                <p className={`text-sm ${textSecondaryClass}`}>
                  {language === 'tr' ? 'E-posta' : 'Email'}
                </p>
                <p className={`${textClass}`}>{order.customerInfo.email}</p>
              </div>
              {order.customerInfo.phone && (
                <div>
                  <p className={`text-sm ${textSecondaryClass}`}>
                    {language === 'tr' ? 'Telefon' : 'Phone'}
                  </p>
                  <p className={`${textClass}`}>{order.customerInfo.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className={`${cardClass} rounded-lg shadow border ${borderClass} p-6`}>
            <h3 className={`text-lg font-medium ${textClass} mb-4`}>
              {language === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={textSecondaryClass}>
                  {language === 'tr' ? 'Ara Toplam' : 'Subtotal'}
                </span>
                <span className={textClass}>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className={textSecondaryClass}>
                  {language === 'tr' ? 'KDV (%20)' : 'Tax (20%)'}
                </span>
                <span className={textClass}>{formatPrice(tax)}</span>
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between">
                <span className={`font-bold ${textClass}`}>
                  {language === 'tr' ? 'Toplam' : 'Total'}
                </span>
                <span className={`font-bold text-neon-green`}>
                  {formatPrice(displayTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Download/Print buttons */}
          <div className="flex flex-col space-y-2 mt-6">
            <button
              className={`w-full px-4 py-2 rounded-md ${buttonPrimaryClass} text-sm flex justify-center items-center`}
              onClick={() => window.print()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              {language === 'tr' ? 'Siparişi Yazdır' : 'Print Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}