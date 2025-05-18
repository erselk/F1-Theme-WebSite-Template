'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { BlogPost } from '@/types';
import { useTheme } from 'next-themes';
import { use } from 'react';

// Client component'ler için params tipini böyle tanımlamalıyız
export default function EditBlogPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  // Unwrap params using React.use() before accessing properties
  const { slug } = use(params);
  const { setTheme } = useTheme();
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force dark theme on mount - for consistent admin UI
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/blogs/${slug}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Blog bilgileri yüklenirken bir hata oluştu');
        }
        
        // Blog verisini ayarla
        const blogData = data.blog;
        
        setBlog(blogData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Blog bilgileri yüklenirken bir hata oluştu');
        console.error('Blog yükleme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const handleSubmit = async (blogData: Partial<BlogPost>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Slug değişikliğini engelle - API'de de kontrol ediliyor
      blogData.slug = slug;
      
      // Veriyi API'ye gönder
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Blog güncellenirken bir hata oluştu');
      }
      
      // Başarılı ise blog listesine yönlendir
      router.push('/admin/blogs');
      router.refresh(); // Listeyi yenilemek için refresh çağır
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blog güncellenirken bir hata oluştu');
      console.error('Blog güncelleme hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-medium-grey">Blog bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {error}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80 transition-colors"
            onClick={() => router.push('/admin/blogs')}
          >
            Blog Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            Blog bulunamadı
          </div>
          <button
            className="mt-4 px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80 transition-colors"
            onClick={() => router.push('/admin/blogs')}
          >
            Blog Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Blog Yazısını Düzenle</h1>
        <p className="text-xs sm:text-sm text-medium-grey">&quot;{blog.title?.tr || blog.title?.en}&quot; başlıklı blog yazısını düzenliyorsunuz.</p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {error}
          </div>
        </div>
      )}
      
      <BlogForm 
        blog={blog}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}