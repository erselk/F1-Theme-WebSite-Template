'use client';

import { useEffect, useState, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { BlogPost } from "@/types";
import { getAllBlogs } from "@/services/mongo-service";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValueEvent, useSpring, useAnimationControls } from "framer-motion";
import { gsap } from "gsap";
import dynamic from "next/dynamic";
// İçe aktaracağımız konfeti animasyonu için JSON dosyası
import confettiAnimation from "@/data/confetti.json";

// Client-side only Lottie bileşeni
const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false, // Server-side rendering'i devre dışı bırakıyoruz
  loading: () => <div className="hidden"></div>
});

type BlogSectionProps = {
  translations: {
    blogTitle: string;
    blogSubtitle: string;
    blogCta: string;
    readMore: string;
  };
};

export default function BlogSection({ translations }: BlogSectionProps) {
  const { isDark, language } = useThemeLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [hasCarousel, setHasCarousel] = useState(false);
  const [noBlogs, setNoBlogs] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isScrolledToStart, setIsScrolledToStart] = useState(true);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDeltaY = useRef(0);
  const lastWheelTimestamp = useRef(Date.now());
  const controls = useAnimationControls();
  const [selectedBlogIndex, setSelectedBlogIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // GSAP animasyon için ref'ler
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonRef = useRef<HTMLAnchorElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Sabit kart genişliği - mobilde daha küçük kartlar (ekrana 2+ kart sığması için)
  const cardWidth = "w-[140px] sm:w-[200px] md:w-[280px]";
  const cardHeight = "h-[220px] sm:h-[300px] md:h-[380px]";
  const imageHeight = "h-[120px] sm:h-[180px] md:h-[280px]";
  
  // Paralax efektleri için scroll hook'u
  const { scrollYProgress } = useScroll();
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1.2]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.3, 1, 1, 0.5]);
  const springScroll = useSpring(scrollYProgress, { stiffness: 500, damping: 150 });

  // GSAP animasyonları için useEffect
  useEffect(() => {
    if (titleRef.current && subtitleRef.current) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.fromTo(
        titleRef.current,
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 }
      ).fromTo(
        subtitleRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      );

      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { width: 0, opacity: 0 },
          { width: "100%", opacity: 1, duration: 0.7, delay: 1 }
        );
      }
    }
  }, [blogs]);

  // Blog kartları için stagger animasyonu
  useEffect(() => {
    if (blogs.length > 0 && carouselRef.current) {
      const cards = carouselRef.current.querySelectorAll('.blog-card');
      
      gsap.fromTo(
        cards,
        { 
          y: 100,
          opacity: 0,
          rotateY: 25,
          scale: 0.8
        },
        { 
          y: 0,
          opacity: 1,
          rotateY: 0,
          scale: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: "elastic.out(1, 0.8)",
          onComplete: () => {
            // İlk blog için konfeti efekti
            if (blogs.length > 0) {
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 3000);
            }
          }
        }
      );
    }
  }, [blogs]);

  useEffect(() => {
    // Get latest 10 blogs
    const fetchBlogs = async () => {
      try {
        const blogsData = await getAllBlogs();
        // Sort blogs by date (newest first) and take first 10
        const sortedBlogs = blogsData.sort((a, b) => {
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        }).slice(0, 10);
        
        // Set carousel status based on blog count
        setHasCarousel(sortedBlogs.length > 3);
        setBlogs(sortedBlogs);
        setNoBlogs(sortedBlogs.length === 0);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
        setNoBlogs(true);
      }
    };
    
    fetchBlogs();
  }, []);

  // Yatay kaydırmayı işle ve scroll durumunu güncelle
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleScroll = () => {
        setScrollPosition(container.scrollLeft);
        setMaxScroll(container.scrollWidth - container.clientWidth);
        setIsScrolledToStart(container.scrollLeft <= 2);
        setIsScrolledToEnd(Math.abs(container.scrollLeft + container.clientWidth - container.scrollWidth) < 5);
        
        // Kaydırma animasyonu sırasında gösterge
        setIsScrolling(true);
        
        // Önceki zamanlayıcıyı temizle
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        // Kaydırma durduğunda isScrolling'i false yap
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 500);
      };

      // İlk değerleri hesapla
      setMaxScroll(container.scrollWidth - container.clientWidth);
      setIsScrolledToStart(container.scrollLeft <= 2);
      setIsScrolledToEnd(Math.abs(container.scrollLeft + container.clientWidth - container.scrollWidth) < 5);

      container.addEventListener('scroll', handleScroll);
      
      // Resize olayında güncelle
      const resizeObserver = new ResizeObserver(() => {
        setMaxScroll(container.scrollWidth - container.clientWidth);
        handleScroll();
      });
      resizeObserver.observe(container);
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [blogs]);

  // Wheel event'i için touch alanında mı kontrol
  const isTouchScreen = useRef(false);
  
  useEffect(() => {
    // Dokunmatik ekran tespiti
    isTouchScreen.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Yatay scroll tamamlanmadan dikey scroll'u engelleme (desktop'ta)
    const handleWheelCapture = (e: WheelEvent) => {
      if (isTouchScreen.current) return; // Dokunmatik cihazlarda engelleme yapma
      
      if (scrollContainerRef.current && 
          !isScrolledToStart && !isScrolledToEnd && 
          scrollContainerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };
    
    // Event listener'ı passive: false ile ekle (preventDefault çalışması için)
    document.addEventListener('wheel', handleWheelCapture, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handleWheelCapture);
    };
  }, [isScrolledToStart, isScrolledToEnd]);
  
  // Dikey tekerlek hareketini yatay kaydırmaya çevirme (düşük hassasiyetle)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Dokunmatik cihazlarda wheel olayını engelleme
    if (isTouchScreen.current) return;
    
    // Scroll eventini engelle
    e.preventDefault();
    
    // Başta yukarı veya sonda aşağı kaydırıyorsanız normal scroll davranışına izin ver
    if ((isScrolledToStart && e.deltaY < 0) || (isScrolledToEnd && e.deltaY > 0)) {
      return;
    }
    
    // Tekerlek olaylarını geciktir ve hassasiyeti düşür
    const now = Date.now();
    accumulatedDeltaY.current += e.deltaY;
    
    if (now - lastWheelTimestamp.current > 100) {
      // Çok daha düşük hassasiyet - deltaY'yi 8'e böl
      const scrollAmount = accumulatedDeltaY.current / 8; 
      
      // Kart genişliğine göre "snap" effect, yavaş animasyon
      const cardWidth = container.querySelector('.blog-card')?.clientWidth || 0;
      const direction = scrollAmount > 0 ? 1 : -1;
      
      // Kaydırma mesafesini bir kart genişliğinin %30'u olarak sınırla
      const scrollDistance = Math.min(Math.abs(scrollAmount), cardWidth * 0.3) * direction;
      
      container.scrollBy({
        left: scrollDistance,
        behavior: 'smooth'
      });
      
      // Değerleri sıfırla
      accumulatedDeltaY.current = 0;
      lastWheelTimestamp.current = now;
    }
  };

  // Mouse ile sürükle-bırak kaydırma işlevi
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Kaydırma hızı çarpanı
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  // Dokunmatik ekran için kaydırma işlevi
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 3D Tilt Card efekti için mouse pozisyonunu hesaplama
  const handleMouseEnter = (index: number) => {
    setIsHovering(true);
    setSelectedBlogIndex(index);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setSelectedBlogIndex(null);
  };

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (selectedBlogIndex !== index) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Kart üzerindeki X ve Y pozisyonunu yüzde olarak hesapla
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // Kartın döndürme açısını hesapla (merkezden daha fazla eğim)
    const tiltX = 20 * (0.5 - y);  // Y eksenindeki eğim (X rotasyonu)
    const tiltY = -20 * (0.5 - x); // X eksenindeki eğim (Y rotasyonu)
    
    // Kart üzerinde "parlama" efekti için pozisyon hesapla
    const glareX = x * 100;
    const glareY = y * 100;
    
    // GSAP ile kartı döndür
    gsap.to(card, {
      rotateX: tiltX,
      rotateY: tiltY,
      transformPerspective: 1000,
      transformOrigin: "center center",
      ease: "power2.out",
      duration: 0.5
    });
    
    // Parlama efekti için CSS değişkenlerini güncelle
    card.style.setProperty('--glare-x', `${glareX}%`);
    card.style.setProperty('--glare-y', `${glareY}%`);
    card.style.setProperty('--glare-opacity', '0.15');  // Parlama opaklığı
  };

  // Otomatik kaydırma fonksiyonu
  useEffect(() => {
    if (!hasCarousel || blogs.length <= 3) return;

    const autoScroll = () => {
      if (!scrollContainerRef.current || isScrolledToEnd) return;
      
      // Otomatik kaydırma miktarı (bir kart genişliği kadar)
      const cardWidth = scrollContainerRef.current.querySelector('.blog-card')?.clientWidth || 0;
      
      // Kart genişliğinin 1/3'ü kadar kaydır
      scrollContainerRef.current.scrollBy({
        left: cardWidth / 3,
        behavior: 'smooth'
      });
    };
    
    // 5 saniyede bir otomatik kaydırma
    const intervalId = setInterval(autoScroll, 5000);
    
    return () => clearInterval(intervalId);
  }, [blogs, hasCarousel, isScrolledToEnd]);

  return (
    <section className={`py-6 sm:py-10 ${isDark ? 'bg-[#262626]' : 'bg-gray-50'} relative overflow-hidden`}>
      {/* Arkaplan animasyonu - dalga efekti */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M0,0 L100,0 L100,100 L0,100 Z"
            fill={isDark ? '#1E1E1E' : '#f9f9f9'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1 }}
          />
          <motion.path
            d="M0,50 C20,60 40,40 60,50 C80,60 100,40 100,50 L100,100 L0,100 Z"
            fill={isDark ? '#222222' : '#f5f5f5'}
            initial={{ y: 100 }}
            animate={{ 
              y: 0,
              transition: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 10,
                ease: "easeInOut"
              }
            }}
          />
          <motion.path
            d="M0,70 C25,65 50,75 75,65 C100,55 100,75 100,70 L100,100 L0,100 Z"
            fill={isDark ? '#1a1a1a' : '#f1f1f1'}
            initial={{ y: 100 }}
            animate={{ 
              y: 0,
              transition: { 
                repeat: Infinity, 
                repeatType: "mirror", 
                duration: 12,
                ease: "easeInOut",
                delay: 0.5
              }
            }}
          />
        </svg>
      </div>

      {/* Konfeti Animasyonu */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Lottie 
            animationData={confettiAnimation} 
            loop={false}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 
            ref={titleRef}
            className={`text-sm sm:text-2xl lg:text-3xl font-bold tracking-tight font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}
          >
            {translations.blogTitle || 'Son Blog Yazıları'}
          </h2>
          <p 
            ref={subtitleRef}
            className={`mt-1 sm:mt-2 text-[8px] sm:text-sm lg:text-base ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}
          >
            {translations.blogSubtitle || 'F1 ve Motorsporları dünyasından güncel içerikler'}
          </p>
        </motion.div>
        
        <div className="relative" 
          onWheel={(e) => {
            // Yatay scroll tamamlanmadan dikey scroll'u engelle (desktop'ta)
            if (!isTouchScreen.current && scrollContainerRef.current && 
                !isScrolledToStart && !isScrolledToEnd) {
              e.preventDefault();
            }
          }}>
          {noBlogs ? (
            <motion.div 
              className={`text-center py-12 ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "backOut" }}
            >
              <p className="text-lg">
                {language === 'tr' ? 'Henüz bir blog yazısı yayınlanmadı.' : 'No blog posts have been published yet.'}
              </p>
            </motion.div>
          ) : (
            <>
              {/* Yatay kaydırılabilir container */}
              <div 
                ref={scrollContainerRef}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`flex overflow-x-auto pb-6 gap-6 hide-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth', 
                  scrollSnapType: 'none',
                  transition: 'all 0.5s ease-in-out'
                }}
              >
                {/* Paralax efekti için dış div */}
                <div 
                  ref={carouselRef}
                  className="flex gap-6 pl-4 pr-8"
                  style={{
                    transform: `scale(${isScrolling ? 0.98 : 1})`,
                    transition: 'transform 0.5s ease-out'
                  }}  
                >
                  {blogs.map((blog, index) => (
                    <Link 
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className={`blog-card flex-shrink-0 ${cardWidth} overflow-hidden rounded-xl border ${
                        isDark ? 'bg-gradient-to-br from-[#262626] to-[#1a1a1a] border-[#3A3A3A]' : 'bg-gradient-to-br from-white to-[#f8f8f8] border-gray-200'
                      } flex flex-col ${cardHeight} group relative transform-gpu`}
                      style={{
                        willChange: 'transform',
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center center',
                        perspective: '1000px',
                        '--glare-x': '50%',
                        '--glare-y': '50%',
                        '--glare-opacity': '0',
                        boxShadow: isDark ? 
                          '0 10px 30px -10px rgba(0,0,0,0.8), 0 5px 15px -5px rgba(0,0,0,0.5)' : 
                          '0 10px 30px -10px rgba(0,0,0,0.2), 0 5px 15px -5px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={(e) => handleMouseMove3D(e, index)}
                    >
                      <div className={`relative ${imageHeight} overflow-hidden`}>
                        <Image
                          src={blog.thumbnailImage}
                          alt={blog.title && blog.title[language] || 'Blog post image'}
                          fill
                          className="object-cover transition-all duration-700"
                          style={{
                            transform: `scale(${isHovering && selectedBlogIndex === index ? 1.1 : 1})`,
                          }}
                        />
                        
                        {/* Parlama efekti */}
                        <div 
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundImage: isDark ?
                              'radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,var(--glare-opacity)), transparent 80%)' :
                              'radial-gradient(circle at var(--glare-x) var(--glare-y), rgba(255,255,255,var(--glare-opacity)), transparent 80%)',
                            mixBlendMode: 'overlay'
                          }}
                        ></div>

                        {/* Görüntü üzerinde degrade efekti */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"
                        ></div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-grow relative z-10 transform-gpu">
                        <h3 className={`text-lg font-medium mb-1 line-clamp-2 ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'} group-hover:text-[#E10600]`}
                            style={{transform: 'translateZ(20px)'}}
                        >
                          {blog.title && blog.title[language] || 'Blog title'}
                        </h3>
                        <p className={`text-sm mb-2 ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'}`}
                           style={{transform: 'translateZ(15px)'}}
                        >
                          {new Date(blog.publishDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className={`text-sm line-clamp-2 ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'}`}
                           style={{transform: 'translateZ(10px)'}}
                        >
                          {blog.excerpt && blog.excerpt[language] || 'Blog excerpt'}
                        </p>
                        
                        {/* Okuma butonu - hover'da görünür */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                          style={{transform: 'translateZ(30px)'}}
                        >
                          <span className="text-white text-sm font-medium">
                            {translations.readMore || 'Devamını Oku →'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Üç boyutlu efekt için alttaki katman */}
                      <div 
                        className="absolute inset-0 rounded-xl z-[-1]" 
                        style={{
                          background: isDark ? '#121212' : '#e0e0e0',
                          transform: 'translateZ(-20px)',
                          boxShadow: isDark ? '0 0 30px 5px rgba(255,0,0,0.1)' : '0 0 30px 5px rgba(225,6,0,0.05)'
                        }}
                      ></div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Özel kaydırma göstergesi */}
              {hasCarousel && (
                <motion.div 
                  ref={progressBarRef}
                  className={`h-2 rounded-full mt-4 mx-auto w-64 relative ${isDark ? 'bg-[#333]' : 'bg-gray-200'}`}
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  <motion.div 
                    className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-[#FF0000] to-[#FF6B6B]' : 'bg-gradient-to-r from-[#E10600] to-[#FF4D4D]'}`}
                    style={{ 
                      width: `${maxScroll > 0 ? (scrollPosition / maxScroll) * 100 : 0}%`,
                      boxShadow: isDark ? '0 0 10px #FF0000' : '0 0 10px rgba(225,6,0,0.3)'
                    }}
                  >
                    {/* Parıldama efekti */}
                    <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden">
                      <div className="w-20 h-full bg-white/30 rotate-12 transform-gpu absolute -left-10 animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            ref={ctaButtonRef}
            href="/blog"
            className={`rounded-md px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-xs sm:text-sm md:text-base font-semibold shadow-lg transition-all duration-300 ${
              isDark 
                ? 'bg-gradient-to-r from-[#FF0000] to-[#CC0000] text-white hover:shadow-[0_0_15px_rgba(255,0,0,0.5)]' 
                : 'bg-gradient-to-r from-[#E10600] to-[#B00500] text-white hover:shadow-[0_0_15px_rgba(225,6,0,0.3)]'
            }`}
          >
            {translations.blogCta}
          </Link>
        </motion.div>

        {/* Stil eklentileri için CSS */}
        <style jsx global>{`
          @keyframes shimmer {
            0% { transform: translateX(-150%) skewX(-15deg); }
            100% { transform: translateX(350%) skewX(-15deg); }
          }
          
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </section>
  );
}