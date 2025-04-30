'use client';

import React from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

const BlogPageHeader: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className="mb-8 sm:mb-12 text-center">
      <h1 className="font-titillium-web text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-dark-grey dark:text-light-grey">
        {language === 'tr' ? 'Blog' : 'Blog'}
      </h1>
      <p className="font-inter text-base sm:text-xl text-medium-grey dark:text-silver max-w-3xl mx-auto">
        {language === 'tr' 
          ? 'F1 haberleri, analiz ve motorsport dünyasından içerikler' 
          : 'F1 news, analysis and content from the world of motorsport'}
      </p>
    </div>
  );
};

export default BlogPageHeader;