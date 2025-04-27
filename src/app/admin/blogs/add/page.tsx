'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BlogForm from '@/components/admin/BlogForm';
import { BlogPost } from '@/types';
import { useTheme } from 'next-themes';

export default function AddBlogPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Force dark theme on mount for admin panel consistency
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  const handleSubmit = async (blogData: Partial<BlogPost>) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Blog eklenirken bir hata oluştu');
      }
      
      // Başarılı ise blog listesine yönlendir
      router.push('/admin/blogs');
      router.refresh(); // Listeyi yenilemek için refresh çağır
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Blog eklenirken bir hata oluştu');
      console.error('Blog ekleme hatası:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">      
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}