'use client';

import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { isDark } = useThemeLanguage();

  // İstatistik verileri
  const stats = [
    {
      title: 'Toplam Etkinlik',
      value: '12',
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
      title: 'Rezervasyonlar',
      value: '28',
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
      title: 'Blog Yazıları',
      value: '8',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      color: isDark ? 'bg-neon-red' : 'bg-f1-red',
    },
  ];

  // Hızlı işlem bağlantıları
  const quickActions = [
    {
      title: 'Etkinlik Yönetimi',
      description: 'Tüm etkinlikleri görüntüleyin, düzenleyin veya yenilerini ekleyin.',
      href: '/admin/events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      title: 'Rezervasyonlar',
      description: 'Rezervasyonları yönetin ve takip edin.',
      href: '/admin/reservations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Site Ayarları',
      description: 'Site ayarlarını yapılandırın.',
      href: '/admin/settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        Admin Dashboard
      </h1>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-md ${
              isDark ? 'bg-graphite' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {stat.title}
                </h2>
                <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
                <div className={stat.color.replace('bg-', 'text-')}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hızlı İşlem Kartları */}
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        Hızlı İşlemler
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link
            href={action.href}
            key={index}
            className={`p-6 rounded-lg shadow-md transition-all hover:-translate-y-1 ${
              isDark
                ? 'bg-graphite hover:shadow-lg hover:bg-carbon-grey'
                : 'bg-white hover:shadow-lg hover:bg-very-light-grey'
            }`}
          >
            <div className="flex items-start">
              <div className={`p-3 rounded-full mr-4 ${
                isDark ? 'bg-carbon-grey text-electric-blue' : 'bg-very-light-grey text-f1-red'
              }`}>
                {action.icon}
              </div>
              <div>
                <h3 className={`text-lg font-medium mb-1 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
