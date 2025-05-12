import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: {
    tr: string;
    en: string;
  };
  className?: string;
};

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = { tr: 'Ara...', en: 'Search...' },
  className = ''
}: SearchInputProps) {
  const { isDark, language } = useThemeLanguage();
  const { borderClass } = getAdminThemeClasses(isDark);
  
  return (
    <input
      type="text"
      placeholder={language === 'tr' ? placeholder.tr : placeholder.en}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-1.5 md:px-4 md:py-2 rounded-md border ${borderClass} ${
        isDark ? 'bg-graphite text-white' : 'bg-white text-gray-800'
      } text-xs md:text-sm ${className}`}
    />
  );
} 