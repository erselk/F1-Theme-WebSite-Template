import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type PageHeaderProps = {
  title: {
    tr: string;
    en: string;
  };
  description?: {
    tr: string;
    en: string;
  };
  actions?: React.ReactNode;
};

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  const { isDark, language } = useThemeLanguage();
  const { textClass, textSecondaryClass } = getAdminThemeClasses(isDark);
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className={`text-lg md:text-2xl font-bold ${textClass}`}>
          {language === 'tr' ? title.tr : title.en}
        </h1>
        {description && (
          <p className={`text-xs md:text-base ${textSecondaryClass}`}>
            {language === 'tr' ? description.tr : description.en}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2 md:gap-3">
          {actions}
        </div>
      )}
    </div>
  );
} 