import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';

interface ProgressStepsProps {
  currentStep: number;
  locale: LanguageType;
}

export function ProgressSteps({ currentStep, locale }: ProgressStepsProps) {
  const { isDark } = useThemeLanguage();
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center relative">
        {/* Show only 2 steps now - Tickets and Personal Details */}
        {[1, 2].map((step) => (
          <div 
            key={step}
            className="flex flex-col items-center relative z-10"
          >
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 text-xs 
                ${currentStep === step 
                  ? 'border-electric-blue bg-electric-blue/20 text-electric-blue' 
                  : currentStep > step 
                    ? 'border-neon-green bg-neon-green/20 text-neon-green'
                    : isDark 
                      ? 'border-carbon-grey bg-dark-grey text-silver'
                      : 'border-gray-300 bg-gray-100 text-gray-500'}`}
            >
              {currentStep > step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={`text-[10px] mt-0.5 ${textColorClass}`}>
              {step === 1 ? (locale === 'tr' ? 'Biletler' : 'Tickets') : 
                (locale === 'tr' ? 'Bilgiler' : 'Details')}
            </span>
          </div>
        ))}
        
        {/* Progress line - Improved visibility in both light and dark mode */}
        <div className="absolute left-0 right-0 w-full">
          <div 
            className={`h-0.5 absolute top-2.5 left-[25%] right-[25%] w-1/2 ${currentStep >= 2 ? 'bg-neon-green' : isDark ? 'bg-carbon-grey' : 'bg-gray-300'}`}
            style={{zIndex: 0}}
          />
        </div>
      </div>
    </div>
  );
} 