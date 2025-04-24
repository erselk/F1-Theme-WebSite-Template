'use client';

import { useState } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export interface EventFilters {
  search: string;
  category: string;
  status: string;
}

interface EventFilterProps {
  onFilterChange: (filters: EventFilters) => void;
}

export function EventFilter({ onFilterChange }: EventFilterProps) {
  const { language, isDark } = useThemeLanguage();
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: '',
    status: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${
      isDark ? 'bg-graphite border border-carbon-grey' : 'bg-card border border-light-grey'
    }`}>
      <h2 className={`font-medium mb-4 ${
        isDark ? 'text-light-grey' : 'text-dark-grey'
      }`}>
        {language === 'tr' ? 'Etkinlikleri Filtrele' : 'Filter Events'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label htmlFor="search" className={`text-sm font-medium flex items-center gap-1 ${
            isDark ? 'text-silver' : 'text-medium-grey'
          }`}>
            {/* Search SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {language === 'tr' ? 'Ara' : 'Search'}
          </label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder={language === 'tr' ? 'Etkinlik ara...' : 'Search events...'}
            value={filters.search}
            onChange={handleFilterChange}
            className={`w-full px-3 py-2 rounded-md ${
              isDark 
                ? 'bg-dark-grey border border-carbon-grey text-light-grey placeholder:text-silver/70 focus:border-electric-blue' 
                : 'bg-white border border-light-grey text-dark-grey placeholder:text-light-text-grey focus:border-race-blue'
            } outline-none transition-colors`}
          />
        </div>
        
        {/* Category Filter */}
        <div className="space-y-2">
          <label htmlFor="category" className={`text-sm font-medium flex items-center gap-1 ${
            isDark ? 'text-silver' : 'text-medium-grey'
          }`}>
            {/* Tag SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
            {language === 'tr' ? 'Kategori' : 'Category'}
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className={`w-full px-3 py-2 rounded-md appearance-none bg-no-repeat bg-right ${
              isDark 
                ? 'bg-dark-grey border border-carbon-grey text-light-grey focus:border-electric-blue focus:ring-1 focus:ring-electric-blue' 
                : 'bg-white border border-light-grey text-dark-grey focus:border-race-blue focus:ring-1 focus:ring-race-blue'
            } outline-none transition-colors`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? '%23aaa' : '%23666'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, 
              backgroundPosition: 'right 8px center',
              colorScheme: isDark ? 'dark' : 'light'
            }}
          >
            <option value="" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}
            </option>
            <option value="workshop" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Atölye Çalışması' : 'Workshop'}
            </option>
            <option value="meetup" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Buluşma' : 'Meetup'}
            </option>
            <option value="conference" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Konferans' : 'Conference'}
            </option>
            <option value="race" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Yarış' : 'Race'}
            </option>
            <option value="other" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Diğer' : 'Other'}
            </option>
          </select>
        </div>
        
        {/* Status Filter */}
        <div className="space-y-2">
          <label htmlFor="status" className={`text-sm font-medium flex items-center gap-1 ${
            isDark ? 'text-silver' : 'text-medium-grey'
          }`}>
            {/* Calendar SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {language === 'tr' ? 'Durum' : 'Status'}
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={`w-full px-3 py-2 rounded-md appearance-none bg-no-repeat bg-right ${
              isDark 
                ? 'bg-dark-grey border border-carbon-grey text-light-grey focus:border-electric-blue focus:ring-1 focus:ring-electric-blue' 
                : 'bg-white border border-light-grey text-dark-grey focus:border-race-blue focus:ring-1 focus:ring-race-blue'
            } outline-none transition-colors`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${isDark ? '%23aaa' : '%23666'}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, 
              backgroundPosition: 'right 8px center',
              colorScheme: isDark ? 'dark' : 'light'
            }}
          >
            <option value="" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Tümü' : 'All'}
            </option>
            <option value="today" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Bugün' : 'Today'}
            </option>
            <option value="tomorrow" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Yarın' : 'Tomorrow'}
            </option>
            <option value="this-week" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Bu Hafta' : 'This Week'}
            </option>
            <option value="upcoming" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Yakında' : 'Upcoming'}
            </option>
            <option value="past" style={{ backgroundColor: isDark ? '#262626' : '#FFFFFF', color: isDark ? '#E0E0E0' : '#333333' }}>
              {language === 'tr' ? 'Geçmiş Etkinlikler' : 'Past Events'}
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}