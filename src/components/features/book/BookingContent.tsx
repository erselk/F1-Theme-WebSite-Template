'use client';

import { useState, useEffect, Suspense } from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import ReservationForm from "./ReservationForm";
import { useSearchParams } from 'next/navigation';

// Define venues with multilingual support
const venues = [
  {
    id: "f1",
    title: {
      tr: "F1 Yarış Simülasyonu",
      en: "F1 Racing Simulation"
    },
    description: {
      tr: "Gerçekçi F1 simülasyon deneyimi",
      en: "Realistic F1 simulation experience"
    },
    icon: "🏁",
  },
  {
    id: "vr",
    title: {
      tr: "VR Deneyim Alanı",
      en: "VR Experience Area"
    },
    description: {
      tr: "Sanal gerçeklik deneyimleri",
      en: "Virtual reality experiences"
    },
    icon: "🥽",
  },
  {
    id: "computers",
    title: {
      tr: "Bilgisayar Salonu",
      en: "Computer Room"
    },
    description: {
      tr: "Yüksek performanslı oyun bilgisayarları",
      en: "High-performance gaming computers"
    },
    icon: "🖥️",
  },
  {
    id: "boardgames",
    title: {
      tr: "Kutu Oyunları",
      en: "Board Games"
    },
    description: {
      tr: "100+ oyun seçeneğiyle eğlenceli saatler",
      en: "Fun hours with 100+ game options"
    },
    icon: "🎲",
  },
  {
    id: "cafe",
    title: {
      tr: "Kafe",
      en: "Cafe"
    },
    description: {
      tr: "Arkadaşlarınızla keyifli vakit geçirin",
      en: "Enjoy time with your friends"
    },
    icon: "☕",
  },
];

// SearchParams hook'unu kullanan bileşen
const BookingContentWithParams: React.FC = () => {
  const { language, isDark } = useThemeLanguage();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const searchParams = useSearchParams();

  // Check URL parameter to pre-select venue on initial load
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['f1', 'vr', 'computers'].includes(typeParam)) {
      setSelectedVenue(typeParam);
    }
  }, [searchParams]);

  // Format venues with the correct language
  const localizedVenues = venues.map(venue => ({
    ...venue,
    // title: venue.title[language as 'tr' | 'en'], // Keep the title object
    // description: venue.description[language as 'tr' | 'en'] // Keep the description object
    // title ve description objelerini doğrudan aktaracağız.
    // Dil seçimi artık ReservationForm veya alt bileşenlerde yapılacak.
  }));

  const handleFormSubmit = () => {
    setIsFormSubmitted(true);
  };

  // Translations
  const translations = {
    tr: {
      // Diğer çeviriler burada kalabilir veya silinebilir, şimdilik bırakıyorum.
      // Eğer başka bir yerde kullanılmıyorsa, bu obje de sadeleştirilebilir.
    },
    en: {
      // Diğer çeviriler burada kalabilir veya silinebilir, şimdilik bırakıyorum.
    }
  };

  // Use the correct language based on locale
  const t = translations[language === 'en' ? 'en' : 'tr'];

  return (
    <div className="mb-16">
      {/* Reservation Form */}
      {!isFormSubmitted && (
        <ReservationForm 
          selectedVenue={selectedVenue} 
          venueOptions={localizedVenues}
          onSubmit={handleFormSubmit} 
        />
      )}
    </div>
  );
};

// Loading state component
const BookingLoadingState: React.FC = () => {
  return (
    <div className="mb-16">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

// Main component with Suspense
export default function BookingContent() {
  return (
    <Suspense fallback={<BookingLoadingState />}>
      <BookingContentWithParams />
    </Suspense>
  );
}