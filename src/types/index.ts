import { LanguageType } from '@/lib/ThemeLanguageContext';
import { createTimezoneDate, getStartOfDay, formatDate, DEFAULT_TIMEZONE } from '@/lib/date-utils';

export interface BlogPost {
  id: string;
  slug: string;
  coverImage: string; 
  thumbnailImage: string;
  publishDate: string; 
  author: {
    _id?: string;
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
  status?: EventStatus;
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
    maxPerOrder?: number;
    availableCount?: number;
    variant?: 'standard' | 'premium' | 'vip';
    isSoldOut?: boolean;
    isComingSoon?: boolean;
  }[]; 
  comments?: {
    id: string;
    name: string;
    timestamp: string;
    content: string;
  }[];
  rules?: {
    id: string;
    content: {
      tr: string;
      en: string;
    };
  }[];
  details?: {
    tr: string;
    en: string;
  };
  schedule?: {
    tr: string[];
    en: string[];
  };
  gallery?: string[];
}

export type EventStatus = 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'upcoming' | 'past';

export const getEventStatus = (date: string): EventStatus => {
  // Use timezone-aware date creation
  const eventDate = createTimezoneDate(date);
  const now = createTimezoneDate();
  
  // Start of day with timezone handling
  const today = getStartOfDay(now);
  
  const tomorrow = createTimezoneDate(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextDay = createTimezoneDate(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const endOfWeek = createTimezoneDate(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  const endOfMonth = createTimezoneDate(today);
  endOfMonth.setDate(endOfMonth.getDate() + 30);
  
  if (eventDate < today) {
    return 'past';
  } else if (eventDate.toDateString() === today.toDateString()) {
    return 'today';
  } else if (eventDate.toDateString() === tomorrow.toDateString()) {
    return 'tomorrow';
  } else if (eventDate >= nextDay && eventDate < endOfWeek) {
    return 'this-week';
  } else if (eventDate >= endOfWeek && eventDate < endOfMonth) {
    return 'this-month';
  } else {
    return 'upcoming';
  }
};

export const formatEventDate = (dateString: string, language: LanguageType): string => {
  // Use the timezone-aware formatter
  return formatDate(
    dateString, 
    language === 'tr' ? 'tr-TR' : 'en-US',
    DEFAULT_TIMEZONE,
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: DEFAULT_TIMEZONE
    }
  );
};