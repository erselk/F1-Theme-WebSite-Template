'use client';

import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { motion } from "framer-motion";

type CTASectionProps = {
  translations: {
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton1: string;
    ctaButton2: string;
  };
};

export default function CTASection({ translations }: CTASectionProps) {
  const { isDark } = useThemeLanguage();

  return (
    <section className={`py-6 sm:py-10 ${isDark ? 'bg-[#FF0000] text-white' : 'bg-[#E10600] text-white'} overflow-hidden relative`}>
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 left-0 w-16 h-16 rounded-full bg-white/10"
        initial={{ x: -50, y: -50 }}
        animate={{ 
          x: [0, 100, 50, 0], 
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-white/10"
        initial={{ x: 50, y: 50 }}
        animate={{ 
          x: [0, -100, -50, 0], 
          y: [0, -50, -100, 0],
          scale: [1, 0.8, 1.2, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <motion.h2 
          className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] mb-2 sm:mb-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {translations.ctaTitle || "Formula 1 Deneyimini Yaşamaya Hazır mısınız?"}
        </motion.h2>
        
        <motion.p 
          className="mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base text-red-100 mb-4 sm:mb-8 max-w-3xl mx-auto font-['Inter']"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {translations.ctaSubtitle || "Profesyonel simülatörlerimizle gerçek F1 pilotu gibi hissedin. Bireysel seanslar veya grup etkinlikleri için hemen rezervasyon yapın."}
        </motion.p>
        
        <motion.div 
          className="flex flex-row justify-center gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/book"
              className={`rounded-md px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold shadow-sm ${
                isDark 
                  ? 'bg-white text-[#FF0000] hover:bg-[#E0E0E0]' 
                  : 'bg-white text-[#E10600] hover:bg-gray-100'
              }`}
            >
              {translations.ctaButton1}
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/contact"
              className="rounded-md border border-white px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-base font-semibold text-white shadow-sm hover:bg-white/10"
            >
              {translations.ctaButton2}
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Racing line animation */}
      <motion.div 
        className="absolute h-1 bg-white/30 left-0 right-0 top-1/3"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      <motion.div 
        className="absolute h-1 bg-white/30 left-0 right-0 bottom-1/3"
        initial={{ scaleX: 0, originX: 1 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
    </section>
  );
}