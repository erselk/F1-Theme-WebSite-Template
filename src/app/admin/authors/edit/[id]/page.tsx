'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { Author } from '@/models/Author';
import React from 'react';

export default function EditAuthorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isDark } = useThemeLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Güvenli bir şekilde params'a erişim
  // params bir Promise ise React.use() ile çözülür, değilse direkt olarak kullanılır
  const id = typeof params.id === 'object' && 'then' in params.id 
    ? React.use(params as any).id 
    : params.id;
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    profileImage: string;
  }>({
    name: '',
    profileImage: '/api/files/680e8849803166580a5ca610'
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Yazarı getir
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/authors/${id}`);
        
        if (!response.ok) {
          throw new Error('Yazar bilgileri getirilirken bir hata oluştu');
        }
        
        const data = await response.json();
        
        if (!data.author) {
          throw new Error('Yazar bulunamadı');
        }
        
        setFormData({
          name: data.author.name,
          profileImage: data.author.profileImage || '/api/files/680e8849803166580a5ca610'
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Yazar bilgileri yüklenirken bir hata oluştu');
        console.error('Error fetching author:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [id]);

  // Profil resmi seçildiğinde önizleme oluştur
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Önizleme URL'si oluştur
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Form temizlendiğinde URL'yi serbest bırakmak için
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!formData.name.trim()) {
      setSubmitError("Yazar adı gereklidir");
      return;
    }
    
    setUploading(true);
    
    try {
      // Önce dosyayı yükle (eğer seçilmişse)
      let imageUrl = formData.profileImage;
      
      if (selectedFile) {
        const formDataForUpload = new FormData();
        formDataForUpload.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataForUpload,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }
      
      // Yazarı güncelle
      const response = await fetch(`/api/authors/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          profileImage: imageUrl,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Yazar güncellenirken bir hata oluştu');
      }
      
      // Başarılı olduğunda yazarlar listesine yönlendir
      router.push('/admin/authors');
      
    } catch (error: any) {
      console.error('Error updating author:', error);
      setSubmitError(error.message || 'Bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-sm md:text-base text-medium-grey">Yazar bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="p-3 md:p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <span className="truncate">{error}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href="/admin/authors" 
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md transition-colors ${
              isDark ? 'bg-carbon-grey text-silver hover:bg-gray-700' : 
              'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Yazarlar Listesine Dön
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Yazar Düzenle</h1>
      </div>
      
      {submitError && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <span className="truncate">{submitError}</span>
          </div>
        </div>
      )}
      
      <div className={`p-4 md:p-6 rounded-lg ${isDark ? 'bg-carbon-grey' : 'bg-white shadow'}`}>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-6">
            {/* Yazar Adı Alanı */}
            <div className="w-full sm:w-1/2">
              <label htmlFor="name" className="block mb-2 text-sm font-medium">
                Yazar Adı <span className="text-f1-red">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-md border ${
                  isDark 
                  ? 'bg-carbon-grey border-dark-grey text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Yazarın adını girin"
                required
              />
            </div>
            
            {/* Profil Resmi Alanı */}
            <div className="w-full sm:w-1/2">
              <label className="block mb-2 text-sm font-medium">
                Profil Resmi <span className="text-f1-red">*</span>
              </label>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 relative overflow-hidden rounded-full border-2 border-gray-300 flex-shrink-0">
                  <Image
                    src={previewUrl || formData.profileImage}
                    alt="Profil önizleme"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`w-full text-xs md:text-sm ${
                      isDark ? 'text-silver' : 'text-gray-700'
                    }`}
                  />
                  <p className="mt-1 text-xs text-medium-grey">
                    Önerilen boyut: 400x400 piksel
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 md:gap-4">
            <Link 
              href="/admin/authors"
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md font-medium text-sm md:text-base ${
                isDark 
                ? 'bg-carbon-grey text-silver hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition`}
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md font-medium text-white text-sm md:text-base ${
                isDark 
                ? 'bg-electric-blue hover:bg-blue-600' 
                : 'bg-f1-red hover:bg-red-700'
              } transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}