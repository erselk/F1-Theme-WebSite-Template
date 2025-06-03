'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// BlogSectionClient'ı dinamik olarak yükle
const BlogSectionClient = dynamic(() => import('./BlogSectionClient'), {
  ssr: false,
  loading: () => <BlogSectionLoading />
});

// Loading bileşeni
function BlogSectionLoading() {
  return (
    <section className="py-6 sm:py-10 border-4 border-white border-t-0 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Title ve subtitle için loading state */}
        <div className="text-center mb-2 sm:mb-6 max-w-3xl mx-auto">
          <div className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64 lg:w-80 mx-auto bg-white/30 rounded-lg animate-pulse"></div>
          <div className="mt-1 sm:mt-2 h-4 sm:h-5 lg:h-6 w-32 sm:w-48 lg:w-64 mx-auto bg-white/30 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Blog kartları için loading state */}
        <div className="flex overflow-x-auto pb-6 gap-6 hide-scrollbar">
          {[...Array(3)].map((_, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-[140px] sm:w-[200px] md:w-[280px] h-[220px] sm:h-[300px] md:h-[380px] rounded-xl border border-white bg-white/30 animate-pulse"
            ></div>
          ))}
        </div>
        
        {/* CTA butonu için loading state */}
        <div className="mt-12 text-center">
          <div className="h-8 sm:h-10 md:h-12 w-32 sm:w-40 md:w-48 mx-auto bg-white/30 rounded-md animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

type BlogSectionProps = {
  translations: {
    blogTitle: string;
    blogSubtitle: string;
    blogCta: string;
    blogDetails: string;
  };
};

export default function BlogSection({ translations }: BlogSectionProps) {
  const [mounted, setMounted] = useState(false);

  // Hydration hatalarını önlemek için
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <BlogSectionLoading />;
  }

  return <BlogSectionClient translations={translations} />;
}