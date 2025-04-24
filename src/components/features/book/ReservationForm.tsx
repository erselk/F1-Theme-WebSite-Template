'use client';

import React, { useState, useEffect } from "react";
import { format, addHours, isBefore, isToday, parseISO, getDay } from 'date-fns';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import { tr, enUS } from 'date-fns/locale';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css';
import jsPDF from 'jspdf';
import { createEvents } from 'ics';
import { saveAs } from 'file-saver';
import AnalogTimeSelector from './AnalogTimeSelector';
import AnalogueTimePicker24h from './AnalogueTimePicker24h';

// Register locales for date picker
registerLocale('tr', tr);
registerLocale('en', enUS);

// Font imports
import "@fontsource/titillium-web/600.css"; // semibold
import "@fontsource/inter/400.css"; // regular
import "@fontsource/barlow-condensed/500.css"; // medium

// Opening and closing hours by day of the week
// 0 = Sunday, 1 = Monday, etc.
const OPENING_HOURS: Record<number, { open: number; close: number }> = {
  0: { open: 10, close: 20 }, // Sunday: 10:00 - 20:00
  1: { open: 10, close: 22 }, // Monday: 10:00 - 22:00
  2: { open: 10, close: 22 }, // Tuesday: 10:00 - 22:00
  3: { open: 10, close: 22 }, // Wednesday: 10:00 - 22:00
  4: { open: 10, close: 22 }, // Thursday: 10:00 - 22:00
  5: { open: 10, close: 22 }, // Friday: 10:00 - 22:00
  6: { open: 9, close: 23 },  // Saturday: 09:00 - 23:00
};

