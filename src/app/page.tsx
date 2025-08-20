'use client';

import { useState, useEffect } from "react";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";
import HeroSection from "@/components/features/home/HeroSection";
import FeaturesSection from "@/components/features/home/FeaturesSection";
import SimulatorsSection from "@/components/features/home/SimulatorsSection";
// Dinamik import ekliyoruz
import dynamic from 'next/dynamic';

// Yüklenme göstergesi bileşeni
const SectionPlaceholder = ({ minHeight = '400px' }) => (
  <div style={{
    minHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px dashed #ccc', // Görsel geri bildirim için
    margin: '20px 0',
    width: '100%'
  }}>
    <p>İçerik yükleniyor...</p>
  </div>
);

// EventsSection'ı doğrudan import etmek yerine dinamik olarak import ediyoruz
const EventsSection = dynamic(() => import('@/components/features/home/EventsSection'), {
  ssr: false, // Sunucu tarafında render edilmesini önlüyoruz
  loading: () => <SectionPlaceholder />, // Yüklenme göstergesi eklendi
});
// BlogSection ve TestimonialsSection'ı dinamik olarak import ediyoruz (ssr: false ile)
const BlogSection = dynamic(() => import('@/components/features/home/BlogSection'), {
  ssr: false,
  loading: () => <SectionPlaceholder />, // Yüklenme göstergesi eklendi
});
const TestimonialsSection = dynamic(() => import('@/components/features/home/TestimonialsSection'), {
  ssr: false,
  loading: () => <SectionPlaceholder minHeight="300px" />, // Yüklenme göstergesi eklendi (farklı yükseklik örneği)
});
import CTASection from "@/components/features/home/CTASection";

