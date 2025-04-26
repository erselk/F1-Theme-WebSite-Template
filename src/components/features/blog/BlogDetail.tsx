'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { BlogPost } from "@/data/blogs";

interface BlogDetailProps {
  blog: BlogPost;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog }) => {
  const { language, isDark } = useThemeLanguage();

  // Format date based on language
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Format content with proper paragraphs
  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-6">
        {paragraph}
      </p>
    ));
  };

  // Categories - consistent with BlogContent component
  const categories = [
    { id: "all", name: { tr: "Tümü", en: "All" } },
    { id: "f1", name: { tr: "Formula 1", en: "Formula 1" } },
    { id: "technology", name: { tr: "Teknoloji", en: "Technology" } },
    { id: "events", name: { tr: "Etkinlikler", en: "Events" } },
    { id: "interviews", name: { tr: "Röportajlar", en: "Interviews" } },
    { id: "other", name: { tr: "Diğer", en: "Other" } }
  ];

  const categoryName = categories.find(c => c.id === blog.category)?.name[language] || blog.category;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link href="/blog" className={`inline-flex items-center text-sm ${isDark ? 'text-silver hover:text-neon-red' : 'text-medium-grey hover:text-f1-red'} transition-colors`}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {language === 'tr' ? 'Tüm Blog Yazıları' : 'All Blog Posts'}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold font-titillium-web mb-6">
        {blog.title[language]}
      </h1>

      {/* Meta information */}
      <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-medium-grey dark:text-silver">
        <Link href={`/blog?author=${encodeURIComponent(blog.author.name)}`} className="flex items-center hover:underline">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
            {blog.author.avatar ? (
              <Image src={blog.author.avatar} alt={blog.author.name} fill className="object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-graphite text-silver' : 'bg-light-grey text-dark-grey'}`}>
                {blog.author.name.charAt(0)}
              </div>
            )}
          </div>
          <span>{blog.author.name}</span>
        </Link>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
          <span>{formatDate(blog.publishDate)}</span>
        </div>
        <Link href={`/blog?category=${blog.category}`} className="flex items-center hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <span className="capitalize">{categoryName}</span>
        </Link>
      </div>

      {/* Cover image */}
      <div className="relative aspect-video md:aspect-[21/9] w-full rounded-lg overflow-hidden mb-10">
        <Image 
          src={blog.coverImage} 
          alt={blog.title[language]} 
          fill 
          sizes="(min-width: 768px) 100vw, 100vw"
          priority
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-titillium-web prose-p:text-medium-grey dark:prose-p:text-silver prose-a:text-f1-red dark:prose-a:text-neon-red">
        {formatContent(blog.content[language])}
      </div>

      {/* Share and navigation section */}
      <div className="mt-16 pt-8 border-t border-light-grey dark:border-graphite">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {/* Share links */}
          <div className="flex items-center mb-4 sm:mb-0">
            <span className="mr-4 text-medium-grey dark:text-silver">
              {language === 'tr' ? 'Paylaş:' : 'Share:'}
            </span>
            <div className="flex space-x-3">
              {/* X */}
              <a href={`https://x.com/intent/tweet?text=${encodeURIComponent(blog.title[language])}&url=${encodeURIComponent(`https://padokclub.com/blog/${blog.slug}`)}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`p-2 rounded-full ${isDark ? 'bg-graphite hover:bg-black' : 'bg-very-light-grey hover:bg-white text-black'} transition-colors`}
                 aria-label="Share on X">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://padokclub.com/blog/${blog.slug}`)}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`p-2 rounded-full ${isDark ? 'bg-graphite hover:bg-graphite/80' : 'bg-very-light-grey hover:bg-light-grey'} transition-colors`}
                 aria-label="Share on Facebook">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://padokclub.com/blog/${blog.slug}`)}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`p-2 rounded-full ${isDark ? 'bg-graphite hover:bg-graphite/80' : 'bg-very-light-grey hover:bg-light-grey'} transition-colors`}
                 aria-label="Share on LinkedIn">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href={`https://wa.me/?text=${encodeURIComponent(`${blog.title[language]} - https://padokclub.com/blog/${blog.slug}`)}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className={`p-2 rounded-full ${isDark ? 'bg-graphite hover:bg-graphite/80' : 'bg-very-light-grey hover:bg-light-grey'} transition-colors`}
                 aria-label="Share on WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.199-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Category tag */}
          <Link 
            href={`/blog?category=${blog.category}`}
            className={`inline-block px-4 py-2 rounded-full text-sm ${
              isDark 
                ? 'bg-neon-red text-white hover:bg-neon-red/90' 
                : 'bg-f1-red text-black hover:bg-f1-red/90' // Light theme'de siyah metin
            } transition-colors`}
            aria-label={`${language === 'tr' ? 'Kategori:' : 'Category:'} ${categoryName}`}
          >
            {categoryName}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogDetail;