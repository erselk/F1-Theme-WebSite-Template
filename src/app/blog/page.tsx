import { Metadata } from 'next';
import { Suspense } from 'react';
import BlogPageHeader from '@/components/features/blog/BlogPageHeader';
import BlogContent from '@/components/features/blog/BlogContent';

export const metadata: Metadata = {
  title: 'Blog | PadokClub',
  description: 'Motorsport ve F1 ile ilgili son haberler, içerikler ve makaleler',
};

// Loading fallback component
function BlogContentLoading() {
  return (
    <div className="animate-pulse p-8">
      <div className="h-6 bg-gray-300 dark:bg-graphite rounded w-1/3 mb-6" />
      <div className="flex flex-wrap gap-3 mb-8 justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="px-4 py-2 rounded-full bg-gray-300 dark:bg-graphite"
            style={{ width: `${60 + i * 10}px` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i}>
            <div className="aspect-video rounded-lg mb-4 bg-gray-300 dark:bg-graphite" />
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-300 dark:bg-graphite rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-300 dark:bg-graphite rounded w-full mb-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BlogPageHeader />
      <Suspense fallback={<BlogContentLoading />}>
        <BlogContent />
      </Suspense>
    </div>
  );
}