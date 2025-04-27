'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { Author } from '@/models/Author';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthorEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isDark } = useThemeLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Yazarı getir
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await fetch(`/api/authors/${params.id}`);
        if (!response.ok) {
          throw new Error('Yazar getirilirken bir hata oluştu');
        }
        const data = await response.json();
        const author = data.author;
        
        setFormData({
          name: author.name,
          profileImage: author.profileImage || '/api/files/680e8849803166580a5ca610'
        });
        
      } catch (error) {
        setError('Yazar yüklenirken bir hata oluştu');
        console.error('Error fetching author:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [params.id]);

  // Profil resmi seçildiğinde önizleme oluştur
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Temizlik işlevi
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    
    if (!formData.name) {
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
      const response = await fetch(`/api/authors/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          profileImage: imageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Yazar güncellenirken bir hata oluştu');
      }
      
      setSubmitSuccess('Yazar başarıyla güncellendi!');
      
    } catch (error: any) {
      console.error('Error updating author:', error);
      setSubmitError(error.message || 'Bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className={`${isDark ? 'text-white' : 'text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yazar Düzenle</h1>
        <Link
          href="/admin/authors"
          className={`px-5 py-2.5 rounded-md font-medium ${
            isDark
              ? 'bg-carbon-grey text-silver hover:bg-gray-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition shadow-md`}
        >
          Geri Dön
        </Link>
      </div>

      {/* Bildirimler */}
      {submitSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {submitSuccess}
        </div>
      )}

      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}

      {/* Yazar Düzenleme Formu */}
      {loading ? (
        <div className="text-center py-10">
          <p>Yazar bilgileri yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div className={`p-6 rounded-lg ${isDark ? 'bg-carbon-grey' : 'bg-white shadow'}`}>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[250px]">
              <label className="block mb-2 font-medium">Yazar Adı*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-md ${
                  isDark ? 'bg-dark-grey border-carbon-grey' : 'bg-white border-gray-300'
                }`}
                required
                placeholder="Yazarın adını girin"
              />
            </div>
            
            <div className="flex-1 min-w-[250px]">
              <label className="block mb-2 font-medium">Profil Resmi*</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative overflow-hidden rounded-full border-2 border-gray-300">
                  <Image
                    src={previewUrl || formData.profileImage || '/api/files/680e8849803166580a5ca610'}
                    alt="Profile preview"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`flex-1 ${isDark ? 'text-silver' : 'text-gray-700'}`}
                />
              </div>
            </div>
            
            <div className="w-full flex justify-end gap-4 mt-6">
              <Link
                href="/admin/authors"
                className={`px-6 py-3 rounded-md font-medium ${
                  isDark
                    ? 'bg-dark-grey text-silver hover:bg-gray-700 border border-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                } shadow-md`}
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={uploading}
                className={`px-6 py-3 rounded-md font-semibold text-white ${
                  isDark
                    ? 'bg-electric-blue hover:bg-blue-600'
                    : 'bg-f1-red hover:bg-red-700'
                } transition shadow-lg ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? 'Güncelleniyor...' : 'Güncelle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}