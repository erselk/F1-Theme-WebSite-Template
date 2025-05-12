'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllBookings, getBookingsStats } from '@/services/booking-service';
import Link from 'next/link';

export default function BookingsPage() {
  const { isDark, language } = useThemeLanguage();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalRevenue: number; totalPeople: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState({ field: 'startTime', direction: 'asc' });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const bookingsPerPage = 10;

  // Format price with proper Turkish/English formatting
  const formatPrice = (amount: number) => {
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

  // Format time range (start to end time)
  const formatTimeRange = (startTime: string, endTime: string) => {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    const startFormatted = startDate.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', options);
    const endFormatted = endDate.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', options);
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Fetch bookings and stats
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsResult, statsResult] = await Promise.all([
        getAllBookings(),
        getBookingsStats()
      ]);

      if (bookingsResult.success && statsResult.success) {
        setBookings(bookingsResult.data);
        setStats(statsResult.data);
      } else {
        setError(bookingsResult.error || statsResult.error || 'Veriler alınırken bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Veriler alınırken bir hata oluştu');
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

  // Handle filter checkboxes
  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => {
      const isActive = prev.includes(filter);
      if (isActive) {
        return prev.filter(f => f !== filter);
      } else {
        return [...prev, filter];
      }
    });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Apply date filters to the data
  const getFilteredBookingsByDate = (data: any[]) => {
    if (!activeFilters.length || !data || !data.length) return data;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Calculate date ranges for the filters
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 7); // Next 7 days
    
    const nextMonthEnd = new Date(today);
    nextMonthEnd.setDate(nextMonthEnd.getDate() + 30); // Next 30 days

    // Apply all active filters - show bookings that match ANY of the selected filters
    return data.filter((booking: any) => {
      const bookingDate = new Date(booking.startTime);
      
      // Check if booking matches any of the active filters
      return activeFilters.some(filter => {
        switch (filter) {
          case 'today':
            return bookingDate >= today && bookingDate < tomorrow;
          case 'tomorrow':
            return bookingDate >= tomorrow && bookingDate < nextDay;
          case 'thisWeek':
            return bookingDate >= today && bookingDate < nextWeekEnd;
          case 'thisMonth':
            return bookingDate >= today && bookingDate < nextMonthEnd;
          case 'past':
            return bookingDate < today;
          default:
            return false;
        }
      });
    });
  };

  // Filter and sort bookings - memoize to prevent infinite loop
  const filteredBookings = useMemo(() => {
    if (!bookings || !bookings.length) return [];
    
    // First apply search filter
    let result = bookings.filter((booking: any) => {
      if (!booking) return false;
      
      try {
        const searchLower = searchTerm.toLowerCase();
        return (
          (booking.name && booking.name.toLowerCase().includes(searchLower)) ||
          (booking.phone && booking.phone.toLowerCase().includes(searchLower)) ||
          (booking.venue && booking.venue.toLowerCase().includes(searchLower)) ||
          (booking.refNumber && booking.refNumber.toLowerCase().includes(searchLower)) ||
          (booking.totalPrice && booking.totalPrice.toString().includes(searchLower))
        );
      } catch (err) {
        console.error("Error filtering booking:", err);
        return false;
      }
    });
    
    // Then apply date filter if any are active
    if (activeFilters.length > 0) {
      result = getFilteredBookingsByDate(result);
    }
    
    // Finally sort the results
    return result.sort((a: any, b: any) => {
      let fieldA, fieldB;
      
      try {
        // Handle nested fields
        if (sorting.field === 'name') {
          fieldA = a.name;
          fieldB = b.name;
        } else if (sorting.field === 'venue') {
          fieldA = a.venue;
          fieldB = b.venue;
        } else {
          fieldA = a[sorting.field];
          fieldB = b[sorting.field];
        }
        
        // Handle date fields
        if (['startTime', 'endTime', 'createdAt'].includes(sorting.field)) {
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
        console.error("Error sorting bookings:", err);
        return 0;
      }
    });
  }, [bookings, searchTerm, sorting, activeFilters]);

  // Calculate pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  
  // Get current bookings with memoization
  const currentBookings = useMemo(() => {
    try {
      return filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
    } catch (err) {
      console.error("Error getting current bookings:", err);
      return [];
    }
  }, [filteredBookings, indexOfFirstBooking, indexOfLastBooking]);
  
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  // Çeviriler
  const t = {
    tr: {
      bookings: 'Mekan Rezervasyonları',
      manageReservations: 'Tüm mekan rezervasyonlarını yönetin',
      refresh: 'Yenile',
      totalBookings: 'Toplam Rezervasyon',
      totalRevenue: 'Toplam Gelir',
      totalPeople: 'Toplam Kişi',
      searchPlaceholder: 'İsim, telefon, alan veya referans ara...',
      venue: 'Alan',
      customer: 'Müşteri',
      date: 'Tarih',
      time: 'Saat',
      people: 'Kişi',
      amount: 'Tutar',
      status: 'Durum',
      actions: 'İşlemler',
      loading: 'Yükleniyor...',
      error: 'Hata Oluştu',
      noMatch: 'Aramanızla eşleşen rezervasyon bulunamadı.',
      noBookingsYet: 'Henüz rezervasyon bulunmuyor.',
      showAll: 'Tüm rezervasyonları göster',
      showing: 'gösteriliyor',
      today: 'Bugün',
      tomorrow: 'Yarın', 
      thisWeek: 'Bu Hafta',
      thisMonth: 'Bu Ay',
      past: 'Geçmiş'
    },
    en: {
      bookings: 'Venue Reservations',
      manageReservations: 'Manage all venue reservations',
      refresh: 'Refresh',
      totalBookings: 'Total Reservations',
      totalRevenue: 'Total Revenue',
      totalPeople: 'Total People',
      searchPlaceholder: 'Search by name, phone, venue or reference...',
      venue: 'Venue',
      customer: 'Customer',
      date: 'Date',
      time: 'Time',
      people: 'People',
      amount: 'Amount',
      status: 'Status',
      actions: 'Actions',
      loading: 'Loading...',
      error: 'Error Occurred',
      noMatch: 'No reservations match your search.',
      noBookingsYet: 'No reservations found yet.',
      showAll: 'Show all reservations',
      showing: 'Showing',
      today: 'Today',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      past: 'Past'
    }
  };

  // Dil seçimi
  const strings = language === 'tr' ? t.tr : t.en;

  // Rezervasyon durumlarını formatlama
  const getStatusBadge = (status: string) => {
    let bgColor = '';
    let textColor = '';
    let statusText = status;

    switch(status) {
      case 'CONFIRMED':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        statusText = language === 'tr' ? 'Onaylandı' : 'Confirmed';
        break;
      case 'PENDING':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        statusText = language === 'tr' ? 'Beklemede' : 'Pending';
        break;
      case 'CANCELLED':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        statusText = language === 'tr' ? 'İptal Edildi' : 'Cancelled';
        break;
      case 'COMPLETED':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        statusText = language === 'tr' ? 'Tamamlandı' : 'Completed';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        statusText = status;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {statusText}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`${cardClass} rounded-lg shadow p-8 flex items-center justify-center h-64`}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className={`mt-4 ${textClass}`}>{strings.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${cardClass} rounded-lg shadow p-8`}>
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">{strings.error}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>
            {strings.bookings}
          </h1>
          <p className={textSecondaryClass}>
            {strings.manageReservations}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-md text-sm ${buttonSecondaryClass}`}
            onClick={fetchData}
          >
            {strings.refresh}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalBookings}
          </h3>
          <p className="text-3xl font-bold text-electric-blue mt-2">
            {stats?.totalBookings || 0}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalRevenue}
          </h3>
          <p className="text-3xl font-bold text-neon-green mt-2">
            {formatPrice(stats?.totalRevenue || 0)}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-6 border ${borderClass}`}>
          <h3 className={`text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalPeople}
          </h3>
          <p className="text-3xl font-bold text-neon-red mt-2">
            {stats?.totalPeople || 0}
          </p>
        </div>
      </div>

      {/* Filters and controls */}
      <div className={`${cardClass} rounded-lg shadow p-4 border ${borderClass}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <input
              type="text"
              placeholder={strings.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full sm:w-80 px-4 py-2 rounded-md border ${borderClass} ${isDark ? 'bg-graphite text-white' : 'bg-white text-gray-800'}`}
            />
          </div>
          
          {/* Date filter checkboxes */}
          <div className="flex flex-wrap gap-2">
            <label className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
              activeFilters.includes('today') ? buttonPrimaryClass : buttonSecondaryClass
            }`}>
              <input 
                type="checkbox" 
                checked={activeFilters.includes('today')}
                onChange={() => handleFilterToggle('today')}
                className="form-checkbox h-4 w-4 rounded"
              />
              {strings.today}
            </label>
            
            <label className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
              activeFilters.includes('tomorrow') ? buttonPrimaryClass : buttonSecondaryClass
            }`}>
              <input 
                type="checkbox" 
                checked={activeFilters.includes('tomorrow')}
                onChange={() => handleFilterToggle('tomorrow')}
                className="form-checkbox h-4 w-4 rounded"
              />
              {strings.tomorrow}
            </label>
            
            <label className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
              activeFilters.includes('thisWeek') ? buttonPrimaryClass : buttonSecondaryClass
            }`}>
              <input 
                type="checkbox" 
                checked={activeFilters.includes('thisWeek')}
                onChange={() => handleFilterToggle('thisWeek')}
                className="form-checkbox h-4 w-4 rounded"
              />
              {strings.thisWeek}
            </label>
            
            <label className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
              activeFilters.includes('thisMonth') ? buttonPrimaryClass : buttonSecondaryClass
            }`}>
              <input 
                type="checkbox" 
                checked={activeFilters.includes('thisMonth')}
                onChange={() => handleFilterToggle('thisMonth')}
                className="form-checkbox h-4 w-4 rounded"
              />
              {strings.thisMonth}
            </label>
            
            <label className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm ${
              activeFilters.includes('past') ? buttonPrimaryClass : buttonSecondaryClass
            }`}>
              <input 
                type="checkbox" 
                checked={activeFilters.includes('past')}
                onChange={() => handleFilterToggle('past')}
                className="form-checkbox h-4 w-4 rounded"
              />
              {strings.past}
            </label>
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className={`${cardClass} rounded-lg shadow border ${borderClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeaderClass}>
              <tr>
                <th className="px-4 py-3 text-left">
                  <button 
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort('venue')}
                  >
                    <span>{strings.venue}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort('name')}
                  >
                    <span>{strings.customer}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button 
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort('startTime')}
                  >
                    <span>{strings.date}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span>{strings.time}</span>
                </th>
                <th className="px-4 py-3 text-center">
                  <button 
                    className="flex items-center focus:outline-none"
                    onClick={() => handleSort('people')}
                  >
                    <span>{strings.people}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-right">
                  <button 
                    className="flex items-center focus:outline-none ml-auto"
                    onClick={() => handleSort('totalPrice')}
                  >
                    <span>{strings.amount}</span>
                  </button>
                </th>
                <th className="px-4 py-3 text-center">
                  <button 
                    className="flex items-center focus:outline-none mx-auto"
                    onClick={() => handleSort('status')}
                  >
                    <span>{strings.status}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className={textClass}>
              {currentBookings.length > 0 ? (
                currentBookings.map((booking: any) => (
                  <tr 
                    key={booking.refNumber} 
                    className={`border-t ${borderClass} ${tableRowHoverClass}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {booking.venue}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{booking.name}</div>
                        {booking.phone && (
                          <div className={`text-sm ${textSecondaryClass}`}>{booking.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(booking.startTime)}
                    </td>
                    <td className="px-4 py-3">
                      {formatTimeRange(booking.startTime, booking.endTime)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {booking.people}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-neon-green">
                      {formatPrice(booking.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className={`${textSecondaryClass} text-lg`}>
                      {searchTerm || activeFilters.length > 0
                        ? strings.noMatch
                        : strings.noBookingsYet}
                    </div>
                    <div className="mt-2">
                      <button
                        className={`text-electric-blue hover:underline`}
                        onClick={() => {
                          setSearchTerm('');
                          setActiveFilters([]);
                          fetchData();
                        }}
                      >
                        {strings.showAll}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBookings.length > bookingsPerPage && (
          <div className={`px-4 py-3 border-t ${borderClass} flex items-center justify-between`}>
            <div className={textSecondaryClass}>
              {language === 'tr' 
                ? `${indexOfFirstBooking + 1}-${Math.min(indexOfLastBooking, filteredBookings.length)} / ${filteredBookings.length} rezervasyon ${strings.showing}`
                : `${strings.showing} ${indexOfFirstBooking + 1}-${Math.min(indexOfLastBooking, filteredBookings.length)} of ${filteredBookings.length} reservations`}
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