// Define custom CSS for styling based on the provided color palette
const styleOverrides = `
  :root {
    --f1-red: #E10600;
    --f1-red-bright: #FF0000;
    --white: #FFFFFF;
    --light-grey: #F5F5F5;
    --very-light-grey: #FAFAFA;
    --dark-grey: #333333;
    --very-dark-grey: #121212;
    --medium-grey: #666666;
    --light-text-grey: #999999;
    --race-blue: #0090D0;
    --race-green: #00A14B;
    --metallic-silver: #C0C0C0;
    --electric-blue: #00B2FF;
    --neon-green: #00D766;
    --shadow-color: rgba(0, 0, 0, 0.1);
  }

  .dark {
    --f1-red: #FF0000;
    --shadow-color: rgba(0, 0, 0, 0.25);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Titillium Web', sans-serif;
    font-weight: 600;
  }

  body, p, li, a, input, select, button {
    font-family: 'Inter', sans-serif;
    font-weight: 400;
  }

  .technical-data, .race-numbers, .stats {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 500;
  }

  .bg-primary {
    background-color: var(--f1-red) !important;
  }

  .text-primary {
    color: var(--f1-red) !important;
  }

  .border-primary {
    border-color: var(--f1-red) !important;
  }

  .venue-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .bg-primary-hover:hover {
    background-color: var(--f1-red-bright) !important;
  }

  /* Calendar customization */
  .react-datepicker {
    font-family: 'Inter', sans-serif;
    border-radius: 0.5rem;
    border-color: var(--light-grey);
  }

  .react-datepicker__header {
    background-color: var(--very-light-grey);
    border-bottom: 1px solid var(--light-grey);
  }

  .react-datepicker__day--selected {
    background-color: var(--f1-red);
  }

  .react-datepicker__day:hover {
    background-color: var(--light-grey);
  }

  /* Success animation */
  @keyframes checkmark {
    0% {
      stroke-dashoffset: 100;
    }
    100% {
      stroke-dashoffset: 0;
    }
  }

  .checkmark {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: checkmark 1s ease-in-out forwards;
  }

  /* Button primary style */
  .btn-primary {
    background-color: var(--f1-red);
    color: var(--white);
    border-radius: 0.375rem;
    padding: 0.75rem 2rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .btn-primary:hover {
    background-color: var(--f1-red-bright);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface ReservationFormProps {
  selectedVenue: string | null;
  venueOptions: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  onSubmit: () => void;
}

// Format current date to YYYY-MM-DD for min date in date picker
const today = new Date();
const formattedToday = format(today, 'yyyy-MM-dd');
const minTime = isToday(today) ? format(addHours(today, 3), 'HH') : '09';

export default function ReservationForm({
  selectedVenue,
  venueOptions,
  onSubmit,
}: ReservationFormProps) {
  const { language, isDark } = useThemeLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [price, setPrice] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentRedirect, setShowPaymentRedirect] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showCallPrompt, setShowCallPrompt] = useState(false);
  const [contactStep, setContactStep] = useState(0); // 0: name, 1: phone
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<[string, string] | null>(['09:00', '10:00']);

  // Hours and minutes options for time selection
  const hours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 9; // 9 to 22
    return hour < 10 ? `0${hour}` : `${hour}`;
  });
  const minutes = ['00', '15', '30', '45'];

  const [formData, setFormData] = useState({
    venue: selectedVenue || "",
    people: "",
    date: formattedToday,
    startHour: "",
    startMinute: "00",
    endHour: "",
    endMinute: "00",
    name: "",
    surname: "",
    phone: "",
    duration: 1, // Default duration in hours
  });

  // Steps labels with translations
  const steps = {
    tr: ['Alan', 'Kişi Sayısı', 'Tarih', 'İletişim'],
    en: ['Venue', 'People', 'Date', 'Contact']
  };

  // People count options
  const peopleOptions = [1, 2, 3, 4, 5, 6, 7, '8+'];

  // Animation variants for the checkmark
  const checkmarkVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
      opacity: 1, 
      pathLength: 1,
      transition: { 
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  // Update venue when selectedVenue prop changes and skip to people count step
  useEffect(() => {
    if (selectedVenue) {
      setFormData(prev => ({ ...prev, venue: selectedVenue }));
      // Skip to people count step if venue is pre-selected from URL
      setCurrentStep(1);
    }
  }, [selectedVenue]);

  // Calculate price based on venue, duration and people count
  useEffect(() => {
    const startTime = timeRange ? timeRange[0] : '';
    const endTime = timeRange ? timeRange[1] : '';
    
    if (currentStep === 2 && formData.venue && startTime && endTime) {
      // Calculate duration in hours
      const start = new Date(`2023-01-01T${startTime}`);
      const end = new Date(`2023-01-01T${endTime}`);
      
      if (end <= start) return;
      
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      let basePrice = 0;
      
      if (formData.venue === "f1") {
        // F1 Simulator pricing: 100 TL for first hour, 200 TL for 2 hours, 300 TL for 3 hours
        if (durationHours <= 1) basePrice = 100;
        else if (durationHours <= 2) basePrice = 200;
        else basePrice = 300;
      } else if (formData.venue === "vr") {
        // VR Area pricing: 50 TL per hour
        basePrice = 50 * Math.ceil(durationHours);
      } else if (formData.venue === "computers") {
        // Computer Room pricing: 20 TL per hour
        basePrice = 20 * Math.ceil(durationHours);
      }
      
      // Multiply by number of people if available
      const peopleCount = parseInt(formData.people) || 1;
      const totalPrice = basePrice * peopleCount;
      
      setFormData(prev => ({ ...prev, duration: Math.ceil(durationHours) }));
      setPrice(totalPrice);
      setShowPrice(totalPrice > 0);
    }
  }, [
    currentStep, 
    formData.venue, 
    timeRange,
    formData.people
  ]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle people count selection
  const handlePeopleSelect = (count: number | string) => {
    if (count === '8+') {
      setShowCallPrompt(true);
    } else {
      setFormData(prev => ({ ...prev, people: count.toString() }));
      nextStep();
    }
  };

  // Handle venue selection
  const handleVenueSelect = (venueId: string) => {
    setFormData(prev => ({ ...prev, venue: venueId }));
    // Auto advance to next step
    setTimeout(() => {
      nextStep();
    }, 300);
  };

  // Move to a specific step
  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step);
      // Reset contact sub-step if going back to contact step
      if (step === 3) {
        setContactStep(0);
      }
    }
  };

  // Move to the next step
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle date-time form submission
  const handleDateTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  // Handle contact form fields submission
  const handleContactFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contactStep < 1) {
      setContactStep(contactStep + 1);
    } else {
      // All contact info collected, move to confirmation
      nextStep();
    }
  };

  // Make a phone call
  const makeCall = () => {
    window.location.href = 'tel:+905555555555';
  };

  // Check if date and time selections are valid
  const isDateTimeValid = () => {
    return formData.date && 
           timeRange &&
           (timeRange[1] > timeRange[0]);
  };

  // Check if name fields are valid
  const isNameValid = () => {
    return formData.name.trim() !== "" && formData.surname.trim() !== "";
  };

  // Check if phone number is valid
  const isPhoneValid = () => {
    return /^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''));
  };

  // Final form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Store reservation data in localStorage for confirmation page
    const venueName = getVenueName(formData.venue);
    const formattedDate = getFormattedDate(formData.date);
    const formattedTime = timeRange ? `${timeRange[0]} - ${timeRange[1]}` : '';
    const fullName = `${formData.name} ${formData.surname}`;
    
    localStorage.setItem('reservation_venue', venueName);
    localStorage.setItem('reservation_name', fullName);
    localStorage.setItem('reservation_date', formattedDate);
    localStorage.setItem('reservation_time', formattedTime);
    localStorage.setItem('reservation_people', formData.people);
    localStorage.setItem('reservation_price', `${price} TL`);
    localStorage.setItem('reservation_phone', formData.phone);
    localStorage.setItem('reservation_date_raw', formData.date);
    localStorage.setItem('reservation_startTime', timeRange ? timeRange[0] : '');
    localStorage.setItem('reservation_endTime', timeRange ? timeRange[1] : '');
    localStorage.setItem('reservation_ref', Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // For venues that need payment (f1, vr, computers)
    if (["f1", "vr", "computers"].includes(formData.venue)) {
      setTimeout(() => {
        setShowPaymentRedirect(true);
        
        // After "redirect", show payment success
        setTimeout(() => {
          setShowPaymentSuccess(true);
          
          // After showing success, submit form
          setTimeout(() => {
            console.log("Form data submitted:", formData);
            onSubmit();
          }, 2000);
        }, 2000);
      }, 1000);
    } else {
      // For cafe and boardgames, directly confirm with success animation
      setTimeout(() => {
        setShowPaymentSuccess(true);
        
        // After showing success, submit form
        setTimeout(() => {
          console.log("Form data submitted:", formData);
          onSubmit();
        }, 2000);
      }, 1000);
    }
  };

  // Get formatted time string for confirmation
  const getFormattedTime = (hour: string, minute: string) => {
    return `${hour}:${minute}`;
  }

  // Get venue display name
  const getVenueName = (id: string) => {
    const venue = venueOptions.find(v => v.id === id);
    return venue ? venue.title : '';
  };

  // Get formatted date string for confirmation based on language
  const getFormattedDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    
    if (language === 'en') {
      // English format: Monday 15 2025
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateNum = date.getDate();
      const year = date.getFullYear();
      return `${day} ${dateNum} ${year}`;
    } else {
      // Turkish format: 16 Haziran 2025
      const day = date.getDate();
      const month = date.toLocaleDateString('tr-TR', { month: 'long' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  };

  // Get the opening hour based on the day of the week
  const openingHourForToday = () => {
    const dayOfWeek = getDay(selectedDate);
    return OPENING_HOURS[dayOfWeek]?.open || 10;
  };

  // Determine if venue needs payment
  const venueNeedsPayment = () => {
    return ["f1", "vr", "computers"].includes(formData.venue);
  };

  // Translations
  const translations = {
    tr: {
      reservation: "Rezervasyon",
      whichVenue: "Hangi alan için rezervasyon yapmak istiyorsunuz?",
      howManyPeople: "Kaç kişi olacaksınız?",
      callForMore: "8 kişiden fazla rezervasyon için lütfen bizi arayın.",
      callNow: "Şimdi Ara",
      goBack: "Geri Dön",
      whenComing: "Ne zaman gelmek istersiniz?",
      startTime: "Başlangıç Saati",
      endTime: "Bitiş Saati",
      totalPrice: "Toplam Ücret",
      confirm: "Onayla",
      contactInfo: "İletişim Bilgileri",
      firstName: "Ad",
      lastName: "Soyad",
      phone: "Telefon Numarası",
      confirmReservation: "Rezervasyonu Onayla",
      selectedVenue: "Seçilen Alan",
      peopleCount: "Kişi Sayısı",
      date: "Tarih",
      time: "Saat",
      fullName: "Ad Soyad",
      contact: "İletişim",
      proceedToPayment: "Ödemeye Geç",
      completeReservation: "Rezervasyonu Tamamla",
      redirectingToPayment: "Ödeme sayfasına yönlendiriliyor...",
      confirmingReservation: "Rezervasyonunuz onaylanıyor...",
      paymentSuccessful: "Ödeme başarılı!",
      reservationConfirmed: "Rezervasyonunuz onaylanmıştır!",
      people: "kişi",
      hour: "Saat",
      successTitle: "Rezervasyonunuz Onaylandı!",
      successMessage: "Seçtiğiniz alan ve saat için rezervasyonunuz başarıyla oluşturuldu.",
      earlyArrival: "Rezervasyon saatinizden 10 dakika önce merkezimizde bulunmanızı rica ederiz."
    },
    en: {
      reservation: "Reservation",
      whichVenue: "Which venue would you like to reserve?",
      howManyPeople: "How many people will attend?",
      callForMore: "Please call us for reservations with more than 8 people.",
      callNow: "Call Now",
      goBack: "Go Back",
      whenComing: "When would you like to come?",
      startTime: "Start Time",
      endTime: "End Time",
      totalPrice: "Total Price",
      confirm: "Confirm",
      contactInfo: "Contact Information",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      confirmReservation: "Confirm Reservation",
      selectedVenue: "Selected Venue",
      peopleCount: "Number of People",
      date: "Date",
      time: "Time",
      fullName: "Full Name",
      contact: "Contact",
      proceedToPayment: "Proceed to Payment",
      completeReservation: "Complete Reservation",
      redirectingToPayment: "Redirecting to payment...",
      confirmingReservation: "Confirming your reservation...",
      paymentSuccessful: "Payment successful!",
      reservationConfirmed: "Your reservation has been confirmed!",
      people: "people",
      hour: "Hour",
      successTitle: "Reservation Confirmed!",
      successMessage: "Your reservation for the selected venue and time has been successfully created.",
      earlyArrival: "We kindly request you to arrive at our center 10 minutes before your reservation time."
    }
  };

  // Use the correct language based on locale
  const t = translations[language === 'en' ? 'en' : 'tr'];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Add style override */}
      <style jsx global>{styleOverrides}</style>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        {t.reservation}
      </h2>
      
      {/* Progress steps indicator */}
      <div className="flex justify-between mb-6 max-w-lg mx-auto">
        {steps[language === 'en' ? 'en' : 'tr'].map((step, index) => (
          <div 
            key={index} 
            onClick={() => goToStep(index)}
            className={`cursor-pointer flex flex-col items-center ${index === currentStep ? "text-primary font-bold" : "text-gray-400"} ${index < currentStep ? "hover:underline" : ""}`}
          >
            <span className="text-center px-2 text-xl font-medium">{step}</span>
          </div>
        ))}
      </div>
      
      <div className="bg-card p-6 rounded-lg border border-border shadow-md">
        {/* Main step content - only one form at root level */}
        {currentStep === 0 && (
          <motion.div 
            className="space-y-6 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-2xl font-semibold mb-5 text-center">
              {t.whichVenue}
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-w-xl mx-auto">
              {venueOptions.map((venue) => (
                <div 
                  key={venue.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors text-center h-24 flex flex-col justify-between ${
                    formData.venue === venue.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 hover:bg-very-light-grey"
                  }`}
                  onClick={() => handleVenueSelect(venue.id)}
                >
                  <div className="text-xs font-medium">{venue.title}</div>
                  <div className="venue-icon self-center">{venue.icon}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* People Count Selection */}
        {currentStep === 1 && (
          <motion.div 
            className="space-y-6 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-2xl font-semibold mb-5 text-center">
              {t.howManyPeople}
            </h3>
            
            {showCallPrompt ? (
              <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/30">
                <p className="mb-4 text-lg">
                  {t.callForMore}
                </p>
                <button
                  type="button"
                  onClick={makeCall}
                  className="btn-primary inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {t.callNow}
                </button>
                <button
                  type="button"
                  className="block mx-auto mt-4 text-primary hover:underline text-sm"
                  onClick={() => setShowCallPrompt(false)}
                >
                  {t.goBack}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
                {peopleOptions.map((count) => (
                  <div 
                    key={count} 
                    className="aspect-square flex items-center justify-center border border-border rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors text-center font-medium"
                    onClick={() => handlePeopleSelect(count)}
                  >
                    {count}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Date and Time Selection */}
        {currentStep === 2 && (
          <motion.div 
            className="space-y-6 transition-all duration-300 flex flex-col items-center justify-center w-fit mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-2xl font-semibold mb-5 text-center">
              {t.whenComing}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-fit">
              {/* Calendar on the left - without label */}
              <div className="w-fit">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setFormData(prev => ({ 
                        ...prev, 
                        date: format(date, 'yyyy-MM-dd')
                      }));
                    }
                  }}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  inline
                  calendarClassName="border border-border rounded-lg p-2 bg-background shadow-md w-fit"
                  dayClassName={() => "text-center hover:bg-primary/10"}
                  monthClassName={() => "font-medium text-center"}
                  wrapperClassName="w-fit"
                  locale={language === 'en' ? 'en' : 'tr'}
                />
              </div>
              
              {/* Time Selection on the right - without label */}
              <div className="w-fit flex flex-col items-center">
                <AnalogueTimePicker24h
                  defaultStartTime={{
                    hours: timeRange ? parseInt(timeRange[0].split(':')[0]) : openingHourForToday(),
                    minutes: timeRange ? parseInt(timeRange[0].split(':')[1]) : 0
                  }}
                  defaultEndTime={{
                    hours: timeRange ? parseInt(timeRange[1].split(':')[0]) : openingHourForToday() + 1,
                    minutes: timeRange ? parseInt(timeRange[1].split(':')[1]) : 0
                  }}
                  selectedDate={selectedDate}
                  language={language as 'tr' | 'en'}
                  showPrice={showPrice}
                  price={price}
                  onTimeChange={(data) => {
                    const startTimeStr = `${data.startTime.hours.toString().padStart(2, '0')}:${data.startTime.minutes.toString().padStart(2, '0')}`;
                    const endTimeStr = `${data.endTime.hours.toString().padStart(2, '0')}:${data.endTime.minutes.toString().padStart(2, '0')}`;
                    
                    setTimeRange([startTimeStr, endTimeStr]);
                    setFormData(prev => ({
                      ...prev,
                      startHour: startTimeStr.split(':')[0],
                      startMinute: startTimeStr.split(':')[1],
                      endHour: endTimeStr.split(':')[0],
                      endMinute: endTimeStr.split(':')[1]
                    }));
                  }}
                />
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleDateTimeSubmit}
                disabled={!isDateTimeValid()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.confirm}
              </button>
            </div>
          </motion.div>
        )}

        {/* Contact Information - Split into 2 sub-steps */}
        {currentStep === 3 && (
          <motion.div 
            className="space-y-5 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-2xl font-semibold mb-5 text-center">
              {t.contactInfo}
            </h3>
            
            {/* 4.1: Name & Surname */}
            {contactStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-lg font-medium mb-3 text-center">
                      {t.firstName}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 rounded border border-border bg-background text-center text-base"
                      placeholder="Adınız"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="surname" className="block text-lg font-medium mb-3 text-center">
                      {t.lastName}
                    </label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      value={formData.surname}
                      onChange={handleChange}
                      className="w-full p-4 rounded border border-border bg-background text-center text-base"
                      placeholder="Soyadınız"
                      required
                    />
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleContactFieldSubmit}
                    disabled={!isNameValid()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            )}
            
            {/* 4.2: Phone */}
            {contactStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="phone" className="block text-lg font-medium mb-3 text-center">
                    {t.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-4 rounded border border-border bg-background text-center text-base"
                    placeholder="05xx xxx xx xx"
                    required
                  />
                </div>
                
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={handleContactFieldSubmit}
                    disabled={!isPhoneValid()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t.confirm}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 4 && (
          <motion.div 
            className="space-y-4 transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              {t.confirmReservation}
            </h3>
            
            <div className="space-y-3 bg-background p-5 rounded-lg border border-border">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.selectedVenue}:</div>
                <div className="font-medium">
                  {getVenueName(formData.venue) || 'Seçilmedi'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.peopleCount}:</div>
                <div className="font-medium">{formData.people} {t.people}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.date}:</div>
                <div className="font-medium">
                  {getFormattedDate(formData.date)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.time}:</div>
                <div className="font-medium">
                  {getFormattedTime(formData.startHour, formData.startMinute)} - {getFormattedTime(formData.endHour, formData.endMinute)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.fullName}:</div>
                <div className="font-medium">{formData.name} {formData.surname}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">{t.contact}:</div>
                <div className="font-medium">{formData.phone}</div>
              </div>
              
              {showPrice && (
                <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-border">
                  <div className="text-sm font-medium">{t.totalPrice}:</div>
                  <div className="font-bold text-primary">{price} TL</div>
                </div>
              )}
            </div>
            
            {isSubmitting ? (
              <div className="text-center py-8">
                {showPaymentSuccess ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.svg 
                      className="w-16 h-16 text-race-green mb-4" 
                      viewBox="0 0 50 50"
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <motion.path
                        d="M15 25 L23 33 L35 17"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={checkmarkVariants}
                      />
                    </motion.svg>
                    <p className="text-xl font-medium text-primary">
                      {venueNeedsPayment() ? t.paymentSuccessful : t.reservationConfirmed}
                    </p>
                  </motion.div>
                ) : showPaymentRedirect ? (
                  <div className="text-primary font-medium">
                    {t.confirmingReservation}
                  </div>
                ) : (
                  <div>
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                    <div className="text-muted-foreground">
                      {venueNeedsPayment() ? t.redirectingToPayment : t.confirmingReservation}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary"
                >
                  {venueNeedsPayment() ? t.proceedToPayment : t.completeReservation}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}