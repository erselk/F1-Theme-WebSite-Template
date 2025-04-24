// Generate SEO friendly slug from English title
export function generateSlugFromEnglishTitle(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
    .replace(/-{2,}/g, '-');      // Replace multiple hyphens with single hyphen
}

// Calculate event status based on date
export function getEventStatus(dateString: string): string {
  const eventDate = new Date(dateString);
  const now = new Date();
  
  // Today's date at midnight for comparison
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Tomorrow's date at midnight
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // End of this week (Sunday)
  const endOfWeek = new Date(today);
  const daysUntilSunday = 7 - endOfWeek.getDay();
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  
  // Set event date to midnight for proper comparison
  const eventDateMidnight = new Date(eventDate);
  eventDateMidnight.setHours(0, 0, 0, 0);
  
  // Event is in the past
  if (eventDateMidnight < today) {
    return 'past';
  }
  
  // Event is today
  if (eventDateMidnight.getTime() === today.getTime()) {
    return 'today';
  }
  
  // Event is tomorrow
  if (eventDateMidnight.getTime() === tomorrow.getTime()) {
    return 'tomorrow';
  }
  
  // Event is this week
  if (eventDateMidnight <= endOfWeek) {
    return 'this-week';
  }
  
  // Event is upcoming (beyond this week)
  return 'upcoming';
}

// Simple translation function that simulates API translation
// In a real app, this would call a translation API like Google Translate
export async function simpleTranslate(
  text: string, 
  sourceLang: 'tr' | 'en', 
  targetLang: 'tr' | 'en'
): Promise<string> {
  // For demo purposes we're not actually translating
  // In production this would call a proper translation API
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!text) return '';
  
  // Some very basic hardcoded translations for common words
  const translations: Record<string, Record<string, string>> = {
    tr: {
      'Standart Bilet': 'Standard Ticket',
      'Etkinlik': 'Event',
      'Bilet': 'Ticket',
      'Yeni': 'New',
      'Ücretsiz': 'Free',
      'Konser': 'Concert',
      'Atölye': 'Workshop',
      'Buluşma': 'Meetup'
    },
    en: {
      'Standard Ticket': 'Standart Bilet',
      'Event': 'Etkinlik',
      'Ticket': 'Bilet',
      'New': 'Yeni',
      'Free': 'Ücretsiz',
      'Concert': 'Konser',
      'Workshop': 'Atölye',
      'Meetup': 'Buluşma'
    }
  };
  
  // Look for exact matches in our mini dictionary
  const fromLang = sourceLang as 'tr' | 'en';
  const toLang = targetLang as 'tr' | 'en';
  
  if (translations[fromLang][text]) {
    return translations[fromLang][text];
  }
  
  // For longer texts that aren't in our dictionary,
  // in a real app we would call a translation API here
  // For demo purposes, we're just adding a note
  if (text.length > 20) {
    return `${text} [${toLang === 'tr' ? 'çevirilecek' : 'to be translated'}]`;
  }
  
  // Return the original text if no translation found
  return text;
}