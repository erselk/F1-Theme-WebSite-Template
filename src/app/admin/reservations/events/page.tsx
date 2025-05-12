'use client';

import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAllEventOrders, getEventOrdersStats } from '@/services/event-orders-service';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice, useFilteredData } from '@/lib/admin-utils';
import LoadingState from '@/components/admin/common/LoadingState';
import ErrorState from '@/components/admin/common/ErrorState';
import PageHeader from '@/components/admin/common/PageHeader';
import StatsCard from '@/components/admin/common/StatsCard';
import AdminCard from '@/components/admin/common/AdminCard';
import SearchInput from '@/components/admin/common/SearchInput';
import DataTable from '@/components/admin/common/DataTable';

export default function EventOrdersPage() {
  const { isDark, language } = useThemeLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<{ totalOrders: number; totalRevenue: number; totalTickets: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState({ field: 'orderDate', direction: 'desc' as 'asc' | 'desc' });
  const searchParams = useSearchParams();

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
        setOrders(ordersResult.data || []);
        setStats(statsResult.data || null);
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

  // URL'den eventSlug parametresi varsa arama terimine ekle
  useEffect(() => {
    const eventSlug = searchParams.get('event');
    if (eventSlug) {
      setSearchTerm(eventSlug);
    }
  }, [searchParams]);

  // Handle sorting
  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Use our custom filtering hook
  const {
    currentItems: currentOrders,
    totalPages,
    indexOfFirstItem: indexOfFirstOrder,
    indexOfLastItem: indexOfLastOrder,
    totalItems: totalFilteredOrders,
    paginate
  } = useFilteredData({
    data: orders,
    searchTerm,
    searchFields: [
      'customerInfo.fullName', 
      'customerInfo.email', 
      'customerInfo.phone', 
      'eventName.tr', 
      'eventName.en'
    ],
    sortField: sorting.field,
    sortDirection: sorting.direction,
    itemsPerPage: 10
  });

  // Table columns definition
  const columns = [
    {
      header: { tr: 'Etkinlik', en: 'Event' },
      accessor: 'eventName',
      cell: (order: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
            {typeof order.eventName === 'object' 
              ? (order.eventName[language] || order.eventName.en || order.eventName.tr || order.eventSlug) 
              : order.eventSlug}
          </div>
          {/* Mobilde müşteri bilgisi */}
          <div className="md:hidden mt-1">
            <div className="text-xs truncate max-w-[120px] text-gray-500">{order.customerInfo?.fullName || ''}</div>
          </div>
        </div>
      )
    },
    {
      header: { tr: 'Müşteri', en: 'Customer' },
      accessor: 'customerInfo',
      hidden: 'mobile' as 'mobile',
      cell: (order: any) => (
        <div>
          <div className="font-medium text-xs md:text-sm truncate max-w-[90px] md:max-w-none">{order.customerInfo?.fullName}</div>
          <div className="text-xs text-gray-400 truncate max-w-[90px] md:max-w-none">{order.customerInfo?.email}</div>
          {order.customerInfo?.phone && (
            <div className="text-xs text-gray-400 truncate max-w-[90px] md:max-w-none">{order.customerInfo.phone}</div>
          )}
        </div>
      )
    },
    {
      header: { tr: 'Biletler', en: 'Tickets' },
      accessor: 'tickets',
      cell: (order: any) => (
        <ul className="space-y-0.5">
          {order.tickets.map((ticket: any, idx: number) => {
            // Bilet adını doğru şekilde gösterme
            const ticketName = typeof ticket.name === 'object' 
              ? (ticket.name[language] || ticket.name.en || ticket.name.tr || 'Ticket')
              : ticket.name;
            
            // Mobilde sadece ilk bileti ve toplam bilet sayısını gösteriyoruz
            if (window.innerWidth < 768 && idx > 0) {
              if (idx === 1) {
                return (
                  <li key={idx} className="text-xs text-gray-500">
                    {language === 'tr' ? `ve ${order.tickets.length - 1} bilet daha` : `and ${order.tickets.length - 1} more`}
                  </li>
                );
              }
              return null;
            }
            
            return (
              <li key={idx} className="text-xs md:text-sm">
                {ticketName} <span className="font-medium">x{ticket.quantity}</span>
              </li>
            );
          })}
        </ul>
      )
    },
    {
      header: { tr: 'Tutar', en: 'Amount' },
      accessor: 'totalPrice',
      hidden: 'mobile' as 'mobile',
      className: 'text-right',
      cell: (order: any) => (
        <span className="font-medium text-xs md:text-sm text-neon-green">
          {formatPrice(order.tickets.reduce((total: number, ticket: any) => total + (ticket.price * ticket.quantity), 0), language)}
        </span>
      )
    },
    {
      header: { tr: 'İşlemler', en: 'Actions' },
      accessor: 'actions',
      className: 'text-right w-10 md:w-auto',
      cell: (order: any) => (
        <div className="flex justify-end">
          <Link
            href={`/admin/reservations/events/${order.orderId}`}
            className="p-1.5 md:px-3 md:py-1 rounded-md text-xs md:text-sm bg-electric-blue hover:bg-blue-600 text-white"
            title={language === 'tr' ? 'Detay' : 'Details'}
          >
            <span className="hidden md:inline">{language === 'tr' ? 'Detay' : 'Details'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      )
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
      title: { tr: 'Toplam Sipariş', en: 'Total Orders' },
      value: stats?.totalOrders || 0,
      color: 'bg-electric-blue'
    },
    {
      title: { tr: 'Toplam Gelir', en: 'Total Revenue' },
      value: formatPrice(stats?.totalRevenue || 0, language),
      color: 'bg-neon-green',
      valueColor: 'text-neon-green'
    },
    {
      title: { tr: 'Toplam Bilet', en: 'Total Tickets' },
      value: stats?.totalTickets || 0,
      color: 'bg-neon-red',
      valueColor: 'text-neon-red'
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title={{ tr: 'Etkinlik Siparişleri', en: 'Event Orders' }}
        description={{ tr: 'Tüm etkinlik siparişlerini ve rezervasyonlarını yönetin', en: 'Manage all event orders and reservations' }}
      />

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
          <div className="w-full">
            <SearchInput 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={{ tr: 'Müşteri, e-posta...', en: 'Search...' }}
            />
          </div>
        </div>
      </AdminCard>

      {/* Orders table */}
      <DataTable
        columns={columns}
        data={currentOrders}
        keyField="orderId"
        pagination={{
          currentPage: Math.min(totalPages || 1, Number(searchParams.get('page')) || 1),
          totalPages,
          totalItems: totalFilteredOrders,
          indexOfFirstItem: indexOfFirstOrder,
          indexOfLastItem: indexOfLastOrder,
          paginate
        }}
        emptyState={{
          withFilters: {
            tr: 'Aramanızla eşleşen sipariş bulunamadı.',
            en: 'No orders match your search.'
          },
          withoutFilters: {
            tr: 'Henüz sipariş bulunmuyor.',
            en: 'No orders found yet.'
          },
          resetFilters: () => {
            setSearchTerm('');
            fetchData();
          }
        }}
        isFiltered={searchTerm !== ''}
      />
    </div>
  );
}