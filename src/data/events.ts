import { LanguageType } from '@/lib/ThemeLanguageContext';

export interface Event {
  id: string;
  slug: string;
  bannerImage: string; // Yatay format - Banner için
  squareImage: string; // Kare format - Grid görünümü için
  price: number; // Starting price
  isFeatured: boolean;
  date: string; // ISO date string
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
}

// Create fixed dates instead of dynamic ones
const createFixedDate = (year: number, month: number, day: number, hour: number = 10, minute: number = 0): string => {
  return new Date(year, month - 1, day, hour, minute).toISOString();
};

// Current year for creating events
const currentYear = new Date().getFullYear();

export const events: Event[] = [
  // Today-like event (April 22, 2025, 10:00)
  {
    id: "1",
    slug: "istanbul-grand-prix-2025",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 1500,
    isFeatured: true,
    date: createFixedDate(2025, 4, 22, 10, 0),
    location: {
      tr: "İstanbul Park Pisti, İstanbul",
      en: "Istanbul Park Circuit, Istanbul"
    },
    title: {
      tr: "İstanbul Grand Prix 2025",
      en: "Istanbul Grand Prix 2025"
    },
    description: {
      tr: "Türkiye'nin en büyük yarış etkinliğine katılın. Hız, heyecan ve rekabet dolu bir gün sizi bekliyor!",
      en: "Join Turkey's biggest racing event. A day full of speed, excitement, and competition awaits you!"
    },
    category: "race"
  },
  // Tomorrow-like event (April 23, 2025, 14:30)
  {
    id: "2",
    slug: "f1-simulation-day",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 750,
    isFeatured: true,
    date: createFixedDate(2025, 4, 23, 14, 30),
    location: {
      tr: "Padok Simülasyon Merkezi, Ankara",
      en: "Padok Simulation Center, Ankara"
    },
    title: {
      tr: "F1 Simülasyon Günü",
      en: "F1 Simulation Day"
    },
    description: {
      tr: "Gerçeğe en yakın F1 simülasyonu deneyimi! Profesyonel pilotlarla beraber, gerçek yarış pisti deneyimini yaşayın.",
      en: "The most realistic F1 simulation experience! Experience real racing tracks with professional drivers."
    },
    category: "workshop"
  },
  // This week's events (5 more)
  {
    id: "3",
    slug: "motorsport-photography-workshop",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 500,
    isFeatured: false,
    date: createFixedDate(2025, 4, 24, 9, 0),
    location: {
      tr: "Fotoğrafçılık Akademisi, İstanbul",
      en: "Photography Academy, Istanbul"
    },
    title: {
      tr: "Motorsport Fotoğrafçılık Atölyesi",
      en: "Motorsport Photography Workshop"
    },
    description: {
      tr: "Yarış pistlerindeki en iyi anları yakalamak için profesyonel fotoğrafçılık tekniklerini öğrenin.",
      en: "Learn professional photography techniques to capture the best moments on racing tracks."
    },
    category: "workshop"
  },
  {
    id: "4",
    slug: "f1-technical-regulations-seminar",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 300,
    isFeatured: false,
    date: createFixedDate(2025, 4, 25, 13, 0),
    location: {
      tr: "Mühendislik Fakültesi, İTÜ, İstanbul",
      en: "Faculty of Engineering, ITU, Istanbul"
    },
    title: {
      tr: "F1 Teknik Regülasyonları Semineri",
      en: "F1 Technical Regulations Seminar"
    },
    description: {
      tr: "Formula 1'in karmaşık teknik kurallarını ve araç tasarımını etkileyen faktörleri anlayın.",
      en: "Understand the complex technical rules of Formula 1 and the factors affecting car design."
    },
    category: "conference"
  },
  {
    id: "5",
    slug: "pit-stop-challenge",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 250,
    isFeatured: true,
    date: createFixedDate(2025, 4, 26, 11, 0),
    location: {
      tr: "Padok Kulübü, İzmir",
      en: "Padok Club, Izmir"
    },
    title: {
      tr: "Pit Stop Yarışması",
      en: "Pit Stop Challenge"
    },
    description: {
      tr: "Takımınızla birlikte pit stop hızınızı test edin! En hızlı lastik değişimi yapan takım büyük ödülü kazanır.",
      en: "Test your pit stop speed with your team! The team with the fastest tire change wins the grand prize."
    },
    category: "meetup"
  },
  {
    id: "6",
    slug: "racing-legends-meet-greet",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 1000,
    isFeatured: true,
    date: createFixedDate(2025, 4, 27, 18, 30),
    location: {
      tr: "Lüks Otel Konferans Salonu, İstanbul",
      en: "Luxury Hotel Conference Hall, Istanbul"
    },
    title: {
      tr: "Yarış Efsaneleri ile Tanışma",
      en: "Racing Legends Meet & Greet"
    },
    description: {
      tr: "Efsanevi pilotlarla tanışın, soru-cevap oturumuna katılın ve özel imza etkinliğine katılma fırsatı yakalayın!",
      en: "Meet legendary drivers, participate in a Q&A session, and get a chance to attend a special signing event!"
    },
    category: "meetup"
  },
  {
    id: "7",
    slug: "motorsport-career-fair",
    bannerImage: "/images/events/banner/suan.jpg",
    squareImage: "/images/events/square/suan.jpg",
    price: 0,
    isFeatured: false,
    date: createFixedDate(2025, 4, 28, 9, 0),
    location: {
      tr: "Üniversite Kampüsü, Ankara",
      en: "University Campus, Ankara"
    },
    title: {
      tr: "Motorsport Kariyer Fuarı",
      en: "Motorsport Career Fair"
    },
    description: {
      tr: "Motorsport endüstrisinde kariyer yapmak isteyenler için networking ve iş fırsatları.",
      en: "Networking and job opportunities for those who want to pursue a career in the motorsport industry."
    },
    category: "conference"
  },
  // Future events (3)
  {
    id: "8",
    slug: "electric-racing-future-symposium",
    bannerImage: "/images/events/banner/gelecek.webp",
    squareImage: "/images/events/square/gelecek.webp",
    price: 850,
    isFeatured: true,
    date: createFixedDate(2025, 6, 15, 10, 0),
    location: {
      tr: "Teknoloji Merkezi, İstanbul",
      en: "Technology Center, Istanbul"
    },
    title: {
      tr: "Elektrikli Yarışın Geleceği Sempozyumu",
      en: "Electric Racing Future Symposium"
    },
    description: {
      tr: "Sürdürülebilir yarış geleceği ve elektrikli araç teknolojileri hakkında kapsamlı bir sempozyum.",
      en: "A comprehensive symposium on sustainable racing future and electric vehicle technologies."
    },
    category: "conference"
  },
  {
    id: "9",
    slug: "international-padok-club-championship",
    bannerImage: "/images/events/banner/gelecek.webp",
    squareImage: "/images/events/square/gelecek.webp",
    price: 2000,
    isFeatured: true,
    date: createFixedDate(2025, 6, 25, 8, 30),
    location: {
      tr: "Uluslararası Yarış Pisti, Antalya",
      en: "International Racing Circuit, Antalya"
    },
    title: {
      tr: "Uluslararası Padok Kulübü Şampiyonası",
      en: "International Padok Club Championship"
    },
    description: {
      tr: "Dünyanın dört bir yanından amatör yarışçıların katıldığı prestijli bir yarış organizasyonu.",
      en: "A prestigious racing organization with amateur racers from all around the world."
    },
    category: "race"
  },
  {
    id: "10",
    slug: "formula-history-exhibition",
    bannerImage: "/images/events/banner/gelecek.webp",
    squareImage: "/images/events/square/gelecek.webp",
    price: 400,
    isFeatured: false,
    date: createFixedDate(2025, 7, 5, 10, 0),
    location: {
      tr: "Otomobil Müzesi, İstanbul",
      en: "Automobile Museum, Istanbul"
    },
    title: {
      tr: "Formula Tarih Sergisi",
      en: "Formula History Exhibition"
    },
    description: {
      tr: "1950'lerden günümüze kadar Formula yarışlarının tarihi gelişimini gösteren özel bir sergi.",
      en: "A special exhibition showing the historical development of Formula racing from the 1950s to the present day."
    },
    category: "other"
  },
  // Past events (2)
  {
    id: "11",
    slug: "classic-racing-cars-gathering",
    bannerImage: "/images/events/banner/eski.jpg",
    squareImage: "/images/events/square/eski.jpg",
    price: 350,
    isFeatured: false,
    date: createFixedDate(2025, 3, 15, 14, 0),
    location: {
      tr: "Klasik Otomobil Kulübü, İstanbul",
      en: "Classic Automobile Club, Istanbul"
    },
    title: {
      tr: "Klasik Yarış Arabaları Buluşması",
      en: "Classic Racing Cars Gathering"
    },
    description: {
      tr: "Yarış tarihinin en ikonik arabalarını yakından görme ve sahipleriyle tanışma fırsatı.",
      en: "An opportunity to see the most iconic cars in racing history up close and meet their owners."
    },
    category: "meetup"
  },
  {
    id: "12",
    slug: "racing-strategy-masterclass",
    bannerImage: "/images/events/banner/eski.jpg",
    squareImage: "/images/events/square/eski.jpg",
    price: 600,
    isFeatured: false,
    date: createFixedDate(2025, 2, 20, 9, 30),
    location: {
      tr: "Strateji Akademisi, İzmir",
      en: "Strategy Academy, Izmir"
    },
    title: {
      tr: "Yarış Stratejisi Masterclass",
      en: "Racing Strategy Masterclass"
    },
    description: {
      tr: "Profesyonel yarış stratejistlerinden yarış stratejisi, pit stop zamanlaması ve ekip yönetimi hakkında bilgiler.",
      en: "Learn about race strategy, pit stop timing, and team management from professional race strategists."
    },
    category: "workshop"
  }
];

