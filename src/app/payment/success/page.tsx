'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

// Component that uses useSearchParams - moved inside a separate component with Suspense
function PaymentSuccessContent() {
  const { isDark, language: locale } = useThemeLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Extract order ID and amount from URL parameters
  const orderId = searchParams.get('orderId') || '';
  const amount = searchParams.get('amount') || '';

  // Theme-dependent color classes
  const bgColorClass = isDark ? 'bg-graphite' : 'bg-white';
  const textColorClass = isDark ? 'text-light-grey' : 'text-slate-700';
  const headingColorClass = isDark ? 'text-white' : 'text-very-dark-grey';
  const borderColorClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  // Redirect user to homepage after countdown
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
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
        <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      <h1 className={`text-2xl font-bold ${headingColorClass} text-center mb-4`}>
        {locale === 'tr' ? 'Ödeme Başarılı!' : 'Payment Successful!'}
      </h1>
      
      <p className={`${textColorClass} text-center mb-6`}>
        {locale === 'tr' 
          ? 'Ödemeniz başarıyla tamamlandı. Biletleriniz e-posta adresinize gönderilecektir.' 
          : 'Your payment has been successfully processed. Your tickets will be sent to your email address.'}
      </p>
      
      {orderId && (
        <div className={`p-4 ${isDark ? 'bg-carbon-grey' : 'bg-gray-50'} rounded-lg mb-6`}>
          <h3 className={`font-medium ${headingColorClass} mb-2`}>
            {locale === 'tr' ? 'Sipariş Bilgileri' : 'Order Details'}
          </h3>
          
          <p className={`${textColorClass} text-sm flex justify-between items-center`}>
            <span>{locale === 'tr' ? 'Sipariş ID:' : 'Order ID:'}</span>
            <span className="font-mono">{orderId}</span>
          </p>
          
          {amount && (
            <p className={`${textColorClass} text-sm flex justify-between items-center mt-2`}>
              <span>{locale === 'tr' ? 'Toplam Tutar:' : 'Total Amount:'}</span>
              <span className="font-semibold text-neon-green">{amount} ₺</span>
            </p>
          )}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <Link 
          href="/"
          className="w-full px-4 py-3 bg-electric-blue text-white rounded-md hover:opacity-90 transition-colors text-sm text-center"
        >
          {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
        </Link>
        
        <Link 
          href="/events"
          className={`w-full px-4 py-3 ${isDark ? 'bg-carbon-grey text-silver' : 'bg-gray-200 text-gray-700'} rounded-md hover:opacity-90 transition-colors text-sm text-center`}
        >
          {locale === 'tr' ? 'Diğer Etkinliklere Göz At' : 'Browse Other Events'}
        </Link>
      </div>
      
      <p className={`text-xs ${textColorClass} text-center mt-6`}>
        {locale === 'tr' ? `${countdown} saniye içinde ana sayfaya yönlendirileceksiniz.` : `You will be redirected to homepage in ${countdown} seconds.`}
      </p>
    </div>
  );
}

// Loading state for Suspense
function PaymentSuccessLoading() {
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
export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}