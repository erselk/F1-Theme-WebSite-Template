'use client';

import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { MapPin, Clock, Phone, Mail, Instagram, Users, Wrench, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function ContactContent() {
  const { language, isDark } = useThemeLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Değişkeni dışarıda tanımlayalım ki submit anında kaybedeceğimiz değerleri bulabilelim
  const initialFormState = {
    name: "",
    email: "",
    subject: "",
    message: "",
  };

  // Translations
  const translations = {
    tr: {
      contactInfo: {
        phone: "Telefon",
        email: "E-posta",
        instagram: "Instagram", 
        address: "Adres",
        hours: "Çalışma Saatleri",
        weekdays: "Pazartesi-Cuma: 09:00-18:00",
        weekend: "Cumartesi: 10:00-15:00",
        getDirections: "Yol Tarifi Al"
      },
      contactForm: {
        title: "İletişim Formu",
        subtitle: "Sorularınız veya önerileriniz için lütfen aşağıdaki formu doldurun. En kısa sürede size dönüş yapacağız.",
        name: "İsim",
        email: "E-posta",
        subject: "Konu",
        message: "Mesaj",
        send: "Gönder",
        success: "Mesajınız başarıyla gönderildi!",
        successDetail: "En kısa sürede size dönüş yapacağız.",
        error: "Mesaj gönderilemedi"
      },
      sections: {
        events: "Etkinlikler & İş Birlikleri",
        eventsDetail: "Etkinlik organizasyonu, sponsorluk veya iş birliği teklifleri için lütfen aşağıdaki e-posta adresi üzerinden bizimle iletişime geçin:",
        support: "Teknik Destek",
        supportDetail: "Web sitesi, aplikasyon veya hesap ile ilgili teknik sorunlar için destek ekibimize aşağıdaki e-posta adresinden ulaşabilirsiniz:"
      }
    },
    en: {
      contactInfo: {
        phone: "Phone",
        email: "Email",
        instagram: "Instagram",
        address: "Address",
        hours: "Working Hours",
        weekdays: "Monday-Friday: 09:00-18:00",
        weekend: "Saturday: 10:00-15:00",
        getDirections: "Get Directions"
      },
      contactForm: {
        title: "Contact Form",
        subtitle: "For your questions or suggestions, please fill in the form below. We will get back to you as soon as possible.",
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
        send: "Send",
        success: "Your message has been sent successfully!",
        successDetail: "We will get back to you as soon as possible.",
        error: "Message could not be sent"
      },
      sections: {
        events: "Events & Partnerships",
        eventsDetail: "For event organization, sponsorship or partnership proposals, please contact us via the email address below:",
        support: "Technical Support",
        supportDetail: "For technical issues related to the website, application or account, you can reach our support team via the email address below:"
      }
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formRef.current) return;
    
    // Form verilerini submit anında topluyoruz
    const formData = {
      name: (formRef.current.elements.namedItem('name') as HTMLInputElement).value,
      email: (formRef.current.elements.namedItem('email') as HTMLInputElement).value,
      subject: (formRef.current.elements.namedItem('subject') as HTMLInputElement).value,
      message: (formRef.current.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    
    try {
      // API endpoint'e form verilerini gönder
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Sunucudan JSON yanıtı talep et
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Yanıt başarılı değilse, muhtemelen bir HTML hata sayfasıdır.
        // Ne döndüğünü görmek için metin olarak okuyalım.
        const errorText = await response.text();
        console.error("Sunucu hatası alındı:", response.status, response.statusText, errorText);
        
        // Metni JSON olarak ayrıştırmayı dene, eğer değilse genel bir hata mesajı veya metnin kendisini kullan.
        let errorJson;
        let errorMessageToThrow;
        try {
          errorJson = JSON.parse(errorText);
          errorMessageToThrow = errorJson.error || errorJson.details || `Sunucu Hatası: ${response.status} - ${response.statusText}`;
        } catch (parseError) {
          // JSON olarak ayrıştırma başarısız oldu, muhtemelen HTML veya düz metin.
          // errorText çok uzun olabileceğinden, ilk birkaç yüz karakterini alabiliriz veya daha genel bir mesaj kullanabiliriz.
          errorMessageToThrow = `Sunucudan geçersiz yanıt alındı (JSON bekleniyordu). Durum: ${response.status}. Yanıtın başı: ${errorText.substring(0, 200)}`;
        }
        throw new Error(errorMessageToThrow);
      }

      // Yanıt başarılıysa, JSON bekliyoruz.
      const result = await response.json(); // Hata burada oluşuyordu. Artık response.ok kontrolünden sonra.

      // Form gönderimi başarılı olduğunda
      setFormSubmitted(true);
      
      // 3 saniye sonra formu sıfırla
      setTimeout(() => {
        setFormSubmitted(false);
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 3000);
    } catch (error: any) {
      // error.message will contain result.error (the specific message from the API)
      // or the message from a network error (e.g., "Failed to fetch")
      // t.contactForm.error is the generic "Mesaj gönderilemedi"
      // The last part is a final fallback.
      const errorMessage = error?.message || t.contactForm.error || 'Mesajınız gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
      alert(errorMessage);
    }
  };

  // Define theme-specific classes
  const cardBgClass = isDark 
    ? 'bg-[#1a1a1a]' 
    : 'bg-white';
  
  // İletişim kartları için renkler
  const contactCardBgClass = isDark 
    ? 'bg-[#1E1E1E] hover:bg-[#262626]' 
    : 'bg-[#f9f9f9] hover:bg-[#f5f5f5]';
  
  // Form kartı için renkler
  const formCardBgClass = isDark 
    ? 'bg-[#1E1E1E]' 
    : 'bg-[#f9f9f9]';
  
  // Etkinlikler kartı için renkler
  const eventsCardBgClass = isDark 
    ? 'bg-[#1E1E1E]' 
    : 'bg-[#f9f9f9]';
  
  // Teknik destek kartı için renkler
  const supportCardBgClass = isDark 
    ? 'bg-[#1E1E1E]' 
    : 'bg-[#f9f9f9]';
  
  // İçerik kartları için genel stil
  const shadowClass = isDark ? 'shadow-md shadow-black/20' : 'shadow-md shadow-gray-400/15';
  const containerClass = isDark ? 'border border-carbon-grey/30' : 'border border-gray-200/70';
  
  // Farklı bileşenler için farklı renkler (HEX kodları ile)
  // İletişim kartları - kırmızı
  const contactBorderClass = isDark ? 'border-l-4 border-l-[#FF3E41]' : 'border-l-4 border-l-[#E10600]';
  const contactIconClass = isDark ? 'text-[#FF3E41]' : 'text-[#E10600]';
  
  // Form - mavi
  const formBorderClass = isDark ? 'border-l-4 border-l-[#0075FF]' : 'border-l-4 border-l-[#0046AD]';
  const formIconClass = isDark ? 'text-[#0075FF]' : 'text-[#0046AD]';
  
  // Etkinlikler - turuncu/amber (Standart Tailwind renkleri, zaten çalışıyor)
  const eventsBorderClass = isDark ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-amber-600';
  const eventsIconClass = isDark ? 'text-amber-500' : 'text-amber-600';
  
  // Teknik destek - yeşil
  const supportBorderClass = isDark ? 'border-l-4 border-l-[#10FF9F]' : 'border-l-4 border-l-green-600';
  const supportIconClass = isDark ? 'text-[#10FF9F]' : 'text-green-600';
  
  // Input field styling - mavi odaklanma (HEX kodları ile)
  const inputClass = `w-full p-2 sm:p-3 border rounded-md text-xs sm:text-sm outline-none ${
    isDark 
      ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-[#0075FF] focus:ring focus:ring-[#0075FF]/30' 
      : 'border-gray-300 bg-white text-gray-900 focus:border-[#0046AD] focus:ring focus:ring-[#0046AD]/30'
  }`;
  
  // Button styling - (Gönder butonu zaten inline style ile HEX kullanıyor, bu class başka bir yerde kullanılmıyorsa kaldırılabilir)
  const buttonClass = `px-6 sm:px-8 py-2 sm:py-3 text-white rounded-md transition-colors text-xs sm:text-sm font-medium font-['Titillium_Web'] ${
    isDark 
      ? 'bg-[#0075FF] hover:bg-[#0075FF]/90 text-white hover:text-white' // electric-blue
      : 'bg-[#0046AD] hover:bg-[#0046AD]/90 text-white hover:text-white' // race-blue
  }`;
  
  // Metin renkleri
  const headingTextClass = isDark ? 'text-[#E0E0E0]' : 'text-dark-grey';
  const subTextClass = isDark ? 'text-[#B0B0B0]' : 'text-medium-grey';
  
  // Contact Form Component - extracted to reuse and reposition on mobile
  const ContactFormComponent = () => (
    <div className={`${formCardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${formBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <MessageSquare className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${formIconClass}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.contactForm.title}</h2>
      </div>
      <p className={`text-xs sm:text-sm mb-5 sm:mb-8 ${subTextClass}`}>{t.contactForm.subtitle}</p>
      
      {formSubmitted ? (
        <div className={`${isDark ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-green-50 border border-green-200 text-green-700'} p-4 sm:p-6 rounded-md text-center`}>
          <p className="text-sm font-medium">{t.contactForm.success}</p>
          <p className="text-xs sm:text-sm mt-2">{t.contactForm.successDetail}</p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} method="POST" noValidate>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="name" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={initialFormState.name}
              className={inputClass}
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="email" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={initialFormState.email}
              className={inputClass}
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="subject" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.subject}</label>
            <input
              type="text"
              id="subject"
              name="subject"
              defaultValue={initialFormState.subject}
              className={inputClass}
              required
            />
          </div>
          <div className="mb-5 sm:mb-6">
            <label htmlFor="message" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.message}</label>
            <textarea
              id="message"
              name="message"
              defaultValue={initialFormState.message}
              rows={5}
              className={inputClass}
              required
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className={`px-6 sm:px-8 py-2 sm:py-3 text-white rounded-md transition-colors text-xs sm:text-sm font-medium font-['Titillium_Web'] ${
                isDark 
                  ? 'bg-[#0075FF] hover:bg-[#0075FF]/90' 
                  : 'bg-[#0046AD] hover:bg-[#0046AD]/90'
              }`}
            >
              {t.contactForm.send}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // Events & Partnerships Section Component
  const EventsComponent = () => (
    <div className={`${eventsCardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${eventsBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <Users className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${eventsIconClass}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.events}</h2>
      </div>
      <p className={`mb-4 sm:mb-6 text-xs sm:text-sm ${subTextClass}`}>{t.sections.eventsDetail}</p>
      <a href="mailto:etkinlik@padokclub.com" className={`${eventsIconClass} hover:underline font-medium text-sm sm:text-base`}>etkinlik@padokclub.com</a>
    </div>
  );

  // Technical Support Section Component
  const SupportComponent = () => (
    <div className={`${supportCardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${supportBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <Wrench className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${supportIconClass}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.support}</h2>
      </div>
      <p className={`mb-4 sm:mb-6 text-xs sm:text-sm ${subTextClass}`}>{t.sections.supportDetail}</p>
      <a href="mailto:destek@padokclub.com" className={`${supportIconClass} hover:underline font-medium text-sm sm:text-base`}>destek@padokclub.com</a>
    </div>
  );

  return (
    <div className="mb-12 sm:mb-16 px-3 sm:px-6 md:px-10 lg:px-16">
      {/* Contact Cards - scaled down on mobile */}
      <div className="mb-8 sm:mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div className={`${contactCardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass} transition-colors duration-200`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Phone className={`w-4 h-4 sm:w-6 sm:h-6 ${contactIconClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.phone}</h3>
              <a href="tel:+90XXXXXXXXXX" className={`text-[10px] sm:text-xs ${subTextClass} hover:${contactIconClass}`}>+90 (XXX) XXX XX XX</a>
            </div>
          </div>
          
          <div className={`${contactCardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass} transition-colors duration-200`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Mail className={`w-4 h-4 sm:w-6 sm:h-6 ${contactIconClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.email}</h3>
              <a href="mailto:info@padokclub.com" className={`text-[10px] sm:text-xs ${subTextClass} ${contactIconClass} hover:underline`}>info@padokclub.com</a>
            </div>
          </div>
          
          <div className={`${contactCardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass} text-white`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Instagram className={`w-4 h-4 sm:w-6 sm:h-6 ${contactIconClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.instagram}</h3>
              <a href="https://instagram.com/padokclub" target="_blank" rel="noopener noreferrer" className={`text-[10px] sm:text-xs ${contactIconClass} hover:underline`}>@padokclub</a>
            </div>
          </div>

          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <MapPin className={`w-4 h-4 sm:w-6 sm:h-6 ${contactIconClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.address}</h3>
              <p className="text-[10px] sm:text-xs">Levent Mah, Levent Cad No:51</p>
              <p className="text-[10px] sm:text-xs mb-1 sm:mb-2">34330 Beşiktaş / İstanbul</p>
              <Link 
                href="https://maps.app.goo.gl/epxeP5PZGRGeCkC88" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`mt-0.5 sm:mt-1 inline-flex items-center text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded ${contactIconClass} hover:underline`}
              >
                <MapPin className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> {t.contactInfo.getDirections}
              </Link>
            </div>
          </div>

          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Clock className={`w-4 h-4 sm:w-6 sm:h-6 ${contactIconClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.hours}</h3>
              <p className="text-[10px] sm:text-xs">{t.contactInfo.weekdays}</p>
              <p className="text-[10px] sm:text-xs">{t.contactInfo.weekend}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Special layout for mobile: Events & Support sections first, Contact Form last */}
      <div>
        {/* On mobile: Events and Support appear first, stacked */}
        <div className="block md:hidden space-y-5">
          <EventsComponent />
          <SupportComponent />
          <div className="mt-5">
            <ContactFormComponent />
          </div>
        </div>

        {/* On desktop: Contact Form left, Events & Support right */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-10">
          <div className="md:col-span-5">
            <ContactFormComponent />
          </div>
          
          <div className="md:col-span-7 flex flex-col space-y-6 lg:space-y-10">
            <EventsComponent />
            <SupportComponent />
          </div>
        </div>
      </div>
    </div>
  );
}