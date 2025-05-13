'use client';

interface FormButtonsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isEditMode: boolean;
  isDark: boolean;
  formLanguage: 'tr' | 'en';
}

export default function FormButtons({
  onCancel,
  isSubmitting,
  isEditMode,
  isDark,
  formLanguage
}: FormButtonsProps) {
  return (
    <div className="flex justify-end space-x-2 sm:space-x-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
          isDark
            ? 'bg-carbon-grey text-silver hover:bg-dark-grey'
            : 'bg-light-grey text-medium-grey hover:bg-very-light-grey'
        } ${(isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {formLanguage === 'tr' ? 'İptal' : 'Cancel'}
      </button>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
          isDark
            ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
            : 'bg-race-blue text-white hover:bg-race-blue/80'
        } ${(isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg 
              className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              ></circle>
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-xs sm:text-sm">{formLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...'}</span>
          </span>
        ) : isEditMode 
          ? (formLanguage === 'tr' ? 'Güncelle' : 'Update')
          : (formLanguage === 'tr' ? 'Yayınla' : 'Publish')}
      </button>
    </div>
  );
} 