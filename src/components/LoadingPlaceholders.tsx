import React from 'react';

interface PlaceholderProps {
  className?: string;
}

interface ContentPlaceholderProps extends PlaceholderProps {
  height?: string;
}

/**
 * Resim yükleme yer tutucu bileşeni
 */
export const ImagePlaceholder: React.FC<PlaceholderProps> = ({ className = '' }) => (
  <div className={`w-full aspect-square bg-carbon-grey/50 animate-pulse rounded-lg ${className}`}></div>
);

/**
 * İçerik yükleme yer tutucu bileşeni
 */
export const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ 
  height = 'h-32', 
  className = '' 
}) => (
  <div className={`w-full ${height} bg-carbon-grey/50 animate-pulse rounded-lg ${className}`}></div>
);

/**
 * Sayfa yükleme yer tutucu bileşeni (tam ekran)
 */
export const FullPageLoader: React.FC<PlaceholderProps> = ({ className = '' }) => (
  <div className={`w-full h-screen flex items-center justify-center ${className}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-blue"></div>
  </div>
);

/**
 * Sosyal medya butonları yükleme yer tutucu bileşeni
 */
export const SocialSharePlaceholder: React.FC<PlaceholderProps> = ({ className = '' }) => (
  <div className={`w-[100px] h-6 bg-carbon-grey/50 animate-pulse rounded-lg ${className}`}></div>
);

/**
 * Banner yükleme yer tutucu bileşeni
 */
export const BannerPlaceholder: React.FC<PlaceholderProps> = ({ className = '' }) => (
  <div className={`w-full h-48 md:h-72 bg-carbon-grey/50 animate-pulse ${className}`}></div>
);

/**
 * Bilet alanı yükleme yer tutucu bileşeni
 */
export const TicketPlaceholder: React.FC<PlaceholderProps> = ({ className = '' }) => (
  <div className={`w-full h-64 bg-carbon-grey/50 animate-pulse rounded-lg ${className}`}></div>
); 