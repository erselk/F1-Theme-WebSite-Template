'use client';

import { FormErrors } from './types';

interface ValidationErrorsProps {
  errors: FormErrors;
  showErrors: boolean;
  formLanguage: 'tr' | 'en';
}

export const ErrorMessage = ({ show, formLanguage }: { show: boolean; formLanguage: 'tr' | 'en' }) => (
  show ? (
    <p className="text-f1-red text-sm mt-1">
      {formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}
    </p>
  ) : null
);

export default function ValidationErrors({ errors, showErrors, formLanguage }: ValidationErrorsProps) {
  if (!showErrors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1 sm:mr-2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12" y2="16"></line>
        </svg>
        <span className="text-xs sm:text-sm">
          {formLanguage === 'tr' 
            ? `Lütfen tüm zorunlu alanları doldurun (${Object.keys(errors).length} eksik alan)`
            : `Please fill in all required fields (${Object.keys(errors).length} missing fields)`}
        </span>
      </div>
    </div>
  );
} 