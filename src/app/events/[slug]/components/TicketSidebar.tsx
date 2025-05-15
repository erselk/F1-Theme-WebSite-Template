'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import {
  ProgressSteps,
  EventHeader,
  TicketSelection,
  PersonalDetails,
  OrderSummary,
  ActionButtons
} from './TicketSidebar/index';

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
  variant?: 'standard' | 'premium' | 'vip';
  isSoldOut?: boolean;
  isComingSoon?: boolean;
  originalName?: any;
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
        maxPerOrder: ticket.maxPerOrder || 5, // Always limit to 5 tickets per order
        variant: ticket.variant || 'standard',
        originalName: ticket.name, // Tüm dil versiyonlarını sakla
        isSoldOut: ticket.isSoldOut || false,
        isComingSoon: ticket.isComingSoon || false
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
  const isStepComplete = (): boolean => {
    switch (currentStep) {
      case 1:
        return selectedTickets.some(ticket => ticket.quantity > 0);
      case 2:
        return Boolean(fullName && email && phone && acceptTerms);
      default:
        return false;
    }
  };
  
  // Handle ticket quantity changes
  const updateTicketQuantity = (id: string, action: 'increase' | 'decrease') => {
    // Find the current ticket type
    const ticketType = ticketTypes.find(t => t.id === id);
    if (!ticketType) return;
    
    // Eğer bilet tükendiyse veya yakında durumundaysa, satın alıma izin verme
    if (ticketType.isSoldOut || ticketType.isComingSoon) {
      // Hata mesajı gösteriyoruz
      setFormErrors({
        ...formErrors,
        [id]: locale === 'tr'
          ? ticketType.isSoldOut ? 'Bu bilet tükenmiştir.' : 'Bu bilet yakında satışa çıkacaktır.'
          : ticketType.isSoldOut ? 'This ticket is sold out.' : 'This ticket is coming soon.'
      });
      return;
    }
    
    // Sadece maxPerOrder ile sınırlama yapacağız
    const purchaseLimit = ticketType.maxPerOrder || 5; // Default to 5 if maxPerOrder is not defined
    
    // Find if this ticket is already in selected tickets
    const existingTicketIndex = selectedTickets.findIndex(t => t.id === id);
    
    if (existingTicketIndex >= 0) {
      // Ticket exists in selection
      const updatedSelectedTickets = [...selectedTickets];
      const currentQuantity = updatedSelectedTickets[existingTicketIndex].quantity;
      
      if (action === 'increase') {
        // Check if we've reached the purchase limit
        if (currentQuantity >= purchaseLimit) {
          // Limited by maxPerOrder
          setFormErrors({
            ...formErrors,
            [id]: locale === 'tr'
              ? `Bir siparişte en fazla ${purchaseLimit} adet bilet satın alabilirsiniz.`
              : `You can purchase maximum ${purchaseLimit} tickets in a single order.`
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
      const formattedSchedule: { tr: string[], en: string[] } = {
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
        eventId: event.id, // Add the event ID to make it easier to check on return
        eventSlug: event.slug // <<<--- EKLENEN SATIR: Gerçek event slug'ını ekle
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
      {/* Progress Steps */}
      {currentStep < 4 && (
        <ProgressSteps 
          currentStep={currentStep} 
          locale={locale} 
        />
      )}
      
      {/* Event header info */}
      <EventHeader 
        event={event} 
        locale={locale} 
      />
      
      <form onSubmit={handleSubmit} className="flex flex-col h-auto">
        <div className="flex-grow">
          {currentStep === 1 && (
            <TicketSelection 
              ticketTypes={ticketTypes}
              selectedTickets={selectedTickets}
              formErrors={formErrors}
              updateTicketQuantity={updateTicketQuantity}
              locale={locale}
            />
          )}
          
          {currentStep === 2 && (
            <PersonalDetails 
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              acceptTerms={acceptTerms}
              setAcceptTerms={setAcceptTerms}
              formErrors={formErrors}
              locale={locale}
            />
          )}
        </div>
        
        {/* Summary and actions */}
        {currentStep < 4 && (
          <div className={`mt-2.5 pt-2 border-t ${isDark ? 'border-gray-700/50' : borderColorClass}`}>
            {/* Order Summary */}
            {selectedTickets.length > 0 && (
              <OrderSummary
                selectedTickets={selectedTickets}
                totalPrice={totalPrice}
                locale={locale}
              />
            )}
            
            {/* Action buttons */}
            <ActionButtons
              currentStep={currentStep}
              isStepComplete={isStepComplete}
              isProcessing={isProcessing}
              goBack={goBack}
              formErrors={formErrors}
              locale={locale}
            />
          </div>
        )}
      </form>
    </div>
  );
}