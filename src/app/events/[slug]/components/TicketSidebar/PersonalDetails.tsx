import { LanguageType, useThemeLanguage } from '@/lib/ThemeLanguageContext';
import Link from 'next/link';

interface PersonalDetailsProps {
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  acceptTerms: boolean;
  setAcceptTerms: (value: boolean) => void;
  formErrors: Record<string, string>;
  locale: LanguageType;
}

export function PersonalDetails({ 
  fullName, setFullName, email, setEmail, phone, setPhone, 
  acceptTerms, setAcceptTerms, formErrors, locale 
}: PersonalDetailsProps) {
  const { isDark } = useThemeLanguage();
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const inputBgClass = isDark ? 'bg-dark-grey' : 'bg-gray-50';
  const inputBorderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  return (
    <div className="step-details space-y-2">
      {/* Heading renk düzeltmesi */}
      <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-very-dark-grey'}`}>
        {locale === 'tr' ? 'Kişisel Bilgiler' : 'Personal Details'}
      </h3>
      
      {/* Personal Details Form - More compact for mobile */}
      <div className="space-y-2">
        <div>
          <label htmlFor="fullName" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
            {locale === 'tr' ? 'Ad Soyad' : 'Full Name'}
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
            {locale === 'tr' ? 'E-posta' : 'Email'}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className={`block text-xs font-medium ${textColorClass} mb-0.5`}>
            {locale === 'tr' ? 'Telefon' : 'Phone'}
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full px-2.5 py-1 ${inputBgClass} border ${inputBorderClass} rounded-md focus:outline-none focus:border-electric-blue ${headingColorClass} text-xs`}
            required
          />
        </div>
        
        {/* Terms acceptance checkbox */}
        <div className="flex items-start mt-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 mr-2"
            required
          />
          <label htmlFor="acceptTerms" className={`text-[10px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {locale === 'tr'
              ? <>
                Ödeme yaparak, <Link href="/terms" className="text-electric-blue hover:underline">satın alma koşullarını</Link> ve <Link href="/privacy" className="text-electric-blue hover:underline">gizlilik politikasını</Link> kabul etmiş oluyorum.
                </>
              : <>
                By making payment, I agree to the <Link href="/terms" className="text-electric-blue hover:underline">purchase terms</Link> and <Link href="/privacy" className="text-electric-blue hover:underline">privacy policy</Link>.
                </>
            }
          </label>
        </div>
        
        {/* Ödeme hatası - gradyan arkaplan ve dikkat çekici tasarım ile */}
        {formErrors.paymentError && (
          <div className="mt-2 animate-pulse-slow relative overflow-hidden">
            {/* Üçgen uyarı ikon içeren gradyan arkaplan */}
            <div className={`p-2 rounded-md shadow-md 
              ${isDark ? 'bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80' : 'bg-gradient-to-r from-red-100 via-red-50 to-red-100'} 
              border-l-4 ${isDark ? 'border-red-500' : 'border-red-500'}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className={`h-3.5 w-3.5 ${isDark ? 'text-red-400' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <h3 className={`text-[10px] font-semibold ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                    {locale === 'tr' ? 'Ödeme Reddedildi' : 'Payment Rejected'}
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-red-300/90' : 'text-red-700'}`}>
                    {formErrors.paymentError}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Yanıp sönen kenar efekti */}
            <div className="absolute inset-0 rounded-md border border-red-500/50 animate-pulse pointer-events-none"></div>
          </div>
        )}

        {/* Secure payment info */}
        <div className="text-center mt-2">
          <p className="whitespace-nowrap text-[9px] inline-flex items-center justify-center flex-wrap">
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {locale === 'tr' 
                ? 'Ödeme işleminiz ' 
                : 'Your payment is '
            }
            </span>
            <span className="font-['Open_Sans'] font-bold text-blue-600 mx-1">Paynet</span>
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              {locale === 'tr' 
                ? ' ile güvenle gerçekleştirilmektedir' 
                : ' securely processed'
              }
            </span>
          </p>
        </div>
      </div>
    </div>
  );
} 