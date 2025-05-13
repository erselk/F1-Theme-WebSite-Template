'use client';

import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React from 'react';

interface LocationSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
}

export default function LocationSection({
  formData,
  formLanguage,
  onInputChange,
  isDark,
  validationErrors,
  showValidationErrors
}: LocationSectionProps) {
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };

  const ErrorMessage = ({ show }: { show: boolean }) => (
    show ? <p className="mt-1 text-xs text-f1-red">{formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}</p> : null
  );

  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Konum Bilgileri' : 'Location Information'}
      </h3>
      
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' ? 'Konum *' : 'Location *'}
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          value={formData.location?.[formLanguage] || ''}
          onChange={onInputChange}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white'
              : 'bg-white border border-light-grey text-dark-grey'
          } ${hasError('location') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
        />
        <ErrorMessage show={hasError('location')} />
      </div>
    </div>
  );
} 