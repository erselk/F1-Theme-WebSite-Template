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
  return (
    <section className="py-6 sm:py-10 text-white overflow-hidden relative border-4 border-white border-t-0">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-['Titillium Web'] mb-4 text-white">
            {translations.ctaTitle}
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto text-white">
            {translations.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/book"
                className="inline-block text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors border-2 border-white hover:bg-white/10"
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
                className="inline-block text-white font-semibold px-8 py-3 rounded-lg text-lg transition-colors border-2 border-white hover:bg-white/10"
              >
                {translations.ctaButton2}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}