'use client';

import { LanguageType } from '@/lib/ThemeLanguageContext';

interface FormButtonsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  isDark: boolean;
  formLanguage: LanguageType;
}

export default function FormButtons({
  onCancel,
  isSubmitting,
  isEditMode,
  isDark,
  formLanguage
}: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-3 sm:space-x-4 pt-2 sm:pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
          isDark
            ? 'bg-dark-grey text-white hover:bg-carbon-grey border border-dark-grey'
            : 'bg-light-grey text-dark-grey hover:bg-medium-grey border border-light-grey'
        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {formLanguage === 'tr' ? 'İptal' : 'Cancel'}
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium ${
          isDark
            ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
            : 'bg-race-blue text-white hover:bg-race-blue/80'
        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {formLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
          </div>
        ) : (
          isEditMode
            ? (formLanguage === 'tr' ? 'Güncelle' : 'Update')
            : (formLanguage === 'tr' ? 'Oluştur' : 'Create')
        )}
      </button>
    </div>
  );
} 