// Tercümeler (Fonksiyon dışına taşındı)
const translations = {
  tr: {
    // Hero bölümü çevirileri
    heroTitle: "Gerçek DeF1 Deneyimine Hoş Geldin.",
    heroSubtitle: "F1 simülasyonları, VR dünyaları, sahne performansları ve daha fazlasıyla İstanbul'un yeni nesil deneyim merkezi.",
    heroCta: "Hemen Keşfet",
    
    // Features bölümü çevirileri
    featuresTitle: "Premium F1 Deneyimi",
    featuresSubtitle: "En gerçekçi F1 deneyimini yaşamak için en son teknolojiye sahip simülatörlerimiz sizi bekliyor",
    feature1Title: "Gerçekçi Simülasyon",
    feature1Desc: "Gerçek F1 araçlarının aerodinamiği, motor sesi ve titreşimleri birebir modellenmiştir",
    feature2Title: "Profesyonel Eğitmen",
    feature2Desc: "Gerçek yarış deneyimine sahip eğitmenlerimizle teknikleri öğrenin ve sürüş becerilerinizi geliştirin",
    feature3Title: "Etkinlikler",
    feature3Desc: "Arkadaşlarınız ve iş arkadaşlarınızla özel etkinlikler, turnuvalar ve yarışlar düzenleyin",
    
    // Simulatörler bölümü çevirileri
    simulatorsTitle: "Simülatörlerimiz",
    simulatorsSubtitle: "Yüksek teknolojiye sahip simülasyon ve deneyim alanlarımız",
    simulator1Title: "F1 Yarış Simülasyonu",
    simulator1Desc: "Profesyonel yarış simülatörlerinde kullanılan yüksek hassasiyetli direksiyon setleri, hidrolik destekli özel koltuklar ve ultra geniş görüş açısı sunan çoklu ekran sistemleriyle donatılmıştır.",
    simulator2Title: "VR Deneyim Alanı",
    simulator2Desc: "Sanal gerçeklik deneyimleri ile benzersiz dünyalara adım atın. En son teknoloji VR gözlükler ile gerçekçi sanal deneyimler yaşayın.",
    simulator3Title: "Bilgisayar Salonu",
    simulator3Desc: "Yüksek performanslı oyun bilgisayarları ile modern oyun deneyimi yaşayın. Arkadaşlarınızla toplu oyun etkinlikleri için ideal.",
    hourPrice: "/ saat",
    bookNow: "Rezervasyon Yap",
    
    // Etkinlikler bölümü çevirileri
    eventsTitle: "Yaklaşan Etkinlikler",
    eventsSubtitle: "F1 tutkunlarını bir araya getiren özel etkinliklerimize katılın",
    eventsCta: "Tüm Etkinlikleri Gör",
    eventDetails: "Detayları Gör →",
    
    // Blog bölümü çevirileri
    blogTitle: "Son Blog Yazıları",
    blogSubtitle: "F1 ve Motorsporları dünyasından güncel içerikler",
    blogCta: "Tüm Blog Yazılarını Gör",
    readMore: "Devamını Oku →",
    
    // Yorumlar bölümü çevirileri
    testimonialsTitle: "Müşterilerimiz Ne Diyor?",
    testimonialsSubtitle: "DeF1Club deneyimini yaşayanların görüşleri",
    testimonials: [
      {
        initial: "MA",
        name: "Mehmet A.",
        role: "F1 Tutkunu",
        text: "\"Hayatımda yaşadığım en gerçekçi F1 deneyimiydi. Simülatörler son derece gerçekçi ve eğitmenler çok profesyonel.\""
      },
      {
        initial: "AY",
        name: "Ayşe Y.",
        role: "Şirket Yöneticisi",
        text: "\"Şirket etkinliğimiz için rezervasyon yapmıştık. Tüm ekip inanılmaz keyif aldı. Kesinlikle tekrar geleceğiz!\""
      },
      {
        initial: "KC",
        name: "Kerem C.",
        role: "Motor Sporları Fanatiği",
        text: "\"F1 tutkunuyum ve DeF1Club'ın sunduğu deneyim beklentilerimin ötesindeydi. Hareket sistemleri olağanüstü!\""
      }
    ],
    
    // CTA bölümü çevirileri
    ctaTitle: "Formula 1 Deneyimini Yaşamaya Hazır mısınız?",
    ctaSubtitle: "Profesyonel simülatörlerimizle gerçek F1 pilotu gibi hissedin. Bireysel seanslar veya grup etkinlikleri için hemen rezervasyon yapın.",
    ctaButton1: "Rezervasyon Yap",
    ctaButton2: "İletişime Geçin"
  },
  en: {
    // Hero section translations
    heroTitle: "Welcome to the Real DeF1 Experience.",
    heroSubtitle: "F1 simulations, VR worlds, stage performances and more at Istanbul's next-generation experience center.",
    heroCta: "Discover Now",
    
    // Features section translations
    featuresTitle: "Premium F1 Experience",
    featuresSubtitle: "Our state-of-the-art simulators await you to experience the most realistic F1 sensation",
    feature1Title: "Realistic Simulation",
    feature1Desc: "The aerodynamics, engine sound and vibrations of real F1 cars are modeled one-to-one",
    feature2Title: "Professional Trainer",
    feature2Desc: "Learn techniques and improve your driving skills with our instructors who have real racing experience",
    feature3Title: "Events",
    feature3Desc: "Organize special events, tournaments and races with your friends and colleagues",
    
    // Simulators section translations
    simulatorsTitle: "Our Simulators",
    simulatorsSubtitle: "High-technology simulation and experience areas",
    simulator1Title: "F1 Racing Simulation",
    simulator1Desc: "Equipped with high-precision steering sets used in professional race simulators, hydraulically supported special seats, and multi-screen systems offering an ultra-wide field of view.",
    simulator2Title: "VR Experience Area",
    simulator2Desc: "Step into unique worlds with virtual reality experiences. Experience realistic virtual experiences with the latest VR glasses technology.",
    simulator3Title: "Computer Room",
    simulator3Desc: "Experience modern gaming with high-performance gaming computers. Ideal for group gaming events with your friends.",
    hourPrice: "/ hour",
    bookNow: "Book Now",
    
    // Events section translations
    eventsTitle: "Upcoming Events",
    eventsSubtitle: "Join our special events that bring F1 enthusiasts together",
    eventsCta: "See All Events",
    eventDetails: "View Details →",
    
    // Blog section translations
    blogTitle: "Latest Blog Posts",
    blogSubtitle: "Latest content from F1 and Motorsports world",
    blogCta: "See All Blog Posts",
    readMore: "Read More →",
    
    // Testimonials section translations
    testimonialsTitle: "What Our Customers Say",
    testimonialsSubtitle: "Reviews from those who experienced DeF1Club",
    testimonials: [
      {
        initial: "MA",
        name: "Mehmet A.",
        role: "F1 Enthusiast",
        text: "\"It was the most realistic F1 experience I've ever had. The simulators are extremely realistic and the instructors are very professional.\""
      },
      {
        initial: "AY",
        name: "Ayşe Y.",
        role: "Company Manager",
        text: "\"We made a reservation for our company event. The whole team had an incredible time. We will definitely come back!\""
      },
      {
        initial: "KC",
        name: "Kerem C.",
        role: "Motorsports Fan",
        text: "\"I'm an F1 enthusiast and the experience DeF1Club offers was beyond my expectations. The motion systems are extraordinary!\""
      }
    ],
    
    // CTA section translations
    ctaTitle: "Are You Ready to Experience Formula 1?",
    ctaSubtitle: "Feel like a real F1 pilot with our professional simulators. Book now for individual sessions or group events.",
    ctaButton1: "Make a Reservation",
    ctaButton2: "Contact Us"
  }
};

