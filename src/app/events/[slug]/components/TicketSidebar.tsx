'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import Link from 'next/link';
import { ReservationTimer } from './ReservationTimer';
import { SeatSelector } from './SeatSelector';
import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Image from 'next/image';

interface TicketSidebarProps {
  event: Event;
  locale: LanguageType;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
  maxPerOrder?: number;
  availableCount?: number;
  variant?: 'standard' | 'premium' | 'vip';
}

export function TicketSidebar({ event, locale: initialLocale }: TicketSidebarProps) {
  const { language, isDark } = useThemeLanguage(); // Use context to get real-time language and theme
  const locale = language; // Use the language from context for dynamic changes
  
  // Helper function to check if a date is valid
  const isValidDate = (date: any): boolean => {
    if (!date) return false;
    const d = new Date(date);
    // Check if the date object is valid and not NaN
    return !isNaN(d.getTime());
  };
  
  // Format date with proper error handling
  const formatEventDate = (dateString: string): string => {
    try {
      if (!isValidDate(dateString)) {
        return locale === 'tr' ? 'Tarih belirtilmedi' : 'Date not specified';
      }
      
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return locale === 'tr' ? 'Geçersiz tarih' : 'Invalid date';
    }
  };
  
  // State for tracking sticky behavior
  const [isSticky, setIsSticky] = useState<boolean>(false);
  
  // Effect for handling scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      // Get the distance from the top of the document
      const scrollPosition = window.scrollY;
      // Adjust this threshold value based on when you want the sidebar to become sticky
      const threshold = 300; // Adjust this value as needed
      
      if (scrollPosition > threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Theme-dependent color classes
  const bgColorClass = isDark ? 'bg-graphite' : 'bg-white';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const inputBgClass = isDark ? 'bg-dark-grey' : 'bg-gray-50';
  const inputBorderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';
  const buttonBgClass = isDark ? 'bg-carbon-grey' : 'bg-gray-200';
  const buttonTextClass = isDark ? 'text-silver' : 'text-gray-700';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-gray-50';
  const progressBgClass = isDark ? 'bg-carbon-grey' : 'bg-gray-300';
  
  // Step of the checkout process
  // 1: Select tickets, 2: Add details, 3: Payment, 4: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // New state for tracking if user wants to iterate again
  const [showIterateOption, setShowIterateOption] = useState<boolean>(false);
  
  // Bilet tiplerini MongoDB'den gelen veri ile oluştur
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  
  // MongoDB'den gelen bilet tiplerini kullanarak ticketTypes'ı doldur
  useEffect(() => {
    // Eğer event.tickets varsa kullan, yoksa boş dizi olarak ayarla
    if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
      const formattedTickets = event.tickets.map(ticket => ({
        id: ticket.id,
        name: ticket.name[locale] || (locale === 'tr' ? 'Bilet' : 'Ticket'),
        price: ticket.price,
        description: ticket.description?.[locale],
        maxPerOrder: 5, // Always limit to 5 tickets per order
        availableCount: ticket.availableCount ?? -1, // Default to unlimited stock if not specified
        variant: ticket.variant || 'standard',
        originalName: ticket.name // Tüm dil versiyonlarını sakla
      }));
      setTicketTypes(formattedTickets);
    } else {
      // MongoDB'de bilet tipi yoksa boş dizi olarak ayarla
      setTicketTypes([]);
    }
  }, [event.tickets, event.price, locale]);

  // Selected ticket quantities
  const [selectedTickets, setSelectedTickets] = useState<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
    originalName?: any; // Tüm dil seçeneklerini saklamak için
  }[]>([]);
  
  // Automatically update selected ticket names when language changes
  useEffect(() => {
    if (selectedTickets.length > 0) {
      setSelectedTickets(prev => prev.map(ticket => {
        // Find the corresponding ticket type to get the updated name
        const updatedTicketType = ticketTypes.find(t => t.id === ticket.id);
        return {
          ...ticket,
          name: updatedTicketType?.name || ticket.name
        };
      }));
    }
  }, [locale, ticketTypes]);
  
  // Reservation details
  const [reservationStartTime, setReservationStartTime] = useState<Date | null>(null);
  const [reservationDuration] = useState<number>(10); // minutes
  
  // Customer details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Terms acceptance
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Determine if seat selection is required
  const [requiresSeatSelection, setRequiresSeatSelection] = useState(false);
  
  // Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Total price
  const totalPrice = selectedTickets.reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);

  // Check if form is complete for the current step
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return selectedTickets.some(ticket => ticket.quantity > 0);
      case 2:
        return fullName && email && phone && acceptTerms;
      default:
        return false;
    }
  };
  
  // Handle ticket quantity changes
  const updateTicketQuantity = (id: string, action: 'increase' | 'decrease') => {
    // Find the current ticket type
    const ticketType = ticketTypes.find(t => t.id === id);
    if (!ticketType) return;
    
    // Determine the purchase limit based on given rules:
    let purchaseLimit: number;
    
    if (ticketType.availableCount === -1) {
      // If availableCount is -1, use maxPerOrder as the limit
      purchaseLimit = ticketType.maxPerOrder || 5; // Default to 5 if maxPerOrder is not defined
    } else if ((ticketType.maxPerOrder || 5) > ticketType.availableCount) {
      // If maxPerOrder is greater than availableCount, use availableCount as the limit
      purchaseLimit = ticketType.availableCount;
    } else {
      // Otherwise, use maxPerOrder as the limit
      purchaseLimit = ticketType.maxPerOrder || 5; // Default to 5 if maxPerOrder is not defined
    }
    
    // Find if this ticket is already in selected tickets
    const existingTicketIndex = selectedTickets.findIndex(t => t.id === id);
    
    if (existingTicketIndex >= 0) {
      // Ticket exists in selection
      const updatedSelectedTickets = [...selectedTickets];
      const currentQuantity = updatedSelectedTickets[existingTicketIndex].quantity;
      
      if (action === 'increase') {
        // Check if we've reached the purchase limit
        if (currentQuantity >= purchaseLimit) {
          // Show appropriate error message based on the limitation
          if (ticketType.availableCount === -1 || ticketType.availableCount > (ticketType.maxPerOrder || 5)) {
            // Limited by maxPerOrder
            setFormErrors({
              ...formErrors,
              [id]: locale === 'tr'
                ? `Bir siparişte en fazla ${purchaseLimit} adet bilet satın alabilirsiniz.`
                : `You can purchase maximum ${purchaseLimit} tickets in a single order.`
            });
          } else {
            // Limited by availableCount
            setFormErrors({
              ...formErrors,
              [id]: locale === 'tr'
                ? `Bu bilet türü için maksimum ${purchaseLimit} adet bilet kalmıştır.`
                : `Maximum ${purchaseLimit} tickets are available for this ticket type.`
            });
          }
          return;
        }
        
        updatedSelectedTickets[existingTicketIndex].quantity += 1;
      } else {
        // Decrease quantity
        if (currentQuantity > 1) {
          updatedSelectedTickets[existingTicketIndex].quantity -= 1;
        } else {
          // Remove ticket if quantity is 0
          updatedSelectedTickets.splice(existingTicketIndex, 1);
        }
        
        // Clear error if it exists
        if (formErrors[id]) {
          const updatedErrors = { ...formErrors };
          delete updatedErrors[id];
          setFormErrors(updatedErrors);
        }
      }
      
      setSelectedTickets(updatedSelectedTickets);
    } else if (action === 'increase') {
      // Check if the ticket is available in stock before adding
      if (ticketType.availableCount === 0) {
        setFormErrors({
          ...formErrors,
          [id]: locale === 'tr'
            ? 'Bu bilet türü tükenmiştir.'
            : 'This ticket type is out of stock.'
        });
        return;
      }
      
      // Add new ticket to selection
      setSelectedTickets([
        ...selectedTickets,
        {
          id: ticketType.id,
          name: ticketType.name,
          quantity: 1,
          price: ticketType.price,
          variant: ticketType.variant,
          originalName: ticketType.originalName
        }
      ]);
    }
  };
  
  // Start timer when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && !reservationStartTime) {
      setReservationStartTime(new Date());
    }
  }, [currentStep, reservationStartTime]);
  
  // Reset reservation timer when it expires
  const handleReservationExpire = () => {
    setCurrentStep(1);
    setReservationStartTime(null);
    setSelectedTickets([]);
  };
  
  // Go to previous step
  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Handle PDF ticket download
  const handleDownloadTicket = () => {
    // This would generate and download a PDF ticket in a real implementation
    alert(locale === 'tr' 
      ? 'Bilet PDF dosyası indiriliyor...' 
      : 'Downloading ticket PDF...'
    );
  };

  // Handle add to calendar
  const handleAddToCalendar = () => {
    // This would create a calendar event in a real implementation
    alert(locale === 'tr' 
      ? 'Etkinlik takviminize ekleniyor...' 
      : 'Adding event to your calendar...'
    );
  };
  
  // New function to handle iteration
  const handleIteration = (iterate: boolean) => {
    if (iterate) {
      // Reset the form and go back to step 1
      setCurrentStep(1);
      setSelectedTickets([]);
      setFullName('');
      setEmail('');
      setPhone('');
      setAcceptTerms(false);
      setFormErrors({});
      setReservationStartTime(null);
      setShowIterateOption(false);
    } else {
      // Just hide the iterate option
      setShowIterateOption(false);
    }
  };
  
  // Function to redirect to payment processing using a full page redirect
  const processPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create a unique order ID
      const orderId = crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Format the schedule data properly for payment page
      const formattedSchedule = {
        tr: [],
        en: []
      };
      
      // Process schedule data if it exists and is an array
      if (event.schedule && Array.isArray(event.schedule)) {
        event.schedule.forEach(item => {
          // For the Turkish version
          formattedSchedule.tr.push(`${item.time} - ${item.title?.tr || ''} ${item.description?.tr ? `: ${item.description.tr}` : ''}`);
          
          // For the English version
          formattedSchedule.en.push(`${item.time} - ${item.title?.en || ''} ${item.description?.en ? `: ${item.description.en}` : ''}`);
        });
      }
      
      // Prepare payment data with detailed event information
      const paymentData = {
        orderId,
        fullName,
        email,
        phone,
        amount: totalPrice * 100, // Kuruş cinsinden
        eventTitle: event.title, // Store complete title object with all language versions
        eventDate: event.date,
        eventLocation: event.location, // Store complete location object with all language versions
        eventImage: event.bannerImage || event.squareImage,
        squareImage: event.squareImage,
        bannerImage: event.bannerImage,
        eventDescription: event.description, // Store complete description object with all language versions
        eventDetails: event.details, // Store complete details object with all language versions
        eventSchedule: formattedSchedule, // Use the formatted schedule with both languages
        eventRules: event.rules, // Store complete rules object with all language versions
        tickets: selectedTickets.map(ticket => {
          const ticketType = ticketTypes.find(t => t.id === ticket.id);
          return {
            ...ticket,
            name: ticketType?.name || ticket.name, // Current language name
            originalName: ticketType?.originalName || ticket.name // All language versions
          };
        }),
        allTickets: event.tickets, // Store all tickets with their language versions
        customerIp: '',
        locale,
        timestamp: Date.now(),
        returnUrl: window.location.href,
        eventId: event.id // Add the event ID to make it easier to check on return
      };
      
      // Save payment data to localStorage so we can retrieve it when returning from payment page
      localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      
      // If total price is 0, skip payment step and go directly to confirmation page
      if (totalPrice === 0) {
        // Since the price is 0, we can mark this as a successful payment immediately
        const successResult = {
          status: 'success',
          orderId,
          paymentId: `free-${orderId}`,
          timestamp: Date.now()
        };
        localStorage.setItem('paymentResult', JSON.stringify(successResult));
        
        // Go directly to payment confirmed page
        window.location.href = `/payment/confirmed?orderId=${orderId}`;
      } else {
        // Regular payment flow - redirect to the payment simulation page
        window.location.href = `/payment/simulate?orderId=${orderId}`;
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setFormErrors({
        ...formErrors,
        payment: locale === 'tr' 
          ? 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
          : 'An error occurred during the payment process. Please try again.'
      });
      setIsProcessing(false);
    }
  };

  // Modify the handleSubmit function to use the simulation page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepComplete()) {
      return;
    }
    
    if (currentStep === 1) {
      // Move to personal details step
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Open the payment simulation page
      processPayment();
    }
  };

  const getContinueButtonClass = () => {
    if (!isStepComplete()) {
      return `${buttonBgClass} ${buttonTextClass} cursor-not-allowed opacity-70`;
    } else {
      return isDark 
        ? 'bg-[#FF0000] hover:bg-[#FF3333] text-white' 
        : 'bg-[#E10600] hover:bg-[#E10600]/90 text-white';
    }
  };
  
  const getPaymentButtonClass = () => {
    if (!isStepComplete() || (currentStep === 2 && !acceptTerms)) {
      return `${buttonBgClass} ${buttonTextClass} cursor-not-allowed opacity-70`;
    } else {
      return 'bg-[#E10600] hover:bg-[#FF0000] text-white dark:bg-[#FF0000] dark:hover:bg-[#FF3333]';
    }
  };

  // Ödeme sonucunu kontrol etmek ve sepet bilgilerini korumak için useEffect
  useEffect(() => {
    // Sayfa yüklendiğinde localStorage'dan daha önce kaydedilmiş sepet bilgilerini al
    const storedCart = localStorage.getItem('pendingCart');
    if (storedCart) {
      try {
        const cartData = JSON.parse(storedCart);
        // Eğer sepet bilgileri eventiId ile eşleşiyorsa, sepeti geri yükle
        if (cartData.eventId === event.id) {
          setSelectedTickets(cartData.tickets || []);
          setFullName(cartData.fullName || '');
          setEmail(cartData.email || '');
          setPhone(cartData.phone || '');
          // Kişisel bilgiler doldurulmuşsa direkt 2. adıma geç
          if (cartData.fullName && cartData.email && cartData.phone) {
            setCurrentStep(2);
          }
        }
      } catch (error) {
        console.error('Error parsing stored cart data:', error);
      }
    }
    
    // Bileşen yüklendiğinde localStorage'dan ödeme sonucunu kontrol et
    const paymentResult = localStorage.getItem('paymentResult');
    if (paymentResult) {
      try {
        const result = JSON.parse(paymentResult);
        
        // Sonucun yeni olup olmadığını kontrol et (son 60 saniye içinde)
        const isRecent = Date.now() - result.timestamp < 60000; // 60 saniye
        
        if (isRecent && result.status === 'rejected') {
          // Ödeme reddedildi, hata mesajını formErrors'a ekle ama payment key'i altında
          // böylece UI'da doğru yerde gösterilir
          setFormErrors({
            ...formErrors,
            paymentError: locale === 'tr' 
              ? `Ödeme reddedildi. Sebep: ${result.reason || 'Belirtilmedi'}`
              : `Payment rejected. Reason: ${result.reason || 'Not specified'}`
          });
          
          // İşleme durumunu kapat
          setIsProcessing(false);
          
          // Adım 2'ye geç (kişisel bilgiler kısmı)
          setCurrentStep(2);
        }
        
        // Kullanılan ödeme sonucunu temizle - tek seferlik gösterim için
        localStorage.removeItem('paymentResult');
      } catch (error) {
        console.error('Error parsing payment result:', error);
      }
    }
  }, [event.id, formErrors, locale]);
  
  // Sepet bilgilerini kaydetmek için
  useEffect(() => {
    if (selectedTickets.length > 0) {
      // Sepetteki biletler ve kişisel bilgileri localStorage'a kaydet
      const cartData = {
        eventId: event.id,
        tickets: selectedTickets,
        fullName,
        email,
        phone,
        timestamp: Date.now()
      };
      localStorage.setItem('pendingCart', JSON.stringify(cartData));
    }
  }, [selectedTickets, fullName, email, phone, event.id]);

  return (
    <div 
      className={`rounded-lg border ${borderColorClass} p-3 shadow-lg ${bgColorClass} flex flex-col h-auto overflow-hidden
        ${isSticky ? 'lg:sticky lg:top-24 transition-all duration-300' : ''}`}
    >
      {/* Progress Steps - Reduced spacing for mobile */}
      {currentStep < 4 && (
        <div className="mb-2">
          <div className="flex justify-between items-center relative">
            {/* Show only 2 steps now - Tickets and Personal Details */}
            {[1, 2].map((step) => (
              <div 
                key={step}
                className="flex flex-col items-center relative z-10"
              >
                <div 
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 text-xs 
                    ${currentStep === step 
                      ? 'border-electric-blue bg-electric-blue/20 text-electric-blue' 
                      : currentStep > step 
                        ? 'border-neon-green bg-neon-green/20 text-neon-green'
                        : isDark 
                          ? 'border-carbon-grey bg-dark-grey text-silver'
                          : 'border-gray-300 bg-gray-100 text-gray-500'}`}
                >
                  {currentStep > step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 ${textColorClass}`}>
                  {step === 1 ? (locale === 'tr' ? 'Biletler' : 'Tickets') : 
                   (locale === 'tr' ? 'Bilgiler' : 'Details')}
                </span>
              </div>
            ))}
            
            {/* Progress line - Improved visibility in both light and dark mode */}
            <div className="absolute left-0 right-0 w-full">
              <div 
                className={`h-0.5 absolute top-2.5 left-[25%] right-[25%] w-1/2 ${currentStep >= 2 ? 'bg-neon-green' : isDark ? 'bg-carbon-grey' : 'bg-gray-300'}`}
                style={{zIndex: 0}}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Event header info - Reduced spacing for mobile */}
      <div className={`mb-2 border-b ${borderColorClass} pb-2`}>
        <h2 className={`text-base font-bold ${headingColorClass}`}>{event.title[locale]}</h2>
        <p className={`${textColorClass} text-xs flex items-center mt-0.5`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-neon-red" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {formatEventDate(event.date)}
        </p>
        <p className={`${textColorClass} text-xs flex items-center mt-0.5`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {event.location[locale]}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col h-auto">
        <div className="flex-grow">
          {currentStep === 1 && (
            <div className="step-select-tickets space-y-3">
              {/* Heading renk düzeltmesi */}
              <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
                {locale === 'tr' ? 'Bilet Seçin' : 'Select Tickets'}
              </h3>
              
              {/* Mobile optimized ticket display - horizontal row layout */}
              {ticketTypes.length > 0 ? (
                <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible">
                  {ticketTypes.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className={`flex flex-col justify-between p-2 ${cardBgClass} rounded-lg border ${borderColorClass} min-w-[120px] shrink-0 lg:flex-row lg:items-center lg:min-w-0 lg:shrink lg:p-3`}
                    >
                      <div className="mb-1.5 lg:mb-0">
                        <h4 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} text-xs truncate`}>{ticket.name}</h4>
                        {ticket.description && (
                          <p className={`text-[10px] ${textColorClass} truncate hidden lg:block`}>{ticket.description}</p>
                        )}
                        <p className="text-electric-blue font-bold mt-0.5 text-xs flex items-center">
                          {ticket.price === 0 ? (locale === 'tr' ? 'Ücretsiz' : 'Free') : (
                            <>
                              {ticket.price} <span className="ml-0.5">₺</span>
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between lg:justify-end lg:space-x-3">
                        <button 
                          type="button" 
                          className={`w-6 h-6 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-neon-red hover:text-white flex items-center justify-center transition-colors`}
                          onClick={() => updateTicketQuantity(ticket.id, 'decrease')}
                          aria-label={locale === 'tr' ? 'Azalt' : 'Decrease'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className={`min-w-6 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} text-xs`}>
                          {selectedTickets.find(t => t.id === ticket.id)?.quantity || 0}
                        </span>
                        
                        <button 
                          type="button" 
                          className={`w-6 h-6 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-electric-blue hover:text-white flex items-center justify-center transition-colors`}
                          onClick={() => updateTicketQuantity(ticket.id, 'increase')}
                          aria-label={locale === 'tr' ? 'Arttır' : 'Increase'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-3 rounded-lg border ${borderColorClass} ${cardBgClass} text-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`${textColorClass} text-xs mb-1`}>
                    {locale === 'tr' 
                      ? 'Biletler henüz satışa çıkmadı.' 
                      : 'Tickets are not available for sale yet.'}
                  </p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-[10px]`}>
                    {locale === 'tr' 
                      ? 'Lütfen daha sonra tekrar kontrol ediniz.' 
                      : 'Please check back later.'}
                  </p>
                </div>
              )}
              
              {Object.keys(formErrors).length > 0 && (
                <div className="text-neon-red text-xs mt-1">
                  {Object.values(formErrors).map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="step-details space-y-2">
              {/* Heading renk düzeltmesi */}
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
                {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Details'}
              </h3>
              
              {reservationStartTime && (
                <div className="flex items-center bg-neon-red/10 p-1.5 rounded-md text-xs text-neon-red">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <ReservationTimer 
                    startTime={reservationStartTime} 
                    duration={reservationDuration} 
                    onExpire={handleReservationExpire}
                    locale={locale}
                  />
                </div>
              )}
              
              {/* Personal Details Form - More compact for mobile */}
              <div className="space-y-2">
                <div>
                  <label htmlFor="fullName" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
                    {locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
                    {locale === 'tr' ? 'E-posta' : 'Email'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
                    {locale === 'tr' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
                
                {/* Terms acceptance checkbox */}
                <div className="flex items-start mt-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 mr-2"
                    required
                  />
                  <label htmlFor="acceptTerms" className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {locale === 'tr'
                      ? 'Ödeme yaparak, satın alma koşullarını ve gizlilik politikasını kabul etmiş oluyorum.'
                      : 'By making payment, I agree to the purchase terms and privacy policy.' 
                    }
                  </label>
                </div>
                
                {/* Ödeme hatası - gradyan arkaplan ve dikkat çekici tasarım ile */}
                {formErrors.paymentError && (
                  <div className="mt-2 animate-pulse-slow relative overflow-hidden">
                    {/* Üçgen uyarı ikon içeren gradyan arkaplan */}
                    <div className={`p-2 rounded-md shadow-md 
                      ${isDark ? 'bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80' : 'bg-gradient-to-r from-red-100 via-red-50 to-red-100'} 
                      border-l-4 ${isDark ? 'border-red-500' : 'border-red-500'}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg className={`h-3.5 w-3.5 ${isDark ? 'text-red-400' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-2">
                          <h3 className={`text-[10px] font-semibold ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                            {locale === 'tr' ? 'Ödeme Reddedildi' : 'Payment Rejected'}
                          </h3>
                          <p className={`text-[10px] ${isDark ? 'text-red-300/90' : 'text-red-700'}`}>
                            {formErrors.paymentError}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Yanıp sönen kenar efekti */}
                    <div className="absolute inset-0 rounded-md border border-red-500/50 animate-pulse pointer-events-none"></div>
                  </div>
                )}

                {/* Secure payment info */}
                <div className="text-center mt-2">
                  <p className="whitespace-nowrap text-[9px] inline-flex items-center justify-center flex-wrap">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {locale === 'tr' 
                        ? 'Ödeme işleminiz ' 
                        : 'Your payment is '
                    }
                    </span>
                    <span className="font-['Open_Sans'] font-bold text-blue-600 mx-1">Paynet</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {locale === 'tr' 
                        ? ' ile güvenle gerçekleştirilmektedir' 
                        : ' securely processed'
                      }
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="step-confirmation text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className={`text-lg font-bold ${headingColorClass}`}>
                {locale === 'tr' ? 'Ödeme Başarılı!' : 'Payment Successful!'}
              </h3>
              
              <p className={`${textColorClass} text-xs`}>
                {locale === 'tr' 
                  ? 'Biletleriniz e-posta adresinize gönderildi.' 
                  : 'Your tickets have been sent to your email address.'
                }
              </p>
              
              <div className={`p-3 ${cardBgClass} rounded-lg`}>
                <h4 className={`font-bold ${headingColorClass} mb-2 text-sm`}>
                  {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                </h4>
                
                <div className="space-y-1.5">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className={`flex justify-between ${textColorClass} text-xs`}>
                      <span>{`${ticket.quantity}x ${ticket.name}`}</span>
                      <span className="text-electric-blue flex items-center">
                        {ticket.price === 0 ? (locale === 'tr' ? 'Ücretsiz' : 'Free') : (
                          <>
                            {ticket.price * ticket.quantity} <span className="ml-1">₺</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  
                  <div className={`border-t ${borderColorClass} pt-1 flex justify-between font-bold ${headingColorClass} text-xs`}>
                    <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                    <span className="text-neon-green flex items-center">
                      {totalPrice} <span className="ml-1">₺</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 mt-2">
                <button 
                  onClick={handleDownloadTicket} 
                  className="w-full px-4 py-2 bg-electric-blue text-white rounded-md hover:opacity-90 transition-colors text-xs flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414L6.293 9.293z" clipRule="evenodd" />
                  </svg>
                  {locale === 'tr' ? 'Bileti İndir (PDF)' : 'Download Ticket (PDF)'}
                </button>
                
                <button 
                  onClick={handleAddToCalendar} 
                  className={`w-full px-4 py-2 ${buttonBgClass} ${buttonTextClass} rounded-md hover:opacity-90 transition-colors text-xs flex items-center justify-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {locale === 'tr' ? 'Takvime Ekle' : 'Add to Calendar'}
                </button>
              </div>

              {/* Add the "Continue to iterate?" option */}
              {showIterateOption && (
                <div className={`mt-4 border-t ${borderColorClass} pt-4`}>
                  <p className={`text-sm ${headingColorClass} mb-3`}>
                    {locale === 'tr' ? 'Başka bilet almak ister misiniz?' : 'Would you like to purchase another ticket?'}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleIteration(true)}
                      className="flex-1 px-4 py-2 bg-neon-green text-black dark:text-graphite font-medium rounded-md hover:opacity-90 transition-colors text-xs"
                    >
                      {locale === 'tr' ? 'Evet, devam et' : 'Yes, continue'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIteration(false)}
                      className={`flex-1 px-4 py-2 ${buttonBgClass} ${buttonTextClass} rounded-md hover:opacity-90 transition-colors text-xs`}
                    >
                      {locale === 'tr' ? 'Hayır, teşekkürler' : 'No, thank you'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Summary and actions - Reduced spacing for mobile */}
        {currentStep < 4 && (
          <div className={`mt-2.5 pt-2 border-t ${isDark ? 'border-gray-700/50' : borderColorClass}`}>
            {/* Order Summary - More compact for mobile */}
            {selectedTickets.length > 0 && (
              <div className="mb-2">
                <h4 className={`text-[10px] font-medium ${textColorClass} mb-1`}>
                  {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                </h4>
                
                <div className="space-y-0.5 mb-1 text-xs">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between">
                      <span className={textColorClass}>{ticket.quantity}x {ticket.name}</span>
                      <span className="text-electric-blue flex items-center">
                        {ticket.price === 0 ? (locale === 'tr' ? 'Ücretsiz' : 'Free') : (
                          <>
                            {ticket.price * ticket.quantity} <span className="ml-1">₺</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  
                  <div className={`border-t ${borderColorClass} pt-1 flex justify-between font-bold ${headingColorClass} text-xs`}>
                    <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                    <span className="text-neon-green flex items-center">
                      {totalPrice} <span className="ml-1">₺</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action buttons with better alignment and consistent coloring */}
            <div className="flex items-center justify-center mt-2">
              {currentStep > 1 ? (
                <div className="flex justify-center w-full">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`px-3 py-1 ${buttonBgClass} ${buttonTextClass} rounded hover:opacity-80 transition-colors text-xs font-medium border ${borderColorClass} mr-2`}
                  >
                    {locale === 'tr' ? 'Geri' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!isStepComplete() || isProcessing}
                    className={`px-3 py-1 rounded text-xs font-medium flex justify-center items-center transition-colors ${getPaymentButtonClass()}`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        {locale === 'tr' ? 'Siparişi Onayla' : 'Confirm Order'}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepComplete()}
                  className={`w-full px-3 py-1 rounded text-xs font-medium flex justify-center items-center transition-colors ${getContinueButtonClass()}`}
                >
                  {locale === 'tr' ? 'Devam Et' : 'Continue'}
                </button>
              )}
            </div>

            {formErrors.payment && (
              <div className="mt-2 bg-neon-red/10 border border-neon-red text-neon-red p-1.5 rounded-md text-xs">
                {formErrors.payment}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}