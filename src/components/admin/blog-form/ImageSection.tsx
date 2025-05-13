'use client';

import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { ImageFile } from './types';

interface ImageSectionProps {
  coverImage: string;
  thumbnailImage: string;
  coverPreview: string | null;
  thumbnailPreview: string | null;
  onCoverSelectorOpen: () => void;
  onThumbnailSelectorOpen: () => void;
  isDark: boolean;
  formLanguage: 'tr' | 'en';
}

export default function ImageSection({
  coverImage,
  thumbnailImage,
  coverPreview,
  thumbnailPreview,
  onCoverSelectorOpen,
  onThumbnailSelectorOpen,
  isDark,
  formLanguage
}: ImageSectionProps) {
  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-4 sm:mb-6 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-base sm:text-lg font-medium mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Görseller' : 'Images'}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Cover Image */}
        <div className="flex flex-col items-center">
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Kapak Görseli (16:9 önerilen)' : 'Cover Image (16:9 recommended)'}
          </label>
          
          <div className="mb-2 sm:mb-4 w-full max-w-[160px] sm:max-w-[284px]">
            {coverPreview ? (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={coverPreview} 
                  alt={formLanguage === 'tr' ? "Kapak önizleme" : "Cover preview"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 284px"
                  priority
                />
              </div>
            ) : coverImage ? (
              <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={coverImage} 
                  alt={formLanguage === 'tr' ? "Kapak görseli" : "Cover image"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 284px"
                  priority
                  unoptimized={coverImage.startsWith('/api/files/')}
                />
              </div>
            ) : (
              <div className="w-full aspect-[16/9] flex items-center justify-center bg-gray-100 rounded-md">
                <span className={`text-xs sm:text-sm ${isDark ? 'text-carbon-grey' : 'text-light-grey'}`}>
                  {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                </span>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-[160px] sm:max-w-[284px]">
            <button
              type="button"
              onClick={onCoverSelectorOpen}
              className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center text-xs sm:text-sm`}
            >
              <PhotoIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
            </button>
          </div>
        </div>
        
        {/* Thumbnail Image */}
        <div className="flex flex-col items-center">
          <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Küçük Görsel (1:1 önerilen)' : 'Thumbnail Image (1:1 recommended)'}
          </label>
          
          <div className="mb-2 sm:mb-4 w-full max-w-[160px] sm:max-w-[160px]">
            {thumbnailPreview ? (
              <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={thumbnailPreview} 
                  alt={formLanguage === 'tr' ? "Küçük görsel önizleme" : "Thumbnail preview"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 160px"
                  priority
                />
              </div>
            ) : thumbnailImage ? (
              <div className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                <Image 
                  src={thumbnailImage} 
                  alt={formLanguage === 'tr' ? "Küçük görsel" : "Thumbnail image"} 
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 160px, 160px"
                  priority
                  unoptimized={thumbnailImage.startsWith('/api/files/')}
                />
              </div>
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                <span className={`text-xs sm:text-sm ${isDark ? 'text-carbon-grey' : 'text-light-grey'}`}>
                  {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                </span>
              </div>
            )}
          </div>
          
          <div className="w-full max-w-[160px] sm:max-w-[160px]">
            <button
              type="button"
              onClick={onThumbnailSelectorOpen}
              className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center text-xs sm:text-sm`}
            >
              <PhotoIcon className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 