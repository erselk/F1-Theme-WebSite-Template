'use client';

import React from 'react';
import { Headset } from 'lucide-react';
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function ContactPageHeader() {
  const { language, isDark } = useThemeLanguage();
  
  // Translations
  const translations = {
    tr: {
      title: "İletişim",
      description: "Bizimle iletişime geçin, DeF1 deneyimini birlikte şekillendirelim."
    },
    en: {
      title: "Contact Us",
      description: "Get in touch with us and let's shape the DeF1 experience together."
    }
  };
  
  const t = translations[language];
  const headingTextClass = isDark ? 'text-white' : 'text-dark-grey';
  const subTextClass = isDark ? 'text-silver' : 'text-medium-grey';
  const iconClass = isDark ? 'text-electric-blue' : 'text-race-blue';
  
  return (
    <section className="py-10 md:py-14">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Headset className={`w-8 h-8 mr-3 ${iconClass}`} />
          <h1 className={`text-3xl md:text-4xl font-bold font-['Titillium_Web'] ${headingTextClass}`}>
            {t.title}
          </h1>
        </div>
        <p className={`text-md md:text-lg max-w-3xl mx-auto px-4 ${subTextClass}`}>
          {t.description}
        </p>
      </div>
    </section>
  );
}