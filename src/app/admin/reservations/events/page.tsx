'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllEventOrders, getEventOrdersStats } from '@/services/event-orders-service';
import Link from 'next/link';

export default function EventOrdersPage() {
  const { isDark, language } = useThemeLanguage();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState<{ totalOrders: number; totalRevenue: number; totalTickets: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState({ field: 'orderDate', direction: 'desc' });
  const ordersPerPage = 10;

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch orders and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersResult, statsResult] = await Promise.all([
        getAllEventOrders(),
        getEventOrdersStats()
      ]);

      if (ordersResult.success && statsResult.success) {
        setOrders(ordersResult.data);
        setStats(statsResult.data);
      } else {
        setError(ordersResult.error || statsResult.error || 'An error occurred while fetching data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle sorting
  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort orders - memoize to prevent infinite loop
  const filteredOrders = useMemo(() => {
    if (!orders || !orders.length) return [];
    
    return orders
      .filter((order: any) => {
        if (!order) return false;
        
        try {
          const searchLower = searchTerm.toLowerCase();
          return (
            // Sipariş no kaldırıldı, şu alanları arayacağız:
            // - Müşteri adı
            // - Email adresi
            // - Telefon numarası
            // - Etkinlik adı
            // - Bilet tutarı (sayısal değer)
            (order.customerInfo && order.customerInfo.fullName && 
              order.customerInfo.fullName.toLowerCase().includes(searchLower)) ||
            (order.customerInfo && order.customerInfo.email && 
              order.customerInfo.email.toLowerCase().includes(searchLower)) ||
            (order.customerInfo && order.customerInfo.phone && 
              order.customerInfo.phone.toLowerCase().includes(searchLower)) ||
            (typeof order.eventName === 'object' && (
              (order.eventName.tr && order.eventName.tr.toLowerCase().includes(searchLower)) ||
              (order.eventName.en && order.eventName.en.toLowerCase().includes(searchLower))
            )) ||
            // Bilet tutarı araması - önce hesaplıyoruz
            (() => {
              if (isNaN(parseFloat(searchLower))) return false; // Sayısal değer değilse atla
              const ticketTotal = order.tickets?.reduce((sum: number, ticket: any) => 
                sum + (ticket.price * ticket.quantity), 0) || 0;
              return ticketTotal.toString().includes(searchLower);
            })()
          );
        } catch (err) {
          console.error("Error filtering order:", err);
          return false;
        }
      })
      .sort((a: any, b: any) => {
        let fieldA, fieldB;
        
        try {
          // Handle nested fields
          if (sorting.field === 'customerName') {
            fieldA = a.customerInfo?.fullName;
            fieldB = b.customerInfo?.fullName;
          } else if (sorting.field === 'eventName') {
            fieldA = typeof a.eventName === 'object' ? (a.eventName[language] || a.eventName.en || a.eventName.tr) : a.eventName;
            fieldB = typeof b.eventName === 'object' ? (b.eventName[language] || b.eventName.en || b.eventName.tr) : b.eventName;
          } else {
            fieldA = a[sorting.field];
            fieldB = b[sorting.field];
          }
          
          // Handle date fields
          if (sorting.field === 'orderDate') {
            fieldA = new Date(fieldA || 0).getTime();
            fieldB = new Date(fieldB || 0).getTime();
          }
          
          // Handle undefined values
          if (fieldA === undefined && fieldB === undefined) return 0;
          if (fieldA === undefined) return 1;
          if (fieldB === undefined) return -1;
          
          // Sorting direction
          return sorting.direction === 'asc'
            ? fieldA > fieldB ? 1 : -1
            : fieldA < fieldB ? 1 : -1;
        } catch (err) {
          console.error("Error sorting orders:", err);
          return 0;
        }
      });
  }, [orders, searchTerm, sorting, language]);

  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  
  // Get current orders with memoization
  const currentOrders = useMemo(() => {
    try {
      return filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    } catch (err) {
      console.error("Error getting current orders:", err);
      return [];
    }
  }, [filteredOrders, indexOfFirstOrder, indexOfLastOrder]);
  
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ... rest of the component
  // Theme classes
  const bgClass = isDark ? 'bg-graphite' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = isDark ? 'text-gray-300' : 'text-gray-500';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const cardClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const tableHeaderClass = isDark ? 'bg-carbon-grey text-silver' : 'bg-gray-50 text-gray-600';
  const tableRowHoverClass = isDark ? 'hover:bg-graphite' : 'hover:bg-gray-50';
  const buttonPrimaryClass = 'bg-electric-blue hover:bg-blue-600 text-white';
  const buttonSecondaryClass = isDark
    ? 'bg-carbon-grey hover:bg-graphite text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
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

  if (error) {
    return (
      <div className={`${cardClass} rounded-lg shadow p-8`}>
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">{language === 'tr' ? 'Hata Oluştu' : 'Error Occurred'}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // ... rest of the UI
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>
            {language === 'tr' ? 'Etkinlik Siparişleri' : 'Event Orders'}
          </h1>
          <p className={textSecondaryClass}>
            {language === 'tr' ? 'Tüm etkinlik siparişlerini ve rezervasyonlarını yönetin' : 'Manage all event orders and reservations'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-md text-sm ${buttonSecondaryClass}`}
            onClick={fetchData}
          >
            {language === 'tr' ? 'Yenile' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {language === 'tr' ? 'Toplam Sipariş' : 'Total Orders'}
          </h3>
          <p className="text-3xl font-bold text-electric-blue mt-2">
            {stats?.totalOrders || 0}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {language === 'tr' ? 'Toplam Gelir' : 'Total Revenue'}
          </h3>
          <p className="text-3xl font-bold text-neon-green mt-2">
            {formatPrice(stats?.totalRevenue || 0)}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {language === 'tr' ? 'Toplam Bilet' : 'Total Tickets'}
          </h3>
          <p className="text-3xl font-bold text-neon-red mt-2">
            {stats?.totalTickets || 0}
          </p>
        </div>
      </div>

      {/* Filters and controls */}
      <div className={`${cardClass} rounded-lg shadow p-4 border ${borderClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder={language === 'tr' ? 'Müşteri, e-posta, telefon, etkinlik veya tutar ara...' : 'Search by customer, email, phone, event or amount...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full sm:w-80 px-4 py-2 rounded-md border ${borderClass} ${isDark ? 'bg-graphite text-white' : 'bg-white text-gray-800'}`}
            />
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className={`${cardClass} rounded-lg shadow border ${borderClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <span>{language === 'tr' ? 'Etkinlik' : 'Event'}</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span>{language === 'tr' ? 'Müşteri' : 'Customer'}</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span>{language === 'tr' ? 'Biletler' : 'Tickets'}</span>
                </th>
                <th className="px-4 py-3 text-right">
                  <span>{language === 'tr' ? 'Tutar' : 'Amount'}</span>
                </th>
                <th className="px-4 py-3 text-right">{language === 'tr' ? 'İşlemler' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className={textClass}>
              {currentOrders.length > 0 ? (
                currentOrders.map((order: any) => (
                  <tr 
                    key={order.orderId} 
                    className={`border-t ${borderClass} ${tableRowHoverClass}`}
                  >
                    <td className="px-4 py-3">
                      {/* Etkinlik adını artık tıklanmadan düz metin olarak gösteriyorum */}
                      <div className="font-medium">
                        {typeof order.eventName === 'object' 
                          ? (order.eventName[language] || order.eventName.en || order.eventName.tr || order.eventSlug) 
                          : order.eventSlug}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{order.customerInfo?.fullName}</div>
                        <div className={`text-sm ${textSecondaryClass}`}>{order.customerInfo?.email}</div>
                        {order.customerInfo?.phone && (
                          <div className={`text-sm ${textSecondaryClass}`}>{order.customerInfo.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-1">
                        {order.tickets.map((ticket: any, idx: number) => {
                          // Bilet adını doğru şekilde gösterme
                          const ticketName = typeof ticket.name === 'object' 
                            ? (ticket.name[language] || ticket.name.en || ticket.name.tr || 'Ticket')
                            : ticket.name;
                          
                          return (
                            <li key={idx} className="text-sm">
                              {ticketName} <span className="font-medium">x{ticket.quantity}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neon-green">
                      {formatPrice(order.tickets.reduce((total: number, ticket: any) => total + (ticket.price * ticket.quantity), 0))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/reservations/events/${order.orderId}`}
                          className={`px-3 py-1 rounded-md text-sm ${buttonPrimaryClass}`}
                        >
                          {language === 'tr' ? 'Detay' : 'Details'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className={`${textSecondaryClass} text-lg`}>
                      {searchTerm
                        ? (language === 'tr' ? 'Aramanızla eşleşen sipariş bulunamadı.' : 'No orders match your search.')
                        : (language === 'tr' ? 'Henüz sipariş bulunmuyor.' : 'No orders found yet.')}
                    </div>
                    <div className="mt-2">
                      <button
                        className={`text-electric-blue hover:underline`}
                        onClick={() => {
                          setSearchTerm('');
                          fetchData();
                        }}
                      >
                        {language === 'tr' ? 'Tüm siparişleri göster' : 'Show all orders'}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <div className={`px-4 py-3 border-t ${borderClass} flex items-center justify-between`}>
            <div className={textSecondaryClass}>
              {language === 'tr' 
                ? `${indexOfFirstOrder + 1}-${Math.min(indexOfLastOrder, filteredOrders.length)} / ${filteredOrders.length} sipariş gösteriliyor`
                : `Showing ${indexOfFirstOrder + 1}-${Math.min(indexOfLastOrder, filteredOrders.length)} of ${filteredOrders.length} orders`}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
              >
                «
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
              >
                ‹
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Show current page, and 1 page before and after
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`px-3 py-1 rounded-md ${
                        pageNumber === currentPage
                          ? 'bg-electric-blue text-white'
                          : buttonSecondaryClass
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                // Show dots for skipped pages
                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return <span key={pageNumber} className="px-3 py-1">…</span>;
                }
                return null;
              })}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
              >
                ›
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}