'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

// Component that uses useSearchParams - moved inside a separate component with Suspense
function PaymentFailedContent() {
  const { isDark, language: locale } = useThemeLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(15);

  // Extract error reason and code from URL parameters
  const reason = searchParams.get('reason') || '';
  const code = searchParams.get('code') || '';

  // Theme-dependent color classes
  const bgColorClass = isDark ? 'bg-graphite' : 'bg-white';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  // Get user-friendly error message based on error code or reason
  const getErrorMessage = () => {
    // Common error messages based on code/reason
    if (reason === 'invalid_hash') {
      return locale === 'tr' 
        ? 'Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.'
        : 'Security verification failed. Please try again.';
    }
    
    if (reason === 'processing_error') {
      return locale === 'tr'
        ? 'Ödeme işlenirken bir hata oluştu. Lütfen tekrar deneyin.'
        : 'An error occurred while processing your payment. Please try again.';
    }
    
    if (reason === 'Guvenlik Kodu hatali' || reason.toLowerCase().includes('security code')) {
      return locale === 'tr'
        ? 'Güvenlik kodu (CVV/CVC) hatalı girildi. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.'
        : 'Invalid security code (CVV/CVC). Please check your card details and try again.';
    }
    
    if (reason.toLowerCase().includes('kart') || reason.toLowerCase().includes('card')) {
      return locale === 'tr'
        ? 'Kart bilgileriniz doğrulanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
        : 'Your card details could not be verified. Please check your information and try again.';
    }
    
    // Default error message
    return locale === 'tr'
      ? 'Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin veya başka bir ödeme yöntemi kullanın.'
      : 'Payment transaction failed. Please try again or use a different payment method.';
  };

  // Redirect user to events page after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/events');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className={`max-w-lg w-full ${bgColorClass} rounded-lg border ${borderColorClass} p-8 shadow-lg`}>
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 rounded-full bg-neon-red/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neon-red" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <h1 className={`text-2xl font-bold ${headingColorClass} text-center mb-4`}>
        {locale === 'tr' ? 'Ödeme Başarısız' : 'Payment Failed'}
      </h1>
      
      <p className={`${textColorClass} text-center mb-6`}>
        {getErrorMessage()}
      </p>
      
      {(reason || code) && (
        <div className={`p-4 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'} rounded-lg mb-6`}>
          <h3 className={`font-medium ${headingColorClass} mb-2`}>
            {locale === 'tr' ? 'Hata Detayları' : 'Error Details'}
          </h3>
          
          {reason && (
            <p className={`${textColorClass} text-sm flex justify-between items-center`}>
              <span>{locale === 'tr' ? 'Hata:' : 'Error:'}</span>
              <span className="font-mono text-neon-red">{reason}</span>
            </p>
          )}
          
          {code && (
            <p className={`${textColorClass} text-sm flex justify-between items-center mt-2`}>
              <span>{locale === 'tr' ? 'Kod:' : 'Code:'}</span>
              <span className="font-mono">{code}</span>
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <Link 
          href="/events"
          className="w-full px-4 py-3 bg-electric-blue text-white rounded-md hover:opacity-90 transition-colors text-sm text-center"
        >
          {locale === 'tr' ? 'Etkinliklere Dön' : 'Back to Events'}
        </Link>
        
        <button
          onClick={() => window.history.back()}
          className={`w-full px-4 py-3 ${isDark ? 'bg-carbon-grey text-silver' : 'bg-gray-200 text-gray-700'} rounded-md hover:opacity-90 transition-colors text-sm text-center`}
        >
          {locale === 'tr' ? 'Tekrar Dene' : 'Try Again'}
        </button>
      </div>
      
      <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <p className="text-amber-800 text-sm flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {locale === 'tr'
              ? 'Endişelenmeyin, kartınızdan herhangi bir tutar çekilmedi. Ödeme işlemini tekrar deneyebilir veya farklı bir ödeme yöntemi kullanabilirsiniz.'
              : 'Don\'t worry, no amount has been charged from your card. You can try the payment process again or use a different payment method.'}
          </span>
        </p>
      </div>
      
      <p className={`text-xs ${textColorClass} text-center mt-6`}>
        {locale === 'tr' ? `${countdown} saniye içinde etkinlikler sayfasına yönlendirileceksiniz.` : `You will be redirected to events page in ${countdown} seconds.`}
      </p>
    </div>
  );
}

// Loading state for Suspense
function PaymentFailedLoading() {
  return (
    <div className="max-w-lg w-full bg-white dark:bg-graphite rounded-lg border border-gray-200 dark:border-carbon-grey p-8 shadow-lg flex justify-center items-center">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 dark:bg-dark-grey rounded-full"></div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-dark-grey rounded-md"></div>
        <div className="h-4 w-full bg-gray-200 dark:bg-dark-grey rounded-md"></div>
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-dark-grey rounded-md"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-dark-grey rounded-md"></div>
        <div className="h-10 w-full bg-gray-200 dark:bg-dark-grey rounded-md"></div>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function PaymentFailedPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Suspense fallback={<PaymentFailedLoading />}>
        <PaymentFailedContent />
      </Suspense>
    </div>
  );
}