'use client';

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { useSearchParams } from "next/navigation";
import { BlogPost } from "@/types";
import useSWRFetch from "@/hooks/useSWRFetch";
import { BLOG_CATEGORIES, ITEMS_PER_PAGE } from "@/constants/blog";
import { blogTranslations } from "@/translations/blog";
import BlogCard from "./BlogCard";

// SearchParams hook'unu kullanan bir bileşen oluşturarak Suspense ile sarmalayacağız
const BlogContentWithSearch: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  const translations = blogTranslations[language];
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  
  // SWR ile blog verilerini çek - optimize edilmiş ayarlar
  const { data, error, isLoading, mutate } = useSWRFetch<{ blogs: BlogPost[], success: boolean }>(
    '/api/blogs',
    { 
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 dakika
    }
  );
  
  // Set active filters from URL query parameters if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    const authorParam = searchParams.get('author');
    if (authorParam) {
      setActiveAuthor(authorParam);
    }
    
    // Sayfa değiştiğinde, sayfa numarasını sıfırla
    setPage(1);
  }, [searchParams]);

  // Sort blogs by date (newest to oldest) and filter by category and/or author
  const filteredBlogs = useMemo(() => {
    // Blog verisi yoksa boş dizi döndür
    if (!data?.blogs) return [];
    
    // First sort all blogs by date (newest first)
    const sortedBlogs = [...data.blogs].sort((a, b) => {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
    
    // Then filter by category and/or author if needed
    return sortedBlogs.filter(blog => {
      const categoryMatch = activeCategory === 'all' || blog.category === activeCategory;
      const authorMatch = !activeAuthor || blog.author.name === activeAuthor;
      return categoryMatch && authorMatch;
    });
  }, [activeCategory, activeAuthor, data?.blogs]);
  
  // Sayfalandırılmış blogları al
  const paginatedBlogs = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredBlogs.slice(startIndex, endIndex);
  }, [filteredBlogs, page]);
  
  // Toplam sayfa sayısını hesapla
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  
  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Handle clearing author filter
  const clearAuthorFilter = () => {
    setActiveAuthor(null);
    setPage(1);
  };

  // Verileri manuel olarak yenileme fonksiyonu
  const refreshData = () => {
    mutate(); // SWR'nin mutate fonksiyonu ile verileri yenile
  };

  // Daha fazla göster butonuna tıklandığında sayfayı artır
  const handleShowMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Kategori adını bul
  const getCategoryName = (categoryId: string) => {
    return BLOG_CATEGORIES.find(c => c.id === categoryId)?.name[language] || categoryId;
  };

  // Eğer hata varsa, hata durumu göster
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">
          {translations.loadingError}
        </p>
        <button 
          onClick={refreshData}
          className={`px-4 py-2 rounded ${isDark ? 'bg-neon-red' : 'bg-f1-red'} text-white`}
        >
          {translations.tryAgain}
        </button>
      </div>
    );
  }

  // Eğer yükleme devam ediyorsa, yükleme durumu göster
  if (isLoading) {
    return <BlogLoadingState />;
  }

  return (
    <div className="mb-12 sm:mb-16 px-2 sm:px-4 md:px-8 lg:px-12 text-[13px] sm:text-base">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
        {BLOG_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id);
              setPage(1); // Kategori değiştiğinde sayfa sıfırlanmalı
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all text-xs sm:text-base font-medium ${
              activeCategory === category.id
                ? isDark
                  ? 'bg-neon-red text-white shadow-[0_0_8px_rgba(255,51,51,0.5)] border-2 border-neon-red transform scale-[1.03] sm:scale-105' 
                  : 'bg-f1-red text-black shadow-md border-2 border-f1-red transform scale-[1.03] sm:scale-105'
                : isDark
                  ? 'bg-graphite text-silver hover:bg-graphite/80 border-2 border-transparent'
                  : 'bg-very-light-grey text-medium-grey hover:bg-light-grey border-2 border-transparent'
            }`}
            aria-pressed={activeCategory === category.id}
          >
            {category.name[language]}
          </button>
        ))}
      </div>
      
      {/* Author filter indicator if active */}
      {activeAuthor && (
        <div className="flex items-center justify-center mb-4 sm:mb-6">
          <div className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm text-white ${isDark ? 'bg-graphite' : 'bg-medium-grey'}`}>
            <span className="mr-1 sm:mr-2">
              {translations.author} {activeAuthor}
            </span>
            <button 
              onClick={clearAuthorFilter}
              className="hover:text-light-grey"
              aria-label={translations.clearAuthorFilter}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {filteredBlogs.length === 0 ? (
        /* Empty state message */
        <div className="text-center py-12 sm:py-16">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
              className={isDark ? "text-silver" : "text-medium-grey"}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-titillium-web mb-2">
            {activeAuthor 
              ? `${activeAuthor} ${translations.noBlogsFoundByAuthor}`
              : translations.noBlogsFoundInCategory
            }
          </h3>
          <p className="text-xs sm:text-base text-medium-grey dark:text-silver max-w-md mx-auto mb-6 sm:mb-8">
            {translations.selectDifferentCategory}
          </p>
        </div>
      ) : (
        /* Blog grid layout ve pagination */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {paginatedBlogs.map((blog) => (
              <BlogCard 
                key={blog.id}
                blog={blog}
                language={language}
                isDark={isDark}
                formatDate={formatDate}
                categoryName={getCategoryName(blog.category)}
              />
            ))}
          </div>
          
          {/* "Daha Fazla Göster" butonu - sadece gösterilecek daha fazla blog varsa */}
          {page < totalPages && (
            <div className="flex justify-center mt-8 sm:mt-12">
              <button
                onClick={handleShowMore}
                className={`px-5 py-2 rounded-full text-sm sm:text-base font-medium transition-colors ${
                  isDark
                    ? 'bg-graphite text-silver hover:bg-graphite/80'
                    : 'bg-very-light-grey text-medium-grey hover:bg-light-grey'
                }`}
              >
                {translations.showMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Ana bileşen
const BlogContent: React.FC = () => {
  return <BlogContentWithSearch />;
};

// Loading state bileşeni
const BlogLoadingState: React.FC = () => {
  const { isDark } = useThemeLanguage();
  
  return (
    <div className="mb-12 sm:mb-16 px-2 sm:px-4 md:px-8 lg:px-12">
      {/* Yükleme animasyonu */}
      <div className="flex justify-end mb-4">
        <div className="w-16 h-4 bg-gray-300 dark:bg-graphite rounded animate-pulse"></div>
      </div>
      
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full animate-pulse ${
              isDark ? 'bg-graphite' : 'bg-very-light-grey'
            }`}
            style={{ width: `${40 + i * 10}px` }}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video rounded-lg mb-3 sm:mb-4 bg-gray-300 dark:bg-graphite" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-3/4" />
              <div className="h-4 sm:h-6 bg-gray-300 dark:bg-graphite rounded w-full" />
              <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-full" />
              <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-2/3" />
              <div className="pt-1 sm:pt-2 flex items-center">
                <div className="rounded-full bg-gray-300 dark:bg-graphite h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-16 sm:w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogContent;