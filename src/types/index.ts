import { LanguageType } from '@/lib/ThemeLanguageContext';

export interface BlogPost {
  id: string;
  slug: string;
  coverImage: string; 
  thumbnailImage: string;
  publishDate: string; 
  author: {
    name: string;
    avatar?: string;
  };
  title: {
    tr: string;
    en: string;
  };
  excerpt: {
    tr: string;
    en: string;
  };
  content: {
    tr: string;
    en: string;
  };
  category: 'f1' | 'technology' | 'events' | 'interviews' | 'other';
}

export interface Event {
  id: string;
  slug: string;
  bannerImage: string;
  squareImage: string;
  price: number; 
  isFeatured: boolean;
  date: string; 
  location: {
    tr: string;
    en: string;
  };
  title: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
  category: 'workshop' | 'meetup' | 'conference' | 'race' | 'other';
  status?: 'today' | 'tomorrow' | 'this-week' | 'upcoming' | 'past';
  tickets?: {
    id: string;
    name: {
      tr: string;
      en: string;
    };
    price: number;
    description?: {
      tr: string;
      en: string;
    };
  }[];
  comments?: {
    id: string;
    name: string;
    timestamp: string;
    content: string;
  }[];
  rules?: {
    tr: string[];
    en: string[];
  };
  gallery?: string[];
}

export const getEventStatus = (date: string): 'today' | 'tomorrow' | 'this-week' | 'upcoming' | 'past' => {
  const eventDate = new Date(date);
  const now = new Date(); 
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  if (eventDate < now) {
    return 'past';
  } else if (eventDate.toDateString() === today.toDateString()) {
    return 'today';
  } else if (eventDate.toDateString() === tomorrow.toDateString()) {
    return 'tomorrow';
  } else if (eventDate <= endOfWeek) {
    return 'this-week';
  } else {
    return 'upcoming';
  }
};

export const formatEventDate = (dateString: string, language: LanguageType): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
};