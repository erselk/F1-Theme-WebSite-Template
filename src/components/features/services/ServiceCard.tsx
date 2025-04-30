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
  const [isMobile, setIsMobile] = useState(false);

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

  // Handle paragraphs with line breaks - correctly parse \n characters
  const formattedDetail = detail.split('\n\n').map((paragraph, i) => (
    <p 
      key={i} 
      className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed ${
        isDark ? 'text-light-grey' : 'text-dark-grey'
      }`}
    >
      {paragraph}
    </p>
  ));

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

  return (
    <div
      ref={cardRef}
      className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
        isDark 
          ? 'bg-graphite shadow-[0_8px_30px_rgb(0,0,0,0.3)]' 
          : 'bg-white shadow-[0_5px_20px_rgb(0,0,0,0.1)]'
      } flex flex-col text-[13px] sm:text-base`}
      style={{ 
        height: isExpanded && !isMobile ? 'auto' : '', 
        gridRow: isExpanded && !isMobile ? 'span 2' : '',
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
          } ${isMobile || !isExpanded ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          
          {/* Detail area without animation - only show on non-mobile when expanded */}
          {!isMobile && isExpanded && (
            <div 
              className={`mt-1 sm:mt-2 overflow-hidden ${
                isDark ? 'text-silver' : 'text-medium-grey'
              }`}
            >
              <div className="space-y-1 sm:space-y-2">
                {formattedDetail}
              </div>
            </div>
          )}
        </div>
        
        {/* Only show button on non-mobile devices */}
        {!isMobile && (
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
        )}
      </div>
    </div>
  );
});

// Add display name for debugging
ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;