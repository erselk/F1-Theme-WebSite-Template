/**
 * Tema durumuna göre kullanılacak CSS sınıflarını döndüren fonksiyon
 * @param isDark Tema koyu mu?
 * @returns CSS sınıfları nesnesi
 */
export const getThemeColors = (isDark: boolean) => ({
  // Metin renk sınıfları
  textColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  headingColorClass: isDark ? 'text-white' : 'text-very-dark-grey',
  accentColorClass: isDark ? 'text-electric-blue' : 'text-neon-red',
  paragraphColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  
  // Arka plan renk sınıfları
  bgColorClass: isDark ? 'bg-graphite' : 'bg-white',
  
  // Kategori badge renk sınıfları
  categoryTextClass: 'text-white', // Her zaman beyaz
  categoryBgClass: isDark ? 'bg-[#00D766]' : 'bg-[#00A14B]', // Yeşil
});

/**
 * Kategori değerini seçilen dile göre çeviren fonksiyon
 * @param category Kategori değeri (string veya object)
 * @param language Dil ('tr' veya 'en')
 * @returns Çevirilmiş kategori değeri
 */
export const getCategoryTranslation = (category: string | Record<string, string>, language: 'tr' | 'en'): string => {
  if (typeof category === 'object') {
    return category[language] || '';
  }
  
  // Sabit kategori çevirileri
  const categoryMap: Record<string, Record<string, string>> = {
    'workshop': { tr: 'Atölye Çalışması', en: 'Workshop' },
    'meetup': { tr: 'Buluşma', en: 'Meetup' },
    'conference': { tr: 'Konferans', en: 'Conference' },
    'race': { tr: 'Yarış', en: 'Race' },
    'party': { tr: 'Parti', en: 'Party' },
    'other': { tr: 'Diğer', en: 'Other' }
  };
  
  return categoryMap[category]?.[language] || category;
}; 