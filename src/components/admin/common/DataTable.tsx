import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';
import Pagination from './Pagination';

type Column<T> = {
  header: {
    tr: string;
    en: string;
  };
  accessor: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hidden?: boolean | 'mobile';
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((item: T) => string | number);
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    indexOfFirstItem: number;
    indexOfLastItem: number;
    paginate: (pageNumber: number) => void;
  };
  emptyState?: {
    withFilters?: {
      tr: string;
      en: string;
    };
    withoutFilters?: {
      tr: string;
      en: string;
    };
    resetFilters?: () => void;
  };
  isFiltered?: boolean;
};

export default function DataTable<T>({
  columns,
  data,
  keyField,
  pagination,
  emptyState,
  isFiltered = false,
}: DataTableProps<T>) {
  const { isDark, language } = useThemeLanguage();
  const { 
    cardClass, 
    borderClass, 
    tableHeaderClass, 
    tableRowHoverClass, 
    textClass, 
    textSecondaryClass 
  } = getAdminThemeClasses(isDark);
  
  // Function to get a unique key for each row
  const getRowKey = (item: T): string => {
    if (typeof keyField === 'function') {
      return String(keyField(item));
    }
    return String(item[keyField]);
  };
  
  // Helper function to get a cell value from accessor path (supports nested fields)
  const getCellValue = (item: any, accessor: string): any => {
    const keys = String(accessor).split('.');
    let value = item;
    
    for (const key of keys) {
      if (value === null || value === undefined) return undefined;
      value = value[key];
    }
    
    return value;
  };
  
  return (
    <div className={`${cardClass} rounded-lg shadow border ${borderClass} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={tableHeaderClass}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`px-2 md:px-4 py-2 md:py-3 ${column.className || ''} ${
                    column.hidden === 'mobile' ? 'hidden md:table-cell' : column.hidden ? 'hidden' : ''
                  }`}
                >
                  <span>{language === 'tr' ? column.header.tr : column.header.en}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={textClass}>
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={getRowKey(item)} 
                  className={`border-t ${borderClass} ${tableRowHoverClass}`}
                >
                  {columns.map((column, index) => (
                    <td 
                      key={index} 
                      className={`px-2 md:px-4 py-2 md:py-3 ${column.className || ''} ${
                        column.hidden === 'mobile' ? 'hidden md:table-cell' : column.hidden ? 'hidden' : ''
                      }`}
                    >
                      {column.cell 
                        ? column.cell(item) 
                        : getCellValue(item, column.accessor as string)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className={`${textSecondaryClass} text-lg`}>
                    {isFiltered
                      ? (language === 'tr' ? emptyState?.withFilters?.tr : emptyState?.withFilters?.en) || 'No items match your search.'
                      : (language === 'tr' ? emptyState?.withoutFilters?.tr : emptyState?.withoutFilters?.en) || 'No items found.'}
                  </div>
                  {isFiltered && emptyState?.resetFilters && (
                    <div className="mt-2">
                      <button
                        className={`text-electric-blue hover:underline`}
                        onClick={emptyState.resetFilters}
                      >
                        {language === 'tr' ? 'Tüm öğeleri göster' : 'Show all items'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && <Pagination {...pagination} />}
    </div>
  );
} 