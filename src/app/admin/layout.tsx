'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import AdminAuth from '@/components/admin/AdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isDark } = useThemeLanguage();
  
  // State for sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // State to track which dropdown menus are open
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    sales: false,
  });

  // Check if on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle function for dropdown menus
  const toggleDropdown = (menuKey: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Admin sidebar navigation links
  const adminNavItems = [
    { 
      name: 'Dashboard',
      href: '/admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    { 
      name: 'Etkinlikler',
      href: '/admin/events',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    { 
      name: 'Bloglar',
      href: '/admin/blogs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8" />
          <path d="M15 18h-5" />
          <path d="M10 6h8v4h-8V6Z" />
        </svg>
      )
    },
    { 
      name: 'Yazarlar',
      href: '/admin/authors',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    { 
      name: 'Satışlar',
      key: 'sales',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      submenu: [
        { 
          name: 'Etkinlikler', 
          href: '/admin/reservations/events',
        },
        { 
          name: 'Rezervasyonlar', 
          href: '/admin/reservations/books',
        },
      ]
    }
  ];

  return (
    <AdminAuth>
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Backdrop - only visible when sidebar is open on mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-40 h-screen transition-transform duration-300 
          ${isDark ? 'bg-dark-grey border-r border-carbon-grey' : 'bg-very-light-grey border-r border-light-grey'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'w-64' : 'w-64'}`}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-carbon-grey">
              <Link
                href="/admin"
                className={`text-xl font-semibold font-['Titillium Web'] ${
                  isDark ? 'text-white' : 'text-dark-grey'
                }`}
              >
                PadokClub Admin
              </Link>
              {isMobile && (
                <button 
                  onClick={toggleSidebar}
                  className="p-1 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            {/* Sidebar Nav */}
            <nav className="p-4 flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {adminNavItems.map((item) => (
                  <li key={item.name}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(item.key)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors ${
                            pathname.includes(item.submenu[0].href.split('/')[1] || '')
                              ? isDark
                                ? 'bg-carbon-grey text-electric-blue'
                                : 'bg-light-grey text-f1-red'
                              : isDark
                              ? 'text-silver hover:bg-dark-grey'
                              : 'text-medium-grey hover:bg-very-light-grey'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-4 w-4 transition-transform ${openMenus[item.key] ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {openMenus[item.key] && (
                          <ul className="mt-1 ml-6 space-y-1">
                            {item.submenu.map((subItem) => (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                    pathname === subItem.href
                                      ? isDark
                                        ? 'bg-carbon-grey text-electric-blue'
                                        : 'bg-light-grey text-f1-red'
                                      : isDark
                                      ? 'text-silver hover:bg-dark-grey'
                                      : 'text-medium-grey hover:bg-very-light-grey'
                                  }`}
                                  onClick={isMobile ? toggleSidebar : undefined}
                                >
                                  <span>{subItem.name}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          pathname === item.href
                            ? isDark
                              ? 'bg-carbon-grey text-electric-blue'
                              : 'bg-light-grey text-f1-red'
                            : isDark
                            ? 'text-silver hover:bg-dark-grey'
                            : 'text-medium-grey hover:bg-very-light-grey'
                        }`}
                        onClick={isMobile ? toggleSidebar : undefined}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className={`p-4 border-t ${isDark ? 'border-carbon-grey' : 'border-light-grey'}`}>
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Ana Siteye Dön</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all ${isMobile ? 'ml-0 px-1' : 'ml-64 p-8'} ${isMobile ? 'pt-16' : 'pt-16'} ${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}
        >
          {/* Mobile Header with menu button */}
          {isMobile && (
            <div className="fixed top-0 left-0 right-0 z-20 py-2 px-2 flex items-center bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-md">
              <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-silver hover:bg-[#2a2a2a]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <span className="ml-3 text-base font-semibold font-['Titillium Web'] truncate text-silver">
                PadokClub Admin
              </span>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </AdminAuth>
  );
}
