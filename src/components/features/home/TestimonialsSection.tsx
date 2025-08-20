'use client';

import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type TestimonialsSectionProps = {
  translations: {
    testimonialsTitle: string;
    testimonialsSubtitle: string;
    testimonials: Array<{
      initial: string;
      name: string;
      role: string;
      text: string;
    }>;
  };
};

export default function TestimonialsSection({ translations }: TestimonialsSectionProps) {
  const { isDark, language } = useThemeLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px 0px" });
  const controls = useAnimation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [controls, isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const glowVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0px rgba(255, 0, 0, 0.5)",
        "0 0 20px rgba(255, 0, 0, 0.8)",
        "0 0 0px rgba(255, 0, 0, 0.5)"
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  // Mobile testimonial texts with translations (shorter versions)
  const mobileTestimonials = [
    {
      initial: "A",
      name: "Ahmet K.",
      role: "",
      text: language === "en" ? "The most realistic F1 experience of my life." : "Hayatımda yaşadığım en gerçekçi F1 deneyimiydi."
    },
    {
      initial: "K",
      name: "Kerem A.",
      role: "",
      text: language === "en" ? "We booked for our company event. The whole team had an incredible time." : "Şirket etkinliğimiz için rezervasyon yapmıştık. Tüm ekip inanılmaz keyif aldı. Kesinlikle tekrar geleceğiz!"
    },
    {
      initial: "E",
      name: "Elif T.",
      role: "",
      text: language === "en" ? "The motion systems are extraordinary!" : "Hareket sistemleri olağanüstü!"
    }
  ];

  // Use mobile testimonials text on mobile, otherwise original testimonials
  const displayedTestimonials = isMobile ? 
    mobileTestimonials.slice(0, 3) : 
    translations.testimonials && translations.testimonials.length >= 3 ? 
      translations.testimonials.slice(0, 3) : 
      mobileTestimonials.slice(0, 3);

  return (
    <section 
      ref={sectionRef}
      className={`py-6 sm:py-10 relative overflow-hidden ${isDark ? 'bg-[#121212]/30 text-[#E0E0E0]' : 'bg-gray-900/30 text-white'} h-auto min-h-[220px] sm:min-h-[280px] md:min-h-[320px] flex items-center`}
    >
      {/* Floating animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.2, 0.1], rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-red-500/20 to-transparent -top-[150px] -left-[150px] blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.3, 0.1], rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[300px] h-[300px] rounded-full bg-gradient-to-r from-red-700/10 to-yellow-500/10 -bottom-[150px] -right-[150px] blur-3xl"
      />

      <div className="max-w-7xl w-full mx-auto px-4 lg:px-6 relative z-10">
        <div className="flex flex-col items-center">
          {/* Title section - centered on mobile and desktop */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-3 sm:mb-5 md:mb-6 text-center"
          >
            <h2 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web']">
              {translations.testimonialsTitle || "Müşterilerimiz Ne Diyor?"}
            </h2>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className={`mt-1 sm:mt-2 text-[8px] sm:text-xs md:text-sm lg:text-base ${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter']`}
            >
              {translations.testimonialsSubtitle || "PadokClub deneyimini yaşayanların görüşleri"}
            </motion.p>
          </motion.div>
          
          {/* Testimonials row - fixed side by side */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="w-full grid grid-cols-3 gap-2 sm:gap-4 md:gap-6"
          >
            {displayedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  transition: { duration: 0.3 }
                }}
                className={`p-2 sm:p-4 md:p-6 rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-800'} transition-all duration-300 min-h-[120px] sm:min-h-0`}
              >
                <div className="flex items-center mb-1 sm:mb-2 md:mb-4">
                  <motion.div 
                    variants={glowVariants}
                    initial="initial"
                    animate="animate"
                    className={`h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full flex-shrink-0 ${isDark ? 'bg-[#FF0000]' : 'bg-red-600'} flex items-center justify-center mr-2 sm:mr-3`}
                  >
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.3 + index * 0.1 }}
                      className="text-white text-[10px] sm:text-sm md:text-base font-bold"
                    >
                      {testimonial.initial}
                    </motion.span>
                  </motion.div>
                  <div className="min-w-0">
                    <motion.h3 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      className="text-xs sm:text-sm md:text-base lg:text-lg font-medium truncate"
                    >
                      {testimonial.name}
                    </motion.h3>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className={`text-[8px] sm:text-xs md:text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-gray-400'} truncate`}
                    >
                      {testimonial.role}
                    </motion.p>
                  </div>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.6 + index * 0.1 }}
                  className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base line-clamp-none`}
                >
                  {testimonial.text}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}