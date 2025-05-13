'use client';

import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React from 'react';

interface DescriptionSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
}

export default function DescriptionSection({
  formData,
  formLanguage,
  onInputChange,
  isDark,
  validationErrors,
  showValidationErrors
}: DescriptionSectionProps) {
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
        {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
      </h3>
      
      <div>
        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' ? 'Açıklama *' : 'Description *'}
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          value={formData.description?.[formLanguage] || ''}
          onChange={onInputChange}
          className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white'
              : 'bg-white border border-light-grey text-dark-grey'
          } ${hasError('description') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
        ></textarea>
        <ErrorMessage show={hasError('description')} />
      </div>
    </div>
  );
} 