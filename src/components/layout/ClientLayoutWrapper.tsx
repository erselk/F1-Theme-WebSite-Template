'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

const ClientLayoutWrapper = ({ children }: ClientLayoutWrapperProps) => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Web Vitals izleme doğrudan bileşen içinde
  useReportWebVitals((metric) => {
    // Kritik metrikleri konsola kaydet
    // Örnek: Google Analytics'e gönderme (isteğe bağlı)
    // if (window.gtag) {
    //   window.gtag('event', metric.name, {
    //     value: Math.round(metric.value * 1000) / 1000,
    //     event_category: 'Web Vitals',
    //     event_label: metric.id,
    //     non_interaction: true,
    //   });
    // }
  });

  return (
    <>
      {!isAdminPage && <BackgroundAnimation />}
      {!isAdminPage && <Header />}
      <main className={!isAdminPage ? "flex-grow pt-[128px]" : "flex-grow"}>
        <div className="container mx-auto px-8 md:px-16 lg:px-24">
          {children}
        </div>
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

export default ClientLayoutWrapper;