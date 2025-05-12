'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllBookings, getBookingsStats } from '@/services/booking-service';
import Link from 'next/link';

export default function BookingsPage() {
  const { isDark, language } = useThemeLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalRevenue: number; totalPeople: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
        setBookings(bookingsResult.data || []);
        setStats(statsResult.data || null);
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

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
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
        if (a.venue && b.venue) {
          fieldA = a.venue;
          fieldB = b.venue;
        } else if (a.name && b.name) {
          fieldA = a.name;
          fieldB = b.name;
        } else if (a.totalPrice && b.totalPrice) {
          fieldA = a.totalPrice;
          fieldB = b.totalPrice;
        } else {
          fieldA = a.startTime;
          fieldB = b.startTime;
        }
        
        // Handle date fields
        if (['startTime', 'endTime', 'createdAt'].includes(fieldA)) {
          fieldA = new Date(fieldA || 0).getTime();
        }
        if (['startTime', 'endTime', 'createdAt'].includes(fieldB)) {
          fieldB = new Date(fieldB || 0).getTime();
        }
        
        // Handle undefined values
        if (fieldA === undefined && fieldB === undefined) return 0;
        if (fieldA === undefined) return 1;
        if (fieldB === undefined) return -1;
        
        // Sorting direction
        return fieldA > fieldB ? 1 : -1;
      } catch (err) {
        console.error("Error sorting bookings:", err);
        return 0;
      }
    });
  }, [bookings, searchTerm, activeFilters]);

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
  const mobileFiltersBgClass = isDark ? 'bg-carbon-grey' : 'bg-gray-100';

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
      past: 'Geçmiş',
      filters: 'Filtreler',
      dateFilters: 'Tarih Filtreleri',
      apply: 'Uygula',
      clear: 'Temizle'
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
      past: 'Past',
      filters: 'Filters',
      dateFilters: 'Date Filters',
      apply: 'Apply',
      clear: 'Clear'
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
    <div className="space-y-4 md:space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div>
          <h1 className={`text-lg md:text-xl font-bold ${textClass}`}>
            {language === 'tr' ? 'Mekan Siparişleri' : 'Venue Bookings'}
          </h1>
          <p className={`text-xs md:text-sm ${textSecondaryClass}`}>
            {language === 'tr' ? 'Tüm mekan siparişlerini ve rezervasyonlarını yönetin' : 'Manage all venue bookings and reservations'}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className={`${cardClass} rounded-lg shadow p-3 md:p-6 border ${borderClass}`}>
          <h3 className={`text-xs md:text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalBookings}
          </h3>
          <p className="text-xl md:text-3xl font-bold text-electric-blue mt-1 md:mt-2">
            {stats?.totalBookings || 0}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 md:p-6 border ${borderClass}`}>
          <h3 className={`text-xs md:text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalRevenue}
          </h3>
          <p className="text-xl md:text-3xl font-bold text-neon-green mt-1 md:mt-2">
            {formatPrice(stats?.totalRevenue || 0)}
          </p>
        </div>
        <div className={`${cardClass} rounded-lg shadow p-3 md:p-6 border ${borderClass}`}>
          <h3 className={`text-xs md:text-lg font-medium ${textSecondaryClass}`}>
            {strings.totalPeople}
          </h3>
          <p className="text-xl md:text-3xl font-bold text-neon-red mt-1 md:mt-2">
            {stats?.totalPeople || 0}
          </p>
        </div>
      </div>
      
      {/* Mobil filtreler tek satır */}
      <div className="md:hidden flex items-center gap-2 mt-2">
        {/* Filtreler ikonu */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className={`p-2 rounded-md ${buttonSecondaryClass} flex items-center justify-center`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>

        {/* Filtre işlemleri - koşullu görünüm yerine her zaman göster */}
        {showMobileFilters && (
          <>
            {/* Arama - daha dar */}
            <div className="flex-1">
              <input
                type="text"
                placeholder={language === 'tr' ? 'Ara...' : 'Search...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-md border ${borderClass} ${isDark ? 'bg-graphite text-white' : 'bg-white text-gray-800'} text-xs`}
              />
            </div>
            
            {/* Date Filters - Dropdown button */}
            <div className="relative">
              <button 
                type="button" 
                className={`px-3 py-1.5 rounded-md text-xs ${isDark ? 'bg-carbon-grey text-white' : 'bg-gray-100 text-gray-700'} flex items-center`}
                onClick={(e) => {
                  const dropdown = document.getElementById('mobileDateFilterDropdown');
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                  e.stopPropagation();
                }}
              >
                <span>{strings.dateFilters}</span>
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu - Direkt hex renk kodu kullanma */}
              <div 
                id="mobileDateFilterDropdown" 
                className="hidden absolute right-0 mt-1 z-50 w-48 rounded-md shadow-xl overflow-hidden bg-[#1e1e1e] border border-gray-700"
              >
                <div className="p-3 rounded-md space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-white">
                      {strings.dateFilters}
                    </span>
                    {activeFilters.length > 0 && (
                      <button 
                        onClick={() => {
                          setActiveFilters([]);
                          document.getElementById('mobileDateFilterDropdown')?.classList.add('hidden');
                        }}
                        className="text-xs text-electric-blue"
                      >
                        {strings.clear}
                      </button>
                    )}
                  </div>
                  {['today', 'tomorrow', 'thisWeek', 'thisMonth', 'past'].map((filter) => (
                    <div key={filter} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`mobile-${filter}`}
                        checked={activeFilters.includes(filter)}
                        onChange={() => handleFilterToggle(filter)}
                        className="rounded text-electric-blue focus:ring-electric-blue h-4 w-4"
                      />
                      <label 
                        htmlFor={`mobile-${filter}`} 
                        className="ml-2 text-xs text-white"
                      >
                        {strings[filter as keyof typeof strings]}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Aktif filtreler sayısı */}
        {activeFilters.length > 0 && (
          <div className="flex items-center justify-center bg-electric-blue text-white rounded-full w-5 h-5 text-xs">
            {activeFilters.length}
          </div>
        )}
      </div>

      {/* Desktop Search and filters */}
      <div className={`hidden md:block ${cardClass} rounded-lg shadow p-4 border ${borderClass}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>
              {language === 'tr' ? 'Arama' : 'Search'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className={`block w-full pl-10 pr-3 py-2 border ${borderClass} rounded-md focus:ring-electric-blue focus:border-electric-blue text-sm ${
                  isDark ? 'bg-dark-grey text-white' : 'bg-white text-gray-900'
                }`}
                placeholder={language === 'tr' ? 'Müşteri adı, telefon, mekan...' : 'Customer name, phone, venue...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset page when search changes
                }}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${textSecondaryClass} mb-1`}>
              {language === 'tr' ? 'Tarih Filtresi' : 'Date Filter'}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterToggle('today')}
                className={`px-3 py-1 rounded-md text-sm border border-white/70 ${
                  activeFilters.includes('today')
                    ? buttonPrimaryClass
                    : `${buttonSecondaryClass} hover:bg-electric-blue hover:text-white`
                }`}
              >
                {language === 'tr' ? 'Bugün' : 'Today'}
              </button>
              <button
                onClick={() => handleFilterToggle('tomorrow')}
                className={`px-3 py-1 rounded-md text-sm border border-white/70 ${
                  activeFilters.includes('tomorrow')
                    ? buttonPrimaryClass
                    : `${buttonSecondaryClass} hover:bg-electric-blue hover:text-white`
                }`}
              >
                {language === 'tr' ? 'Yarın' : 'Tomorrow'}
              </button>
              <button
                onClick={() => handleFilterToggle('thisWeek')}
                className={`px-3 py-1 rounded-md text-sm border border-white/70 ${
                  activeFilters.includes('thisWeek')
                    ? buttonPrimaryClass
                    : `${buttonSecondaryClass} hover:bg-electric-blue hover:text-white`
                }`}
              >
                {language === 'tr' ? 'Bu Hafta' : 'This Week'}
              </button>
              <button
                onClick={() => handleFilterToggle('thisMonth')}
                className={`px-3 py-1 rounded-md text-sm border border-white/70 ${
                  activeFilters.includes('thisMonth')
                    ? buttonPrimaryClass
                    : `${buttonSecondaryClass} hover:bg-electric-blue hover:text-white`
                }`}
              >
                {language === 'tr' ? 'Bu Ay' : 'This Month'}
              </button>
              <button
                onClick={() => handleFilterToggle('past')}
                className={`px-3 py-1 rounded-md text-sm border border-white/70 ${
                  activeFilters.includes('past')
                    ? buttonPrimaryClass
                    : `${buttonSecondaryClass} hover:bg-electric-blue hover:text-white`
                }`}
              >
                {language === 'tr' ? 'Geçmiş' : 'Past'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings table */}
      <div className={`${cardClass} rounded-lg shadow border ${borderClass} overflow-hidden`}>
        {filteredBookings.length === 0 ? (
          <div className="p-6 md:p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className={`text-base md:text-lg font-medium ${textClass} mb-1`}>
              {language === 'tr' ? 'Rezervasyon bulunamadı' : 'No bookings found'}
            </h3>
            <p className={`text-sm ${textSecondaryClass}`}>
              {language === 'tr' 
                ? searchTerm || activeFilters.length
                  ? 'Arama kriterlerinize uygun rezervasyon bulunamadı. Filtreleri temizleyip tekrar deneyin.' 
                  : 'Henüz rezervasyon bulunmuyor.'
                : searchTerm || activeFilters.length
                  ? 'No bookings matching your search criteria. Clear filters and try again.' 
                  : 'No bookings have been made yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tableHeaderClass}>
                <tr>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span>{language === 'tr' ? 'Mekan' : 'Venue'}</span>
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span>{language === 'tr' ? 'Müşteri' : 'Customer'}</span>
                  </th>
                  <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium uppercase tracking-wider">
                    <span>{language === 'tr' ? 'Toplam' : 'Total'}</span>
                  </th>
                  {/* Status column - only visible on desktop */}
                  <th scope="col" className="hidden md:table-cell px-3 md:px-6 py-2 md:py-3 text-center text-xs font-medium uppercase tracking-wider">
                    <span>{language === 'tr' ? 'Durum' : 'Status'}</span>
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
                      <td className="px-3 md:px-4 py-2 md:py-3 max-w-[35%] md:max-w-none">
                        <div className="font-medium text-xs md:text-sm truncate">
                          {booking.venue}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatTimeRange(booking.startTime, booking.endTime)}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 max-w-[35%] md:max-w-none">
                        <div>
                          <div className="font-medium text-xs md:text-sm truncate">{booking.name}</div>
                          {booking.phone && (
                            <div className={`text-xs ${textSecondaryClass} truncate`}>{booking.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-2 md:py-3 text-right font-medium text-xs md:text-sm text-neon-green">
                        {formatPrice(booking.totalPrice)}
                      </td>
                      {/* Status - only visible on desktop */}
                      <td className="hidden md:table-cell px-3 md:px-4 py-2 md:py-3 text-center">
                        {getStatusBadge(booking.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 md:px-4 py-6 md:py-8 text-center">
                      <div className={`${textSecondaryClass} text-sm md:text-lg`}>
                        {searchTerm || activeFilters.length > 0
                          ? strings.noMatch
                          : strings.noBookingsYet}
                      </div>
                      <div className="mt-2">
                        <button
                          className={`text-xs md:text-sm text-electric-blue hover:underline`}
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
        )}
      </div>
    </div>
  );
}