'use client';

import { ChangeEvent } from 'react';
import Image from 'next/image';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Event } from '@/types';
import { FormErrors } from './types';

interface ImageSectionProps {
  formData: Partial<Event>;
  bannerPreview: string | null;
  squarePreview: string | null;
  galleryPreviews: string[];
  formLanguage: 'tr' | 'en';
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  onBannerSelectorOpen: () => void;
  onSquareSelectorOpen: () => void;
  onGallerySelectorOpen: () => void;
  handleGalleryImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  removeGalleryImage: (index: number) => void;
}

export default function ImageSection({
  formData,
  bannerPreview,
  squarePreview,
  galleryPreviews,
  formLanguage,
  isDark,
  onBannerSelectorOpen,
  onSquareSelectorOpen,
  onGallerySelectorOpen,
  handleGalleryImageUpload,
  removeGalleryImage
}: ImageSectionProps) {
  // Default images that already exist in the project
  const defaultBannerImage = '/images/logouzun.png';
  const defaultSquareImage = '/images/logokare.png';
  
  // Görsel ekleme mantığını güncelle
  // Kullanıcının eklediği görselleri alıyoruz
  const userGalleryImages = [...(formData.gallery || [])].filter(
    img => img !== defaultBannerImage && img !== defaultSquareImage
  );
  
  // Toplam 3 görsele tamamlamak için gereken default görsel sayısı
  const defaultImagesNeeded = Math.max(0, 3 - userGalleryImages.length);
  
  // Görüntülenecek tüm görsel listesi
  let gallery = [...userGalleryImages];
  
  // İhtiyaç duyulan sayıda default görsel ekle
  for (let i = 0; i < defaultImagesNeeded; i++) {
    gallery.push(defaultBannerImage);
  }
  
  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Görseller' : 'Images'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-2 sm:mb-4">
        {/* Banner Image */}
        <div className="flex flex-col items-center">
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Banner Görseli (16:9 önerilen)' : 'Banner Image (16:9 recommended)'}
          </label>
          
          <div className="mb-2 sm:mb-4 flex justify-center w-full max-w-[160px] sm:max-w-[284px]">
            {bannerPreview ? (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={bannerPreview} 
                  alt={formLanguage === 'tr' ? "Banner önizleme" : "Banner preview"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 284px"
                  priority
                />
              </div>
            ) : formData.bannerImage ? (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={formData.bannerImage} 
                  alt={formLanguage === 'tr' ? "Banner görseli" : "Banner image"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 284px"
                  priority
                  unoptimized={formData.bannerImage.startsWith('/api/files/')}
                />
              </div>
            ) : (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={defaultBannerImage} 
                  alt={formLanguage === 'tr' ? "Varsayılan banner" : "Default banner"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 284px"
                  priority
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center w-full max-w-[160px] sm:max-w-[284px]">
            <button
              type="button"
              onClick={onBannerSelectorOpen}
              className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center text-xs sm:text-sm`}
            >
              <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
            </button>
          </div>
        </div>
        
        {/* Square Image */}
        <div className="flex flex-col items-center">
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Kare Görseli (1:1 önerilen)' : 'Square Image (1:1 recommended)'}
          </label>
          
          <div className="mb-2 sm:mb-4 flex justify-center">
            {squarePreview ? (
              <div className="relative w-[160px] h-[160px] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={squarePreview} 
                  alt={formLanguage === 'tr' ? "Kare önizleme" : "Square preview"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="160px"
                  priority
                />
              </div>
            ) : formData.squareImage ? (
              <div className="relative w-[160px] h-[160px] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={formData.squareImage} 
                  alt={formLanguage === 'tr' ? "Kare görseli" : "Square image"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="160px"
                  priority
                  unoptimized={formData.squareImage.startsWith('/api/files/')}
                />
              </div>
            ) : (
              <div className="relative w-[160px] h-[160px] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={defaultSquareImage} 
                  alt={formLanguage === 'tr' ? "Varsayılan kare" : "Default square"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="160px"
                  priority
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center w-full max-w-[160px]">
            <button
              type="button"
              onClick={onSquareSelectorOpen}
              className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center text-xs sm:text-sm`}
            >
              <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Gallery Images */}
      <div>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Galeri Görselleri' : 'Gallery Images'}
          </label>
          
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onGallerySelectorOpen}
              className={`p-2 sm:px-4 sm:py-2 rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center`}
            >
              <PhotoIcon className="w-6 h-6 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline">
                {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Gallery preview */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mt-2">
          {gallery && gallery.length > 0 ? (
            gallery.map((imagePath, index) => {
              // Varsayılan görsel mi kontrolü
              const isDefaultImage = imagePath === defaultBannerImage || imagePath === defaultSquareImage;
              const isUserAddedImage = index < userGalleryImages.length;
              
              return (
                <div 
                  key={`gallery-${index}`}
                  className="relative group"
                >
                  <div className={`relative w-full h-20 sm:h-32 bg-gray-100 rounded-md overflow-hidden ${isDefaultImage ? 'opacity-60' : ''}`}>
                    <Image 
                      src={imagePath}
                      alt={formLanguage === 'tr' 
                        ? isDefaultImage ? "Varsayılan görsel" : `Galeri görseli ${index + 1}` 
                        : isDefaultImage ? "Default image" : `Gallery image ${index + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized={imagePath.startsWith('/api/files/')}
                    />
                  </div>
                  {isUserAddedImage && (
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'bg-carbon-grey text-white' : 'bg-white text-dark-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu görseli sil" : "Delete this image"}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className={`col-span-full py-6 text-center ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
              {formLanguage === 'tr' 
                ? 'Henüz galeri görseli eklenmemiş. Görsel seçmek için butonları kullanın.'
                : 'No gallery images added yet. Use the buttons to select images.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 