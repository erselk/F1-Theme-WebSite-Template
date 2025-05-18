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

// Simple translation function that uses Google Translate API
export async function simpleTranslate(
  text: string, 
  sourceLang: 'tr' | 'en', 
  targetLang: 'tr' | 'en'
): Promise<string> {
  if (!text) return '';
  
  try {
    // Google Translate API endpoint
    const apiUrl = `https://translate.googleapis.com/translate_a/single`;
    
    // Prepare parameters for the API call
    const params = new URLSearchParams({
      client: 'gtx', // Use public API without key
      sl: sourceLang,
      tl: targetLang,
      dt: 't', // Return text
      q: text
    });
    
    // Make the API request
    const response = await fetch(`${apiUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract translated text from the response
    // Google Translate API returns a complex nested array
    let translatedText = '';
    if (data && data[0] && data[0].length > 0) {
      data[0].forEach((item: any) => {
        if (item[0]) {
          translatedText += item[0];
        }
      });
    }
    
    return translatedText || text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Translation error occurred');
  }
}