import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type ErrorStateProps = {
  error: string | null;
};

export default function ErrorState({ error }: ErrorStateProps) {
  const { isDark, language } = useThemeLanguage();
  const { cardClass } = getAdminThemeClasses(isDark);
  
  return (
    <div className={`${cardClass} rounded-lg shadow p-8`}>
      <div className="text-red-500 text-center">
        <h2 className="text-xl font-bold mb-2">{language === 'tr' ? 'Hata Oluştu' : 'Error Occurred'}</h2>
        <p>{error}</p>
      </div>
    </div>
  );
} 