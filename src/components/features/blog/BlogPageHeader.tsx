'use client';

import React from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { blogTranslations } from "@/translations/blog";

const BlogPageHeader: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  const translations = blogTranslations[language];
  
  return (
    <div className="mb-8 sm:mb-12 text-center">
      <h1 className="font-titillium-web text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-dark-grey dark:text-light-grey">
        {translations.pageTitle}
      </h1>
      <p className="font-inter text-base sm:text-xl text-medium-grey dark:text-silver max-w-3xl mx-auto">
        {translations.description}
      </p>
    </div>
  );
};

export default React.memo(BlogPageHeader);