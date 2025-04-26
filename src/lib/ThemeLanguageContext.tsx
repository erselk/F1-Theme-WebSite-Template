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

// Default context values with English as default
const defaultContext: ThemeLanguageContextType = {
  language: 'en',
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
  const [language, setLanguage] = useState<LanguageType>('en');

  useEffect(() => {
    setMounted(true);
    // Check for language preference in cookie
    const savedLanguage = getCookie('NEXT_LOCALE');
    if (savedLanguage && ['tr', 'en'].includes(savedLanguage as string)) {
      setLanguage(savedLanguage as LanguageType);
    } else if (typeof window !== 'undefined') {
      // If no cookie exists and we're on client-side, check browser language
      const browserLanguage = navigator.language.split('-')[0];
      const detectedLanguage = ['tr', 'en'].includes(browserLanguage) ? browserLanguage as LanguageType : 'en';
      setLanguage(detectedLanguage);
      setCookie('NEXT_LOCALE', detectedLanguage);
    }
  }, []);

  // Safe getter for theme setting
  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const toggleLanguage = () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    setLanguage(newLanguage);
    setCookie('NEXT_LOCALE', newLanguage);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // Delay content on first render to prevent server/client mismatch
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