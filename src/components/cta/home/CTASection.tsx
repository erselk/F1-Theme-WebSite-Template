import Link from 'next/link';
import { motion } from 'framer-motion';

const translations = {
  ctaTitle: 'Başlık',
  ctaSubtitle: 'Alt başlık'
};

const CTASection = () => {
  return (
    <section className="py-6 sm:py-10 text-white relative overflow-hidden border-4 border-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <h2 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] text-white">
            {translations.ctaTitle}
          </h2>
          <p className="mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base text-white/80 font-['Inter']">
            {translations.ctaSubtitle}
          </p>
        </div>
        
        <motion.div 
          className="mt-4 sm:mt-6 text-center flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/book"
            className="inline-block bg-[#E10600] hover:bg-[#E10600]/90 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors border-4 border-white/30 w-full sm:w-auto"
          >
            Rezervasyon Yap
          </Link>
          
          <Link
            href="/contact"
            className="inline-block bg-transparent hover:bg-white/10 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base transition-colors border-4 border-white/30 w-full sm:w-auto"
          >
            İletişime Geçin
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection; 