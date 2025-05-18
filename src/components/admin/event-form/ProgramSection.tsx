'use client';

import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProgramItem {
  id?: string;
  time: string;
  title: {
    tr: string;
    en: string;
  };
  description: {
    tr: string;
    en: string;
  };
}

interface ProgramSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  handleProgramChange: (index: number, field: string, value: string) => void;
  addProgramItem: () => void;
  removeProgramItem: (index: number) => void;
}

export default function ProgramSection({
  formData,
  formLanguage,
  isDark,
  validationErrors,
  showValidationErrors,
  handleProgramChange,
  addProgramItem,
  removeProgramItem
}: ProgramSectionProps) {
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };

  const ErrorMessage = ({ show }: { show: boolean }) => (
    show ? <p className="mt-1 text-xs text-f1-red">{formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}</p> : null
  );

  // Generate default time format (HH:MM)
  const generateTimeString = (hour: number, minuteStep: number = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minuteStep.toString().padStart(2, '0')}`;
  };
  
  // Saat girişini kontrol eden fonksiyon
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    // Değeri al ve handleProgramChange ile güncelle
    const value = e.target.value;
    // Saat değerini HH:MM formatında ayarla
    if (e.target.type === 'time') {
      handleProgramChange(index, 'time', value);
    } else {
      // Text tipinde girişse, regex kontrolü yap
      const regex = /^[0-9:]*$/;
      if (regex.test(value)) {
        handleProgramChange(index, 'time', value);
      }
    }
  };
  
  // Yeni program öğesi ekleme işlevi
  const handleAddProgramItem = () => {
    // Artık varsayılan saat değeri useEventForm içinde ayarlanıyor
    addProgramItem();
    // setTimeout kaldırıldı, gerek kalmadı
  };

  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className={`text-sm sm:text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
          {formLanguage === 'tr' ? 'Etkinlik Programı' : 'Event Program'}
        </h3>
        
        <button
          type="button"
          onClick={handleAddProgramItem}
          className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
            isDark
              ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
              : 'bg-race-blue text-white hover:bg-race-blue/80'
          }`}
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
          <span className="hidden sm:inline">
            {formLanguage === 'tr' ? 'Yeni Program Öğesi Ekle' : 'Add New Program Item'}
          </span>
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {formData.schedule && Array.isArray(formData.schedule) && formData.schedule.length > 0 ? (
          formData.schedule.map((item: ProgramItem, index: number) => (
            <div 
              key={item.id || index} 
              className={`p-2 sm:p-3 border rounded-md ${
                isDark ? 'border-dark-grey' : 'border-light-grey'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Time */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Saat *' : 'Time *'}
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      placeholder="21:00"
                      value={item.time || '21:00'}
                      onChange={(e) => handleTimeInput(e, index)}
                      className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      } ${hasError(`schedule[${index}].time`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    />
                  </div>
                  <ErrorMessage show={hasError(`schedule[${index}].time`)} />
                </div>

                {/* Title */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={item.title?.[formLanguage] || ''}
                      onChange={(e) => {
                        handleProgramChange(index, 'title', e.target.value);
                      }}
                      className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      } ${hasError(`schedule[${index}].title`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeProgramItem(index)}
                      className={`flex-shrink-0 p-1 rounded-md ${
                        isDark
                          ? 'text-silver hover:bg-dark-grey'
                          : 'text-medium-grey hover:bg-very-light-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu program öğesini sil" : "Delete this program item"}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <ErrorMessage show={hasError(`schedule[${index}].title`)} />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={item.description?.[formLanguage] || ''}
                    onChange={(e) => {
                      handleProgramChange(index, 'description', e.target.value);
                    }}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    }`}
                    placeholder={formLanguage === 'tr' 
                      ? "Program öğesi hakkında açıklama" 
                      : "Description about this program item"}
                  ></textarea>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' 
              ? 'Henüz program öğesi eklenmemiş. Eklemek için "+" butonunu kullanın.'
              : 'No program items added yet. Use the "+" button to add items.'}
          </div>
        )}
      </div>
    </div>
  );
} 