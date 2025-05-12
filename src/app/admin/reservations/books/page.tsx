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

const BOOKING_STATUS = {
  pending: { tr: 'Bekliyor', en: 'Pending', color: 'bg-amber-500 text-white' },
  confirmed: { tr: 'Onaylandı', en: 'Confirmed', color: 'bg-green-500 text-white' },
  cancelled: { tr: 'İptal Edildi', en: 'Cancelled', color: 'bg-red-500 text-white' },
  completed: { tr: 'Tamamlandı', en: 'Completed', color: 'bg-blue-500 text-white' },
};

export default function BookingsPage() {
  const { isDark, language } = useThemeLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalBookings: number; totalRevenue: number; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState({ field: 'startTime', direction: 'desc' as 'asc' | 'desc' });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Status Badge Component
  const getStatusBadge = (status: string) => {
    const statusConfig = BOOKING_STATUS[status as keyof typeof BOOKING_STATUS] || 
      { tr: 'Bilinmiyor', en: 'Unknown', color: 'bg-gray-500 text-white' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusConfig.color}`}>
        {language === 'tr' ? statusConfig.tr : statusConfig.en}
      </span>
    );
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

  // Handle sorting
  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Toggle status filter
  const toggleFilter = (status: string) => {
    setActiveFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setActiveFilters([]);
  };

  // Use our custom filtering hook
  const {
    currentItems: currentBookings,
    totalPages,
    indexOfFirstItem: indexOfFirstBooking,
    indexOfLastItem: indexOfLastBooking,
    totalItems: totalFilteredBookings,
    paginate
  } = useFilteredData({
    data: bookings.filter(booking => 
      activeFilters.length === 0 || activeFilters.includes(booking.status)
    ),
    searchTerm,
    searchFields: ['venue', 'name', 'phone', 'email'],
    sortField: sorting.field,
    sortDirection: sorting.direction,
    itemsPerPage: 10
  });

  // Table columns definition
  const columns = [
    {
      header: { tr: 'Mekan ve Tarih', en: 'Venue & Date' },
      accessor: 'venue',
      cell: (booking: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
            {booking.venue}
          </div>
          <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-none">
            {formatDate(booking.startTime, language)}
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
          {booking.email && (
            <div className="text-xs text-gray-400 truncate max-w-[90px] md:max-w-none">{booking.email}</div>
          )}
        </div>
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
    },
    {
      header: { tr: 'Durum', en: 'Status' },
      accessor: 'status',
      className: 'text-center hidden md:table-cell',
      hidden: 'mobile' as 'mobile',
      cell: (booking: any) => getStatusBadge(booking.status)
    }
  ];

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
    status: language === 'tr' ? 'Durum' : 'Status',
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
        <div className="flex flex-col space-y-4">
          <div className="w-full">
            <SearchInput 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={{ tr: 'Müşteri, mekan...', en: 'Search...' }}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs md:text-sm font-medium">{strings.status}:</span>
            {Object.entries(BOOKING_STATUS).map(([key, value]) => (
              <button
                key={key}
                className={`px-3 py-1 text-xs md:text-sm rounded-full ${
                  activeFilters.includes(key)
                    ? value.color
                    : isDark ? 'bg-carbon-grey text-silver' : 'bg-gray-100 text-gray-700'
                }`}
                onClick={() => toggleFilter(key)}
              >
                {language === 'tr' ? value.tr : value.en}
              </button>
            ))}
            
            {(activeFilters.length > 0 || searchTerm) && (
              <button
                className="px-3 py-1 text-xs md:text-sm rounded-full text-red-500 bg-red-100 hover:bg-red-200"
                onClick={resetFilters}
              >
                {strings.reset}
              </button>
            )}
          </div>
        </div>
      </AdminCard>

      {/* Bookings table */}
      <DataTable
        columns={columns}
        data={currentBookings}
        keyField="refNumber"
        pagination={{
          currentPage: Math.ceil(indexOfFirstBooking / 10) + 1,
          totalPages,
          totalItems: totalFilteredBookings,
          indexOfFirstItem: indexOfFirstBooking,
          indexOfLastItem: indexOfLastBooking,
          paginate
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
        isFiltered={searchTerm !== '' || activeFilters.length > 0}
      />
    </div>
  );
}