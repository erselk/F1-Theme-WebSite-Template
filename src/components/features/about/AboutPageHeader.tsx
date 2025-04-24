'use client';

import React from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

const AboutPageHeader: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className="mb-12 text-center">
      <h1 className="text-4xl font-bold mb-4 text-dark-grey dark:text-light-grey">
        {language === 'tr' ? 'Hakkımızda' : 'About Us'}
      </h1>
      <p className="text-xl text-medium-grey dark:text-silver max-w-3xl mx-auto">
        {language === 'tr' 
          ? 'PadokClub, teknoloji, eğlence ve sosyal yaşamı bir araya getiren benzersiz bir deneyim merkezi' 
          : 'PadokClub, a unique experience center that brings together technology, entertainment, and social life'}
      </p>
    </div>
  );
};

export default AboutPageHeader;