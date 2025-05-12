import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type StatsCardProps = {
  title: {
    tr: string;
    en: string;
  };
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  valueColor?: string;
};

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = 'bg-electric-blue', 
  valueColor = 'text-electric-blue'
}: StatsCardProps) {
  const { isDark, language } = useThemeLanguage();
  const { cardClass, borderClass, textSecondaryClass } = getAdminThemeClasses(isDark);
  
  return (
    <div className={`${cardClass} rounded-lg shadow p-3 md:p-6 border ${borderClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-xs md:text-lg font-medium ${textSecondaryClass}`}>
            {language === 'tr' ? title.tr : title.en}
          </h3>
          <p className={`text-xl md:text-3xl font-bold mt-1 md:mt-2 ${valueColor}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={`p-2 md:p-3 rounded-full ${color} bg-opacity-20`}>
            <div className={color.replace('bg-', 'text-')}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 