'use client';

import React, { useState } from 'react';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { formatCurrency } from '@/lib/utils';
import { AnalogueTimePicker24h } from './AnalogueTimePicker24h';

interface SimulatorBookingFormProps {
  onSuccess: (referenceNumber: string) => void;
  onError: (error: string) => void;
}

// Simulatör fiyatları (dakika başına)
const PRICE_PER_MINUTE = 20;
const MINIMUM_DURATION = 15; // dakika
const MAXIMUM_DURATION = 120; // dakika
const MAX_PARTICIPANTS = 5;

export default function SimulatorBookingForm({ onSuccess, onError }: SimulatorBookingFormProps) {
  const { language: locale, isDark } = useThemeLanguage();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form durumu
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState(30); // Varsayılan 30 dakika
  const [participants, setParticipants] = useState(1); // Varsayılan 1 kişi
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Kredi kartı durumu
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Tema bağımlı sınıflar
  const inputBgClass = isDark ? 'bg-graphite' : 'bg-white';
  const inputBorderClass = isDark ? 'border-carbon-grey focus:border-electric-blue' : 'border-gray-300 focus:border-electric-blue';
  const inputTextClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const labelClass = isDark ? 'text-silver' : 'text-slate-700';
  const buttonClass = isDark 
    ? 'bg-electric-blue hover:bg-electric-blue-dark text-white disabled:bg-carbon-grey'
    : 'bg-electric-blue hover:bg-electric-blue-dark text-white disabled:bg-gray-400';
  const secondaryButtonClass = isDark
    ? 'bg-carbon-grey hover:bg-dark-grey text-white'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-800';
  
  // Toplam fiyatı hesapla
  const calculateTotalPrice = () => {
    return duration * PRICE_PER_MINUTE * participants;
  };
  
  // Formu doğrula
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Tarih kontrolü
    if (!date) {
      newErrors.date = locale === 'tr' ? 'Lütfen bir tarih seçin' : 'Please select a date';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = locale === 'tr' ? 'Geçmiş bir tarih seçemezsiniz' : 'You cannot select a past date';
      }
    }
    
    // Saat kontrolü
    if (!startTime) {
      newErrors.startTime = locale === 'tr' ? 'Lütfen bir başlangıç saati seçin' : 'Please select a start time';
    }
    
    // İsim kontrolü
    if (!firstName.trim()) {
      newErrors.firstName = locale === 'tr' ? 'İsim gereklidir' : 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = locale === 'tr' ? 'Soyisim gereklidir' : 'Last name is required';
    }
    
    // E-posta kontrolü
    if (!email.trim()) {
      newErrors.email = locale === 'tr' ? 'E-posta adresi gereklidir' : 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = locale === 'tr' ? 'Geçerli bir e-posta adresi girin' : 'Please enter a valid email address';
    }
    
    // Telefon kontrolü
    if (!phone.trim()) {
      newErrors.phone = locale === 'tr' ? 'Telefon numarası gereklidir' : 'Phone number is required';
    }
    
    // Koşulları kabul etme kontrolü
    if (!acceptTerms) {
      newErrors.acceptTerms = locale === 'tr' ? 'Rezervasyon koşullarını kabul etmelisiniz' : 'You must accept the booking terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Kredi kartı formunu doğrula
  const validatePaymentForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Kart numarası kontrolü
    if (!cardNumber.trim() || cardNumber.replace(/\s+/g, '').length < 16) {
      newErrors.cardNumber = locale === 'tr' ? 'Geçerli bir kart numarası girin' : 'Please enter a valid card number';
    }
    
    // Kart sahibi adı kontrolü
    if (!cardName.trim()) {
      newErrors.cardName = locale === 'tr' ? 'Kart sahibinin adını girin' : 'Please enter the cardholder name';
    }
    
    // Son kullanma tarihi kontrolü
    if (!expiryDate.trim() || !expiryDate.includes('/')) {
      newErrors.expiryDate = locale === 'tr' ? 'Geçerli bir son kullanma tarihi girin (AA/YY)' : 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = locale === 'tr' ? 'Kartınızın süresi dolmuş' : 'Your card has expired';
      }
    }
    
    // CVV/CVC kontrolü
    if (!cvv.trim() || cvv.length < 3) {
      newErrors.cvv = locale === 'tr' ? 'Geçerli bir güvenlik kodu girin' : 'Please enter a valid security code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Kredi kartı numarasını formatla (4 haneli gruplar şeklinde)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Son kullanma tarihini formatla (AA/YY şeklinde)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return value;
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showPaymentForm) {
      // İlk adım: bilgileri doğrula
      if (validateForm()) {
        setShowPaymentForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // İkinci adım: ödeme bilgilerini doğrula ve gönder
      if (validatePaymentForm()) {
        try {
          setLoading(true);
          
          // Rezervasyon verilerini hazırla
          const bookingData = {
            bookingType: 'simulator',
            date: date?.toISOString(),
            startTime,
            duration,
            participants,
            guestName: `${firstName} ${lastName}`,
            guestEmail: email,
            guestPhone: phone,
            notes,
            totalPrice: calculateTotalPrice(),
            paymentStatus: 'COMPLETED', // Demo için
            paymentReference: `DEMO-${Date.now()}`
          };
          
          // API çağrısı
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
          });
          
          const data = await response.json();
          
          if (response.ok) {
            // Başarılı rezervasyon
            onSuccess(data.referenceNumber);
          } else {
            // API hatası
            onError(data.error || 'Rezervasyon kaydedilirken bir hata oluştu');
          }
        } catch (error) {
          // Bağlantı/sunucu hatası
          onError(locale === 'tr' ? 'Sunucuyla bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.' : 'Could not connect to the server. Please try again later.');
          console.error('Booking error:', error);
        } finally {
          setLoading(false);
        }
      }
    }
  };
  
  // Ödeme formundan geri dön
  const handleBack = () => {
    setShowPaymentForm(false);
  };
  
  // İlgili tarihleri oluştur (bugünden itibaren önümüzdeki 30 gün)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Yerel tarih formatı (gün/ay/yıl)
  const formatLocalDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US');
  };
  
  // Toplam fiyat
  const totalPrice = calculateTotalPrice();
  
  return (
    <form onSubmit={handleSubmit}>
      {!showPaymentForm ? (
        // Birinci adım: Rezervasyon bilgileri
        <div className="space-y-6">
          {/* Tarih ve saat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="booking-date" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Tarih' : 'Date'}<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="booking-date"
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.date ? 'border-red-500' : ''}`}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : null)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>
            
            <div>
              <label htmlFor="booking-time" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Saat' : 'Time'}<span className="text-red-500">*</span>
              </label>
              <AnalogueTimePicker24h
                onTimeSelect={setStartTime}
                className={`border ${errors.startTime ? 'border-red-500' : inputBorderClass} rounded-md ${inputBgClass}`}
              />
              {errors.startTime && <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>}
            </div>
          </div>
          
          {/* Süre ve katılımcı sayısı */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Süre (dakika)' : 'Duration (minutes)'}
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setDuration((prev) => Math.max(prev - 15, MINIMUM_DURATION))}
                  className={`p-2 rounded-l-md border ${inputBorderClass} ${inputBgClass}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => {
                    const value = Math.min(Math.max(parseInt(e.target.value) || MINIMUM_DURATION, MINIMUM_DURATION), MAXIMUM_DURATION);
                    setDuration(value);
                  }}
                  className={`w-full text-center ${inputBgClass} ${inputTextClass} border-t border-b ${inputBorderClass}`}
                  min={MINIMUM_DURATION}
                  max={MAXIMUM_DURATION}
                  step={15}
                />
                <button
                  type="button"
                  onClick={() => setDuration((prev) => Math.min(prev + 15, MAXIMUM_DURATION))}
                  className={`p-2 rounded-r-md border ${inputBorderClass} ${inputBgClass}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="participants" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Katılımcı Sayısı' : 'Number of Participants'}
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setParticipants((prev) => Math.max(prev - 1, 1))}
                  className={`p-2 rounded-l-md border ${inputBorderClass} ${inputBgClass}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  id="participants"
                  value={participants}
                  onChange={(e) => {
                    const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), MAX_PARTICIPANTS);
                    setParticipants(value);
                  }}
                  className={`w-full text-center ${inputBgClass} ${inputTextClass} border-t border-b ${inputBorderClass}`}
                  min={1}
                  max={MAX_PARTICIPANTS}
                />
                <button
                  type="button"
                  onClick={() => setParticipants((prev) => Math.min(prev + 1, MAX_PARTICIPANTS))}
                  className={`p-2 rounded-r-md border ${inputBorderClass} ${inputBgClass}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <hr className={isDark ? 'border-carbon-grey' : 'border-gray-200'} />
          
          {/* Kişisel bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="first-name" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Adınız' : 'First Name'}<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.firstName ? 'border-red-500' : ''}`}
                required
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
            </div>
            
            <div>
              <label htmlFor="last-name" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Soyadınız' : 'Last Name'}<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.lastName ? 'border-red-500' : ''}`}
                required
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'E-posta Adresiniz' : 'Email Address'}<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.email ? 'border-red-500' : ''}`}
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Telefon Numaranız' : 'Phone Number'}<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.phone ? 'border-red-500' : ''}`}
                required
              />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>
          
          {/* Notlar */}
          <div>
            <label htmlFor="notes" className={`block text-sm font-medium mb-2 ${labelClass}`}>
              {locale === 'tr' ? 'Notlar' : 'Notes'}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass}`}
              rows={3}
            ></textarea>
          </div>
          
          {/* Fiyat özeti */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-graphite' : 'bg-gray-50'}`}>
            <h3 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
              {locale === 'tr' ? 'Ücret Özeti' : 'Price Summary'}
            </h3>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Dakika Fiyatı' : 'Price per minute'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>
                  {formatCurrency(PRICE_PER_MINUTE, 'TRY', locale === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Süre' : 'Duration'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{duration} {locale === 'tr' ? 'dakika' : 'minutes'}</span>
              </div>
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Katılımcı Sayısı' : 'Number of participants'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{participants}</span>
              </div>
            </div>
            <div className="flex justify-between pt-2 border-t border-carbon-grey">
              <span className="font-medium">{locale === 'tr' ? 'Toplam' : 'Total'}</span>
              <span className="font-bold text-electric-blue">
                {formatCurrency(totalPrice, 'TRY', locale === 'tr' ? 'tr-TR' : 'en-US')}
              </span>
            </div>
          </div>
          
          {/* Koşulları kabul et */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="accept-terms" className={`ml-2 text-sm ${labelClass}`}>
              {locale === 'tr' 
                ? 'Rezervasyon koşullarını ve gizlilik politikasını okudum, onaylıyorum.' 
                : 'I have read and accept the booking terms and privacy policy.'}<span className="text-red-500">*</span>
            </label>
          </div>
          {errors.acceptTerms && <p className="mt-1 text-sm text-red-500">{errors.acceptTerms}</p>}
          
          {/* İleri butonu */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium ${buttonClass}`}
            >
              {locale === 'tr' ? 'Devam Et' : 'Continue'}
            </button>
          </div>
        </div>
      ) : (
        // İkinci adım: Ödeme bilgileri
        <div className="space-y-6">
          <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
            {locale === 'tr' ? 'Rezervasyon Özeti' : 'Booking Summary'}
          </h3>
          
          {/* Özet */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-graphite' : 'bg-gray-50'}`}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Tarih' : 'Date'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{date && formatLocalDate(date)}</span>
              </div>
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Saat' : 'Time'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{startTime}</span>
              </div>
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Süre' : 'Duration'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{duration} {locale === 'tr' ? 'dakika' : 'minutes'}</span>
              </div>
              <div className="flex justify-between">
                <span className={labelClass}>{locale === 'tr' ? 'Katılımcılar' : 'Participants'}</span>
                <span className={isDark ? 'text-white' : 'text-very-dark-grey'}>{participants}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-carbon-grey">
                <span className="font-medium">{locale === 'tr' ? 'Toplam Ücret' : 'Total Price'}</span>
                <span className="font-bold text-electric-blue">
                  {formatCurrency(totalPrice, 'TRY', locale === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
              </div>
            </div>
          </div>
          
          <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
            {locale === 'tr' ? 'Ödeme Bilgileri' : 'Payment Details'}
          </h3>
          
          {/* Kart bilgileri */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="card-number" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Kart Numarası' : 'Card Number'}
              </label>
              <input
                type="text"
                id="card-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19} // 16 rakam + 3 boşluk
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.cardNumber ? 'border-red-500' : ''}`}
                placeholder="0000 0000 0000 0000"
                required
              />
              {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
            </div>
            
            <div>
              <label htmlFor="card-name" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                {locale === 'tr' ? 'Kart Üzerindeki İsim' : 'Cardholder Name'}
              </label>
              <input
                type="text"
                id="card-name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.cardName ? 'border-red-500' : ''}`}
                required
              />
              {errors.cardName && <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="expiry-date" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {locale === 'tr' ? 'Son Kullanma Tarihi' : 'Expiry Date'}
                </label>
                <input
                  type="text"
                  id="expiry-date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength={5} // MM/YY
                  className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.expiryDate ? 'border-red-500' : ''}`}
                  placeholder="AA/YY"
                  required
                />
                {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
              </div>
              
              <div>
                <label htmlFor="cvv" className={`block text-sm font-medium mb-2 ${labelClass}`}>
                  {locale === 'tr' ? 'Güvenlik Kodu (CVV)' : 'Security Code (CVV)'}
                </label>
                <input
                  type="text"
                  id="cvv"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                  className={`w-full p-3 rounded-md border ${inputBgClass} ${inputTextClass} ${inputBorderClass} ${errors.cvv ? 'border-red-500' : ''}`}
                  required
                />
                {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>}
              </div>
            </div>
          </div>
          
          {/* Ödeme logolarını göster */}
          <div className="flex justify-center space-x-3 my-4">
            <img src="/images/payment/visa.svg" alt="Visa" className="h-8" />
            <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8" />
            <img src="/images/payment/iyzico-logo.png" alt="iyzico" className="h-8" />
            <img src="/images/payment/garanti-bbva-logo.png" alt="Garanti BBVA" className="h-8" />
          </div>
          
          {/* Butonlar */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className={`px-6 py-3 rounded-md font-medium ${secondaryButtonClass}`}
            >
              {locale === 'tr' ? 'Geri Dön' : 'Back'}
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-md font-medium ${buttonClass} flex items-center`}
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {locale === 'tr' ? `${formatCurrency(totalPrice, 'TRY')} - Ödeme Yap` : `${formatCurrency(totalPrice, 'TRY')} - Pay Now`}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}