'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { ThemeLanguageProvider } from '@/lib/ThemeLanguageContext';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system" // Use system as default to detect browser preference
      enableSystem={true} // Enable system theme detection
      disableTransitionOnChange
      {...props}
    >
      <ThemeLanguageProvider>
        {children}
      </ThemeLanguageProvider>
    </NextThemesProvider>
  );
}