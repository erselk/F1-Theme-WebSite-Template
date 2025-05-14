/**
 * Etkinlikler için ortak stiller ve etiketler utility dosyası
 * Bu dosya, tekrarlanan stil ve etiket kodlarını tek bir yerde toplar.
 * Böylece hem EventCard hem de EventDetail bileşenlerinde kullanılabilir.
 */

import { LanguageType } from "@/lib/ThemeLanguageContext";

/**
 * Etkinlik durumuna göre durum badge'i stilini döndürür
 */
export const getStatusClasses = (status: string, isDark: boolean, isCard: boolean = true) => {
  // Card ve Detail bileşenleri için farklı temel sınıflar
  const baseClasses = isCard 
    ? "absolute top-2 left-2 md:top-4 md:left-4 px-1 py-0.5 md:px-2 md:py-0.5 rounded-full text-[8px] md:text-[10px] font-medium z-10 shadow-sm"
    : "";
  
  if (status === 'past') {
    return `${baseClasses} bg-gray-400 text-white`;
  } else {
    return isDark 
      ? `${baseClasses} bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50` 
      : `${baseClasses} bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50`;
  }
};

/**
 * Etkinlik durumuna göre durum etiketini döndürür
 */
export const getStatusLabel = (status: string, language: LanguageType): string => {
  switch (status) {
    case 'today': return language === 'tr' ? 'Bugün' : 'Today';
    case 'tomorrow': return language === 'tr' ? 'Yarın' : 'Tomorrow';
    case 'this-week': return language === 'tr' ? 'Bu Hafta' : 'This Week';
    case 'this-month': return language === 'tr' ? 'Bu Ay' : 'This Month';
    case 'upcoming': return language === 'tr' ? 'Yakında' : 'Upcoming';
    case 'past': return language === 'tr' ? 'Geçmiş Etkinlik' : 'Past Event';
    default: return 'Status: ' + status; // Hata ayıklama için status değerini göster
  }
};

/**
 * Etkinlik kategorisine göre kategori etiketini döndürür
 */
export const getCategoryLabel = (category: string, language: LanguageType): string => {
  switch (category) {
    case 'workshop': return language === 'tr' ? 'Atölye Çalışması' : 'Workshop';
    case 'meetup': return language === 'tr' ? 'Buluşma' : 'Meetup';
    case 'conference': return language === 'tr' ? 'Konferans' : 'Conference';
    case 'race': return language === 'tr' ? 'Yarış' : 'Race';
    case 'party': return language === 'tr' ? 'Parti' : 'Party';
    case 'other': return language === 'tr' ? 'Diğer' : 'Other';
    default: return '';
  }
};

/**
 * Etkinlik durumuna göre buton stilini döndürür
 */
export const getButtonClasses = (status: string, isDark: boolean, isCard: boolean = true) => {
  // Card ve Detail bileşenleri için farklı temel sınıflar
  const baseClasses = isCard 
    ? "w-full py-1.5 text-xs font-medium rounded-md transition-colors shadow-md"
    : "w-full py-3 px-4 text-center rounded-md text-white font-medium transition-colors shadow-md";
  
  if (status === 'past') {
    return `${baseClasses} bg-gray-400 text-white cursor-not-allowed`;
  } 
  
  if (isDark) {
    return `${baseClasses} bg-[#FF0000]/70 hover:bg-[#FF0000]/80 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50`;
  } else {
    return `${baseClasses} bg-[#E10600]/70 hover:bg-[#E10600]/80 text-white shadow-[#E10600]/30 border border-[#E10600]/50`;
  }
};

/**
 * Etkinlik durumuna göre buton etiketini döndürür
 */
export const getButtonLabel = (status: string, language: LanguageType): string => {
  if (status === 'past') {
    return language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Ended';
  }
  return language === 'tr' ? 'Bilet Al' : 'Buy Ticket';
};

/**
 * Bilet fiyatı için badge stilini döndürür
 */
export const getPriceStyles = (isDark: boolean) => {
  return isDark 
    ? 'bg-[#FF0000]/70 text-white shadow-[#FF0000]/30 border border-[#FF0000]/50' 
    : 'bg-[#E10600]/70 text-white shadow-[#E10600]/30 border border-[#E10600]/50';
};

/**
 * EventCard için arka plan stilini döndürür
 */
export const getCardBackgroundStyle = (status: string, isDark: boolean) => {
  if (status === 'past') {
    return isDark 
      ? 'bg-graphite/70 border border-carbon-grey opacity-80'  
      : 'bg-card/70 border border-light-grey opacity-80';
  }
  return isDark 
    ? 'bg-graphite border border-carbon-grey' 
    : 'bg-card border border-light-grey';
}; 