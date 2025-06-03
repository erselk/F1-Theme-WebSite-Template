'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({
  isOpen,
  onClose
}: MobileMenuProps) => {
  const pathname = usePathname();
  const { language, toggleLanguage } = useThemeLanguage();

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          onClick={onClose}
        />
        <motion.div 
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
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
                src="/images/logolight.png"
                alt="PadokClub"
                width={200}
                height={56}
              />
            </Link>
            <motion.button
              type="button"
              className="rounded-md p-2 text-gray-700"
              onClick={onClose}
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
            <div className="-my-6 divide-y divide-gray-500/10">
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
                          ? 'text-[#E10600]'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
              <div className="py-6">
                <div className="flex items-center justify-center gap-4 mb-6">
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
                      className="flex-1 text-center block w-full rounded-lg py-2.5 text-lg font-semibold leading-7 text-white bg-[#E10600] hover:bg-[#E10600]/90 font-['Titillium Web']"
                      onClick={onClose}
                    >
                      {bookText}
                    </Link>
                  </motion.div>
                  
                  <motion.button
                    onClick={toggleLanguage}
                    className="px-3 py-1 text-lg font-semibold font-['Inter'] text-gray-700 hover:text-black"
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
    </AnimatePresence>
  );
};

export default MobileMenu;