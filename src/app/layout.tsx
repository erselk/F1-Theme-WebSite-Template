import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Barlow_Condensed, Titillium_Web } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientLayoutWrapper from "@/components/layout/ClientLayoutWrapper";

// WebVitalsReporter artık ClientLayoutWrapper içinde kullanılacak
// ClientLayoutWrapper bir client component olduğu için dinamik import
// veya ssr: false kullanımı orada sorun olmayacak

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const titilliumWeb = Titillium_Web({
  variable: "--font-titillium-web",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PadokClub - F1 Simülatör Deneyimi",
  description: "F1 deneyimini profesyonel simülatörlerle yaşayın - Etkinlikler ve rezervasyonlar için PadokClub",
  keywords: "F1, simülatör, yarış, rezervasyon, etkinlik, padok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        {/* Diğer potansiyel preconnect/prefetch'ler buraya eklenebilir */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${titilliumWeb.variable} ${barlowCondensed.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
