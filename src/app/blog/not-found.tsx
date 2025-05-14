'use client';

import Link from 'next/link';
import { blogTranslations } from '@/translations/blog';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export default function BlogNotFound() {
  const { language } = useThemeLanguage();
  const translations = blogTranslations[language];
  
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl md:text-4xl font-bold font-titillium-web mb-6">
        {translations.blogNotFound}
      </h1>
      
      <div className="max-w-2xl mx-auto mb-8">
        <p className="mb-4 text-medium-grey dark:text-silver">
          {translations.blogNotFoundMessage}
        </p>
        
        <Link 
          href="/blog" 
          className="inline-block px-6 py-3 rounded-md bg-f1-red dark:bg-neon-red hover:bg-f1-red/90 dark:hover:bg-neon-red/90 text-white transition-colors"
        >
          {translations.returnToBlog}
        </Link>
      </div>
    </div>
  );
}