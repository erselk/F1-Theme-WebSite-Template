export const getThemeColors = (isDark: boolean) => ({
  textColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  headingColorClass: isDark ? 'text-white' : 'text-very-dark-grey',
  accentColorClass: isDark ? 'text-electric-blue' : 'text-[#fe0a00]',
  paragraphColorClass: isDark ? 'text-light-grey' : 'text-slate-700',
  
  bgColorClass: isDark ? 'bg-[#cc41ab]' : 'bg-[#ff51d6]',
  
  categoryTextClass: 'text-white',
  categoryBgClass: isDark ? 'bg-[#c80800]' : 'bg-[#fe0a00]',
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
