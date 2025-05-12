import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type LoadingStateProps = {
  height?: string;
};

export default function LoadingState({ height = 'h-64' }: LoadingStateProps) {
  const { isDark, language } = useThemeLanguage();
  const { cardClass, textClass } = getAdminThemeClasses(isDark);
  
  return (
    <div className={`${cardClass} rounded-lg shadow p-8 flex items-center justify-center ${height}`}>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
        <p className={`mt-4 ${textClass}`}>{language === 'tr' ? 'Yükleniyor...' : 'Loading...'}</p>
      </div>
    </div>
  );
} 