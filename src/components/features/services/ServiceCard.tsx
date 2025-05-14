'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface ServiceCardProps {
  emoji: string;
  title: string;
  description: string;
  detail: string;
  imageSrc: string;
  isDark: boolean;
  index: number;
}

// Using memo to prevent unnecessary re-renders
const ServiceCard = memo(({ emoji, title, description, detail, isDark, imageSrc, index }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useThemeLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [initialAnimDone, setInitialAnimDone] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Initial animation for mobile cards
  useEffect(() => {
    if (isMobile && !initialAnimDone && cardInnerRef.current) {
      // Start animation after a staggered delay based on index
      const timer = setTimeout(() => {
        if (cardInnerRef.current) {
          // Start animation with full 360 rotation
          cardInnerRef.current.style.transition = 'transform 1.5s ease';
          cardInnerRef.current.style.transform = 'rotateY(360deg)';
          
          // Reset after animation is done
          const resetTimer = setTimeout(() => {
            if (cardInnerRef.current) {
              cardInnerRef.current.style.transition = 'none';
              cardInnerRef.current.style.transform = 'rotateY(0deg)';
              
              // Re-enable transitions after reset
              setTimeout(() => {
                if (cardInnerRef.current) {
                  cardInnerRef.current.style.transition = 'transform 0.7s ease';
                  setInitialAnimDone(true);
                }
              }, 50);
            }
          }, 1500);
          
          return () => clearTimeout(resetTimer);
        }
      }, 300 + index * 200);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, initialAnimDone, index]);

  // This effect handles expanding/collapsing card without affecting the animation
  useEffect(() => {
    if (cardRef.current && isExpanded) {
      // When card is expanded, use position relative to remove grid influence
      cardRef.current.style.position = 'relative';
      cardRef.current.style.zIndex = '10';
    } else if (cardRef.current) {
      // When card is collapsed, return to normal position
      cardRef.current.style.position = '';
      cardRef.current.style.zIndex = '';
    }
  }, [isExpanded]);

  // Handle button click without triggering animation reload
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store current scroll position before toggling
    const currentScrollPosition = window.scrollY;
    
    // Toggle expanded state
    setIsExpanded(!isExpanded);
    
    // If we're closing the card, maintain scroll position
    if (isExpanded) {
      // Use setTimeout to ensure this happens after the state update and re-render
      setTimeout(() => {
        window.scrollTo({
          top: currentScrollPosition,
          behavior: "auto" // Use "auto" instead of "smooth" to prevent visible scrolling
        });
      }, 10);
    }
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile && initialAnimDone) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile && initialAnimDone && touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diffX = touchEndX - touchStartX.current;
      
      // If the swipe is significant enough (more than 40px)
      if (Math.abs(diffX) > 40) {
        // Herhangi bir yöne kaydırma, mevcut yüzün tersine geçiş yaptırır
        setIsFlipped(!isFlipped);
      }
      
      // Reset touch start
      touchStartX.current = null;
    }
  };

  // Render card for mobile (flippable with swipe) or desktop
  if (isMobile) {
    return (
      <div
        ref={cardRef}
        className="relative min-h-[240px] h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={cardInnerRef}
          className={`w-full h-full rounded-xl shadow-lg ${
            isDark 
              ? 'bg-graphite shadow-[0_8px_30px_rgb(0,0,0,0.3)]' 
              : 'bg-white shadow-[0_5px_20px_rgb(0,0,0,0.1)]'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.7s ease',
            perspective: '2000px'
          }}
        >
          {/* Front - Only image and title */}
          <div 
            className="absolute w-full h-full rounded-xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="relative h-full w-full">
              <Image
                src={imageSrc}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-cover"
                priority={index < 3}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${
                isDark ? 'from-black/80 to-transparent' : 'from-black/60 to-transparent'
              }`}></div>
              <div className="absolute bottom-4 left-4 text-white">
                <span className="text-base font-bold font-['Titillium_Web'] leading-tight">{title}</span>
              </div>
            </div>
          </div>

          {/* Back - Only short description */}
          <div 
            className="absolute w-full h-full rounded-xl overflow-hidden"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className={`h-full w-full p-5 flex items-center justify-center ${
              isDark ? 'bg-graphite text-white' : 'bg-white text-dark-grey'
            }`}>
              <p className={`text-sm text-center font-['Inter'] ${
                isDark ? 'text-light-grey' : 'text-medium-grey'
              }`}>
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version (original card)
  return (
    <div
      ref={cardRef}
      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isDark 
          ? 'bg-graphite shadow-[0_8px_30px_rgb(0,0,0,0.3)]' 
          : 'bg-white shadow-[0_5px_20px_rgb(0,0,0,0.1)]'
      } flex flex-col text-[13px] sm:text-base`}
      style={{ 
        height: isExpanded ? 'auto' : '', 
        gridRow: isExpanded ? 'span 2' : '',
        opacity: 1,
        transform: 'translateY(0)' // Apply the transform statically instead of with animation
      }}
    >
      <div className="relative h-32 sm:h-36 md:h-44 w-full overflow-hidden flex-shrink-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 hover:scale-110"
          priority={index < 3} // Load first 3 images with priority
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${
          isDark ? 'from-black/80 to-transparent' : 'from-black/60 to-transparent'
        }`}></div>
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-white flex items-center">
          <span className="text-xl sm:text-2xl md:text-3xl mr-1.5 sm:mr-2 md:mr-3">{emoji}</span>
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-['Titillium_Web']">{title}</span>
        </div>
      </div>

      <div className="p-3 sm:p-4 pt-2 sm:pt-3 pb-2 sm:pb-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <p className={`text-xs sm:text-sm md:text-base mb-2 sm:mb-3 leading-relaxed font-['Inter'] ${
            isDark ? 'text-silver' : 'text-medium-grey'
          } ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          
          {/* Detail area without animation - only show when expanded */}
          {isExpanded && (
            <div 
              className={`mt-1 sm:mt-2 overflow-hidden ${
                isDark ? 'text-silver' : 'text-medium-grey'
              }`}
            >
              <div className="space-y-1 sm:space-y-2">
                {detail.split('\n\n').map((paragraph, i) => (
                  <p 
                    key={i} 
                    className={`text-xs mb-2 leading-relaxed ${
                      isDark ? 'text-light-grey' : 'text-dark-grey'
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-2 sm:mt-3 md:mt-4">
          <button
            onClick={handleToggleExpand}
            className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all ${
              isDark 
                ? `bg-carbon-grey hover:bg-[#464646] text-white border border-[#4a4a4a]` 
                : `bg-light-grey hover:bg-[#e8e8e8] text-dark-grey border border-[#e0e0e0]`
            } flex items-center justify-center z-10 relative`}
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded 
                ? (language === 'tr' ? 'Kapat' : 'Close') 
                : (language === 'tr' ? 'Detaylı Bilgi' : 'View Details')}
            </span>
            <svg 
              className={`ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});

// Add display name for debugging
ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;