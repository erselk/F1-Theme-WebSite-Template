export const getThemeColors = (isDark: boolean) => ({
  textColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  headingColorClass: isDark ? 'text-white' : 'text-very-dark-grey',
  accentColorClass: isDark ? 'text-electric-blue' : 'text-neon-red',
  paragraphColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  
  bgColorClass: isDark ? 'bg-graphite' : 'bg-white',
  
  categoryTextClass: 'text-white',
  categoryBgClass: isDark ? 'bg-[#00D766]' : 'bg-[#00A14B]',
});

export const getCategoryTranslation = (category: string | Record<string, string>, language: 'tr' | 'en'): string => {
  if (typeof category === 'object') {
    return category[language] || '';
  }
  
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
