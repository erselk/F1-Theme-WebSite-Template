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
    <div className="animate-pulse p-4 sm:p-8">
      <div className="h-4 sm:h-6 bg-gray-300 dark:bg-graphite rounded w-1/3 mb-4 sm:mb-6" />
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-300 dark:bg-graphite"
            style={{ width: `${50 + i * 8}px` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {Array(6).fill(0).map((_, i) => (
          <div key={i}>
            <div className="aspect-video rounded-lg mb-3 sm:mb-4 bg-gray-300 dark:bg-graphite" />
            <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-1/2 mb-1.5 sm:mb-2" />
            <div className="h-4 sm:h-6 bg-gray-300 dark:bg-graphite rounded w-3/4 mb-1.5 sm:mb-2" />
            <div className="h-3 sm:h-4 bg-gray-300 dark:bg-graphite rounded w-full mb-1.5 sm:mb-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 text-[13px] sm:text-base scale-95 sm:scale-100">
      <BlogPageHeader />
      <Suspense fallback={<BlogContentLoading />}>
        <BlogContent />
      </Suspense>
    </div>
  );
}