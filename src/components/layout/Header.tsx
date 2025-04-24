'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

const Header = () => {
  const pathname = usePathname();
  const { language, toggleLanguage, isDark, toggleTheme, mounted } = useThemeLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Initial check on mount
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  
  // Define navigation items directly in each language
  const navigationItems = {
    tr: [
      { name: 'Etkinlikler', href: '/events' },
      { name: 'Hizmetlerimiz', href: '/services' },
      { name: 'Hakkımızda', href: '/about' },
      { name: 'İletişim', href: '/contact' },
      { name: 'Blog', href: '/blog' },
    ],
    en: [
      { name: 'Events', href: '/events' },
      { name: 'Services', href: '/services' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
    ]
  };
  
  // Get current navigation items based on language
  const navigation = navigationItems[language];
  
  // Book text in both languages
  const bookText = language === 'tr' ? 'Rezervasyon Yap' : 'Book Now';

  // If not mounted yet, don't render theme-dependent elements to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">PadokClub</span>
              <Image
                className="h-8 w-auto"
                src="/logo.svg"
                alt="PadokClub"
                width={32}
                height={32}
                priority
              />
            </Link>
          </div>
          {/* Loading state for the rest of the header */}
        </div>
      </header>
    );
  }

  return (
    <header className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-md fixed top-0 left-0 right-0 w-full ${scrolled ? 'h-[80px]' : 'h-[128px]'} transition-all duration-300 z-50`}>
      <nav className="mx-auto flex w-full max-w-[95%] items-center justify-between px-4 h-full" aria-label="Global">
        {/* Logo - Fixed Left with larger size */}
        <div className="flex-none items-center">
          <Link href="/" className="-m-0 p-0">
            <span className="sr-only">PadokClub</span>
            <Image
              className={`${scrolled ? 'h-20' : 'h-32'} w-auto transition-all duration-300`}
              src={isDark ? '/images/logodark.png' : '/images/logolight.png'}
              alt="PadokClub"
              width={480}
              height={130}
              priority
            />
          </Link>
        </div>
        
        {/* Mobile menu button - Only visible on small screens */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className={`inline-flex items-center justify-center rounded-md p-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        
        {/* Desktop Navigation - Fixed Center */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center items-center">
          <div className="flex gap-x-8 items-center h-[40px]">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-semibold leading-none font-['Titillium Web'] ${
                  pathname === item.href
                    ? isDark ? 'text-[#FF0000]' : 'text-[#E10600]'
                    : isDark ? 'text-gray-100 hover:text-[#FF3333]' : 'text-gray-900 hover:text-[#E10600]'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Book Now button - Between Navigation and Theme/Lang Buttons */}
        <div className="hidden lg:flex lg:items-center mx-1 lg:mx-2">
          <Link
            href="/book"
            className={`text-base font-semibold rounded-md px-4 py-2.5 
              ${isDark 
                ? 'bg-[#FF0000] text-white hover:bg-[#FF3333]' 
                : 'bg-[#E10600] text-white hover:bg-[#E10600]/90'
              } shadow-sm font-['Titillium Web']`}
          >
            {bookText}
          </Link>
        </div>
        
        {/* Theme and Language Switchers - Fixed Right */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-full ${isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className={`flex items-center justify-center px-2.5 py-1 text-base font-semibold 
              ${isDark 
                ? 'text-gray-100 hover:text-white' 
                : 'text-gray-900 hover:text-black'
              } font-['Inter']`}
            aria-label="Toggle language"
          >
            {language === 'tr' ? 'TR' : 'EN'}
          </button>
        </div>
      </nav>
       {/* Mobile menu - also update logo size */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${
            isDark ? 'bg-[#1E1E1E]' : 'bg-white'
          } px-6 py-4 sm:max-w-sm sm:ring-1 ${
            isDark ? 'sm:ring-gray-100/10' : 'sm:ring-gray-900/10'
          }`}>
            <div className="flex items-center justify-between">
              <Link href="/" locale={undefined} className="-m-1 p-1">
                <span className="sr-only">PadokClub</span>
                <Image
                  className="h-14 w-auto"
                  src={isDark ? '/images/logodark.png' : '/images/logolight.png'}
                  alt="PadokClub"
                  width={200}
                  height={56}
                />
              </Link>
              <button
                type="button"
                className={`rounded-md p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className={`-my-6 divide-y ${isDark ? 'divide-gray-500/30' : 'divide-gray-500/10'}`}>
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-lg font-semibold leading-7 font-['Titillium Web'] ${
                        pathname === item.href 
                          ? isDark ? 'text-[#FF0000]' : 'text-[#E10600]'
                          : isDark 
                            ? 'text-gray-100 hover:bg-[#262626]' 
                            : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <button
                      onClick={toggleTheme}
                      className={`p-2 rounded-md ${isDark ? 'text-gray-200 hover:bg-[#3A3A3A]' : 'text-gray-700 hover:bg-gray-200'}`}
                      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {isDark ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414-1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      )}
                    </button>
                    
                    <Link
                      href="/book"
                      className={`flex-1 text-center rounded-lg py-2.5 text-lg font-semibold leading-7 text-white ${
                        isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-[#E10600]/90'
                      } font-['Titillium Web']`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {bookText}
                    </Link>
                    
                    <button
                      onClick={toggleLanguage}
                      className={`px-3 py-1 text-lg font-semibold font-['Inter'] ${
                        isDark 
                          ? 'text-gray-200 hover:text-white' 
                          : 'text-gray-700 hover:text-black'
                      }`}
                    >
                      {language === 'tr' ? 'TR' : 'EN'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;