'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface ImageGalleryProps {
  images: string[];
  title: string;
  locale: LanguageType;
}

export function ImageGallery({ images, title, locale }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(images.length > 0 ? images[0] : null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { isDark } = useThemeLanguage();

  // Lightbox açıldığında body scrolling'i devre dışı bırak
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

  // Resim sayısına göre grid yapısını belirleme
  const gridConfig = useMemo(() => {
    const totalImages = images.length;
    
    if (totalImages === 0) return { cols: 1, rows: 1 };
    if (totalImages === 1) return { cols: 1, rows: 1 };
    if (totalImages <= 4) return { cols: 2, rows: 2 };
    if (totalImages <= 9) return { cols: 3, rows: 3 };
    if (totalImages <= 16) return { cols: 4, rows: 4 };
    return { cols: 5, rows: 5 }; // 17-25 resim
  }, [images.length]);

  if (!images.length) {
    return (
      <div className={`text-center p-8 border border-dashed ${isDark ? 'bg-dark-grey/80 border-carbon-grey/80' : 'bg-gray-100/80 border-gray-300/80'}`}>
        <p className={isDark ? 'text-silver' : 'text-gray-600'}>
          {locale === 'tr' ? 'Bu etkinlik için henüz fotoğraf yok.' : 'No photos available for this event yet.'}
        </p>
      </div>
    );
  }

  const openLightbox = (index: number) => {
    setActiveImage(images[index]);
    setLightboxOpen(true);
  };

  return (
    <div>
      {/* Kare galeri alanı */}
      <div 
        className="w-full aspect-square"
        style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`,
          gap: '2px',
        }}
      >
        {images.slice(0, gridConfig.cols * gridConfig.rows).map((image, index) => (
          <div 
            key={index} 
            className="relative overflow-hidden rounded-lg cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="w-full h-full relative">
              <Image 
                src={image} 
                alt={`${title} - ${index + 1}`}
                className="object-cover transition-transform hover:scale-110 duration-300 absolute inset-0 w-full h-full"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                unoptimized={image.startsWith('/api/files/')}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Show all photos button if more than grid capacity */}
      {images.length > (gridConfig.cols * gridConfig.rows) && (
        <button 
          className={`w-full mt-3 py-2 text-center border ${isDark ? 'bg-dark-grey/80 border-dark-grey/80 text-light-grey' : 'bg-gray-200/80 border-gray-200/80 text-gray-800'} rounded-lg transition-colors`}
          onClick={() => setLightboxOpen(true)}
        >
          {locale === 'tr' 
            ? `Tüm Fotoğrafları Gör (${images.length})` 
            : `View All Photos (${images.length})`}
        </button>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div 
            className={`max-w-4xl w-full p-4 rounded-lg border ${isDark ? 'bg-dark-grey/80 border-gray-700/80' : 'bg-white/80 border-gray-200/80'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setLightboxOpen(false)}
                className={`${isDark ? 'text-white hover:text-electric-blue' : 'text-gray-800 hover:text-blue-500'} transition-colors`}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Current image */}
            <div className="relative w-full h-[60vh] mb-4">
              <Image
                src={activeImage || images[0]}
                alt={title}
                className="object-contain"
                fill
                sizes="100vw"
                quality={90}
              />
            </div>
            
            {/* Thumbnails */}
            <div className="overflow-x-auto">
              <div className="flex space-x-2 py-2">
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`relative flex-shrink-0 w-24 h-16 cursor-pointer rounded-md overflow-hidden
                      ${activeImage === img ? 'ring-2 ring-electric-blue/80' : 'opacity-70 hover:opacity-100'}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`${title} - ${index + 1}`}
                      className="object-cover"
                      fill
                      sizes="10vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}