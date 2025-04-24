'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { setCookie, getCookie } from 'cookies-next';

export const useLocale = () => {
  const pathname = usePathname();
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<string>('tr'); // Default to Turkish
  
  // On mount, detect browser language or use saved preference
  useEffect(() => {
    // First check if there's a saved preference in cookies
    const savedLocale = getCookie('NEXT_LOCALE');
    
    if (savedLocale && ['tr', 'en'].includes(savedLocale as string)) {
      setLocale(savedLocale as string);
    } else if (i18n.language) {
      // If no cookie but i18n has a language set, use that
      setLocale(i18n.language);
    } else {
      // Otherwise detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      const detectedLocale = ['tr', 'en'].includes(browserLanguage) ? browserLanguage : 'tr';
      setLocale(detectedLocale);
      setCookie('NEXT_LOCALE', detectedLocale);
    }
  }, [i18n.language]);

  const changeLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      // Set locale in state
      setLocale(newLocale);
      
      // Save locale preference in a cookie
      setCookie('NEXT_LOCALE', newLocale);
      
      // Force reload WITHOUT adding language to URL
      if (typeof document !== 'undefined') {
        const currentPath = window.location.pathname;
        // Strip any language prefix that might be there (/en/, /tr/)
        const pathWithoutLang = currentPath.replace(/^\/(en|tr)/, '') || '/';
        
        // Set the cookie and reload the current page without changing URL
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        window.location.href = pathWithoutLang;
      }
    }
  };

  return {
    locale,
    changeLocale,
  };
};