// Ana sayfa bileşeni
export default function Home() {
  const { language } = useThemeLanguage();

  // Choose the current language translations
  const t = translations[language] || translations.tr; // Dil yüklenemezse Türkçe'ye geri dön
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection translations={{
        heroTitle: t.heroTitle,
        heroSubtitle: t.heroSubtitle,
        heroCta: t.heroCta
      }} />
      
      {/* Features Section */}
      <FeaturesSection translations={{
        featuresTitle: t.featuresTitle,
        featuresSubtitle: t.featuresSubtitle,
        feature1Title: t.feature1Title,
        feature1Desc: t.feature1Desc,
        feature2Title: t.feature2Title,
        feature2Desc: t.feature2Desc,
        feature3Title: t.feature3Title,
        feature3Desc: t.feature3Desc
      }} />
      
      {/* Simulators Section */}
      <SimulatorsSection translations={{
        simulatorsTitle: t.simulatorsTitle,
        simulatorsSubtitle: t.simulatorsSubtitle,
        simulator1Title: t.simulator1Title,
        simulator1Desc: t.simulator1Desc,
        simulator2Title: t.simulator2Title,
        simulator2Desc: t.simulator2Desc,
        simulator3Title: t.simulator3Title,
        simulator3Desc: t.simulator3Desc,
        hourPrice: t.hourPrice,
        bookNow: t.bookNow
      }} />
      
      {/* Events Section */}
      <EventsSection translations={{
        eventsTitle: t.eventsTitle,
        eventsSubtitle: t.eventsSubtitle,
        eventsCta: t.eventsCta,
        eventDetails: t.eventDetails
      }} />
      
      {/* Blog Section */}
      <BlogSection translations={{
        blogTitle: t.blogTitle,
        blogSubtitle: t.blogSubtitle,
        blogCta: t.blogCta,
        readMore: t.readMore
      }} />
      
      {/* Testimonials Section */}
      <TestimonialsSection translations={{
        testimonialsTitle: t.testimonialsTitle,
        testimonialsSubtitle: t.testimonialsSubtitle,
        testimonials: t.testimonials
      }} />
      
      {/* CTA Section */}
      <CTASection translations={{
        ctaTitle: t.ctaTitle,
        ctaSubtitle: t.ctaSubtitle,
        ctaButton1: t.ctaButton1,
        ctaButton2: t.ctaButton2
      }} />

      {/* CSS scrollbar'ı gizlemek için */}
      <style jsx global>{`
        body {
          scrollbar-width: none; /* Firefox */
        }
        body::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        .overflow-hidden {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .overflow-hidden::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        .overflow-visible {
          overflow: visible !important;
        }
      `}</style>
    </>
  );
}
