'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/types';
import Link from 'next/link';
import { ReservationTimer } from './ReservationTimer';
import { SeatSelector } from './SeatSelector';
import { LanguageType } from '@/lib/ThemeLanguageContext';
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

export function TicketSidebar({ event, locale }: TicketSidebarProps) {
  // Step of the checkout process
  // 1: Select tickets, 2: Add details, 3: Payment, 4: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Sample ticket types (in real app, this would come from the backend)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: 'standard',
      name: locale === 'tr' ? 'Standart Bilet' : 'Standard Ticket',
      price: event.price || 250,
      maxPerOrder: 5,
      availableCount: 150,
      variant: 'standard'
    },
    {
      id: 'premium',
      name: locale === 'tr' ? 'Premium Bilet' : 'Premium Ticket',
      price: (event.price || 250) * 1.5,
      description: locale === 'tr' ? 'Özel alan erişimi dahil' : 'Includes special area access',
      maxPerOrder: 3,
      availableCount: 50,
      variant: 'premium'
    },
    {
      id: 'vip',
      name: locale === 'tr' ? 'VIP Bilet' : 'VIP Ticket',
      price: (event.price || 250) * 2.5,
      description: locale === 'tr' ? 'Sınırsız ikramlar ve özel alan erişimi' : 'Unlimited refreshments and special area access',
      maxPerOrder: 2,
      availableCount: 20,
      variant: 'vip'
    }
  ]);
  
  // Selected ticket quantities
  const [selectedTickets, setSelectedTickets] = useState<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    variant?: string;
  }[]>([]);
  
  // Reservation details
  const [reservationStartTime, setReservationStartTime] = useState<Date | null>(null);
  const [reservationDuration] = useState<number>(10); // minutes
  
  // Customer details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardType, setCardType] = useState('');
  
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
        return fullName && email && phone;
      case 3:
        return cardNumber && cardName && expiryMonth && expiryYear && cvc && acceptTerms;
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
  
  // Handle card type detection based on first digits
  const detectCardType = (number: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    
    if (/^4/.test(cleanNumber)) {
      return 'visa';
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return 'mastercard';
    } else if (/^3[47]/.test(cleanNumber)) {
      return 'amex';
    } else if (/^6(?:011|5)/.test(cleanNumber)) {
      return 'discover';
    }
    
    return '';
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    if (!value) return '';
    
    const cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const cardType = detectCardType(cleanValue);
    setCardType(cardType);
    
    if (cardType === 'amex') {
      // Format: XXXX XXXXXX XXXXX
      const parts = [];
      if (cleanValue.length > 0) parts.push(cleanValue.slice(0, 4));
      if (cleanValue.length > 4) parts.push(cleanValue.slice(4, 10));
      if (cleanValue.length > 10) parts.push(cleanValue.slice(10, 15));
      return parts.join(' ');
    } else {
      // Format: XXXX XXXX XXXX XXXX
      const parts = [];
      for (let i = 0; i < cleanValue.length; i += 4) {
        parts.push(cleanValue.slice(i, i + 4));
      }
      return parts.join(' ');
    }
  };
  
  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
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
  
  // Submit payment using Iyzico
  const submitPayment = async () => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call your backend API
      // which would then interact with Iyzico's APIs
      
      // Mock API call with success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This is where you'd actually call the Iyzico payment API
      // using the sandbox credentials
      /*
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s+/g, ''),
          cardHolderName: cardName,
          expiryMonth,
          expiryYear,
          cvc,
          amount: totalPrice,
          currency: 'TRY',
          eventId: event.id,
          tickets: selectedTickets,
          customer: {
            name: fullName,
            email,
            phone
          }
        })
      });
      
      const data = await response.json();
      */
      
      // Move to confirmation step
      setCurrentStep(4);
    } catch (error) {
      console.error('Payment error:', error);
      
      setFormErrors({
        ...formErrors,
        payment: locale === 'tr' 
          ? 'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.'
          : 'An error occurred during payment processing. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isStepComplete()) {
      return;
    }
    
    if (currentStep < 3) {
      // Move to next step
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Process payment
      submitPayment();
    }
  };
  
  // Render different content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-select-tickets space-y-4">
            <h3 className="text-xl font-bold text-white">
              {locale === 'tr' ? 'Bilet Seçin' : 'Select Tickets'}
            </h3>
            
            {ticketTypes.map((ticket) => (
              <div 
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dark-grey rounded-lg border border-carbon-grey"
              >
                <div className="mb-3 sm:mb-0">
                  <h4 className="font-bold text-white">{ticket.name}</h4>
                  {ticket.description && (
                    <p className="text-sm text-silver">{ticket.description}</p>
                  )}
                  <p className="text-electric-blue font-bold mt-1">
                    {locale === 'tr' 
                      ? `${ticket.price} ₺`
                      : `${ticket.price} TRY`
                    }
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button 
                    type="button" 
                    className="w-8 h-8 rounded-full bg-carbon-grey text-white hover:bg-neon-red flex items-center justify-center transition-colors"
                    onClick={() => updateTicketQuantity(ticket.id, 'decrease')}
                    aria-label={locale === 'tr' ? 'Azalt' : 'Decrease'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <span className="min-w-6 text-center text-white">
                    {selectedTickets.find(t => t.id === ticket.id)?.quantity || 0}
                  </span>
                  
                  <button 
                    type="button" 
                    className="w-8 h-8 rounded-full bg-carbon-grey text-white hover:bg-electric-blue flex items-center justify-center transition-colors"
                    onClick={() => updateTicketQuantity(ticket.id, 'increase')}
                    aria-label={locale === 'tr' ? 'Arttır' : 'Increase'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            
            {Object.keys(formErrors).length > 0 && (
              <div className="text-neon-red text-sm mt-2">
                {Object.values(formErrors).map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-sm text-silver mb-1">
                {locale === 'tr' ? 'Not:' : 'Note:'}
              </p>
              <p className="text-xs text-silver">
                {locale === 'tr' 
                  ? 'Seçilen biletler 10 dakika boyunca rezerve edilir. Bu süre içinde satın alınmazlarsa otomatik olarak iptal edilecektir.'
                  : 'Selected tickets are reserved for 10 minutes. If not purchased within this time, they will be automatically canceled.'
                }
              </p>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="step-details space-y-4">
            <h3 className="text-xl font-bold text-white">
              {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Details'}
            </h3>
            
            {reservationStartTime && (
              <ReservationTimer 
                startTime={reservationStartTime} 
                duration={reservationDuration} 
                onExpire={handleReservationExpire}
                locale={locale}
                className="text-sm text-neon-red bg-neon-red/10 p-2 rounded-md flex items-center mb-4"
              />
            )}
            
            <div className="space-y-3">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-silver mb-1">
                  {locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-silver mb-1">
                  {locale === 'tr' ? 'E-posta' : 'Email'}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-silver mb-1">
                  {locale === 'tr' ? 'Telefon' : 'Phone'}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                  required
                />
              </div>
            </div>
            
            {/* Seat selection if required */}
            {requiresSeatSelection && (
              <div className="mt-6">
                <h4 className="font-medium text-white mb-2">
                  {locale === 'tr' ? 'Koltuk Seçimi' : 'Seat Selection'}
                </h4>
                
                <SeatSelector 
                  event={event} 
                  selectedTickets={selectedTickets} 
                  locale={locale}
                />
              </div>
            )}
          </div>
        );
        
      case 3:
        return (
          <div className="step-payment space-y-4">
            <h3 className="text-xl font-bold text-white">
              {locale === 'tr' ? 'Ödeme Bilgileri' : 'Payment Details'}
            </h3>
            
            {reservationStartTime && (
              <ReservationTimer 
                startTime={reservationStartTime} 
                duration={reservationDuration} 
                onExpire={handleReservationExpire}
                locale={locale}
                className="text-sm text-neon-red bg-neon-red/10 p-2 rounded-md flex items-center mb-4"
              />
            )}
            
            <div className="space-y-3">
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-silver mb-1">
                  {locale === 'tr' ? 'Kart Üzerindeki İsim' : 'Name on Card'}
                </label>
                <input
                  type="text"
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-silver mb-1">
                  {locale === 'tr' ? 'Kart Numarası' : 'Card Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white pr-10"
                    maxLength={19}
                    required
                    placeholder="XXXX XXXX XXXX XXXX"
                  />
                  {cardType && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Image 
                        src={`/images/payment/${cardType}.svg`} 
                        alt={cardType} 
                        width={32} 
                        height={20} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-silver mb-1">
                    {locale === 'tr' ? 'Son Kullanma Tarihi' : 'Expiry Date'}
                  </label>
                  <div className="flex space-x-2">
                    <select
                      id="expiryMonth"
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                      required
                    >
                      <option value="">{locale === 'tr' ? 'Ay' : 'Month'}</option>
                      {Array.from({length: 12}, (_, i) => {
                        const month = (i + 1).toString().padStart(2, '0');
                        return (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        );
                      })}
                    </select>
                    
                    <select
                      id="expiryYear"
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(e.target.value)}
                      className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                      required
                    >
                      <option value="">{locale === 'tr' ? 'Yıl' : 'Year'}</option>
                      {Array.from({length: 10}, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <option key={year} value={year.slice(-2)}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium text-silver mb-1">
                    {locale === 'tr' ? 'Güvenlik Kodu' : 'Security Code'}
                  </label>
                  <input
                    type="text"
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full px-3 py-2 bg-dark-grey border border-carbon-grey rounded-md focus:outline-none focus:border-electric-blue text-white"
                    maxLength={4}
                    required
                    placeholder={cardType === 'amex' ? 'XXXX' : 'XXX'}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <img 
                src="/images/iyzico-logo.png" 
                alt="iyzico" 
                className="h-4 mx-auto mb-1"
              />
              <p className="text-xs text-silver">
                {locale === 'tr' 
                  ? 'Ödeme işleminiz iyzico tarafından güvenle gerçekleştirilmektedir.' 
                  : 'Your payment is securely processed by iyzico.'
                }
              </p>
            </div>
            
            <div className="flex items-start mt-4">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="acceptTerms" className="text-sm text-silver">
                {locale === 'tr'
                  ? 'Ödeme yaparak, satın alma koşullarını ve gizlilik politikasını kabul etmiş oluyorum.'
                  : 'By making payment, I agree to the purchase terms and privacy policy.'
                }
              </label>
            </div>
            
            {formErrors.payment && (
              <div className="bg-neon-red/10 border border-neon-red text-neon-red p-3 rounded-md text-sm mt-4">
                {formErrors.payment}
              </div>
            )}
          </div>
        );
        
      case 4:
        return (
          <div className="step-confirmation text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white">
              {locale === 'tr' ? 'Ödeme Başarılı!' : 'Payment Successful!'}
            </h3>
            
            <p className="text-light-grey">
              {locale === 'tr' 
                ? 'Biletleriniz e-posta adresinize gönderildi.' 
                : 'Your tickets have been sent to your email address.'
              }
            </p>
            
            <div className="p-4 bg-dark-grey rounded-lg">
              <h4 className="font-bold text-white mb-2">
                {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
              </h4>
              
              <div className="space-y-2">
                {selectedTickets.map((ticket) => (
                  <div key={ticket.id} className="flex justify-between text-silver">
                    <span>{`${ticket.quantity}x ${ticket.name}`}</span>
                    <span>
                      {locale === 'tr' 
                        ? `${ticket.price * ticket.quantity} ₺`
                        : `${ticket.price * ticket.quantity} TRY`
                      }
                    </span>
                  </div>
                ))}
                
                <div className="border-t border-carbon-grey pt-2 flex justify-between font-bold text-white">
                  <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                  <span>
                    {locale === 'tr' 
                      ? `${totalPrice} ₺`
                      : `${totalPrice} TRY`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <Link href="/account/tickets" className="inline-block mt-4 px-6 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/90 transition-colors">
              {locale === 'tr' ? 'Biletlerimi Görüntüle' : 'View My Tickets'}
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="sticky top-20 bg-graphite rounded-lg border border-carbon-grey p-5 shadow-lg">
      {/* Progress Steps */}
      {currentStep < 4 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className="flex flex-col items-center"
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm 
                    ${currentStep === step 
                      ? 'border-electric-blue bg-electric-blue/20 text-electric-blue' 
                      : currentStep > step 
                        ? 'border-neon-green bg-neon-green/20 text-neon-green'
                        : 'border-carbon-grey bg-dark-grey text-silver'}`}
                >
                  {currentStep > step ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <span className="text-xs mt-1 text-silver">
                  {step === 1 ? (locale === 'tr' ? 'Biletler' : 'Tickets') : 
                   step === 2 ? (locale === 'tr' ? 'Detaylar' : 'Details') : 
                   (locale === 'tr' ? 'Ödeme' : 'Payment')}
                </span>
              </div>
            ))}
            
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-4 w-full h-0.5 px-10 flex">
              <div 
                className="h-full bg-carbon-grey w-1/3 mx-5"
                style={{ backgroundColor: currentStep >= 2 ? 'var(--neon-green)' : 'var(--carbon-grey)' }}
              ></div>
              <div 
                className="h-full bg-carbon-grey w-1/3 mx-5"
                style={{ backgroundColor: currentStep >= 3 ? 'var(--neon-green)' : 'var(--carbon-grey)' }}
              ></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Event header info */}
      <div className="mb-6 border-b border-carbon-grey pb-4">
        <h2 className="text-2xl font-bold text-white">{event.title[locale]}</h2>
        <p className="text-silver flex items-center mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
        <p className="text-silver flex items-center mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          {event.location[locale]}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="min-h-64">
          {renderStepContent()}
        </div>
        
        {/* Summary and actions */}
        {currentStep < 4 && (
          <div className="mt-6 pt-4 border-t border-carbon-grey">
            {/* Order Summary */}
            {selectedTickets.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-silver mb-2">
                  {locale === 'tr' ? 'Sipariş Özeti' : 'Order Summary'}
                </h4>
                
                <div className="space-y-1 mb-2">
                  {selectedTickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between text-sm">
                      <span className="text-light-grey">{ticket.quantity}x {ticket.name}</span>
                      <span className="text-light-grey">
                        {locale === 'tr' 
                          ? `${ticket.price * ticket.quantity} ₺`
                          : `${ticket.price * ticket.quantity} TRY`
                        }
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between text-white font-bold">
                  <span>{locale === 'tr' ? 'Toplam' : 'Total'}</span>
                  <span className="text-electric-blue">
                    {locale === 'tr' 
                      ? `${totalPrice} ₺`
                      : `${totalPrice} TRY`
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-4 py-2 border border-carbon-grey text-light-grey rounded-md hover:bg-dark-grey transition-colors flex-1"
                >
                  {locale === 'tr' ? 'Geri' : 'Back'}
                </button>
              )}
              
              <button
                type="submit"
                disabled={!isStepComplete() || isProcessing}
                className={`px-4 py-2 rounded-md text-white flex-1 flex justify-center items-center ${
                  isStepComplete() && !isProcessing
                    ? 'bg-neon-red hover:bg-neon-red/90' 
                    : 'bg-carbon-grey cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
                  </>
                ) : currentStep === 3 ? (
                  locale === 'tr' ? 'Ödeme Yap' : 'Make Payment'
                ) : (
                  locale === 'tr' ? 'Devam Et' : 'Continue'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}