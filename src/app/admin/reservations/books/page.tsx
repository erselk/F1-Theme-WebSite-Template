'use client';

import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllBookings, getBookingsStats } from '@/services/booking-service';
import { formatPrice, formatDate, formatTimeRange, useFilteredData } from '@/lib/admin-utils';
import LoadingState from '@/components/admin/common/LoadingState';
import ErrorState from '@/components/admin/common/ErrorState';
import PageHeader from '@/components/admin/common/PageHeader';
import StatsCard from '@/components/admin/common/StatsCard';
import AdminCard from '@/components/admin/common/AdminCard';
import SearchInput from '@/components/admin/common/SearchInput';
import DataTable from '@/components/admin/common/DataTable';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Tarih filtresi seçenekleri
const DATE_FILTERS = {
  today: { tr: 'Bugün', en: 'Today' },
  tomorrow: { tr: 'Yarın', en: 'Tomorrow' },
  thisWeek: { tr: 'Bu Hafta', en: 'This Week' },
  thisMonth: { tr: 'Bu Ay', en: 'This Month' },
  past: { tr: 'Geçmiş', en: 'Past' },
};

export default function BookingsPage() {
  const { isDark, language } = useThemeLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalRevenue: number; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDateFilters, setActiveDateFilters] = useState<string[]>([]);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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
        setError(bookingsResult.error || statsResult.error || 'An error occurred while fetching data');
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

  // Filtrelenen verileri tarih filtrelerine göre daha fazla işle
  const processDateFilter = (bookingsList: any[]) => {
    if (!activeDateFilters.length) {
      // Herhangi bir filtre yoksa, bugünden geleceğe + dünden geçmişe sırala
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureBookings = bookingsList
        .filter(booking => new Date(booking.startTime) >= today)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      const pastBookings = bookingsList
        .filter(booking => new Date(booking.startTime) < today)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

      return [...futureBookings, ...pastBookings];
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    
    // Birden fazla filtre varsa, hepsini birleştiriyoruz
    let resultBookings: any[] = [];
    
    activeDateFilters.forEach(filter => {
      let filterBookings: any[] = [];
      
      switch (filter) {
        case 'today':
          filterBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate >= today && bookingDate < tomorrow;
          });
          break;
        case 'tomorrow':
          filterBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            const nextDay = new Date(tomorrow);
            nextDay.setDate(tomorrow.getDate() + 1);
            return bookingDate >= tomorrow && bookingDate < nextDay;
          });
          break;
        case 'thisWeek':
          filterBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate >= today && bookingDate < nextWeek;
          });
          break;
        case 'thisMonth':
          filterBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate >= today && bookingDate < nextMonth;
          });
          break;
        case 'past':
          filterBookings = bookingsList.filter(booking => {
            const bookingDate = new Date(booking.startTime);
            return bookingDate < today;
          });
          break;
      }
      
      // Benzersiz değerleri ekle
      filterBookings.forEach(booking => {
        if (!resultBookings.some(b => b.refNumber === booking.refNumber)) {
          resultBookings.push(booking);
        }
      });
    });
    
    // Tarihe göre sıralama
    return resultBookings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // Toggle date filter
  const toggleDateFilter = (filterKey: string) => {
    if (activeDateFilters.includes(filterKey)) {
      setActiveDateFilters(prev => prev.filter(key => key !== filterKey));
    } else {
      setActiveDateFilters(prev => [...prev, filterKey]);
    }
    setShowMobileFilter(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setActiveDateFilters([]);
  };

  // İlk filtrelemeyi yap sonra tarih filtrelerini uygula
  const filteredData = useFilteredData({
    data: processDateFilter(bookings),
    searchTerm,
    searchFields: ['venue', 'name', 'phone', 'email'],
    sortField: 'startTime',
    sortDirection: 'asc',
    itemsPerPage: 10
  });

  // Table columns definition - Web version
  const webColumns = [
    {
      header: { tr: 'Alan', en: 'Venue' },
      accessor: 'venue',
      cell: (booking: any) => (
        <div className="font-medium text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
          {booking.venue}
        </div>
      )
    },
    {
      header: { tr: 'Müşteri', en: 'Customer' },
      accessor: 'name',
      cell: (booking: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[90px] md:max-w-none">{booking.name}</div>
          {booking.phone && (
            <div className="text-xs text-gray-400 truncate max-w-[90px] md:max-w-none">{booking.phone}</div>
          )}
        </div>
      )
    },
    {
      header: { tr: 'Tarih', en: 'Date' },
      accessor: 'startTime',
      cell: (booking: any) => (
        <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
          {formatDate(booking.startTime, language, true)}
        </div>
      )
    },
    {
      header: { tr: 'Saat', en: 'Time' },
      accessor: 'time',
      cell: (booking: any) => (
        <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
          {formatTimeRange(booking.startTime, booking.endTime, language)}
        </div>
      )
    },
    {
      header: { tr: 'Kişi', en: 'Persons' },
      accessor: 'personCount',
      className: 'text-center',
      cell: (booking: any) => (
        <span className="text-xs md:text-sm">
          {booking.personCount || '1'}
        </span>
      )
    },
    {
      header: { tr: 'Tutar', en: 'Amount' },
      accessor: 'totalPrice',
      className: 'text-right',
      cell: (booking: any) => (
        <span className="font-medium text-xs md:text-sm text-neon-green">
          {formatPrice(booking.totalPrice, language)}
        </span>
      )
    }
  ];

  // Mobile columns definition
  const mobileColumns = [
    {
      header: { tr: 'Alan & Zaman', en: 'Venue & Time' },
      accessor: 'venue',
      cell: (booking: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
            {booking.venue}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
            {formatDate(booking.startTime, language, true)}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
            {formatTimeRange(booking.startTime, booking.endTime, language)}
          </div>
        </div>
      )
    },
    {
      header: { tr: 'Müşteri', en: 'Customer' },
      accessor: 'name',
      cell: (booking: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[90px] md:max-w-none">{booking.name}</div>
          {booking.phone && (
            <div className="text-xs text-gray-400 truncate max-w-[90px] md:max-w-none">{booking.phone}</div>
          )}
        </div>
      )
    },
    {
      header: { tr: 'Tutar', en: 'Amount' },
      accessor: 'totalPrice',
      className: 'text-right',
      cell: (booking: any) => (
        <div className="text-right">
          <span className="font-medium text-xs md:text-sm text-neon-green">
            {formatPrice(booking.totalPrice, language)}
          </span>
          <div className="text-xs text-gray-400">{language === 'tr' ? 'Kişi:' : 'Persons:'} {booking.personCount || '1'}</div>
        </div>
      )
    }
  ];

  // Responsive columns selection
  const columns = typeof window !== 'undefined' && window.innerWidth <= 768 ? mobileColumns : webColumns;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Stats cards data
  const statsCards = [
    {
      title: { tr: 'Toplam Rezervasyon', en: 'Total Bookings' },
      value: stats?.totalBookings || 0,
      color: 'bg-electric-blue'
    },
    {
      title: { tr: 'Toplam Gelir', en: 'Total Revenue' },
      value: formatPrice(stats?.totalRevenue || 0, language),
      color: 'bg-neon-green',
      valueColor: 'text-neon-green'
    }
  ];

  // UI strings based on language
  const strings = {
    reset: language === 'tr' ? 'Filtreleri Temizle' : 'Clear Filters',
    filters: language === 'tr' ? 'Filtreler' : 'Filters',
    dateFilter: language === 'tr' ? 'Tarih' : 'Date',
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={{ tr: 'Rezervasyonlar', en: 'Bookings' }}
        description={{ tr: 'Tüm rezervasyonları yönetin', en: 'Manage all bookings' }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            valueColor={stat.valueColor}
          />
        ))}
      </div>

      {/* Filters and controls */}
      <AdminCard>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-4 space-y-4 md:space-y-0">
          {/* Arama kutusunu web sürümünde daha dar yapalım */}
          <div className="w-full md:w-1/3">
            <SearchInput 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={{ tr: 'Müşteri, mekan...', en: 'Search...' }}
            />
          </div>
          
          {/* Tarih Filtresi - Mobil Versiyonu */}
          <div className="block md:hidden relative">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className={`w-full px-3 py-2 text-xs rounded-md flex justify-between items-center ${
                isDark ? 'bg-[#e1e1e1] text-gray-700 border border-gray-200' : 'bg-[#e1e1e1] text-gray-700 border border-gray-200'
              }`}
            >
              <span>
                {activeDateFilters.length > 0
                  ? activeDateFilters.map(filter => language === 'tr' ? DATE_FILTERS[filter as keyof typeof DATE_FILTERS].tr : DATE_FILTERS[filter as keyof typeof DATE_FILTERS].en).join(', ')
                  : (language === 'tr' ? 'Tarih Seçin' : 'Select Date')}
              </span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            
            {showMobileFilter && (
              <div className={`absolute z-10 mt-1 w-full rounded-md shadow-lg ${
                isDark ? 'bg-[#e1e1e1] border border-gray-200' : 'bg-[#e1e1e1] border border-gray-200'
              }`}>
                {Object.entries(DATE_FILTERS).map(([key, value]) => (
                  <button
                    key={key}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2 ${
                      isDark ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleDateFilter(key)}
                  >
                    <div className={`w-4 h-4 flex-shrink-0 rounded border ${
                      activeDateFilters.includes(key) 
                        ? 'bg-race-blue border-race-blue' 
                        : 'border-gray-400'
                    }`}>
                      {activeDateFilters.includes(key) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {language === 'tr' ? value.tr : value.en}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Tarih Filtresi - Web Versiyonu */}
          <div className="hidden md:flex flex-wrap gap-2 items-center">
            <span className="text-xs md:text-sm font-medium">{strings.dateFilter}:</span>
            {Object.entries(DATE_FILTERS).map(([key, value]) => (
              <button
                key={key}
                className={`px-3 py-1 text-xs md:text-sm rounded-full flex items-center gap-1.5 ${
                  activeDateFilters.includes(key)
                    ? (isDark ? 'bg-electric-blue text-white' : 'bg-race-blue text-white')
                    : (isDark ? 'bg-carbon-grey text-silver hover:bg-dark-grey' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }`}
                onClick={() => toggleDateFilter(key)}
              >
                <div className={`w-3.5 h-3.5 flex-shrink-0 rounded-sm border ${
                  activeDateFilters.includes(key) 
                    ? (isDark ? 'border-white' : 'border-white')
                    : (isDark ? 'border-silver' : 'border-gray-400')
                }`}>
                  {activeDateFilters.includes(key) && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {language === 'tr' ? value.tr : value.en}
              </button>
            ))}
          </div>
        </div>
      </AdminCard>

      {/* Bookings table */}
      <DataTable
        columns={columns}
        data={filteredData.currentItems}
        keyField="refNumber"
        pagination={{
          currentPage: filteredData.currentPage,
          totalPages: filteredData.totalPages,
          totalItems: filteredData.totalItems,
          indexOfFirstItem: filteredData.indexOfFirstItem,
          indexOfLastItem: filteredData.indexOfLastItem,
          paginate: filteredData.paginate
        }}
        emptyState={{
          withFilters: {
            tr: 'Aramanızla eşleşen rezervasyon bulunamadı.',
            en: 'No bookings match your search.'
          },
          withoutFilters: {
            tr: 'Henüz rezervasyon bulunmuyor.',
            en: 'No bookings found yet.'
          },
          resetFilters
        }}
        isFiltered={searchTerm !== '' || activeDateFilters.length > 0}
      />
    </div>
  );
}