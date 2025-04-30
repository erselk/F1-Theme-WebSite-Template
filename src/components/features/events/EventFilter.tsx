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
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="relative">
      {/* Small Filter Button on Left */}
      <button 
        onClick={toggleFilter} 
        className={`flex items-center justify-center gap-1 px-2 py-1 rounded-md text-xs md:hidden ${
          isDark 
            ? 'bg-graphite border border-carbon-grey text-light-grey' 
            : 'bg-white border border-light-grey text-dark-grey'
        } ${isFilterOpen ? 'mb-2' : ''}`}
      >
        {/* Filter Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        <span>{language === 'tr' ? 'Filtrele' : 'Filter'}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      
      {/* Filter Content - Different styles for mobile and desktop */}
      <div className={`
        ${isFilterOpen ? 'block' : 'hidden'} md:block
        md:rounded-lg md:shadow-sm 
        ${isDark ? 'md:bg-graphite md:border md:border-carbon-grey' : 'md:bg-card md:border md:border-light-grey'}
      `}>
        <div className="p-2 md:p-3">
          <h2 className={`text-sm font-medium mb-2 hidden md:block ${
            isDark ? 'text-light-grey' : 'text-dark-grey'
          }`}>
            {language === 'tr' ? 'Etkinlikleri Filtrele' : 'Filter Events'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Search Input */}
            <div className="space-y-1">
              <label htmlFor="search" className={`text-xs font-medium flex items-center gap-1 ${
                isDark ? 'text-silver' : 'text-medium-grey'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className={`w-full px-2 py-1 text-xs rounded-md ${
                  isDark 
                    ? 'bg-dark-grey border border-carbon-grey text-light-grey placeholder:text-silver/70 focus:border-electric-blue' 
                    : 'bg-white border border-light-grey text-dark-grey placeholder:text-light-text-grey focus:border-race-blue'
                } outline-none transition-colors`}
              />
            </div>
            
            {/* Category Filter */}
            <div className="space-y-1">
              <label htmlFor="category" className={`text-xs font-medium flex items-center gap-1 ${
                isDark ? 'text-silver' : 'text-medium-grey'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className={`w-full px-2 py-1 text-xs rounded-md appearance-none ${
                  isDark 
                    ? 'bg-dark-grey border border-carbon-grey text-light-grey focus:border-electric-blue focus:ring-1 focus:ring-electric-blue' 
                    : 'bg-white border border-light-grey text-dark-grey focus:border-race-blue focus:ring-1 focus:ring-race-blue'
                } outline-none transition-colors`}
              >
                <option value="">
                  {language === 'tr' ? 'Tüm Kategoriler' : 'All Categories'}
                </option>
                <option value="workshop">
                  {language === 'tr' ? 'Atölye Çalışması' : 'Workshop'}
                </option>
                <option value="meetup">
                  {language === 'tr' ? 'Buluşma' : 'Meetup'}
                </option>
                <option value="conference">
                  {language === 'tr' ? 'Konferans' : 'Conference'}
                </option>
                <option value="race">
                  {language === 'tr' ? 'Yarış' : 'Race'}
                </option>
                <option value="other">
                  {language === 'tr' ? 'Diğer' : 'Other'}
                </option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="space-y-1">
              <label htmlFor="status" className={`text-xs font-medium flex items-center gap-1 ${
                isDark ? 'text-silver' : 'text-medium-grey'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className={`w-full px-2 py-1 text-xs rounded-md appearance-none ${
                  isDark 
                    ? 'bg-dark-grey border border-carbon-grey text-light-grey focus:border-electric-blue focus:ring-1 focus:ring-electric-blue' 
                    : 'bg-white border border-light-grey text-dark-grey focus:border-race-blue focus:ring-1 focus:ring-race-blue'
                } outline-none transition-colors`}
              >
                <option value="">
                  {language === 'tr' ? 'Tümü' : 'All'}
                </option>
                <option value="today">
                  {language === 'tr' ? 'Bugün' : 'Today'}
                </option>
                <option value="tomorrow">
                  {language === 'tr' ? 'Yarın' : 'Tomorrow'}
                </option>
                <option value="this-week">
                  {language === 'tr' ? 'Bu Hafta' : 'This Week'}
                </option>
                <option value="this-month">
                  {language === 'tr' ? 'Bu Ay' : 'This Month'}
                </option>
                <option value="upcoming">
                  {language === 'tr' ? 'Yakında' : 'Upcoming'}
                </option>
                <option value="past">
                  {language === 'tr' ? 'Geçmiş Etkinlikler' : 'Past Events'}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}