'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface ImageGalleryProps {
  images: string[];
  title: string;
  locale: LanguageType;
}

export function ImageGallery({ images, title, locale }: ImageGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(images.length > 0 ? images[0] : null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="text-center p-8 bg-dark-grey/40 rounded-lg border border-dashed border-carbon-grey">
        <p className="text-silver">
          {locale === 'tr' ? 'Bu etkinlik için henüz fotoğraf yok.' : 'No photos available for this event yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div className="relative w-full h-64 sm:h-80 mb-4 overflow-hidden rounded-lg">
        {activeImage && (
          <div 
            className="w-full h-full cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={activeImage}
              alt={title}
              className="object-cover rounded-lg transition-transform hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={85}
            />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {images.slice(0, 8).map((img, index) => (
          <div 
            key={index} 
            className={`relative h-16 sm:h-20 cursor-pointer rounded-md overflow-hidden 
              ${activeImage === img ? 'ring-2 ring-electric-blue' : 'opacity-70 hover:opacity-100'}`}
            onClick={() => setActiveImage(img)}
          >
            <Image
              src={img}
              alt={`${title} - ${index + 1}`}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 25vw, 10vw"
            />
          </div>
        ))}
      </div>

      {/* Show all photos button if more than 8 */}
      {images.length > 8 && (
        <button 
          className="w-full mt-3 py-2 text-center bg-dark-grey hover:bg-carbon-grey text-light-grey rounded-lg transition-colors"
          onClick={() => setLightboxOpen(true)}
        >
          {locale === 'tr' 
            ? `Tüm Fotoğrafları Gör (${images.length})` 
            : `View All Photos (${images.length})`}
        </button>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setLightboxOpen(false)}
                className="text-white hover:text-electric-blue transition-colors"
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
                      ${activeImage === img ? 'ring-2 ring-electric-blue' : 'opacity-70 hover:opacity-100'}`}
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