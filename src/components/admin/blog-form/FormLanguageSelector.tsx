'use client';

import { LanguageType } from '@/lib/ThemeLanguageContext';

interface FormLanguageSelectorProps {
  formLanguage: LanguageType;
  onChange: (language: LanguageType) => void;
  isDark: boolean;
}

export default function FormLanguageSelector({ formLanguage, onChange, isDark }: FormLanguageSelectorProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
        {formLanguage === 'tr' ? 'İçerik Dili' : 'Content Language'}
      </label>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <select
          value={formLanguage}
          onChange={(e) => onChange(e.target.value as LanguageType)}
          className={`px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
              : 'bg-white border border-light-grey text-dark-grey'
          }`}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
        
        <p className={`text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' 
            ? 'İçerik Türkçe girilecek ve yayınlanırken İngilizceye çevrilecek.'
            : 'Content will be entered in English and translated to Turkish when published.'}
        </p>
      </div>
    </div>
  );
} 