'use client';

import React from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

const AboutPageHeader: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className="mb-6 sm:mb-8 md:mb-12 text-center px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 text-dark-grey dark:text-light-grey">
        {language === 'tr' ? 'Hakkımızda' : 'About Us'}
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-medium-grey dark:text-silver max-w-3xl mx-auto">
        {language === 'tr' 
          ? 'PadokClub, teknoloji, eğlence ve sosyal yaşamı bir araya getiren benzersiz bir deneyim merkezi' 
          : 'PadokClub, a unique experience center that brings together technology, entertainment, and social life'}
      </p>
    </div>
  );
};

export default AboutPageHeader;