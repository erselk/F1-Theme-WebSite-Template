'use client';

import { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import useSWRFetch from '@/hooks/useSWRFetch';
import BlogDetail from '@/components/features/blog/BlogDetail';
import { BlogPost } from '@/types';

export default function BlogPostPage() {
  const { slug } = useParams();
  
  // SWR ile tek blog verisi çekme - optimize edilmiş ayarlar
  const { data, error, isLoading } = useSWRFetch<{ blog: BlogPost, success: boolean }>(
    `/api/blogs/${slug}`,
    { 
      revalidateOnFocus: true,  // Sekmeye odaklanıldığında yeniden doğrula
      revalidateIfStale: true, // Veri bayatsa yeniden doğrula
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 dakika - blog içeriği çok sık değişmez
    }
  );
  
  // Sayfa başlığını güncelle
  useEffect(() => {
    if (data?.blog) {
      document.title = `${data.blog.title.en} | PadokClub Blog`;
    }
  }, [data?.blog]);
  
  // Hata durumunu kontrol et
  if (error || (data && !data.success)) {
    notFound();
  }
  
  // Yükleme durumu için
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          {/* Back button skeleton */}
          <div className="mb-8 w-36 h-5 bg-gray-300 dark:bg-graphite rounded"></div>
          
          {/* Title skeleton */}
          <div className="h-9 bg-gray-300 dark:bg-graphite rounded w-3/4 mb-4"></div>
          <div className="h-9 bg-gray-300 dark:bg-graphite rounded w-2/3 mb-6"></div>
          
          {/* Meta information skeleton */}
          <div className="flex gap-4 mb-8">
            <div className="w-40 h-6 bg-gray-300 dark:bg-graphite rounded"></div>
            <div className="w-32 h-6 bg-gray-300 dark:bg-graphite rounded"></div>
            <div className="w-24 h-6 bg-gray-300 dark:bg-graphite rounded"></div>
          </div>
          
          {/* Cover image skeleton */}
          <div className="aspect-video w-full rounded-lg bg-gray-300 dark:bg-graphite mb-10"></div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-full"></div>
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-4/5"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Blog verisi yoksa 404 göster
  if (!data?.blog) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogDetail blog={data.blog} />
    </div>
  );
}