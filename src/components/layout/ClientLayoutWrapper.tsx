'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

const ClientLayoutWrapper = ({ children }: ClientLayoutWrapperProps) => {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminPage && <BackgroundAnimation />}
      {!isAdminPage && <Header />}
      <main className={!isAdminPage ? "flex-grow pt-[128px]" : "flex-grow"}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

export default ClientLayoutWrapper;