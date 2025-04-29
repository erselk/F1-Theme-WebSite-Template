'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { motion, useAnimation, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import dynamic from "next/dynamic";
import type { Container, Engine } from "tsparticles-engine";
import gsap from "gsap";
import { throttle } from "lodash";

// Particles bileşenini dinamik olarak yükle
const Particles = dynamic(() => import('react-particles'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-[1] bg-black/20"></div>
});

// Dinamik olarak loadSlim fonksiyonunu import et
const loadParticlesSlim = async (engine: Engine) => {
  try {
    const { loadSlim } = await import("tsparticles-slim");
    return await loadSlim(engine);
  } catch (error) {
    console.error("Error loading particles:", error);
  }
};

type HeroSectionProps = {
  translations: {
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
  };
};

export default function HeroSection({ translations }: HeroSectionProps) {
  const { isDark } = useThemeLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [containerScale, setContainerScale] = useState(1);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  
  // Key to prevent animation resets
  const [animationKey] = useState(Math.random().toString(36).substring(7));
  // Animation has been setup flag
  const [animationSetup, setAnimationSetup] = useState(false);
  
  // Particles initialization
  const particlesInit = useCallback(async (engine: Engine) => {
    console.log(engine);
    // Initialize the tsParticles instance (engine) using our dynamic import
    await loadParticlesSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);
  
  // Home slides from the home folder (about1.jpg to about19.jpg)
  const homeSlides = Array.from({ length: 19 }, (_, i) => `/images/about${i + 1}.jpg`);
  
  // Handle slide change when clicking on dots
  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Spring animation for the hero title
  const titleSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.8) translateY(-50px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    delay: 500,
    config: { mass: 2, tension: 120, friction: 14 }
  });

  // Spring animation for the subtitle
  const subtitleSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 1000,
    config: { mass: 1, tension: 170, friction: 18 }
  });

  // Spring animation for the CTA button
  const ctaSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    delay: 1500,
    config: { mass: 1, tension: 120, friction: 12 }
  });

  // Scroll animation values
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 250]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const parallaxY = useTransform(scrollY, [0, 500], [0, -150]);
  
  // Hero container'ının boyutunu izlemek için resize observer useEffect
  useEffect(() => {
    if (!heroContainerRef.current || !mounted) return;
    
    // Orijinal boyut - tasarım 1920x1080 için optimize edildi varsayalım
    const designWidth = 1920;
    
    const updateScale = () => {
      if (!heroContainerRef.current) return;
      const containerWidth = heroContainerRef.current.offsetWidth;
      // Ölçek faktörünü hesapla (minimum 0.5, maksimum 1)
      const newScale = Math.max(0.5, Math.min(1, containerWidth / designWidth));
      setContainerScale(newScale);
    };
    
    // Sayfa yüklendiğinde ve boyut değiştiğinde ölçeği güncelle
    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(heroContainerRef.current);
    
    // Pencere boyutu değişimi için de dinleyelim
    window.addEventListener('resize', updateScale);
    
    return () => {
      if (heroContainerRef.current) {
        resizeObserver.unobserve(heroContainerRef.current);
      }
      window.removeEventListener('resize', updateScale);
    };
  }, [mounted]);
  
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined' && mounted && !animationSetup) {
      // Only setup the animation once
      setAnimationSetup(true);
      
      // Hero section animations with GSAP
      const tl = gsap.timeline();
      
      if (titleRef.current && subtitleRef.current && ctaRef.current) {
        // Make sure the title is visible first
        titleRef.current.style.opacity = '1';
        
        // Split text characters for letter-by-letter animation
        const titleText = titleRef.current.textContent || '';
        const titleChars = titleText.split('');
        
        // Clear and rebuild the title with spans
        titleRef.current.textContent = '';
        titleChars.forEach((char) => {
          const span = document.createElement('span');
          span.classList.add('hero-char');
          span.textContent = char === ' ' ? '\u00A0' : char;
          titleRef.current?.appendChild(span);
        });
        
        // Animate each character
        gsap.fromTo(
          '.hero-char',
          { opacity: 0, y: 50, rotate: 45, scale: 0.8 },
          { 
            opacity: 1, 
            y: 0, 
            rotate: 0,
            scale: 1,
            duration: 0.8, 
            stagger: 0.04,
            ease: "back.out(1.7)",
            delay: 0.2
          }
        );
        
        // GSAP 3D effect for the CTA button - persist this effect
        gsap.to(ctaRef.current, {
          rotateY: 15,
          rotateX: 15,
          duration: 0.5,
          ease: "power1.out",
          delay: 1.5
        });
        
        // Floating animation for the CTA - persist this effect
        gsap.to(ctaRef.current, {
          y: "-10px",
          repeat: -1,
          yoyo: true,
          duration: 1.5,
          ease: "sine.inOut",
          delay: 2
        });
      }
      
      // 3D Tilt effect for the hero section - optimized with throttle
      if (heroRef.current) {
        // Mouse hareketlerini throttle ediyoruz
        const handleMouseMove = throttle((e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { left, top, width, height } = heroRef.current!.getBoundingClientRect();
          
          const x = (clientX - left) / width;
          const y = (clientY - top) / height;
          
          const rotateX = (y - 0.5) * 10;
          const rotateY = (0.5 - x) * 10;
          
          gsap.to(heroRef.current, {
            rotateX: rotateX,
            rotateY: rotateY,
            duration: 0.5,
            ease: "power2.out"
          });
        }, 25);
        
        heroRef.current.addEventListener('mousemove', handleMouseMove);
        
        heroRef.current.addEventListener('mouseleave', () => {
          gsap.to(heroRef.current, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        });
        
        // Event listener'ları temizleme
        return () => {
          if (heroRef.current) {
            heroRef.current.removeEventListener('mousemove', handleMouseMove);
          }
        };
      }
    }
    
    // Slider timer effect - don't re-initialize on language or theme change
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeSlides.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, [homeSlides.length, mounted, animationSetup]);
  
  // Memoize particles configuration for better performance
  const particlesOptions = useMemo(() => ({
    particles: {
      number: {
        value: 70,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: isDark ? "#ff0000" : "#e10600"
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        }
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false
        }
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: isDark ? "#ff3333" : "#e10600",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none" as const, // Use const assertion to fix type error
        random: true,
        straight: false,
        out_mode: "out" as const,
        bounce: false,
        attract: {
          enable: true,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detect_on: "canvas" as const, // Use const assertion to fix type error
      events: {
        onhover: {
          enable: true,
          mode: "grab" as const // Fix type error
        },
        onclick: {
          enable: true,
          mode: "push" as const // Fix type error
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 1
          }
        },
        push: {
          particles_nb: 4
        },
      }
    },
    retina_detect: true
  }), [isDark]); // Only recreate when theme changes
  
  if (!mounted) {
    return null; // Return null on server-side to prevent hydration mismatch
  }

  return (
    <section 
      ref={heroContainerRef} 
      className="relative text-white w-full aspect-[16/9] overflow-hidden perspective-1000" 
      style={{ perspective: "1000px" }}
    >
      {/* Particles background - persist with key */}
      <div className="absolute inset-0 z-[1]">
        <div className="relative w-full h-full overflow-hidden">
          <Particles
            key={animationKey}
            id="react-particles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
              ...particlesOptions,
              particles: {
                ...particlesOptions.particles,
                number: {
                  ...particlesOptions.particles.number,
                  // Ekran boyutu küçüldükçe (containerScale azaldıkça) parçacık sayısını azalt
                  value: Math.max(30, Math.round(70 * containerScale)),
                  density: {
                    enable: true,
                    // Ekran küçüldükçe yoğunluk alanını artır (daha fazla dağılım)
                    value_area: 800 + (1 - containerScale) * 1200
                  }
                },
                size: {
                  ...particlesOptions.particles.size,
                  value: 3 * containerScale,
                },
                move: {
                  ...particlesOptions.particles.move,
                  // Mobil için hızı biraz artır, böylece daha dinamik görünür
                  speed: 2 + (1 - containerScale) * 2,
                  // Ekran küçüldükçe rastgeleliği artır
                  random: true,
                  // Mobil görünümde daha geniş hareket alanı
                  out_mode: containerScale < 0.7 ? "bounce" : "out",
                  attract: {
                    ...particlesOptions.particles.move.attract,
                    // Mobilde çekim gücünü azalt (daha dağınık hareket etsinler)
                    enable: containerScale > 0.7,
                    rotateX: 600 * containerScale,
                    rotateY: 1200 * containerScale
                  }
                },
                line_linked: {
                  ...particlesOptions.particles.line_linked,
                  // Mobil görünümde çizgilerin mesafesini azalt, böylece daha dağınık görünür
                  distance: 150 - (1 - containerScale) * 50,
                  // Çizgi sayısını azalt
                  opacity: Math.min(0.4, 0.4 * containerScale * 1.5)
                }
              },
              interactivity: {
                ...particlesOptions.interactivity,
                modes: {
                  ...particlesOptions.interactivity.modes,
                  grab: {
                    ...particlesOptions.interactivity.modes.grab,
                    distance: 140 * containerScale // Mobilde dokunma etkileşimini azalt
                  }
                }
              }
            }}
            className="absolute inset-0"
          />
        </div>
      </div>
      
      <motion.div style={{ y: parallaxY }} className="absolute inset-0 z-[1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={homeSlides[currentSlide]}
              alt={`Padok Club Slide ${currentSlide + 1}`}
              fill
              className="object-cover brightness-75"
              priority={currentSlide === 0}
            />
          </motion.div>
        </AnimatePresence>
        <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-[#121212]/40 via-[#280000]/50 to-[#121212]/90' : 'from-black/30 via-[#500000]/40 to-black/80'}`}></div>
      </motion.div>
      
      {/* Content container - preserve content across language/theme changes */}
      <div 
        ref={heroRef}
        className="absolute inset-0 z-[2] flex items-center justify-center"
        style={{ 
          transform: `scale(${containerScale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Abstract decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-12 grid-rows-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div 
                key={`circle-${i}-${animationKey}`}
                className={`absolute rounded-full mix-blend-screen ${isDark ? 'bg-red-500/20' : 'bg-red-500/10'}`}
                style={{ 
                  width: 100 + Math.random() * 200,
                  height: 100 + Math.random() * 200,
                  left: `${Math.random() * 90}%`, 
                  top: `${Math.random() * 90}%` 
                }}
                animate={{
                  x: [0, 30, -20, 10, 0],
                  y: [0, -30, 20, 15, 0],
                  scale: [1, 1.1, 0.9, 1.05, 1],
                }}
                transition={{
                  duration: 20,
                  ease: "linear",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </div>
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-[3] max-w-7xl mx-auto py-24 px-6 lg:px-8 flex flex-col items-center text-center"
        >
          <motion.h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 opacity-100"
            initial={{ opacity: 1 }}
          >
            {translations.heroTitle}
          </motion.h1>
          
          {/* Replace animated components with motion components */}
          <motion.p 
            ref={subtitleRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="text-lg md:text-xl max-w-2xl mb-8"
          >
            {translations.heroSubtitle}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <Link
              ref={ctaRef}
              href="/book"
              className={`relative inline-block rounded-md ${isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-[#FF0000]'} px-5 py-3 text-lg font-semibold text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 overflow-hidden`}
            >
              {/* Glowing effect - keep animation with key */}
              <motion.span 
                key={`glow-${animationKey}`}
                className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"
                initial={{ x: '-100%', skewX: -20 }}
                animate={{ x: '150%', skewX: -15 }}
                transition={{ 
                  repeat: Infinity,
                  repeatDelay: 3,
                  duration: 1.5,
                  ease: "easeInOut" 
                }}
              />
              
              {/* Button content */}
              <motion.span 
                className="relative z-10 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {translations.heroCta}
                <motion.svg
                  key={`arrow-${animationKey}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="ml-1"
                  initial={{ x: 0 }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </motion.svg>
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Slide buttons - hidden on mobile */}
      <motion.div 
        className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-[3] hidden md:flex"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        style={{ 
          transform: `scale(${containerScale})`,
          transformOrigin: 'center bottom'
        }}
      >
        {homeSlides.map((_, index) => (
          <motion.button
            key={`slide-dot-${index}-${animationKey}`}
            className={`w-4 h-4 rounded-full transition-colors ${
              index === currentSlide 
                ? isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]' 
                : isDark ? 'bg-[#3A3A3A] hover:bg-[#B0B0B0]' : 'bg-gray-400 hover:bg-red-300'
            }`}
            onClick={() => handleSlideChange(index)}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.8 }}
            animate={index === currentSlide ? { 
              scale: [1, 1.2, 1],
              transition: { duration: 1, repeat: Infinity }
            } : {}}
          />
        ))}
      </motion.div>
    </section>
  );
}