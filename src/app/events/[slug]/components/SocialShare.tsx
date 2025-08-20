'use client';

import React, { useState, useCallback } from 'react';
import { useThemeLanguage, LanguageType } from '@/lib/ThemeLanguageContext';

interface SocialShareProps {
  url: string;
  title: string;
  locale: LanguageType;
}

export function SocialShare({ url, title, locale }: SocialShareProps) {
  const { isDark } = useThemeLanguage();
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // Event invitation messages in both languages
  const shareMessages = {
    tr: `DeF1 Club'daki ${title} etkinliğine davetlisiniz! Detaylı bilgi için:`,
    en: `You are invited to the ${title} event at DeF1 Club! For more details:`
  };

  const encodedMessage = encodeURIComponent(shareMessages[locale]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    });
  }, [url]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 md:gap-2">
      <span className="hidden md:inline-block font-medium">{locale === 'tr' ? 'Paylaş:' : 'Share:'}</span>
      
      {/* Twitter/X */}
      <button
        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`, '_blank')}
        className={`${isDark ? 'bg-carbon-grey text-white' : 'bg-transparent text-black'} rounded-full p-1 md:p-2 transition-all transform hover:scale-110 hover:bg-black hover:text-white`}
        aria-label={locale === 'tr' ? 'X üzerinde paylaş' : 'Share on X'}
      >
        <svg className="h-2.5 w-2.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0082L3.2002 21H4.75404L10.7663 14.0121L15.5549 21H20.7996L13.6823 10.6218ZM11.5541 13.0887L10.8574 12.0511L5.31391 4.16788H7.70053L12.1742 10.5782L12.8709 11.6158L18.6854 19.8321H16.2988L11.5541 13.0887Z"></path>
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank')}
        className={`${isDark ? 'bg-carbon-grey text-white' : 'bg-transparent text-black'} rounded-full p-1 md:p-2 transition-all transform hover:scale-110 hover:bg-[#1877F2] hover:text-white`}
        aria-label={locale === 'tr' ? 'Facebook üzerinde paylaş' : 'Share on Facebook'}
      >
        <svg className="h-2.5 w-2.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')}
        className={`${isDark ? 'bg-carbon-grey text-white' : 'bg-transparent text-black'} rounded-full p-1 md:p-2 transition-all transform hover:scale-110 hover:bg-[#0A66C2] hover:text-white`}
        aria-label={locale === 'tr' ? 'LinkedIn üzerinde paylaş' : 'Share on LinkedIn'}
      >
        <svg className="h-2.5 w-2.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
        </svg>
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodedMessage}%20${encodedUrl}`, '_blank')}
        className={`${isDark ? 'bg-carbon-grey text-white' : 'bg-transparent text-black'} rounded-full p-1 md:p-2 transition-all transform hover:scale-110 hover:bg-[#25D366] hover:text-white`}
        aria-label={locale === 'tr' ? 'WhatsApp üzerinde paylaş' : 'Share on WhatsApp'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.199-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"></path>
        </svg>
      </button>

      {/* Copy Link Button */}
      <button
        onClick={copyToClipboard}
        className={`${isDark ? 'bg-carbon-grey text-white' : 'bg-transparent text-black'} rounded-full p-1 md:p-2 transition-all transform hover:scale-110 hover:bg-electric-blue`}
        aria-label={locale === 'tr' ? 'Bağlantıyı Kopyala' : 'Copy Link'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      </button>
    </div>
  );
}

// Lazy loading için varsayılan dışa aktarım ekleyelim
export default SocialShare;