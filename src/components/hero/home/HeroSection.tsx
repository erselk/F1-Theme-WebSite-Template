import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const HeroSection = () => {
  const sectionRef = useRef(null);

  return (
    <section 
      ref={sectionRef}
      className="py-6 sm:py-10 text-white relative overflow-hidden border-4 border-white"
    >
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-8 w-[98%] sm:w-auto overflow-hidden">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <h1 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] text-white">
            {translations.heroTitle}
          </h1>
          <p className="mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base text-white/80 font-['Inter']">
            {translations.heroSubtitle}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 lg:gap-6 items-center justify-center">
          <motion.div 
            className="w-full sm:w-1/2 p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg bg-transparent border-4 border-white/30 relative overflow-hidden"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative z-10">
              <h2 className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] text-white mb-1 sm:mb-2">
                {translations.heroFeature1Title}
              </h2>
              <p className="text-white/80 font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal">
                {translations.heroFeature1Desc}
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full sm:w-1/2 p-2 sm:p-4 rounded-lg sm:rounded-xl shadow-lg bg-transparent border-4 border-white/30 relative overflow-hidden"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative z-10">
              <h2 className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] text-white mb-1 sm:mb-2">
                {translations.heroFeature2Title}
              </h2>
              <p className="text-white/80 font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal">
                {translations.heroFeature2Desc}
              </p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-4 sm:mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/book"
            className="inline-block bg-[#E10600] hover:bg-[#E10600]/90 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors border-4 border-white/30"
          >
            {translations.heroCTA}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection; 