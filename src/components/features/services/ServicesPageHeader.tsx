'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

const ServicesPageHeader: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  
  return (
    <div className={`w-full py-6 px-6 ${isDark ? 'bg-dark-grey' : 'bg-white'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-6 text-center pt-0"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-0"
        >
          <h1 
            className={`text-3xl md:text-4xl font-bold mb-1 font-titillium-web ${
              isDark ? 'text-white' : 'text-dark-grey'
            }`}
          >
            {language === 'tr' ? 'Hizmetlerimiz' : 'Our Services'}
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div 
            className={`w-24 h-1 mb-2 ${
              isDark ? 'bg-f1-red-bright' : 'bg-f1-red'
            }`}
          ></div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className={`max-w-3xl mx-auto text-base md:text-xl leading-tight font-inter ${
            isDark ? 'text-light-grey' : 'text-medium-grey'
          }`}
        >
          {language === 'tr' 
            ? 'Padok Club, fiziksel ve dijital deneyimleri birleştiren, disiplinler arası etkileşimi destekleyen çok katlı bir teknoloji, eğlence ve sosyalleşme merkezidir.'
            : 'Padok Club is a multi-level technology, entertainment, and social hub that combines physical and digital experiences while supporting interdisciplinary interactions.'}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default ServicesPageHeader;