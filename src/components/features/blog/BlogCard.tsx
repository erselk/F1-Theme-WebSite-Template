import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { DEFAULT_BLUR_DATA_URL } from '@/constants/blog';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface BlogCardProps {
  blog: BlogPost & { author?: { _id?: string, name?: string, profileImage?: string } };
  language: string;
  formatDate: (dateString: string) => string;
  categoryName: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  language,
  formatDate,
  categoryName
}) => {
  const [setRef, isVisible] = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1
  });

  return (
    <div className="group" ref={setRef as React.RefCallback<HTMLDivElement>}>
      <Link href={`/blog/${blog.slug}`} className="group block">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          {isVisible && (
            <Image
              src={blog.coverImage}
              alt={blog.title[language]}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
        
        <div className="space-y-1 sm:space-y-1.5 p-3 sm:p-4 rounded-lg bg-[#f9f9f9] shadow-md shadow-gray-400/15">
          <div className="flex items-center text-[10px] sm:text-xs text-medium-grey">
            <span>{formatDate(blog.publishDate)}</span>
            <span className="mx-1 sm:mx-1.5">•</span>
            <span className="capitalize">{categoryName}</span>
          </div>
          
          <h3 className="text-sm sm:text-base md:text-lg font-semibold font-titillium-web line-clamp-2 transition-colors group-hover:text-f1-red">
            {blog.title[language]}
          </h3>
          
          <p className="text-[10px] sm:text-xs text-medium-grey line-clamp-2">
            {blog.excerpt[language]}
          </p>
          
          <div className="flex items-center pt-1 sm:pt-1.5">
            <div 
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation(); 
                if (blog.author?._id) {
                  window.location.href = `/blog?authorId=${encodeURIComponent(blog.author._id)}`;
                } else if (blog.author?.name) {
                  window.location.href = `/blog?author=${encodeURIComponent(blog.author.name)}`;
                }
              }}
              className="flex items-center group cursor-pointer"
            >
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full overflow-hidden mr-1.5 sm:mr-2">
                {blog.author?.profileImage ? (
                  <Image 
                    src={blog.author.profileImage} 
                    alt={blog.author.name || 'Author'}
                    fill 
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={DEFAULT_BLUR_DATA_URL}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center`}>
                    {blog.author?.name?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium group-hover:underline">
                {blog.author?.name || 'Bilinmeyen Yazar'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default React.memo(BlogCard); 