import React from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { getAdminThemeClasses } from '@/lib/admin-utils';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  indexOfFirstItem: number;
  indexOfLastItem: number;
  paginate: (pageNumber: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  paginate
}: PaginationProps) {
  const { isDark, language } = useThemeLanguage();
  const { borderClass, textSecondaryClass, buttonSecondaryClass } = getAdminThemeClasses(isDark);
  
  if (totalPages <= 1) return null;
  
  return (
    <div className={`px-4 py-3 border-t ${borderClass} flex items-center justify-between`}>
      <div className={textSecondaryClass}>
        {language === 'tr' 
          ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalItems)} / ${totalItems} öğe gösteriliyor`
          : `Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, totalItems)} of ${totalItems} items`}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
        >
          «
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
        >
          ‹
        </button>
        
        {/* Page numbers */}
        {[...Array(totalPages)].map((_, i) => {
          const pageNumber = i + 1;
          // Show current page, and 1 page before and after
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => paginate(pageNumber)}
                className={`px-3 py-1 rounded-md ${
                  pageNumber === currentPage
                    ? 'bg-electric-blue text-white'
                    : buttonSecondaryClass
                }`}
              >
                {pageNumber}
              </button>
            );
          }
          // Show dots for skipped pages
          if (
            (pageNumber === 2 && currentPage > 3) ||
            (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
          ) {
            return <span key={pageNumber} className="px-3 py-1">…</span>;
          }
          return null;
        })}
        
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
        >
          ›
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'} ${buttonSecondaryClass}`}
        >
          »
        </button>
      </div>
    </div>
  );
} 