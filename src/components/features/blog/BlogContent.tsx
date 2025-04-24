'use client';

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { getBlogs } from "@/data/blogs";
import { useSearchParams } from "next/navigation";

const BlogContent: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeAuthor, setActiveAuthor] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const blogs = getBlogs();
  
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
  }, [searchParams]);
  
  // Categories
  const categories = [
    { id: "all", name: { tr: "Tümü", en: "All" } },
    { id: "f1", name: { tr: "Formula 1", en: "Formula 1" } },
    { id: "technology", name: { tr: "Teknoloji", en: "Technology" } },
    { id: "events", name: { tr: "Etkinlikler", en: "Events" } },
    { id: "interviews", name: { tr: "Röportajlar", en: "Interviews" } },
    { id: "other", name: { tr: "Diğer", en: "Other" } }
  ];

  // Sort blogs by date (newest to oldest) and filter by category and/or author
  const filteredBlogs = useMemo(() => {
    // First sort all blogs by date (newest first)
    const sortedBlogs = [...blogs].sort((a, b) => {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
    
    // Then filter by category and/or author if needed
    return sortedBlogs.filter(blog => {
      const categoryMatch = activeCategory === 'all' || blog.category === activeCategory;
      const authorMatch = !activeAuthor || blog.author.name === activeAuthor;
      return categoryMatch && authorMatch;
    });
  }, [activeCategory, activeAuthor, blogs]);
  
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
  };

  return (
    <div className="mb-16 px-4 md:px-8 lg:px-12">
      {/* Category filters */}
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full transition-all font-medium ${
              activeCategory === category.id
                ? isDark
                  ? 'bg-neon-red text-white shadow-[0_0_10px_rgba(255,51,51,0.5)] border-2 border-neon-red transform scale-105' 
                  : 'bg-f1-red text-black shadow-md border-2 border-f1-red transform scale-105'
                : isDark
                  ? 'bg-graphite text-silver hover:bg-graphite/80 border-2 border-transparent'
                  : 'bg-very-light-grey text-medium-grey hover:bg-light-grey border-2 border-transparent'
            }`}
          >
            {category.name[language]}
          </button>
        ))}
      </div>
      
      {/* Author filter indicator if active */}
      {activeAuthor && (
        <div className="flex items-center justify-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-white ${isDark ? 'bg-graphite' : 'bg-medium-grey'}`}>
            <span className="mr-2">
              {language === 'tr' ? 'Yazar:' : 'Author:'} {activeAuthor}
            </span>
            <button 
              onClick={clearAuthorFilter}
              className="hover:text-light-grey"
              aria-label={language === 'tr' ? 'Yazar filtresini kaldır' : 'Clear author filter'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {filteredBlogs.length === 0 ? (
        /* Empty state message */
        <div className="text-center py-16">
          <div className="w-16 h-16 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" 
              className={isDark ? "text-silver" : "text-medium-grey"}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold font-titillium-web mb-2">
            {activeAuthor 
              ? language === 'tr' 
                ? `${activeAuthor} tarafından yazılmış blog bulunamadı` 
                : `No blogs found written by ${activeAuthor}`
              : language === 'tr' 
                ? 'Bu kategoride blog bulunamadı' 
                : 'No blogs found in this category'
            }
          </h3>
          <p className="text-medium-grey dark:text-silver max-w-md mx-auto mb-8">
            {language === 'tr' 
              ? 'Lütfen farklı bir kategori seçin veya daha sonra tekrar kontrol edin.' 
              : 'Please select a different category or check back later.'}
          </p>
        </div>
      ) : (
        /* Blog grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="group">
              <Link href={`/blog/${blog.slug}`} className="block">
                <div className="relative aspect-video overflow-hidden rounded-lg mb-4">
                  <Image 
                    src={blog.thumbnailImage} 
                    alt={blog.title[language]} 
                    fill 
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-medium-grey dark:text-silver">
                    <span>{formatDate(blog.publishDate)}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{categories.find(c => c.id === blog.category)?.name[language]}</span>
                  </div>
                  
                  <h3 className={`text-xl font-semibold font-titillium-web transition-colors ${isDark ? 'group-hover:text-neon-red' : 'group-hover:text-f1-red'}`}>
                    {blog.title[language]}
                  </h3>
                  
                  <p className="text-medium-grey dark:text-silver line-clamp-2">
                    {blog.excerpt[language]}
                  </p>
                  
                  <div className="flex items-center pt-2">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent link
                        window.location.href = `/blog?author=${encodeURIComponent(blog.author.name)}`;
                      }}
                      className="flex items-center group cursor-pointer"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden mr-3">
                        {blog.author.avatar ? (
                          <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-graphite text-silver' : 'bg-light-grey text-dark-grey'}`}>
                            {blog.author.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium group-hover:underline">{blog.author.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogContent;