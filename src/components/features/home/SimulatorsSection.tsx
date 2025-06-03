'use client';

import Image from "next/image";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import simulatorPriceData from '@/data/simulatorPrices.json'; // Fiyatları import et

type SimulatorsSectionProps = {
  translations: {
    simulatorsTitle: string;
    simulatorsSubtitle: string;
    simulator1Title: string;
    simulator1Desc: string;
    simulator2Title: string;
    simulator2Desc: string;
    simulator3Title: string;
    simulator3Desc: string;
    hourPrice: string;
    bookNow: string;
  };
};

export default function SimulatorsSection({ translations }: SimulatorsSectionProps) {
  const { isDark } = useThemeLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [animationsTriggered, setAnimationsTriggered] = useState(false);
  const [language, setLanguage] = useState("tr");
  
  // Fiyatları JSON'dan al
  const prices = simulatorPriceData.simulators;
  const f1Price = prices.find(p => p.id === 'f1')?.pricePerHour || 0;
  const vrPrice = prices.find(p => p.id === 'vr')?.pricePerHour || 0;
  const gamingPcPrice = prices.find(p => p.id === 'gaming_pc')?.pricePerHour || 0;

  const simulator1Controls = useAnimation();
  const simulator2Controls = useAnimation();
  const simulator3Controls = useAnimation();
  
  const sectionRef = useRef<HTMLElement>(null);

  // Fixed simulator images that won't change
  const simulatorImages = {
    f1: "/images/about5.jpg",
    vr: "/images/about12.jpg",
    computers: "/images/about8.jpg"
  };
  
  // Mobile short descriptions
  const mobileDescriptions = {
    tr: {
      simulator1: "Profesyonel yarış simülatörlerinde kullanılan ekipmanlarla donatılmıştır.",
      simulator2: "En son teknoloji VR gözlükler ile gerçekçi sanal deneyimler yaşayın.",
      simulator3: "Yüksek performanslı oyun bilgisayarları ile modern oyun deneyimi yaşayın."
    },
    en: {
      simulator1: "Equipped with professional racing simulator equipment.",
      simulator2: "Experience realistic virtual experiences with the latest VR glasses.",
      simulator3: "Experience modern gaming with high-performance gaming computers."
    }
  };

  // Detect language from URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
      setLanguage("en");
    } else {
      setLanguage("tr");
    }
  }, []);

  // Detect screen size and track mobile/desktop state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Check when screen size changes
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Start animations automatically for mobile devices
  useEffect(() => {
    if (isMobile && !animationsTriggered) {
      // Start animations shortly after page loads
      const triggerAnimations = () => {
        simulator1Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut" }
        });
        
        simulator2Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.2 }
        });
        
        simulator3Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.4 }
        });
        
        setAnimationsTriggered(true);
      };
      
      // Start animations after page loads
      const timer = setTimeout(triggerAnimations, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, animationsTriggered, simulator1Controls, simulator2Controls, simulator3Controls]);

  // When user scrolls, start animations if section is in viewport
  useEffect(() => {
    if (!isMobile) return; // Only for mobile
    
    const handleScroll = () => {
      if (!sectionRef.current || animationsTriggered) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      
      // If the top of the section is in the viewport
      if (rect.top <= viewHeight * 0.75) {
        simulator1Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut" }
        });
        
        simulator2Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.2 }
        });
        
        simulator3Controls.start({
          opacity: 1,
          x: 0,
          scale: 1,
          transition: { duration: 0.7, ease: "easeOut", delay: 0.4 }
        });
        
        setAnimationsTriggered(true);
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Check on initial load too
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, animationsTriggered, simulator1Controls, simulator2Controls, simulator3Controls]);

  return (
    <section 
      ref={sectionRef}
      className="py-6 sm:py-10 border-4 border-white border-t-0"
    >
      <div className="max-w-5xl mx-auto px-0 sm:px-4 lg:px-8 w-[98%] sm:w-auto overflow-hidden">
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <h2 className="text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] text-white">
            {translations.simulatorsTitle}
          </h2>
          <p className="mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base text-white font-['Inter']">
            {translations.simulatorsSubtitle}
          </p>
        </div>
        
        {/* All simulator cards in one row for both mobile and desktop */}
        <div className="flex flex-row !flex-nowrap justify-between gap-0.5 sm:gap-4 lg:gap-8 w-full items-stretch">
          {/* Simulator 1 - F1 - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className="overflow-hidden shadow-sm rounded-lg bg-transparent flex flex-col h-full w-full border-4 border-white relative"
                style={{ transformOrigin: "center center" }}
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={isMobile ? simulator1Controls : {}}
                whileInView={!isMobile ? { opacity: 1, x: 0, scale: 1 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative h-16 sm:h-40 md:h-48 lg:h-64 z-10">
                  <motion.div 
                    className="absolute inset-0"
                    whileHover={{
                      filter: "brightness(1.2)",
                      transition: { duration: 0.3 }
                    }}
                    animate={{
                      filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Image
                      src={simulatorImages.f1}
                      alt={translations.simulator1Title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    
                    {/* Racing speed lines overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                        x: [-100, 100],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 2,
                        repeatDelay: 3
                      }}
                    />
                  </motion.div>
                </div>
                
                <div className="p-1 sm:p-2 md:p-4 lg:p-6 flex flex-col flex-grow z-10">
                  <motion.h3 
                    className="text-[9px] sm:text-sm md:text-base lg:text-xl font-medium mb-0.5 sm:mb-1 md:mb-2 font-['Titillium_Web'] text-white"
                  >
                    {translations.simulator1Title}
                  </motion.h3>
                  
                  <p className="text-[7px] sm:text-xs md:text-sm lg:text-base font-['Inter'] text-white flex-grow hidden sm:block">
                    {translations.simulator1Desc}
                  </p>
                  
                  {/* Mobile short description */}
                  <p className="text-[7px] sm:hidden font-['Inter'] text-white mb-1">
                    {language === "en" ? mobileDescriptions.en.simulator1 : mobileDescriptions.tr.simulator1}
                  </p>
                  
                  <div className="flex flex-col mt-1 sm:mt-auto">
                    {/* Racing wheel animation icon */}
                    <div className="flex justify-end mb-1">
                      <motion.div 
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                        animate={{ 
                          y: [0, -2, 0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z" />
                        </svg>
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <motion.div 
                        className="text-[6px] sm:text-xs md:text-sm lg:text-base font-bold font-['Barlow Condensed'] text-white"
                        animate={{
                          filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        ₺{f1Price} <span className="text-[6px] sm:text-xs md:text-sm text-white">{translations.hourPrice}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ background: isDark ? '#FF0000' : '#E10600' }}
                        whileHover={{ 
                          scale: 1.05,
                          background: isDark ? "#FF3333" : "#FF0000",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="overflow-hidden rounded-md relative"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white opacity-20"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        />
                        <Link
                          href="/book?type=f1"
                          className={`flex items-center justify-center rounded-md px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-[6px] sm:text-xs md:text-xs font-semibold text-white relative z-10`}
                        >
                          {translations.bookNow}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Simulator 2 - VR - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className="overflow-hidden shadow-sm rounded-lg bg-transparent flex flex-col h-full w-full border-4 border-white relative"
                style={{ transformOrigin: "center center" }}
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={isMobile ? simulator2Controls : {}}
                whileInView={!isMobile ? { opacity: 1, x: 0, scale: 1 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, delay: 0.2, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative h-16 sm:h-40 md:h-48 lg:h-64 z-10">
                  <motion.div 
                    className="absolute inset-0"
                    whileHover={{
                      filter: "brightness(1.2)",
                      transition: { duration: 0.3 }
                    }}
                    animate={{
                      filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Image
                      src={simulatorImages.vr}
                      alt={translations.simulator2Title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    
                    {/* Racing speed lines overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                        x: [-100, 100],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 2,
                        repeatDelay: 3
                      }}
                    />
                  </motion.div>
                </div>
                
                <div className="p-1 sm:p-2 md:p-4 lg:p-6 flex flex-col flex-grow z-10">
                  <motion.h3 
                    className="text-[9px] sm:text-sm md:text-base lg:text-xl font-medium mb-0.5 sm:mb-1 md:mb-2 font-['Titillium_Web'] text-white"
                  >
                    {translations.simulator2Title}
                  </motion.h3>
                  
                  <p className="text-[7px] sm:text-xs md:text-sm lg:text-base font-['Inter'] text-white flex-grow hidden sm:block">
                    {translations.simulator2Desc}
                  </p>
                  
                  {/* Mobile short description */}
                  <p className="text-[7px] sm:hidden font-['Inter'] text-white mb-1">
                    {language === "en" ? mobileDescriptions.en.simulator2 : mobileDescriptions.tr.simulator2}
                  </p>
                  
                  <div className="flex flex-col mt-1 sm:mt-auto">
                    {/* VR Goggles Icon Animation */}
                    <div className="flex justify-end mb-1">
                      <motion.div 
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                        animate={{ 
                          y: [0, -2, 0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                          <path d="M3,9H7L10,16H14L17,9H21A2,2 0 0,1 23,11V18A2,2 0 0,1 21,20H3A2,2 0 0,1 1,18V11A2,2 0 0,1 3,9M12,2C13.66,2 15,3.34 15,5C15,6.66 13.66,8 12,8C10.34,8 9,6.66 9,5C9,3.34 10.34,2 12,2Z" />
                        </svg>
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <motion.div 
                        className="text-[6px] sm:text-xs md:text-sm lg:text-base font-bold font-['Barlow Condensed'] text-white"
                        animate={{
                          filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        ₺{vrPrice} <span className="text-[6px] sm:text-xs md:text-sm text-white">{translations.hourPrice}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ background: isDark ? '#FF0000' : '#E10600' }}
                        whileHover={{ 
                          scale: 1.05,
                          background: isDark ? "#FF3333" : "#FF0000",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="overflow-hidden rounded-md relative"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white opacity-20"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        />
                        <Link
                          href="/book?type=vr"
                          className={`flex items-center justify-center rounded-md px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-[6px] sm:text-xs md:text-xs font-semibold text-white relative z-10`}
                        >
                          {translations.bookNow}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Simulator 3 - Computers - With container for overflow protection */}
          <div className="basis-1/3 p-2 sm:p-4 overflow-visible flex">
            <div className="w-full h-full flex justify-center items-center">
              <motion.div 
                className="overflow-hidden shadow-sm rounded-lg bg-transparent flex flex-col h-full w-full border-4 border-white relative"
                style={{ transformOrigin: "center center" }}
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={isMobile ? simulator3Controls : {}}
                whileInView={!isMobile ? { opacity: 1, x: 0, scale: 1 } : {}}
                viewport={!isMobile ? { once: true, margin: "-50px" } : {}}
                transition={!isMobile ? { duration: 0.7, delay: 0.4, ease: "easeOut" } : {}}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: isDark ? "0 20px 25px -5px rgba(255, 0, 0, 0.15)" : "0 20px 25px -5px rgba(225, 6, 0, 0.15)",
                  transition: { duration: 0.2 }
                }}
              >
                <div className="relative h-16 sm:h-40 md:h-48 lg:h-64 z-10">
                  <motion.div 
                    className="absolute inset-0"
                    whileHover={{
                      filter: "brightness(1.2)",
                      transition: { duration: 0.3 }
                    }}
                    animate={{
                      filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Image
                      src={simulatorImages.computers}
                      alt={translations.simulator3Title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    
                    {/* Racing speed lines overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                        x: [-100, 100],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 2,
                        repeatDelay: 3
                      }}
                    />
                  </motion.div>
                </div>
                
                <div className="p-1 sm:p-2 md:p-4 lg:p-6 flex flex-col flex-grow z-10">
                  <motion.h3 
                    className="text-[9px] sm:text-sm md:text-base lg:text-xl font-medium mb-0.5 sm:mb-1 md:mb-2 font-['Titillium_Web'] text-white"
                  >
                    {translations.simulator3Title}
                  </motion.h3>
                  
                  <p className="text-[7px] sm:text-xs md:text-sm lg:text-base font-['Inter'] text-white flex-grow hidden sm:block">
                    {translations.simulator3Desc}
                  </p>
                  
                  {/* Mobile short description */}
                  <p className="text-[7px] sm:hidden font-['Inter'] text-white mb-1">
                    {language === "en" ? mobileDescriptions.en.simulator3 : mobileDescriptions.tr.simulator3}
                  </p>
                  
                  <div className="flex flex-col mt-1 sm:mt-auto">
                    {/* Computer Key animation */}
                    <div className="flex justify-end mb-1">
                      <motion.div 
                        className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                        animate={{ 
                          y: [0, -2, 0, -2, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
                          <path d="M6,2H18A2,2 0 0,1 20,4V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2M6,4V8H18V4H6M6,10V12H8V10H6M10,10V12H12V10H10M14,10V12H16V10H14M18,10V12H20V10H18M6,14V16H8V14H6M10,14V16H12V14H10M14,14V16H16V14H14M18,14V16H20V14H18M6,18V20H8V18H6M10,18V20H12V18H10M14,18V20H16V18H14M18,18V20H20V18H18Z" />
                        </svg>
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <motion.div 
                        className="text-[6px] sm:text-xs md:text-sm lg:text-base font-bold font-['Barlow Condensed'] text-white"
                        animate={{
                          filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      >
                        ₺{gamingPcPrice} <span className="text-[6px] sm:text-xs md:text-sm text-white">{translations.hourPrice}</span>
                      </motion.div>
                      
                      <motion.div
                        initial={{ background: isDark ? '#FF0000' : '#E10600' }}
                        whileHover={{ 
                          scale: 1.05,
                          background: isDark ? "#FF3333" : "#FF0000",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="overflow-hidden rounded-md relative"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-white opacity-20"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        />
                        <Link
                          href="/book?type=computer"
                          className={`flex items-center justify-center rounded-md px-1 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 lg:px-4 lg:py-2 text-[6px] sm:text-xs md:text-xs font-semibold text-white relative z-10`}
                        >
                          {translations.bookNow}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden button for mobile devices for automatic animation triggering */}
      {isMobile && !animationsTriggered && (
        <button
          className="opacity-0 absolute"
          aria-hidden="true"
          onClick={() => {
            simulator1Controls.start({
              opacity: 1,
              x: 0,
              scale: 1,
              transition: { duration: 0.7, ease: "easeOut" }
            });
            
            simulator2Controls.start({
              opacity: 1,
              x: 0,
              scale: 1,
              transition: { duration: 0.7, delay: 0.2, ease: "easeOut" }
            });
            
            simulator3Controls.start({
              opacity: 1,
              x: 0,
              scale: 1,
              transition: { duration: 0.7, delay: 0.4, ease: "easeOut" }
            });
            
            setAnimationsTriggered(true);
          }}
        >
          Start Animations
        </button>
      )}
    </section>
  );
}