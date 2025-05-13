'use client';

import { LanguageType } from '@/lib/ThemeLanguageContext';

interface FormLanguageSelectorProps {
  formLanguage: LanguageType;
  onChange: (language: LanguageType) => void;
  isDark: boolean;
}

export default function FormLanguageSelector({ formLanguage, onChange, isDark }: FormLanguageSelectorProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
        {formLanguage === 'tr' ? 'İçerik Dili' : 'Content Language'}
      </label>
      <div className="flex items-center space-x-4">
        <select
          value={formLanguage}
          onChange={(e) => onChange(e.target.value as LanguageType)}
          className={`px-3 py-2 rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
              : 'bg-white border border-light-grey text-dark-grey'
          }`}
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
        
        <p className={`text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' 
            ? 'İçerik Türkçe girilecek ve yayınlanırken İngilizceye çevrilecek.'
            : 'Content will be entered in English and translated to Turkish when published.'}
        </p>
      </div>
    </div>
  );
} 