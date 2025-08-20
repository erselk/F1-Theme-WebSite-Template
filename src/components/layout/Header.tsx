'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';

// Mobil menüyü dinamik olarak yükle
const DynamicMobileMenu = dynamic(() => import('./MobileMenu'), { 
  ssr: false,
  loading: () => <div className="lg:hidden"></div>
});

const Header = () => {
  const pathname = usePathname();
  const { language, toggleLanguage, isDark, toggleTheme, mounted } = useThemeLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const controls = useAnimation();
  const navControls = useAnimation();
  
  // Handle scroll event - smooth animations based on scroll position
  useEffect(() => {
    const debouncedHandleScroll = debounce(() => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
        
        // Apply different heights and animations based on scroll position
        if (isScrolled) {
          controls.start({
            height: ['128px', '80px'],
            transition: { duration: 0.4, ease: "easeInOut" }
          });
        } else {
          controls.start({
            height: ['80px', '128px'],
            transition: { duration: 0.4, ease: "easeInOut" }
          });
        }
      }
    }, 10);
    
    // Initial check on mount
    debouncedHandleScroll();
    
    window.addEventListener('scroll', debouncedHandleScroll);
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      debouncedHandleScroll.cancel();
    };
  }, [scrolled, controls]);
  
  // Initial animation when page loads
  useEffect(() => {
    if (mounted) {
      controls.start({
        y: 0,
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
      });
      
      navControls.start({
        y: 0,
        opacity: 1, 
        transition: { 
          duration: 0.6, 
          staggerChildren: 0.1, 
          delayChildren: 0.2, 
          ease: "easeOut" 
        }
      });
    }
  }, [mounted, controls, navControls]);
  
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

  // Navbar ve menu item animasyon varyantları
  const navbarVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  
  const navItemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // If not mounted yet, don't render theme-dependent elements to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="bg-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">PadokClub</span>
            </Link>
          </div>
          {/* Loading state for the rest of the header */}
        </div>
      </header>
    );
  }

  return (
    <motion.header 
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} shadow-md fixed top-0 left-0 right-0 w-full z-50`}
      style={{ 
        boxShadow: scrolled 
          ? isDark 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)' 
          : 'none',
        height: scrolled ? '80px' : '128px',
        transition: 'height 0.4s ease-in-out, box-shadow 0.4s ease'
      }}
    >
      <nav className="mx-auto flex w-full max-w-[95%] items-center justify-between px-4 h-full" aria-label="Global">
        {/* Logo - Fixed Left with larger size */}
        <motion.div 
          className="flex-none items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
        >
          <Link href="/" className="-m-0 p-0">
            <span className="sr-only">PadokClub</span>
            <Image
              className={`${scrolled ? 'h-10' : 'h-16'} w-auto transition-all duration-300`}
              src={isDark ? '/images/logodark.png' : '/images/logolight.png'}
              alt="PadokClub"
              width={150} // Reduced from 240
              height={45} // Reduced from 65
              priority
            />
          </Link>
        </motion.div>
        
        {/* Mobile menu button - Only visible on small screens */}
        <motion.div 
          className="flex lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            type="button"
            className={`inline-flex items-center justify-center rounded-md p-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
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
          </motion.button>
        </motion.div>
        
        {/* Desktop Navigation - Fixed Center */}
        <motion.div 
          className="hidden lg:flex lg:flex-1 lg:justify-center items-center"
          animate={navControls}
          initial={{ opacity: 0, y: -10 }}
        >
          <div className="flex gap-x-8 items-center h-[40px]">
            {navigation.map((item, i) => (
              <motion.div
                key={item.name}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`text-base font-semibold leading-none font-['Titillium Web'] ${
                    pathname === item.href
                      ? isDark ? 'text-[#FF0000]' : 'text-[#E10600]'
                      : isDark ? 'text-gray-100 hover:text-[#FF3333]' : 'text-gray-900 hover:text-[#E10600]'
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Grouped right side elements for better performance */}
        <motion.div 
          className="hidden lg:flex lg:items-center lg:gap-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
        >
          {/* Book Now button */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/book"
              className={`flex-1 text-center block rounded-lg px-5 py-2 text-base font-semibold leading-7 text-white ${
                isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-[#E10600]/90'
              } font-['Titillium Web']`}
            >
              {bookText}
            </Link>
          </motion.div>
          
          {/* Theme and Language Switchers */}
          <div className="flex items-center lg:gap-x-3">
            {/* Theme Switcher */}
            <motion.button
              onClick={toggleTheme}
              className={`p-1.5 rounded-full ${isDark ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
            </motion.button>
            
            {/* Language Switcher */}
            <motion.button
              type="button"
              onClick={toggleLanguage}
              className={`flex items-center justify-center px-2.5 py-1 text-base font-semibold 
                ${isDark 
                  ? 'text-gray-100 hover:text-white' 
                  : 'text-gray-900 hover:text-black'
                } font-['Inter']`}
              aria-label="Toggle language"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {language === 'tr' ? 'TR' : 'EN'}
            </motion.button>
          </div>
        </motion.div>
      </nav>
      
      {/* Mobile menu - also update logo size */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="fixed inset-0 z-50 bg-black/30" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${
                isDark ? 'bg-[#1E1E1E]' : 'bg-white'
              } px-6 py-4 sm:max-w-sm sm:ring-1 ${
                isDark ? 'sm:ring-gray-100/10' : 'sm:ring-gray-900/10'
              }`}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
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
                <motion.button
                  type="button"
                  className={`rounded-md p-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.9 }}
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
                </motion.button>
              </div>
              <div className="mt-6 flow-root">
                <div className={`-my-6 divide-y ${isDark ? 'divide-gray-500/30' : 'divide-gray-500/10'}`}>
                  <div className="space-y-2 py-6">
                    {navigation.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.3 }}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
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
                      </motion.div>
                    ))}
                  </div>
                  <div className="py-6">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <motion.button
                        onClick={toggleTheme}
                        className={`p-2 rounded-md ${isDark ? 'text-gray-200 hover:bg-[#3A3A3A]' : 'text-gray-700 hover:bg-gray-200'}`}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9, rotate: 15 }}
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
                      </motion.button>
                      
                      <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          href="/book"
                          className={`flex-1 text-center block w-full rounded-lg py-2.5 text-lg font-semibold leading-7 text-white ${
                            isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-[#E10600]/90'
                          } font-['Titillium Web']`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {bookText}
                        </Link>
                      </motion.div>
                      
                      <motion.button
                        onClick={toggleLanguage}
                        className={`px-3 py-1 text-lg font-semibold font-['Inter'] ${
                          isDark 
                            ? 'text-gray-200 hover:text-white' 
                            : 'text-gray-700 hover:text-black'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {language === 'tr' ? 'TR' : 'EN'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;