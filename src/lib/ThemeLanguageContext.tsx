'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { setCookie, getCookie } from 'cookies-next';

export type LanguageType = 'tr' | 'en';

interface ThemeLanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  toggleLanguage: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

// Default context değerleri
const defaultContext: ThemeLanguageContextType = {
  language: 'tr',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isDark: false,
  toggleTheme: () => {},
  mounted: false,
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType>(defaultContext);

export function ThemeLanguageProvider({ children }: { children: ReactNode }) {
  const { setTheme, theme, systemTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState<LanguageType>('tr');

  useEffect(() => {
    setMounted(true);
    // Check for language preference in cookie
    const savedLanguage = getCookie('NEXT_LOCALE');
    if (savedLanguage && ['tr', 'en'].includes(savedLanguage as string)) {
      setLanguage(savedLanguage as LanguageType);
    } else if (typeof window !== 'undefined') {
      // Eğer cookie yoksa ve client tarafındaysak tarayıcı dilini kontrol et
      const browserLanguage = navigator.language.split('-')[0];
      const detectedLanguage = ['tr', 'en'].includes(browserLanguage) ? browserLanguage as LanguageType : 'tr';
      setLanguage(detectedLanguage);
      setCookie('NEXT_LOCALE', detectedLanguage);
    }
  }, []);

  // Theme ayarı için güvenli getter
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const toggleLanguage = () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLanguage);
    setCookie('NEXT_LOCALE', newLanguage);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Server/client uyumsuzluğunu önlemek için ilk render'da içeriği geciktir
  if (!mounted) {
    return (
      <ThemeLanguageContext.Provider value={defaultContext}>
        <div className="invisible">{children}</div>
      </ThemeLanguageContext.Provider>
    );
  }

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isDark,
        toggleTheme,
        mounted
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
}