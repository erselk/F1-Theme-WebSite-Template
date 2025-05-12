import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type AdminCardProps = {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

export default function AdminCard({ children, className = '', noPadding = false }: AdminCardProps) {
  const { isDark } = useThemeLanguage();
  const { cardClass, borderClass } = getAdminThemeClasses(isDark);
  
  return (
    <div className={`${cardClass} rounded-lg shadow border ${borderClass} ${noPadding ? '' : 'p-3 md:p-4'} ${className}`}>
      {children}
    </div>
  );
} 