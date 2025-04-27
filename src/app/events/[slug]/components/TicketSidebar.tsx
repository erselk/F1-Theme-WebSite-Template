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
        maxPerOrder: ticket.maxPerOrder || 5,
        availableCount: ticket.availableCount || 100,
        variant: ticket.variant || 'standard'
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
    
    // Find if this ticket is already in selected tickets
    const existingTicketIndex = selectedTickets.findIndex(t => t.id === id);
    
    if (existingTicketIndex >= 0) {
      // Ticket exists in selection
      const updatedSelectedTickets = [...selectedTickets];
      const currentQuantity = updatedSelectedTickets[existingTicketIndex].quantity;
      
      if (action === 'increase') {
        // Check if we've reached the maximum per order
        if (ticketType.maxPerOrder && currentQuantity >= ticketType.maxPerOrder) {
          setFormErrors({
            ...formErrors,
            [id]: locale === 'tr' 
              ? `Bir siparişte maksimum ${ticketType.maxPerOrder} adet seçebilirsiniz.`
              : `You can select maximum ${ticketType.maxPerOrder} per order.`
          });
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
      // Add new ticket to selection
      setSelectedTickets([
        ...selectedTickets,
        {
          id: ticketType.id,
          name: ticketType.name,
          quantity: 1,
          price: ticketType.price,
          variant: ticketType.variant
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
  
  // Modify to skip step 3 (payment details) and go directly to payment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepComplete()) {
      return;
    }
    
    if (currentStep === 1) {
      // Move to personal details step
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Process payment directly with iyzico
      redirectToIyzicoPayment();
    }
  };

  // New function to redirect to iyzico payment
  const redirectToIyzicoPayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call your backend API to create a payment session
      // Mock a successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is where you'd redirect to iyzico or show their embedded payment form
      alert(locale === 'tr' 
        ? 'Bu işlem normalde sizi iyzico güvenli ödeme sayfasına yönlendirecektir.' 
        : 'This would normally redirect you to the iyzico secure payment page.' 
      );
      
      // For demo purposes, simulate successful payment
      setCurrentStep(4); // Success step
      setShowIterateOption(true); // Show the iterate option after successful payment
    } catch (error) {
      console.error('Payment redirect error:', error);
      setFormErrors({
        ...formErrors,
        payment: locale === 'tr' 
          ? 'Ödeme yönlendirmesi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
          : 'An error occurred during payment redirection. Please try again.'
      });
    } finally {
      setIsProcessing(false);
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

  return (
    <div 
      className={`rounded-lg border ${borderColorClass} p-4 shadow-lg ${bgColorClass} flex flex-col h-auto overflow-hidden
        ${isSticky ? 'lg:sticky lg:top-24 transition-all duration-300' : ''}`}
    >
      {/* Progress Steps */}
      {currentStep < 4 && (
        <div className="mb-3">
          <div className="flex justify-between items-center relative">
            {/* Show only 2 steps now - Tickets and Personal Details */}
            {[1, 2].map((step) => (
              <div 
                key={step}
                className="flex flex-col items-center relative z-10"
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs 
                    ${currentStep === step 
                      ? 'border-electric-blue bg-electric-blue/20 text-electric-blue' 
                      : currentStep > step 
                        ? 'border-neon-green bg-neon-green/20 text-neon-green'
                        : isDark 
                          ? 'border-carbon-grey bg-dark-grey text-silver'
                          : 'border-gray-300 bg-gray-100 text-gray-500'}`}
                >
                  {currentStep > step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
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
                className={`h-0.5 absolute top-3 left-[25%] right-[25%] w-1/2 ${currentStep >= 2 ? 'bg-neon-green' : isDark ? 'bg-carbon-grey' : 'bg-gray-300'}`}
                style={{zIndex: 0}}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Event header info */}
      <div className={`mb-2 border-b ${borderColorClass} pb-2`}>
        <h2 className={`text-lg font-bold ${headingColorClass}`}>{event.title[locale]}</h2>
        <p className={`${textColorClass} text-xs flex items-center mt-0.5`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-neon-red" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {new Date(event.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
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
            <div className="step-select-tickets space-y-4">
              {/* Heading renk düzeltmesi */}
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
                {locale === 'tr' ? 'Bilet Seçin' : 'Select Tickets'}
              </h3>
              
              {ticketTypes.length > 0 ? (
                <>
                  {ticketTypes.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 ${cardBgClass} rounded-lg border ${borderColorClass}`}
                    >
                      <div className="mb-2 sm:mb-0">
                        <h4 className={`font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} text-sm`}>{ticket.name}</h4>
                        {ticket.description && (
                          <p className={`text-xs ${textColorClass}`}>{ticket.description}</p>
                        )}
                        <p className="text-electric-blue font-bold mt-1 text-sm flex items-center">
                          {ticket.price} <span className="ml-1">₺</span>
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          type="button" 
                          className={`w-7 h-7 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-neon-red hover:text-white flex items-center justify-center transition-colors`}
                          onClick={() => updateTicketQuantity(ticket.id, 'decrease')}
                          aria-label={locale === 'tr' ? 'Azalt' : 'Decrease'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <span className={`min-w-6 text-center ${isDark ? 'text-gray-100' : 'text-gray-900'} text-sm`}>
                          {selectedTickets.find(t => t.id === ticket.id)?.quantity || 0}
                        </span>
                        
                        <button 
                          type="button" 
                          className={`w-7 h-7 rounded-full ${buttonBgClass} ${headingColorClass} hover:bg-electric-blue hover:text-white flex items-center justify-center transition-colors`}
                          onClick={() => updateTicketQuantity(ticket.id, 'increase')}
                          aria-label={locale === 'tr' ? 'Arttır' : 'Increase'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className={`p-4 rounded-lg border ${borderColorClass} ${cardBgClass} text-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`${textColorClass} text-sm mb-1`}>
                    {locale === 'tr' 
                      ? 'Biletler henüz satışa çıkmadı.' 
                      : 'Tickets are not available for sale yet.'}
                  </p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                    {locale === 'tr' 
                      ? 'Lütfen daha sonra tekrar kontrol ediniz.' 
                      : 'Please check back later.'}
                  </p>
                </div>
              )}
              
              {Object.keys(formErrors).length > 0 && (
                <div className="text-neon-red text-xs mt-2">
                  {Object.values(formErrors).map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="step-details space-y-3">
              {/* Heading renk düzeltmesi */}
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
                {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Details'}
              </h3>
              
              {reservationStartTime && (
                <div className="flex items-center bg-neon-red/10 p-2 rounded-md text-xs text-neon-red mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="fullName" className={`block text-xs font-medium ${textColorClass} mb-1`}>
                    {locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full px-3 py-1.5 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className={`block text-xs font-medium ${textColorClass} mb-1`}>
                    {locale === 'tr' ? 'E-posta' : 'Email'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-1.5 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className={`block text-xs font-medium ${textColorClass} mb-1`}>
                    {locale === 'tr' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3 py-1.5 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
                    required
                  />
                </div>
              </div>
              
              {/* Seat selection if required */}
              {requiresSeatSelection && (
                <div className="mt-4">
                  <h4 className={`font-medium ${headingColorClass} text-xs mb-2`}>
                    {locale === 'tr' ? 'Koltuk Seçimi' : 'Seat Selection'}
                  </h4>
                  <SeatSelector 
                    event={event} 
                    selectedTickets={selectedTickets} 
                    locale={locale}
                  />
                </div>
              )}

              {/* Terms acceptance checkbox */}
              <div className="flex items-start mt-4">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="acceptTerms" className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {locale === 'tr'
                    ? 'Ödeme yaparak, satın alma koşullarını ve gizlilik politikasını kabul etmiş oluyorum.'
                    : 'By making payment, I agree to the purchase terms and privacy policy.' 
                  }
                </label>
              </div>
              
              {/* İyzico bilgisi - tek satırda */}
              <div className="text-center mt-4">
                <p className="whitespace-nowrap text-[10px] inline-flex items-center justify-center flex-wrap">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {locale === 'tr' ? 'Ödeme işleminiz ' : 'Your payment is ' }
                  </span>
                  <span className="font-extrabold text-[#1E64FF] mx-1">iyzico</span>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    {locale === 'tr' ? ' tarafından güvenle gerçekleştirilmektedir' : ' securely processed'}
                  </span>
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="step-confirmation text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className={`text-xl font-bold ${headingColorClass}`}>
                {locale === 'tr' ? 'Ödeme Başarılı!' : 'Payment Successful!'}
              </h3>
              
              <p className={`${textColorClass} text-sm`}>
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
                        {ticket.price * ticket.quantity} <span className="ml-1">₺</span>
                      </span>
                    </div>
                  ))}
                  
                  <div className={`border-t ${borderColorClass} pt-1.5 flex justify-between font-bold ${headingColorClass} text-xs`}>
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
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
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
        
        {/* Summary and actions */}
        {currentStep < 4 && (
          <div className={`mt-3 pt-2 border-t ${isDark ? 'border-gray-700/50' : borderColorClass}`}>
            {/* Order Summary */}
            {selectedTickets.length > 0 && (
              <div className="mb-2.5">
                <h4 className={`text-[10px] font-medium ${textColorClass} mb-1.5`}>
                  {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                </h4>
                
                <div className="space-y-0.5 mb-1.5 text-xs">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between">
                      <span className={textColorClass}>{ticket.quantity}x {ticket.name}</span>
                      <span className="text-electric-blue flex items-center">
                        {ticket.price * ticket.quantity} <span className="ml-1">₺</span>
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className={`flex justify-between ${headingColorClass} font-bold text-xs`}>
                  <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                  <span className="text-neon-green flex items-center">
                    {totalPrice} <span className="ml-1">₺</span>
                  </span>
                </div>
              </div>
            )}
            
            {/* Action buttons with better alignment and consistent coloring */}
            <div className="flex items-center justify-center mt-2.5">
              {currentStep > 1 ? (
                <div className="flex justify-center w-full">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`px-3 py-1.5 ${buttonBgClass} ${buttonTextClass} rounded hover:opacity-80 transition-colors text-xs font-medium border ${borderColorClass} mr-2`}
                  >
                    {locale === 'tr' ? 'Geri' : 'Back'}
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!isStepComplete() || isProcessing}
                    className={`px-3 py-1.5 rounded text-xs font-medium flex justify-center items-center transition-colors ${getPaymentButtonClass()}`}
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
                        {locale === 'tr' ? 'Ödemeye Geç' : 'Proceed to Payment'}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepComplete()}
                  className={`w-full px-3 py-1.5 rounded text-xs font-medium flex justify-center items-center transition-colors ${getContinueButtonClass()}`}
                >
                  {locale === 'tr' ? 'Devam Et' : 'Continue'}
                </button>
              )}
            </div>

            {formErrors.payment && (
              <div className="mt-2 bg-neon-red/10 border border-neon-red text-neon-red p-2 rounded-md text-xs">
                {formErrors.payment}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}