import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { DEFAULT_BLUR_DATA_URL } from '@/constants/blog';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface BlogCardProps {
  blog: BlogPost & { author?: { _id?: string, name?: string, profileImage?: string } };
  language: string;
  isDark: boolean;
  formatDate: (dateString: string) => string;
  categoryName: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  language,
  isDark,
  formatDate,
  categoryName
}) => {
  const [setRef, isVisible] = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1
  });

  return (
    <div className="group" ref={setRef as React.RefCallback<HTMLDivElement>}>
      <Link href={`/blog/${blog.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-lg mb-2 sm:mb-3">
          {isVisible && (
            <Image 
              src={blog.thumbnailImage} 
              alt={blog.title[language]} 
              fill 
              sizes="(max-width: 640px) 50vw, (min-width: 641px) and (max-width: 1023px) 50vw, (min-width: 1024px) and (max-width: 1279px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 will-change-transform"
              placeholder="blur"
              blurDataURL={DEFAULT_BLUR_DATA_URL}
            />
          )}
        </div>
        
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center text-[10px] sm:text-xs text-medium-grey dark:text-silver">
            <span>{formatDate(blog.publishDate)}</span>
            <span className="mx-1 sm:mx-1.5">•</span>
            <span className="capitalize">{categoryName}</span>
          </div>
          
          <h3 className={`text-sm sm:text-base md:text-lg font-semibold font-titillium-web line-clamp-2 transition-colors ${isDark ? 'group-hover:text-neon-red' : 'group-hover:text-f1-red'}`}>
            {blog.title[language]}
          </h3>
          
          <p className="text-[10px] sm:text-xs text-medium-grey dark:text-silver line-clamp-2">
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
                  <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-graphite text-silver' : 'bg-light-grey text-dark-grey'}`}>
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