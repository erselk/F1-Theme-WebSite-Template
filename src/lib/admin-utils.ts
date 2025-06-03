import { useState, useEffect, useMemo } from 'react';

export const getAdminThemeClasses = (isDark: boolean) => {
  return {
    bgClass: isDark ? 'bg-[#cc41ab]' : 'bg-[#ff51d6]',
    textClass: isDark ? 'text-white' : 'text-gray-800',
    textSecondaryClass: isDark ? 'text-gray-300' : 'text-gray-500',
    borderClass: isDark ? 'border-[#c80800]' : 'border-[#fe0a00]',
    cardClass: isDark ? 'bg-[#cc8a00]' : 'bg-[#ffad00]',
    tableHeaderClass: isDark ? 'bg-[#c80800] text-white' : 'bg-[#fe0a00] text-white',
    tableRowHoverClass: isDark ? 'hover:bg-[#cc41ab]' : 'hover:bg-[#ff51d6]',
    buttonPrimaryClass: 'bg-[#fe0a00] hover:bg-[#e00900] text-white',
    buttonSecondaryClass: isDark
      ? 'bg-[#c80800] hover:bg-[#b30700] text-white'
      : 'bg-[#ff51d6] hover:bg-[#ff3dc9] text-white',
    buttonDangerClass: 'bg-[#fe0a00] hover:bg-[#e00900] text-white',
  };
};

export const formatPrice = (amount: number, language: string) => {
  const hasDecimal = amount % 1 !== 0;
  
  return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: hasDecimal ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string, language: string, dateOnly: boolean = false) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(dateOnly ? {} : { hour: '2-digit', minute: '2-digit' })
  };
  
  return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
};

export const formatTimeRange = (startTime: string, endTime: string, language: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';
  return `${start.toLocaleTimeString(locale, options)} - ${end.toLocaleTimeString(locale, options)}`;
};

export function useFilteredData<T>({
  data,
  searchTerm,
  searchFields,
  sortField = '',
  sortDirection = 'desc',
  itemsPerPage = 10,
}: {
  data: T[];
  searchTerm: string;
  searchFields: (keyof T | string)[];
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  itemsPerPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];
    
    let result = data;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      result = data.filter((item: any) => {
        try {
          return searchFields.some(field => {
            const fieldPath = String(field).split('.');
            let value = item;
            
            for (const key of fieldPath) {
              if (value === null || value === undefined) return false;
              value = value[key];
            }
            
            if (value === null || value === undefined) return false;
            
            if (typeof value === 'object') {
              return Object.values(value).some(v => 
                v !== null && 
                v !== undefined && 
                String(v).toLowerCase().includes(searchLower)
              );
            }
            
            return String(value).toLowerCase().includes(searchLower);
          });
        } catch (err) {
          return false;
        }
      });
    }
    
    if (sortField) {
      result.sort((a: any, b: any) => {
        let fieldA = getNestedValue(a, sortField);
        let fieldB = getNestedValue(b, sortField);
        
        if (fieldA instanceof Date || (typeof fieldA === 'string' && !isNaN(Date.parse(fieldA)))) {
          fieldA = new Date(fieldA).getTime();
          fieldB = new Date(fieldB).getTime();
        }
        
        if (fieldA === undefined && fieldB === undefined) return 0;
        if (fieldA === undefined) return 1;
        if (fieldB === undefined) return -1;
        
        const comparison = fieldA > fieldB ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return result;
  }, [data, searchTerm, searchFields, sortField, sortDirection]);
  
  function getNestedValue(obj: any, path: string) {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    
    return value;
  }
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  const currentItems = useMemo(() => {
    try {
      return filteredData.slice(indexOfFirstItem, indexOfLastItem);
    } catch (err) {
      return [];
    }
  }, [filteredData, indexOfFirstItem, indexOfLastItem]);
  
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  return {
    filteredData,
    currentItems,
    currentPage,
    totalPages,
    totalItems,
    indexOfFirstItem,
    indexOfLastItem,
    paginate,
  };
}
