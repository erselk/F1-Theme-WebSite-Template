'use client';

import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { useEffect, useState } from 'react';
import { getDashboardStats, getTodayEvents, getTodayBookings } from '@/services/admin-service';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export default function AdminDashboard() {
  const { isDark, language } = useThemeLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalReservations: 0,
    totalBlogs: 0,
    totalPeople: 0,
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [todayBookings, setTodayBookings] = useState([]);
  const [error, setError] = useState(null);

  // Format price based on language
  const formatPrice = (amount) => {
    const hasDecimal = amount % 1 !== 0;
    
    return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: hasDecimal ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date based on language
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time (e.g., "2 hours from now")
  const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: language === 'tr' ? tr : enUS
    });
  };

  // Load dashboard data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Fetch all stats at once
        const [statsResult, eventsResult, bookingsResult] = await Promise.all([
          getDashboardStats(),
          getTodayEvents(),
          getTodayBookings()
        ]);

        if (statsResult.success) {
          setStats({
            totalEvents: statsResult.data.totalEvents,
            totalReservations: statsResult.data.totalReservations,
            totalBlogs: statsResult.data.totalBlogs,
            totalPeople: statsResult.data.totalPeople
          });
        }

        if (eventsResult.success) {
          setTodayEvents(eventsResult.data);
        }

        if (bookingsResult.success) {
          setTodayBookings(bookingsResult.data);
        }

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Veriler yüklenirken bir hata oluştu');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // İstatistik verileri
  const statCards = [
    {
      title: language === 'tr' ? 'Toplam Etkinlik' : 'Total Events',
      value: stats.totalEvents,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      color: isDark ? 'bg-electric-blue' : 'bg-race-blue',
    },
    {
      title: language === 'tr' ? 'Rezervasyonlar' : 'Reservations',
      value: stats.totalReservations,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      color: isDark ? 'bg-neon-green' : 'bg-race-green',
    },
    {
      title: language === 'tr' ? 'Blog Yazıları' : 'Blog Posts',
      value: stats.totalBlogs,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      color: isDark ? 'bg-neon-red' : 'bg-f1-red',
    },
  ];

  if (loading) {
    return (
      <div className={`rounded-lg shadow p-8 flex items-center justify-center h-64 ${isDark ? 'bg-graphite' : 'bg-white'}`}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium">
            {language === 'tr' ? 'Yükleniyor...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg shadow p-8 ${isDark ? 'bg-graphite text-white' : 'bg-white text-dark-grey'}`}>
        <div className="text-red-500 text-center">
          <h2 className="text-xl font-bold mb-2">
            {language === 'tr' ? 'Hata Oluştu' : 'Error Occurred'}
          </h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${isDark ? 'text-white' : 'text-dark-grey'} mt-6 md:mt-4`}>
        {language === 'tr' ? 'Yönetim Paneli' : 'Admin Dashboard'}
      </h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`p-4 md:p-6 rounded-lg shadow-md ${
              isDark ? 'bg-graphite' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xs md:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {stat.title}
                </h2>
                <p className={`text-2xl md:text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 md:p-3 rounded-full ${stat.color} bg-opacity-20`}>
                <div className={stat.color.replace('bg-', 'text-')}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Events and Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Today's Events */}
        <div className={`p-4 md:p-6 rounded-lg shadow-md ${isDark ? 'bg-graphite' : 'bg-white'}`}>
          <h2 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {language === 'tr' ? 'Bugünkü Etkinlikler' : 'Today\'s Events'}
          </h2>
          
          {todayEvents.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {todayEvents.map((event, index) => (
                <div 
                  key={index} 
                  className={`p-3 md:p-4 rounded-lg border ${isDark ? 'border-carbon-grey bg-dark-grey' : 'border-light-grey bg-very-light-grey'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className={`text-sm md:text-base font-semibold truncate ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                      {event.title}
                    </h3>
                    <span className={`text-xs md:text-sm font-medium px-2 py-1 rounded mt-1 md:mt-0 inline-block ${
                      isDark ? 'bg-carbon-grey text-electric-blue' : 'bg-light-grey text-race-blue'
                    }`}>
                      {formatRelativeTime(event.date)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-4 mt-2 md:mt-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {language === 'tr' ? 'Satılan Bilet' : 'Tickets Sold'}
                      </p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-electric-blue' : 'text-race-blue'}`}>
                        {event.totalTickets || 0}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {language === 'tr' ? 'Toplam Gelir' : 'Total Revenue'}
                      </p>
                      <p className={`text-base md:text-lg font-bold ${isDark ? 'text-neon-green' : 'text-race-green'}`}>
                        {formatPrice(event.totalRevenue || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 md:p-8 text-center rounded-lg ${
              isDark ? 'bg-dark-grey text-silver' : 'bg-very-light-grey text-medium-grey'
            }`}>
              <p>{language === 'tr' ? 'Bugün etkinlik bulunmuyor' : 'No events today'}</p>
            </div>
          )}
        </div>

        {/* Today's Reservations */}
        <div className={`p-4 md:p-6 rounded-lg shadow-md ${isDark ? 'bg-graphite' : 'bg-white'}`}>
          <h2 className={`text-lg md:text-xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {language === 'tr' ? 'Bugünkü Rezervasyonlar' : 'Today\'s Reservations'}
          </h2>
          
          {todayBookings.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {todayBookings.map((booking, index) => (
                <div 
                  key={booking.refNumber || index} 
                  className={`p-3 md:p-4 rounded-lg border ${isDark ? 'border-carbon-grey bg-dark-grey' : 'border-light-grey bg-very-light-grey'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1">
                    <h3 className={`text-sm md:text-base font-semibold truncate ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                      {booking.venue}
                    </h3>
                    <span className={`text-xs md:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                      {formatDate(booking.startTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className={`text-xs md:text-sm truncate ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {booking.name} · {booking.people} {language === 'tr' ? 'kişi' : 'people'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm font-medium ${isDark ? 'text-neon-green' : 'text-race-green'}`}>
                        {formatPrice(booking.totalPrice || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`p-6 md:p-8 text-center rounded-lg ${
              isDark ? 'bg-dark-grey text-silver' : 'bg-very-light-grey text-medium-grey'
            }`}>
              <p>{language === 'tr' ? 'Bugün rezervasyon bulunmuyor' : 'No reservations today'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
