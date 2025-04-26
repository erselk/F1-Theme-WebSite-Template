'use client';

import { useState, useEffect, Suspense } from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import ReservationForm from "./ReservationForm";
import jsPDF from 'jspdf';
import { createEvents } from 'ics';
import { saveAs } from 'file-saver';
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
  const [reservationData, setReservationData] = useState({
    ref: '',
    name: '',
    venue: '',
    date: '',
    time: '',
    people: '',
    price: '',
    phone: '',
    dateRaw: '',
    startTime: '',
    endTime: ''
  });

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
    title: venue.title[language as 'tr' | 'en'],
    description: venue.description[language as 'tr' | 'en']
  }));

  const handleFormSubmit = () => {
    // Load reservation data from localStorage
    setReservationData({
      ref: localStorage.getItem('reservation_ref') || '',
      name: localStorage.getItem('reservation_name') || '',
      venue: localStorage.getItem('reservation_venue') || '',
      date: localStorage.getItem('reservation_date') || '',
      time: localStorage.getItem('reservation_time') || '',
      people: localStorage.getItem('reservation_people') || '',
      price: localStorage.getItem('reservation_price') || '',
      phone: localStorage.getItem('reservation_phone') || '',
      dateRaw: localStorage.getItem('reservation_date_raw') || '',
      startTime: localStorage.getItem('reservation_startTime') || '',
      endTime: localStorage.getItem('reservation_endTime') || ''
    });
    setIsFormSubmitted(true);
  };

  // Translations
  const translations = {
    tr: {
      successTitle: "Rezervasyonunuz Onaylandı!",
      successMessage: "Seçtiğiniz alan ve saat için rezervasyonunuz başarıyla oluşturuldu.",
      earlyArrival: "Rezervasyon saatinizden 10 dakika önce merkezimizde bulunmanızı rica ederiz."
    },
    en: {
      successTitle: "Reservation Confirmed!",
      successMessage: "Your reservation for the selected venue and time has been successfully created.",
      earlyArrival: "We kindly request you to arrive at our center 10 minutes before your reservation time."
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

      {/* Success Message (Conditional) */}
      {isFormSubmitted && (
        <section className="p-8 bg-background border border-border rounded-lg max-w-2xl mx-auto animate-fadeIn shadow-md">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">
              {t.successTitle}
            </h3>
            <p className="mb-3 text-lg text-foreground">
              {t.successMessage}
            </p>
            <p className="text-muted-foreground mb-6">
              {t.earlyArrival}
            </p>
            
            {/* Reservation details box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
              <h4 className="font-semibold text-center text-lg mb-3">{language === 'tr' ? 'Rezervasyon Bilgileriniz' : 'Your Reservation Details'}</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">{language === 'tr' ? 'Referans No:' : 'Reference No:'}</span> {reservationData.ref}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Ad Soyad:' : 'Full Name:'}</span> {reservationData.name}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Alan:' : 'Venue:'}</span> {reservationData.venue}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Tarih:' : 'Date:'}</span> {reservationData.date}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Saat:' : 'Time:'}</span> {reservationData.time}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Kişi Sayısı:' : 'Number of People:'}</span> {reservationData.people}</p>
                <p><span className="font-medium">{language === 'tr' ? 'Toplam Ücret:' : 'Total Price:'}</span> {reservationData.price}</p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              {/* Download PDF button */}
              <button 
                onClick={() => {
                  const doc = new jsPDF();
                  doc.text(`Reservation Details`, 10, 10);
                  doc.text(`Reference No: ${reservationData.ref}`, 10, 20);
                  doc.text(`Full Name: ${reservationData.name}`, 10, 30);
                  doc.text(`Venue: ${reservationData.venue}`, 10, 40);
                  doc.text(`Date: ${reservationData.date}`, 10, 50);
                  doc.text(`Time: ${reservationData.time}`, 10, 60);
                  doc.text(`Number of People: ${reservationData.people}`, 10, 70);
                  doc.text(`Total Price: ${reservationData.price}`, 10, 80);
                  doc.save('reservation-details.pdf');
                }}
                className="btn-primary flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {language === 'tr' ? 'Rezervasyon Bilgilerini İndir' : 'Download Reservation Details'}
              </button>
              
              {/* Add to Calendar button */}
              <button 
                onClick={() => {
                  const event = {
                    start: [parseInt(reservationData.dateRaw.split('-')[0]), parseInt(reservationData.dateRaw.split('-')[1]), parseInt(reservationData.dateRaw.split('-')[2]), parseInt(reservationData.startTime.split(':')[0]), parseInt(reservationData.startTime.split(':')[1])],
                    end: [parseInt(reservationData.dateRaw.split('-')[0]), parseInt(reservationData.dateRaw.split('-')[1]), parseInt(reservationData.dateRaw.split('-')[2]), parseInt(reservationData.endTime.split(':')[0]), parseInt(reservationData.endTime.split(':')[1])],
                    title: `Reservation at ${reservationData.venue}`,
                    description: `Reservation Details:\nReference No: ${reservationData.ref}\nFull Name: ${reservationData.name}\nVenue: ${reservationData.venue}\nDate: ${reservationData.date}\nTime: ${reservationData.time}\nNumber of People: ${reservationData.people}\nTotal Price: ${reservationData.price}`,
                    location: 'Gaming Center',
                    url: 'https://gamingcenter.com',
                    status: 'CONFIRMED',
                    busyStatus: 'BUSY',
                    organizer: { name: 'Gaming Center', email: 'info@gamingcenter.com' }
                  };
                  createEvents([event], (error, value) => {
                    if (error) {
                      console.error(error);
                      return;
                    }
                    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
                    saveAs(blob, 'reservation.ics');
                  });
                }}
                className={`flex items-center justify-center py-3 px-6 rounded ${isDark ? 'bg-blue-600 text-white' : 'bg-race-blue text-black'} hover:bg-blue-600 ${isDark ? 'hover:text-white' : 'hover:text-black'} font-medium`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {language === 'tr' ? 'Takvime Ekle' : 'Add to Calendar'}
              </button>
            </div>

            {/* Return to homepage button */}
            <a 
              href="/"
              className="inline-flex items-center text-primary hover:underline mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {language === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        </section>
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