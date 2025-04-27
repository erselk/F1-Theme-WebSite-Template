'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ImageFile {
  id: string;
  filename: string;
  url: string;
  publicPath: string;
  createdAt: string;
  contentType: string;
}

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: ImageFile) => void;
  category: 'banner' | 'square' | 'gallery';
  currentImage?: string;
}

export default function ImageSelector({
  isOpen,
  onClose,
  onSelect,
  category,
  currentImage
}: ImageSelectorProps) {
  const { isDark, language: currentLanguage } = useThemeLanguage();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // File input ref for upload button
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial selected image from props
  useEffect(() => {
    if (currentImage) {
      // Extract file ID from current image path
      const fileIdMatch = currentImage.match(/\/([^\/]+)$/);
      if (fileIdMatch && fileIdMatch[1]) {
        setSelectedImage(fileIdMatch[1]);
      }
    }
  }, [currentImage]);

  // Load images when modal opens
  useEffect(() => {
    if (isOpen) {
      loadImages();
    }
  }, [isOpen, category]);

  // Function to load images from the API
  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Artık kategori parametresini göndermiyoruz
      const response = await fetch(`/api/files/list`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load images');
      }
      
      setImages(data.files || []);
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('category', category);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Refresh the image list
          await loadImages();
          
          // Başarı bildirimini kaldırdık
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(currentLanguage === 'tr'
          ? `Yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
          : `Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUploading(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle image selection
  const handleSelect = (image: ImageFile) => {
    setSelectedImage(image.id);
    onSelect(image);
    onClose();
  };

  // Render nothing if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`relative max-w-4xl w-full rounded-lg shadow-xl overflow-hidden ${
            isDark ? 'bg-carbon-grey' : 'bg-white'
          } max-h-[80vh] flex flex-col`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`p-4 border-b ${isDark ? 'border-dark-grey' : 'border-light-grey'} flex justify-between items-center`}>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {currentLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
            </h3>
            
            <div className="flex items-center space-x-3">
              {/* Upload button */}
              <div className="relative">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  id="image-upload" 
                  className="hidden"
                  accept="image/*" 
                  onChange={handleUpload}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="image-upload"
                  className={`flex items-center px-3 py-1 rounded-md cursor-pointer ${
                    isDark 
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80' 
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {currentLanguage === 'tr' ? 'Yükleniyor...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      {currentLanguage === 'tr' ? 'Yükle' : 'Upload'}
                    </>
                  )}
                </label>
              </div>
              
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className={`rounded-md p-1 ${
                  isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                } focus:outline-none transition-colors`}
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue"></div>
              </div>
            ) : error ? (
              <div className="text-center text-f1-red p-4">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={loadImages}
                  className="mt-2 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80 transition-colors"
                >
                  {currentLanguage === 'tr' ? 'Tekrar Dene' : 'Try Again'}
                </button>
              </div>
            ) : images.length === 0 ? (
              <div className="text-center p-4">
                <p className={isDark ? 'text-silver' : 'text-medium-grey'}>
                  {currentLanguage === 'tr' 
                    ? 'Henüz yüklenmiş görsel yok. Yeni görsel yüklemek için "Yükle" butonunu kullanabilirsiniz.' 
                    : 'No images uploaded yet. You can use the "Upload" button to add new images.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div 
                    key={image.id}
                    onClick={() => handleSelect(image)}
                    className={`relative cursor-pointer group rounded-md overflow-hidden border-2 ${
                      selectedImage === image.id 
                        ? 'border-electric-blue' 
                        : isDark ? 'border-dark-grey hover:border-silver' : 'border-light-grey hover:border-medium-grey'
                    } transition-colors`}
                  >
                    <div className="relative aspect-square w-full">
                      <Image 
                        src={image.url}
                        alt={image.filename}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="transition-opacity group-hover:opacity-90"
                      />
                    </div>
                    
                    {selectedImage === image.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="w-6 h-6 text-electric-blue" />
                      </div>
                    )}
                    
                    <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{image.filename}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className={`p-4 border-t ${isDark ? 'border-dark-grey' : 'border-light-grey'} flex justify-end space-x-2`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark
                  ? 'bg-dark-grey text-silver hover:bg-carbon-grey'
                  : 'bg-light-grey text-medium-grey hover:bg-very-light-grey'
              } transition-colors`}
            >
              {currentLanguage === 'tr' ? 'İptal' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}