export const getEvents = () => {
  // Calculate and add dynamic status to each event
  return events.map(event => {
    const status = getEventStatus(event.date);
    return { ...event, status };
  });
};

export const getFeaturedEvents = () => {
  const eventsWithStatus = getEvents();
  // Varsayılan olarak banner'a featured etkinlikleri gösterelim
  // Ancak 10'dan az featured etkinlik varsa, diğer etkinlikleri de ekleyelim
  const featured = eventsWithStatus.filter(event => event.isFeatured);
  
  if (featured.length >= 10) {
    return featured.slice(0, 10); // En fazla ilk 10 featured etkinliği göster
  } else {
    // Featured etkinlik sayısı 10'dan azsa, diğer etkinlikleri de ekle
    const nonFeatured = eventsWithStatus.filter(event => !event.isFeatured);
    const remaining = 10 - featured.length;
    return [...featured, ...nonFeatured.slice(0, remaining)].slice(0, 10);
  }
};

export const getEventBySlug = (slug: string) => {
  const event = events.find(event => event.slug === slug);
  if (event) {
    const status = getEventStatus(event.date);
    return { ...event, status };
  }
  return undefined;
};

export const getEventStatus = (date: string): 'today' | 'tomorrow' | 'this-week' | 'upcoming' | 'past' => {
  const eventDate = new Date(date);
  const now = new Date(); // Şimdiki zamanı tam olarak alıyoruz (saat ve dakika bilgisiyle)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  
  // Şu anki zamandan daha önceyse (saat dahil) geçmiş etkinlik
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

export const getSortedEvents = () => {
  const eventsWithStatus = getEvents();
  return [...eventsWithStatus].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    const now = new Date().getTime();
    
    // Sort future events (ascending by date)
    if (dateA >= now && dateB >= now) {
      return dateA - dateB;
    }
    // Sort past events (descending by date)
    else if (dateA < now && dateB < now) {
      return dateB - dateA;
    }
    // Future events come before past events
    else {
      return dateA >= now ? -1 : 1;
    }
  });
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
