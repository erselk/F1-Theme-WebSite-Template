'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  isDark: boolean;
  language: string;
  navigation: Array<{ name: string; href: string }>;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  bookText: string;
}

const MobileMenu = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  isDark,
  language,
  navigation,
  toggleTheme,
  toggleLanguage,
  bookText
}: MobileMenuProps) => {
  if (!mobileMenuOpen) return null;
  
  return (
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
            <span className="sr-only">DeF1Club</span>
            <Image
              className="h-14 w-auto"
              src={isDark ? '/images/logodark.png' : '/images/logolight.png'}
              alt="DeF1Club"
              width={150}
              height={42}
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
                      isDark 
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
  );
};

export default MobileMenu;