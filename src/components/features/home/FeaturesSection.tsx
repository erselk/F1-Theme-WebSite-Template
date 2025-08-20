'use client';

import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";

type FeaturesSectionProps = {
  translations: {
    featuresTitle: string;
    featuresSubtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
  };
};

export default function FeaturesSection({ translations }: FeaturesSectionProps) {
  const { isDark } = useThemeLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [animationsTriggered, setAnimationsTriggered] = useState(false);
  
  const feature1Controls = useAnimation();
  const feature2Controls = useAnimation();
  const feature3Controls = useAnimation();
  
  const sectionRef = useRef<HTMLElement>(null);

  // Ekran boyutunu tespit etme ve mobil/masaüstü durumunu izleme
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // İlk yüklendiğinde kontrol et
    checkMobile();
    
    // Ekran boyutu değiştiğinde kontrol et
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Mobil cihazlar için otomatik olarak animasyonları başlat
  useEffect(() => {
    if (isMobile && !animationsTriggered) {
      // Sayfa yüklendikten kısa bir süre sonra animasyonları başlat
      const triggerAnimations = () => {
        feature1Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut" }
        });
        
        feature2Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.2 }
        });
        
        feature3Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.4 }
        });
        
        setAnimationsTriggered(true);
      };
      
      // Sayfa yüklendikten sonra animasyonları başlat
      const timer = setTimeout(triggerAnimations, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, animationsTriggered, feature1Controls, feature2Controls, feature3Controls]);

  // Kullanıcı kaydırma eylemi gerçekleştirdiğinde, eğer bölüm görünür alandaysa animasyonları başlat
  useEffect(() => {
    if (!isMobile) return; // Sadece mobil için
    
    const handleScroll = () => {
      if (!sectionRef.current || animationsTriggered) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      
      // Eğer bölümün üst kısmı görünür alandaysa
      if (rect.top <= viewHeight * 0.75) {
        feature1Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut" }
        });
        
        feature2Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.2 }
        });
        
        feature3Controls.start({
          opacity: 1,
          y: 0,
          rotateX: 0,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.4 }
        });
        
        setAnimationsTriggered(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // İlk yüklemede de kontrolü yap
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, animationsTriggered, feature1Controls, feature2Controls, feature3Controls]);

  return (
    <section 
      ref={sectionRef}
      className={`py-6 sm:py-10 ${isDark ? 'bg-[#1E1E1E] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}
    >
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-8 w-[98%] sm:w-auto overflow-hidden">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <h2 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web']">
            {translations.featuresTitle}
          </h2>
          <p className={`mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
            {translations.featuresSubtitle}
          </p>
        </div>
        
        {/* Her ekran boyutunda tek satır için flex-row ve !flex-nowrap kullanıldı */}
        <div className="flex flex-row !flex-nowrap justify-between gap-0.5 sm:gap-2 lg:gap-3 w-full items-stretch">
          {/* Feature 1 - Gerçekçi Simülasyon - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className={`p-1 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-[#262626] to-[#1A1A1A]' : 'bg-gradient-to-br from-white to-gray-50'} h-full w-full border-b-4 ${isDark ? 'border-[#FF0000]' : 'border-[#E10600]'} relative overflow-hidden`}
                style={{ transformOrigin: "center bottom" }}
                initial={{ opacity: 0, y: 100, rotateX: -25 }}
                animate={isMobile ? feature1Controls : {}}
                whileInView={!isMobile ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                {/* Animated Background Effect */}
                <div className="absolute inset-0 w-full h-full opacity-10">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={`feature1-circle-${i}`}
                      className={`absolute rounded-full ${isDark ? 'bg-red-500' : 'bg-[#E10600]'}`}
                      style={{
                        width: `${5 + Math.random() * 25}px`,
                        height: `${5 + Math.random() * 25}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2],
                        x: [0, 5, 0],
                        y: [0, -5, 0],
                      }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 2 + Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <motion.div 
                      className={`h-4 w-4 min-w-[1rem] sm:h-8 sm:w-8 sm:min-w-[2rem] md:h-10 md:w-10 md:min-w-[2.5rem] lg:h-12 lg:w-12 lg:min-w-[3rem] rounded-lg ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center shrink-0 shadow-lg`}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 5 }}
                    >
                      <motion.svg 
                        className="h-2.5 w-2.5 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        animate={{
                          scale: [1, 1.2, 1],
                          filter: ["drop-shadow(0 0 0px rgba(255,255,255,0.5))", "drop-shadow(0 0 8px rgba(255,255,255,0.8))", "drop-shadow(0 0 0px rgba(255,255,255,0.5))"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </motion.svg>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] flex-grow pt-0.5 sm:pt-0"
                      animate={{
                        textShadow: isDark 
                          ? ["0 0 0px rgba(255,0,0,0)", "0 0 10px rgba(255,0,0,0.5)", "0 0 0px rgba(255,0,0,0)"] 
                          : ["0 0 0px rgba(225,6,0,0)", "0 0 10px rgba(225,6,0,0.5)", "0 0 0px rgba(225,6,0,0)"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      {translations.feature1Title}
                    </motion.h3>
                  </div>
                  
                  <div className="pl-[calc(1rem+4px)] sm:pl-[calc(2rem+8px)] md:pl-[calc(2.5rem+8px)] lg:pl-[calc(3rem+8px)]">
                    <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal`}>
                      {translations.feature1Desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Feature 2 - Profesyonel Eğitmen - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className={`p-1 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-[#262626] to-[#1A1A1A]' : 'bg-gradient-to-br from-white to-gray-50'} h-full w-full border-b-4 ${isDark ? 'border-[#FF0000]' : 'border-[#E10600]'} relative overflow-hidden`}
                style={{ transformOrigin: "center bottom" }}
                initial={{ opacity: 0, y: 100, rotateX: -25 }}
                animate={isMobile ? feature2Controls : {}}
                whileInView={!isMobile ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, delay: 0.2, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                {/* Trophy Animation Background */}
                <motion.div 
                  className="absolute top-1 right-1 opacity-5"
                  animate={{ 
                    opacity: [0.05, 0.1, 0.05],
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ 
                    duration: 10, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <svg className="w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-20 lg:h-20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.2,2H19.5H18C17.1,2 16,3 16,4H8C8,3 6.9,2 6,2H4.5H3.8H2V11C2,12 3,13 4,13H6.2C6.6,15 7.9,16.7 11,17V19.1C8.8,19.3 8,20.4 8,21.7V22H16V21.7C16,20.4 15.2,19.3 13,19.1V17C16.1,16.7 17.4,15 17.8,13H20C21,13 22,12 22,11V2H20.2M4,11V4H6V6V11C5.1,11 4.3,11 4,11M20,11C19.7,11 18.9,11 18,11V6V4H20V11Z" />
                  </svg>
                </motion.div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <motion.div 
                      className={`h-4 w-4 min-w-[1rem] sm:h-8 sm:w-8 sm:min-w-[2rem] md:h-10 md:w-10 md:min-w-[2.5rem] lg:h-12 lg:w-12 lg:min-w-[3rem] rounded-lg ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center shrink-0 shadow-lg`}
                      initial={{ rotateZ: 0 }}
                      animate={{ rotateZ: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                    >
                      <motion.svg 
                        className="h-2.5 w-2.5 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.9, 1, 0.9]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </motion.svg>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] flex-grow pt-0.5 sm:pt-0"
                      animate={{
                        textShadow: isDark 
                          ? ["0 0 0px rgba(255,0,0,0)", "0 0 10px rgba(255,0,0,0.5)", "0 0 0px rgba(255,0,0,0)"] 
                          : ["0 0 0px rgba(225,6,0,0)", "0 0 10px rgba(225,6,0,0.5)", "0 0 0px rgba(225,6,0,0)"]
                      }}
                      transition={{
                        duration: 3,
                        delay: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      {translations.feature2Title}
                    </motion.h3>
                  </div>
                  
                  <div className="pl-[calc(1rem+4px)] sm:pl-[calc(2rem+8px)] md:pl-[calc(2.5rem+8px)] lg:pl-[calc(3rem+8px)]">
                    <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal`}>
                      {translations.feature2Desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Feature 3 - Etkinlikler - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className={`p-1 sm:p-3 md:p-4 rounded-lg sm:rounded-xl shadow-lg ${isDark ? 'bg-gradient-to-br from-[#262626] to-[#1A1A1A]' : 'bg-gradient-to-br from-white to-gray-50'} h-full w-full border-b-4 ${isDark ? 'border-[#FF0000]' : 'border-[#E10600]'} relative overflow-hidden`}
                style={{ transformOrigin: "center bottom" }}
                initial={{ opacity: 0, y: 100, rotateX: -25 }}
                animate={isMobile ? feature3Controls : {}}
                whileInView={!isMobile ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, delay: 0.4, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                {/* Particle Effect */}
                <motion.div className="absolute inset-0 w-full h-full">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div 
                      key={`event-particle-${i}`}
                      className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-red-500' : 'bg-[#E10600]'}`}
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        opacity: 0.4,
                      }}
                      animate={{
                        y: [0, -10 - Math.random() * 15],
                        x: [0, (Math.random() - 0.5) * 10],
                        scale: [0, 1.2],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: 1 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  ))}
                </motion.div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <motion.div 
                      className={`h-4 w-4 min-w-[1rem] sm:h-8 sm:w-8 sm:min-w-[2rem] md:h-10 md:w-10 md:min-w-[2.5rem] lg:h-12 lg:w-12 lg:min-w-[3rem] rounded-lg ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center shrink-0 shadow-lg`}
                      initial={{ rotateY: 0 }}
                      animate={{ rotateY: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 5 }}
                    >
                      <motion.svg 
                        className="h-2.5 w-2.5 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </motion.svg>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-[9px] sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold font-['Titillium_Web'] flex-grow pt-0.5 sm:pt-0"
                      animate={{
                        textShadow: isDark 
                          ? ["0 0 0px rgba(255,0,0,0)", "0 0 10px rgba(255,0,0,0.5)", "0 0 0px rgba(255,0,0,0)"] 
                          : ["0 0 0px rgba(225,6,0,0)", "0 0 10px rgba(225,6,0,0.5)", "0 0 0px rgba(225,6,0,0)"]
                      }}
                      transition={{
                        duration: 3,
                        delay: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      {translations.feature3Title}
                    </motion.h3>
                  </div>
                  
                  <div className="pl-[calc(1rem+4px)] sm:pl-[calc(2rem+8px)] md:pl-[calc(2.5rem+8px)] lg:pl-[calc(3rem+8px)]">
                    <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter'] text-[8px] sm:text-xs md:text-sm lg:text-base leading-tight sm:leading-snug md:leading-normal`}>
                      {translations.feature3Desc}
                    </p>
                  </div>
                  
                  {/* Calendar animation */}
                  <motion.div 
                    className="absolute bottom-1 right-1 w-2 h-2 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 opacity-10"
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1],
                      scale: [1, 1.05, 1],
                      y: [0, -2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3H18V1M17,12H12V17H17V12Z" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobil cihazlarda otomatik başlatma düğmesi - Gizli bir düğme */}
      {isMobile && !animationsTriggered && (
        <button
          className="opacity-0 absolute"
          aria-hidden="true"
          onClick={() => {
            feature1Controls.start({
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.7, ease: "easeOut" }
            });
            
            feature2Controls.start({
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.7, delay: 0.2, ease: "easeOut" }
            });
            
            feature3Controls.start({
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.7, delay: 0.4, ease: "easeOut" }
            });
            
            setAnimationsTriggered(true);
          }}
        >
          Animasyonları Başlat
        </button>
      )}
    </section>
  );
}