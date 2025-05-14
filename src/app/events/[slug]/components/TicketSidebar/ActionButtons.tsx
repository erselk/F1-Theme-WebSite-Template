import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface ActionButtonsProps {
  currentStep: number;
  isStepComplete: () => boolean;
  isProcessing: boolean;
  goBack: () => void;
  formErrors: Record<string, string>;
  locale: LanguageType;
}

export function ActionButtons({ 
  currentStep, isStepComplete, isProcessing, goBack, formErrors, locale 
}: ActionButtonsProps) {
  const { isDark } = useThemeLanguage();
  const buttonBgClass = isDark ? 'bg-carbon-grey' : 'bg-gray-200';
  const buttonTextClass = isDark ? 'text-silver' : 'text-gray-700';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  const getContinueButtonClass = () => {
    if (!isStepComplete()) {
      return `${buttonBgClass} ${buttonTextClass} cursor-not-allowed opacity-70`;
    } else {
      return isDark 
        ? 'bg-[#FF0000] hover:bg-[#FF3333] text-white' 
        : 'bg-[#E10600] hover:bg-[#E10600]/90 text-white';
    }
  };
  
  const getPaymentButtonClass = () => {
    if (!isStepComplete()) {
      return `${buttonBgClass} ${buttonTextClass} cursor-not-allowed opacity-70`;
    } else {
      return 'bg-[#E10600] hover:bg-[#FF0000] text-white dark:bg-[#FF0000] dark:hover:bg-[#FF3333]';
    }
  };

  return (
    <div className="flex items-center justify-center mt-2">
      {currentStep > 1 ? (
        <div className="flex justify-center w-full">
          <button
            type="button"
            onClick={goBack}
            className={`px-3 py-1 ${buttonBgClass} ${buttonTextClass} rounded hover:opacity-80 transition-colors text-xs font-medium border ${borderColorClass} mr-2`}
          >
            {locale === 'tr' ? 'Geri' : 'Back'}
          </button>
          
          <button
            type="submit"
            disabled={!isStepComplete() || isProcessing}
            className={`px-3 py-1 rounded text-xs font-medium flex justify-center items-center transition-colors ${getPaymentButtonClass()}`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
              </>
            ) : (
              <>
                {locale === 'tr' ? 'Siparişi Onayla' : 'Confirm Order'}
              </>
            )}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={!isStepComplete()}
          className={`w-full px-3 py-1 rounded text-xs font-medium flex justify-center items-center transition-colors ${getContinueButtonClass()}`}
        >
          {locale === 'tr' ? 'Devam Et' : 'Continue'}
        </button>
      )}
      
      {formErrors.payment && (
        <div className="mt-2 bg-neon-red/10 border border-neon-red text-neon-red p-1.5 rounded-md text-xs">
          {formErrors.payment}
        </div>
      )}
    </div>
  );
} 