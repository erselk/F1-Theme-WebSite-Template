'use client';

import type { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React, { useEffect, useState } from 'react';
import { format, addDays, setHours, setMinutes, parseISO } from 'date-fns';

interface BasicInfoSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dateInputValue: string;
  setDateInputValue: React.Dispatch<React.SetStateAction<string>>;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
}

export default function BasicInfoSection({
  formData,
  formLanguage,
  onInputChange,
  onNumberChange,
  onCheckboxChange,
  dateInputValue,
  setDateInputValue,
  isDark,
  validationErrors,
  showValidationErrors
}: BasicInfoSectionProps) {
  // Tarih değişikliğinin takibi için yerel state
  const [dateInitialized, setDateInitialized] = useState(false);
  
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };

  const ErrorMessage = ({ show }: { show: boolean }) => (
    show ? <p className="mt-1 text-xs text-f1-red">{formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}</p> : null
  );

  // Sabit varsayılan tarih ve saat değeri yerine date-fns kullanarak dinamik tarih oluştur
  useEffect(() => {
    // Sadece bir kez çalıştığından emin olmak için
    if (dateInitialized) return;
    
    // İçeri giren değer boş mu kontrol et
    if (dateInputValue) {
      setDateInitialized(true);
      return;
    }

    try {
      // Date-fns kullanarak bugün için saat 21:00'i için tarih oluştur
      const today = new Date();
      const defaultTime = setMinutes(setHours(today, 21), 0);
      const defaultDate = format(defaultTime, "yyyy-MM-dd'T'HH:mm");
      
      console.log('Date-fns ile varsayılan tarih ayarlanıyor:', defaultDate);
      
      // Direkt DOM'a etki etmesi için setTimeout kullan
      setTimeout(() => {
        // State'i güncelle
        setDateInputValue(defaultDate);
        
        // formData'yı da güncelle
        const customEvent = {
          target: {
            name: 'date',
            value: defaultDate,
            tagName: 'INPUT',
            type: 'datetime-local',
          } as HTMLInputElement,
          type: 'change',
          preventDefault: () => {},
          stopPropagation: () => {}
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onInputChange(customEvent);
        
        // Tarih başlatıldı olarak işaretle
        setDateInitialized(true);
        
        console.log('Tarih güncellendi, yeni değer:', defaultDate);
      }, 0);
    } catch (error) {
      console.error('Tarih ayarlama hatası:', error);
    }
  }, [dateInputValue, setDateInputValue, onInputChange, dateInitialized]);

  // Debug için
  useEffect(() => {
    console.log('Güncel dateInputValue:', dateInputValue);
  }, [dateInputValue]);

  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Ana Bilgiler' : 'Main Information'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title?.[formLanguage] || ''}
            onChange={onInputChange}
            className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white'
                : 'bg-white border border-light-grey text-dark-grey'
            } ${hasError('title') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
          />
          <ErrorMessage show={hasError('title')} />
        </div>

        {/* Event Date and Category - Desktop: side by side, Mobile: stacked */}
        <div className="md:col-span-1">
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Etkinlik Tarihi ve Saati *' : 'Event Date and Time *'}
          </label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            required
            value={dateInputValue || format(setMinutes(setHours(new Date(), 21), 0), "yyyy-MM-dd'T'HH:mm")}
            onChange={onInputChange}
            className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white'
                : 'bg-white border border-light-grey text-dark-grey'
            } ${hasError('date') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
          />
          <ErrorMessage show={hasError('date')} />
        </div>

        <div className="md:col-span-1">
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Kategori *' : 'Category *'}
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category || 'other'}
            onChange={onInputChange}
            className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
                : 'bg-white border border-light-grey text-dark-grey'
            }`}
          >
            <option value="workshop">{formLanguage === 'tr' ? 'Atölye Çalışması' : 'Workshop'}</option>
            <option value="meetup">{formLanguage === 'tr' ? 'Buluşma' : 'Meetup'}</option>
            <option value="conference">{formLanguage === 'tr' ? 'Konferans' : 'Conference'}</option>
            <option value="party">{formLanguage === 'tr' ? 'Parti' : 'Party'}</option>
            <option value="other">{formLanguage === 'tr' ? 'Diğer' : 'Other'}</option>
          </select>
        </div>

        {/* Featured Checkbox */}
        <div className="md:col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured || false}
              onChange={onCheckboxChange}
              className={`w-4 h-4 mr-2 ${
                isDark
                  ? 'bg-carbon-grey border border-dark-grey text-electric-blue'
                  : 'bg-white border border-light-grey text-dark-grey'
              }`}
            />
            <label className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
              {formLanguage === 'tr' ? 'Öne Çıkarılsın' : 'Featured'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
} 