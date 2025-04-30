'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

// Loading component
function PaymentSimulationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex items-center justify-center flex-col">
        <div className="w-12 h-12 border-4 border-t-electric-blue border-r-electric-blue border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Yükleniyor / Loading...</p>
      </div>
    </div>
  );
}

// Main component content
function PaymentSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: locale, isDark } = useThemeLanguage();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Sayfa yüklendiğinde localStorage'dan ödeme verilerini al
  useEffect(() => {
    const storedPaymentData = localStorage.getItem('pendingPayment');
    if (storedPaymentData) {
      try {
        const data = JSON.parse(storedPaymentData);
        setPaymentData(data);
      } catch (error) {
        console.error('Error parsing payment data:', error);
      }
    }
  }, []);

  // Ödemeyi onaylama işlemi
  const handleConfirmPayment = () => {
    setLoading(true);
    
    // Onay bilgisini localStorage'a kaydet
    localStorage.setItem('paymentResult', JSON.stringify({
      status: 'success',
      orderId: paymentData?.orderId || searchParams.get('orderId') || `order-${Date.now()}`,
      timestamp: Date.now()
    }));
    
    // Onay sayfasına yönlendir
    router.push('/payment/confirmed');
  };

  // Ödemeyi reddetme işlemi
  const handleRejectPayment = () => {
    setLoading(true);
    
    // Red bilgisini localStorage'a kaydet
    localStorage.setItem('paymentResult', JSON.stringify({
      status: 'rejected',
      reason: locale === 'tr' ? 'Kullanıcı tarafından reddedildi' : 'Rejected by user',
      timestamp: Date.now()
    }));
    
    // Etkinlik sayfasına geri dön - paymentData'dan etkinlik slug bilgisini alarak
    if (paymentData && paymentData.returnUrl) {
      // returnUrl'den etkinlik slug'ını çıkart
      try {
        const url = new URL(paymentData.returnUrl);
        const pathParts = url.pathname.split('/');
        const eventSlug = pathParts[pathParts.length - 1];
        
        // Etkinliğin detay sayfasına yönlendir
        router.push(`/events/${eventSlug}`);
      } catch (error) {
        console.error('Error parsing return URL:', error);
        // Hatada genel etkinlikler sayfasına yönlendir
        router.push('/events');
      }
    } else {
      // Bilgi yoksa genel etkinlikler sayfasına yönlendir
      router.push('/events');
    }
  };

  // Tema bağımlı stiller
  const bgClass = isDark ? 'bg-graphite' : 'bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const cardBgClass = isDark ? 'bg-dark-grey' : 'bg-white';
  const borderClass = isDark ? 'border-carbon-grey' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
      <div className={`max-w-md w-full ${cardBgClass} rounded-lg shadow-lg border ${borderClass} p-6`}>
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold ${textClass} mb-2`}>
            {locale === 'tr' ? 'Ödeme Onayı' : 'Payment Confirmation'}
          </h1>
          <p className={`${secondaryTextClass} text-sm`}>
            {locale === 'tr' 
              ? 'Bu bir ödeme simülasyon ekranıdır. Gerçek bir ödeme işlemi gerçekleştirilmeyecektir.' 
              : 'This is a payment simulation screen. No actual payment will be processed.'}
          </p>
        </div>

        <div className={`bg-opacity-50 rounded-md p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h2 className={`font-medium ${textClass} mb-3 text-sm`}>
            {locale === 'tr' ? 'Sipariş Bilgileri' : 'Order Details'}
          </h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={secondaryTextClass}>{locale === 'tr' ? 'Sipariş ID:' : 'Order ID:'}</span>
              <span className={textClass}>#{(paymentData?.orderId || searchParams.get('orderId') || '-').substring(0, 8)}</span>
            </div>
            
            {paymentData && (
              <>
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Etkinlik:' : 'Event:'}</span>
                  <span className={textClass}>
                    {/* eventTitle bir nesne olduğundan doğrudan kullanım yerine, mevcut locale için doğru dili seçiyoruz */}
                    {paymentData.eventTitle 
                      ? (typeof paymentData.eventTitle === 'object' 
                        ? paymentData.eventTitle[locale] || '-'
                        : paymentData.eventTitle)
                      : '-'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Ad Soyad:' : 'Full Name:'}</span>
                  <span className={textClass}>{paymentData.fullName || '-'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className={secondaryTextClass}>{locale === 'tr' ? 'Toplam:' : 'Total:'}</span>
                  <span className="text-electric-blue font-medium">
                    {paymentData.amount ? (paymentData.amount / 100).toFixed(2) : '0.00'} ₺
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 mt-6">
          <button
            onClick={handleConfirmPayment}
            disabled={loading}
            className={`w-full py-3 rounded-md text-white text-sm font-medium transition-colors ${
              loading 
                ? 'bg-green-600 opacity-70 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {locale === 'tr' ? 'İşleniyor...' : 'Processing...'}
              </span>
            ) : (
              <>{locale === 'tr' ? 'Ödemeyi Onayla' : 'Confirm Payment'}</>
            )}
          </button>
          
          <button
            onClick={handleRejectPayment}
            disabled={loading}
            className={`w-full py-3 rounded-md text-sm font-medium transition-colors ${
              loading 
                ? 'bg-red-600 opacity-70 cursor-not-allowed text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {locale === 'tr' ? 'Ödemeyi Reddet' : 'Reject Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the page component with Suspense boundary
export default function PaymentSimulationPage() {
  return (
    <Suspense fallback={<PaymentSimulationLoading />}>
      <PaymentSimulationContent />
    </Suspense>
  );
}