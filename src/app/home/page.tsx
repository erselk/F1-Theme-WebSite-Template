'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Event, getSortedEvents } from "@/data/events";
import { BlogPost, getBlogs } from "@/data/blogs";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function Home() {
  // const { language, isDark } = useThemeLanguage();
  const { language, isDark } = useThemeLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // Home slides from the home folder (about1.jpg to about19.jpg)
  const homeSlides = Array.from({ length: 19 }, (_, i) => `/images/home/about${i + 1}.jpg`);
  
  // Handle slide change when clicking on dots
  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
  useEffect(() => {
    setMounted(true);
    
    // Slider timer effect
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeSlides.length);
    }, 5000); // Change slide every 5 seconds
    
    // Get latest 3 events using async function
    const fetchEvents = async () => {
      try {
        const eventsData = await getSortedEvents();
        const upcomingEvents = eventsData.filter(event => 
          event.status !== 'past'
        ).slice(0, 3);
        
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      }
    };
    
    // Get latest 3 blogs
    const fetchBlogs = async () => {
      try {
        const blogsData = getBlogs();
        // Sort blogs by date (newest first) and take first 3
        const sortedBlogs = blogsData.sort((a, b) => {
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        }).slice(0, 3);
        
        setBlogs(sortedBlogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setBlogs([]);
      }
    };
    
    fetchEvents();
    fetchBlogs();
    
    return () => clearInterval(interval);
  }, [homeSlides.length]);
  
  // Fixed simulator images that won't change
  const simulatorImages = {
    f1: "/images/home/about5.jpg",
    vr: "/images/home/about12.jpg",
    computers: "/images/home/about8.jpg"
  };
  
  // Translations
  const translations = {
    tr: {
      heroTitle: "Gerçek Padok Deneyimine Hoş Geldin.",
      heroSubtitle: "F1 simülasyonları, VR dünyaları, sahne performansları ve daha fazlasıyla İstanbul'un yeni nesil deneyim merkezi.",
      heroCta: "Hemen Keşfet",
      
      featuresTitle: "Premium F1 Deneyimi",
      featuresSubtitle: "En gerçekçi F1 deneyimini yaşamak için en son teknolojiye sahip simülatörlerimiz sizi bekliyor",
      feature1Title: "Gerçekçi Simülasyon",
      feature1Desc: "Gerçek F1 araçlarının aerodinamiği, motor sesi ve titreşimleri birebir modellenmiştir",
      feature2Title: "Profesyonel Eğitmen",
      feature2Desc: "Gerçek yarış deneyimine sahip eğitmenlerimizle teknikleri öğrenin ve sürüş becerilerinizi geliştirin",
      feature3Title: "Etkinlikler",
      feature3Desc: "Arkadaşlarınız ve iş arkadaşlarınızla özel etkinlikler, turnuvalar ve yarışlar düzenleyin",
      
      simulatorsTitle: "Simülatörlerimiz",
      simulatorsSubtitle: "Yüksek teknolojiye sahip simülasyon ve deneyim alanlarımız",
      simulator1Title: "F1 Yarış Simülasyonu",
      simulator1Desc: "Profesyonel yarış simülatörlerinde kullanılan yüksek hassasiyetli direksiyon setleri, hidrolik destekli özel koltuklar ve ultra geniş görüş açısı sunan çoklu ekran sistemleriyle donatılmıştır.",
      simulator2Title: "VR Deneyim Alanı",
      simulator2Desc: "Sanal gerçeklik deneyimleri ile benzersiz dünyalara adım atın. En son teknoloji VR gözlükler ile gerçekçi sanal deneyimler yaşayın.",
      simulator3Title: "Bilgisayar Salonu",
      simulator3Desc: "Yüksek performanslı oyun bilgisayarları ile modern oyun deneyimi yaşayın. Arkadaşlarınızla toplu oyun etkinlikleri için ideal.",
      
      eventsTitle: "Yaklaşan Etkinlikler",
      eventsSubtitle: "F1 tutkunlarını bir araya getiren özel etkinliklerimize katılın",
      eventsCta: "Tüm Etkinlikleri Gör",
      eventDetails: "Detayları Gör →",
      
      testimonialsTitle: "Müşterilerimiz Ne Diyor?",
      testimonialsSubtitle: "PadokClub deneyimini yaşayanların görüşleri",
      
      ctaTitle: "Formula 1 Deneyimini Yaşamaya Hazır mısınız?",
      ctaSubtitle: "Profesyonel simülatörlerimizle gerçek F1 pilotu gibi hissedin. Bireysel seanslar veya grup etkinlikleri için hemen rezervasyon yapın.",
      ctaButton1: "Rezervasyon Yap",
      ctaButton2: "İletişime Geçin",
      
      hourPrice: "/ saat",
      bookNow: "Rezervasyon Yap"
    },
    en: {
      heroTitle: "Welcome to the Real Paddock Experience.",
      heroSubtitle: "F1 simulations, VR worlds, stage performances and more at Istanbul's next-generation experience center.",
      heroCta: "Discover Now",
      
      featuresTitle: "Premium F1 Experience",
      featuresSubtitle: "Our state-of-the-art simulators await you to experience the most realistic F1 sensation",
      feature1Title: "Realistic Simulation",
      feature1Desc: "The aerodynamics, engine sound and vibrations of real F1 cars are modeled one-to-one",
      feature2Title: "Professional Trainer",
      feature2Desc: "Learn techniques and improve your driving skills with our instructors who have real racing experience",
      feature3Title: "Events",
      feature3Desc: "Organize special events, tournaments and races with your friends and colleagues",
      
      simulatorsTitle: "Our Simulators",
      simulatorsSubtitle: "High-technology simulation and experience areas",
      simulator1Title: "F1 Racing Simulation",
      simulator1Desc: "Equipped with high-precision steering sets used in professional race simulators, hydraulically supported special seats, and multi-screen systems offering an ultra-wide field of view.",
      simulator2Title: "VR Experience Area",
      simulator2Desc: "Step into unique worlds with virtual reality experiences. Experience realistic virtual experiences with the latest VR glasses technology.",
      simulator3Title: "Computer Room",
      simulator3Desc: "Experience modern gaming with high-performance gaming computers. Ideal for group gaming events with your friends.",
      
      eventsTitle: "Upcoming Events",
      eventsSubtitle: "Join our special events that bring F1 enthusiasts together",
      eventsCta: "See All Events",
      eventDetails: "View Details →",
      
      testimonialsTitle: "What Our Customers Say",
      testimonialsSubtitle: "Reviews from those who experienced PadokClub",
      
      ctaTitle: "Are You Ready to Experience Formula 1?",
      ctaSubtitle: "Feel like a real F1 pilot with our professional simulators. Book now for individual sessions or group events.",
      ctaButton1: "Make a Reservation",
      ctaButton2: "Contact Us",
      
      hourPrice: "/ hour",
      bookNow: "Book Now"
    }
  };

  // Choose the current language translations
  const t = translations[language];
  
  if (!mounted) {
    return null; // Return null on server-side to prevent hydration mismatch
  }
  
  return (
    <>
      {/* Hero Section with Slider */}
      <section className="relative text-white h-screen">
        <div className="absolute inset-0 z-[1]">
          {homeSlides.map((slide, index) => (
            <div 
              key={slide}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-30" : "opacity-0"
              }`}
              style={{backdropFilter: "blur(2px)"}}
            >
              <Image
                src={slide}
                alt={`Padok Club Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-[#121212]/40 to-[#121212]/80' : 'from-black/30 to-black/70'}`}></div>
        </div>
        <div className="relative z-[2] max-w-7xl mx-auto py-24 px-6 lg:px-8 flex flex-col items-center text-center h-full flex justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            {t.heroSubtitle}
          </p>
          <Link
            href="/book"
            className={`rounded-md ${isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-[#FF0000]'} px-5 py-3 text-lg font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600`}
          >
            {t.heroCta}
          </Link>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-[2]">
          {homeSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide 
                  ? isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]' 
                  : isDark ? 'bg-[#3A3A3A] hover:bg-[#B0B0B0]' : 'bg-gray-400 hover:bg-red-300'
              }`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
      
      {/* Features Section */}
      <section className={`py-16 ${isDark ? 'bg-[#1E1E1E] text-[#E0E0E0]' : 'bg-white text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-['Titillium_Web']">
              {t.featuresTitle}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
              {t.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-[#262626]' : 'bg-gray-50'}`}>
              <div className={`h-12 w-12 rounded-md ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center mb-4`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 font-['Titillium_Web']">{t.feature1Title}</h3>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
                {t.feature1Desc}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-[#262626]' : 'bg-gray-50'}`}>
              <div className={`h-12 w-12 rounded-md ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center mb-4`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 font-['Titillium_Web']">{t.feature2Title}</h3>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
                {t.feature2Desc}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className={`p-6 rounded-lg shadow-sm ${isDark ? 'bg-[#262626]' : 'bg-gray-50'}`}>
              <div className={`h-12 w-12 rounded-md ${isDark ? 'bg-[#FF0000]' : 'bg-[#E10600]'} flex items-center justify-center mb-4`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2 font-['Titillium_Web']">{t.feature3Title}</h3>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
                {t.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Simulators Section */}
      <section className={`py-16 ${isDark ? 'bg-[#262626]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              {t.simulatorsTitle}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
              {t.simulatorsSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Simulator 1 */}
            <div className={`overflow-hidden shadow-sm rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} flex flex-col h-full`}>
              <div className="relative h-64">
                <Image
                  src={simulatorImages.f1}
                  alt={t.simulator1Title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className={`text-xl font-medium mb-2 font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                  {t.simulator1Title}
                </h3>
                <p className={`mb-4 font-['Inter'] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} flex-grow`}>
                  {t.simulator1Desc}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-lg font-bold font-['Barlow Condensed'] ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'}`}>
                    ₺100 {t.hourPrice}
                  </span>
                  <Link
                    href="/book?type=f1"
                    className={`rounded-md ${isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-red-500'} px-4 py-2 text-sm font-semibold text-white shadow-sm`}
                  >
                    {t.bookNow}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Simulator 2 */}
            <div className={`overflow-hidden shadow-sm rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} flex flex-col h-full`}>
              <div className="relative h-64">
                <Image
                  src={simulatorImages.vr}
                  alt={t.simulator2Title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className={`text-xl font-medium mb-2 font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                  {t.simulator2Title}
                </h3>
                <p className={`mb-4 font-['Inter'] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} flex-grow`}>
                  {t.simulator2Desc}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-lg font-bold font-['Barlow Condensed'] ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'}`}>
                    ₺50 {t.hourPrice}
                  </span>
                  <Link
                    href="/book?type=vr"
                    className={`rounded-md ${isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-red-500'} px-4 py-2 text-sm font-semibold text-white shadow-sm`}
                  >
                    {t.bookNow}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Simulator 3 */}
            <div className={`overflow-hidden shadow-sm rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} flex flex-col h-full`}>
              <div className="relative h-64">
                <Image
                  src={simulatorImages.computers}
                  alt={t.simulator3Title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className={`text-xl font-medium mb-2 font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                  {t.simulator3Title}
                </h3>
                <p className={`mb-4 font-['Inter'] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} flex-grow`}>
                  {t.simulator3Desc}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className={`text-lg font-bold font-['Barlow Condensed'] ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'}`}>
                    ₺20 {t.hourPrice}
                  </span>
                  <Link
                    href="/book?type=computers"
                    className={`rounded-md ${isDark ? 'bg-[#FF0000] hover:bg-[#FF3333]' : 'bg-[#E10600] hover:bg-red-500'} px-4 py-2 text-sm font-semibold text-white shadow-sm`}
                  >
                    {t.bookNow}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className={`py-16 ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              {t.eventsTitle}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
              {t.eventsSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className={`overflow-hidden shadow-sm rounded-lg border ${isDark ? 'bg-[#262626] border-[#3A3A3A]' : 'bg-white border-gray-200'} flex flex-col h-full`}>
                <div className="relative h-48">
                  <Image
                    src={event.squareImage}
                    alt={event.title[language as keyof typeof event.title]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-2 ${isDark ? 'bg-[#FF0000]/20 text-[#FF3333]' : 'bg-red-100 text-red-700'}`}>
                        {new Date(event.date).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <h3 className={`text-xl font-medium font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                        {event.title[language as keyof typeof event.title]}
                      </h3>
                    </div>
                    <span className={`text-lg font-bold font-['Barlow Condensed'] ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'}`}>
                      ₺{event.price}
                    </span>
                  </div>
                  <p className={`mt-2 mb-4 font-['Inter'] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} flex-grow`}>
                    {event.description[language as keyof typeof event.description]}
                  </p>
                  <div className="flex justify-end mt-auto">
                    <Link
                      href={`/events/${event.slug}`}
                      className={`font-medium ${isDark ? 'text-[#FF0000] hover:text-[#FF3333]' : 'text-[#E10600] hover:text-red-500'}`}
                    >
                      {t.eventDetails}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/events"
              className={`rounded-md border px-5 py-3 text-base font-semibold shadow-sm ${
                isDark 
                  ? 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000]/10' 
                  : 'border-[#E10600] text-[#E10600] hover:bg-red-50'
              }`}
            >
              {t.eventsCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section - Added for displaying blog posts */}
      <section className={`py-16 ${isDark ? 'bg-[#262626]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold tracking-tight sm:text-4xl font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              {language === 'tr' ? 'Son Blog Yazıları' : 'Latest Blog Posts'}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} font-['Inter']`}>
              {language === 'tr' ? 'F1 ve Motorsporları dünyasından güncel içerikler' : 'Latest content from F1 and Motorsports world'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div key={blog.id} className={`overflow-hidden shadow-sm rounded-lg border ${isDark ? 'bg-[#1E1E1E] border-[#3A3A3A]' : 'bg-white border-gray-200'} flex flex-col h-full`}>
                <div className="relative h-48">
                  <Image
                    src={blog.thumbnailImage}
                    alt={blog.title[language]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mb-2 ${isDark ? 'bg-[#FF0000]/20 text-[#FF3333]' : 'bg-red-100 text-red-700'}`}>
                      {blog.category.toUpperCase()}
                    </span>
                    <h3 className={`text-xl font-medium font-['Titillium_Web'] ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
                      {blog.title[language]}
                    </h3>
                  </div>
                  <p className={`mt-2 mb-4 font-['Inter'] ${isDark ? 'text-[#B0B0B0]' : 'text-gray-600'} flex-grow`}>
                    {blog.excerpt[language]}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 overflow-hidden`}>
                        {blog.author.avatar ? (
                          <Image
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold">{blog.author.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className={`text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-gray-500'}`}>
                        {blog.author.name}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${blog.slug}`}
                      className={`font-medium ${isDark ? 'text-[#FF0000] hover:text-[#FF3333]' : 'text-[#E10600] hover:text-red-500'}`}
                    >
                      {language === 'tr' ? 'Devamını Oku →' : 'Read More →'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className={`rounded-md border px-5 py-3 text-base font-semibold shadow-sm ${
                isDark 
                  ? 'border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000]/10' 
                  : 'border-[#E10600] text-[#E10600] hover:bg-red-50'
              }`}
            >
              {language === 'tr' ? 'Tüm Blog Yazılarını Gör' : 'See All Blog Posts'}
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className={`py-16 ${isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-gray-900 text-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-['Titillium_Web']">
              {t.testimonialsTitle}
            </h2>
            <p className={`mt-4 text-lg ${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter']`}>
              {t.testimonialsSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-800'}`}>
              <div className="flex items-center mb-4">
                <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-[#FF0000]' : 'bg-red-600'} flex items-center justify-center mr-3`}>
                  <span className="text-lg font-bold">M</span>
                </div>
                <div>
                  <h3 className="font-medium font-['Titillium_Web']">Mehmet Yılmaz</h3>
                  <p className={`text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-gray-400'} font-['Inter']`}>
                    İstanbul
                  </p>
                </div>
              </div>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter']`}>
                {language === 'tr' 
                  ? '"Hayatımda yaşadığım en gerçekçi F1 deneyimiydi. Simülatörler son derece gerçekçi ve eğitmenler çok profesyonel."'
                  : '"It was the most realistic F1 experience I\'ve ever had. The simulators are extremely realistic and the instructors are very professional."'
                }
              </p>
            </div>
            
            {/* Testimonial 2 */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-800'}`}>
              <div className="flex items-center mb-4">
                <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-[#FF0000]' : 'bg-red-600'} flex items-center justify-center mr-3`}>
                  <span className="text-lg font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-medium font-['Titillium_Web']">Ayşe Kaya</h3>
                  <p className={`text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-gray-400'} font-['Inter']`}>
                    Ankara
                  </p>
                </div>
              </div>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter']`}>
                {language === 'tr'
                  ? '"Şirket etkinliğimiz için rezervasyon yapmıştık. Tüm ekip inanılmaz keyif aldı. Kesinlikle tekrar geleceğiz!"'
                  : '"We made a reservation for our company event. The whole team had an incredible time. We will definitely come back!"'
                }
              </p>
            </div>
            
            {/* Testimonial 3 */}
            <div className={`p-6 rounded-lg ${isDark ? 'bg-[#1E1E1E]' : 'bg-gray-800'}`}>
              <div className="flex items-center mb-4">
                <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-[#FF0000]' : 'bg-red-600'} flex items-center justify-center mr-3`}>
                  <span className="text-lg font-bold">C</span>
                </div>
                <div>
                  <h3 className="font-medium font-['Titillium_Web']">Can Demir</h3>
                  <p className={`text-sm ${isDark ? 'text-[#B0B0B0]' : 'text-gray-400'} font-['Inter']`}>
                    İzmir
                  </p>
                </div>
              </div>
              <p className={`${isDark ? 'text-[#B0B0B0]' : 'text-gray-300'} font-['Inter']`}>
                {language === 'tr'
                  ? '"F1 tutkunuyum ve PadokClub\'ın sunduğu deneyim beklentilerimin ötesindeydi. Hareket sistemleri olağanüstü!"'
                  : '"I\'m an F1 enthusiast and the experience PadokClub offers was beyond my expectations. The motion systems are extraordinary!"'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className={`py-16 ${isDark ? 'bg-[#FF0000] text-white' : 'bg-[#E10600] text-white'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6 font-['Titillium_Web']">
            {t.ctaTitle}
          </h2>
          <p className={`text-lg ${isDark ? 'text-[#FFFFFF]' : 'text-red-100'} mb-8 max-w-3xl mx-auto font-['Inter']`}>
            {t.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/book"
              className={`rounded-md px-5 py-3 text-base font-semibold shadow-sm ${
                isDark 
                  ? 'bg-white text-[#FF0000] hover:bg-[#E0E0E0]' 
                  : 'bg-white text-[#E10600] hover:bg-gray-100'
              }`}
            >
              {t.ctaButton1}
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-white px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#FF0000] hover:border-[#FF0000]"
            >
              {t.ctaButton2}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
