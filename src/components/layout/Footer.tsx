'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

const Footer = () => {
  const { t } = useTranslation('common');
  const { language, isDark, mounted } = useThemeLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tr: [
      { name: 'Ana Sayfa', href: '/', useLocale: undefined },
      { name: 'Etkinlikler', href: '/events' },
      { name: 'Hizmetlerimiz', href: '/services' },
      { name: 'Hakkımızda', href: '/about' },
      { name: 'İletişim', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
    ],
    en: [
      { name: 'Home', href: '/', useLocale: undefined },
      { name: 'Events', href: '/events' },
      { name: 'Services', href: '/services' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Blog', href: '/blog' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ]
  };

  const locationInfo = {
    tr: {
      title: 'Konum',
      address: 'Levent, Levent Cd. NO:51, 34330 Beşiktaş/İstanbul',
      directions: 'Yol Tarifi Al',
    },
    en: {
      title: 'LOCATION',
      address: 'Levent, Levent St. NO:51, 34330 Besiktas/Istanbul',
      directions: 'Get Directions',
    }
  };

  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )},
    { name: 'Facebook', url: 'https://facebook.com/padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    )},
    { name: 'X', url: 'https://x.com/padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0082L3.2002 21H4.75404L10.7663 14.0121L15.5549 21H20.7996L13.6823 10.6218ZM11.5541 13.0887L10.8574 12.0511L5.31391 4.16788H7.70053L12.1742 10.5782L12.8709 11.6158L18.6854 19.8321H16.2988L11.5541 13.0887Z" />
      </svg>
    )},
    { name: 'YouTube', url: 'https://youtube.com/@padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )},
    { name: 'TikTok', url: 'https://tiktok.com/@padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )},
    { name: 'LinkedIn', url: 'https://linkedin.com/company/padokclub', icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )},
  ];

  if (!mounted) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="animate-pulse h-40 w-full bg-gray-800 rounded"></div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`${isDark ? 'bg-[#1E1E1E] text-white' : 'bg-gray-900 text-white'}`}>
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-6">
              <Link href="/" locale={undefined} className="inline-block">
                <Image
                  className="h-16 w-auto"
                  src="/images/logodark.png"
                  alt="PadokClub"
                  width={160}
                  height={64}
                />
              </Link>
            </div>
            <div className="flex space-x-4 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isDark ? 'text-gray-300 hover:text-[#FF3333]' : 'text-gray-300 hover:text-[#E10600]'}`}
                  aria-label={social.name}
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold font-['Titillium Web'] uppercase tracking-wide mb-4">
                {language === 'tr' ? 'Bağlantılar' : 'LINKS'}
              </h3>
              <ul className="space-y-2">
                {footerLinks[language as 'tr' | 'en'].slice(0, 4).map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      locale={link.useLocale}
                      className={`text-sm ${isDark ? 'text-gray-300 hover:text-[#FF3333]' : 'text-gray-300 hover:text-[#E10600]'}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold font-['Titillium Web'] uppercase tracking-wide mb-4 opacity-0">
                {language === 'tr' ? 'Bağlantılar' : 'Links'}
              </h3>
              <ul className="space-y-2">
                {footerLinks[language as 'tr' | 'en'].slice(4).map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      locale={link.useLocale}
                      className={`text-sm ${isDark ? 'text-gray-300 hover:text-[#FF3333]' : 'text-gray-300 hover:text-[#E10600]'}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold font-['Titillium Web'] uppercase tracking-wide mb-4">
              {locationInfo[language as 'tr' | 'en'].title}
            </h3>
            <address className="not-italic text-sm text-gray-300 mb-4">
              {locationInfo[language as 'tr' | 'en'].address}
            </address>
            <a 
              href="https://maps.app.goo.gl/epxeP5PZGRGeCkC88" 
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center text-sm ${
                isDark ? 'text-[#FF3333] hover:text-[#FF6666]' : 'text-[#E10600] hover:text-[#E13330]'
              } font-['Inter']`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {locationInfo[language as 'tr' | 'en'].directions}
            </a>
          </div>
          <div className="w-full h-48 md:h-40 lg:h-52 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.502893564132!2d29.0206296!3d41.0798576!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7a49fe953f3%3A0x6bfe4560f584590e!2sOMEN%20CLUB%20TSYD!5e0!3m2!1str!2str!4v1745068634657!5m2!1str!2str" 
              width="100%" 
              height="100%" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="PadokClub Location"
            />
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-gray-400 font-['Inter']">
              &copy; {currentYear} PadokClub. {language === 'tr' ? 'Tüm Hakları Saklıdır.' : 'All Rights Reserved.'}
            </p>
            <Link 
              href="/book" 
              className={`mt-4 md:mt-0 text-sm px-4 py-2 rounded-md font-['Titillium Web'] font-semibold ${
                isDark 
                  ? 'bg-[#FF0000] text-white hover:bg-[#FF3333]' 
                  : 'bg-[#E10600] text-white hover:bg-[#E10600]/90'
              }`}
            >
              {language === 'tr' ? 'Rezervasyon Yap' : 'Book Now'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;