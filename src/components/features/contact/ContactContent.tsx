'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import { MapPin, Clock, Phone, Mail, Instagram, Users, Wrench, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useThemeLanguage } from "@/lib/ThemeLanguageContext";

export default function ContactContent() {
  const { language, isDark } = useThemeLanguage();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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
        successDetail: "En kısa sürede size dönüş yapacağız."
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
        successDetail: "We will get back to you as soon as possible."
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Form submission would normally be implemented here
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  // Define theme-specific classes
  const cardBgClass = isDark ? 'bg-graphite' : 'bg-light-grey';
  const headingTextClass = isDark ? 'text-white' : 'text-dark-grey';
  const subTextClass = isDark ? 'text-silver' : 'text-medium-grey';
  const primaryBtnClass = isDark 
    ? 'bg-neon-red hover:bg-neon-red/90' 
    : 'bg-f1-red hover:bg-f1-red/90';
  const primaryTextClass = isDark ? 'text-electric-blue' : 'text-race-blue';
  const shadowClass = isDark ? 'shadow-md shadow-black/20' : 'shadow-md shadow-gray-400/15';
  const containerClass = isDark ? 'border border-carbon-grey/30' : 'border border-gray-200/70';
  
  // Contact info card accent colors - all using f1-red/neon-red
  const contactBorderClass = isDark ? 'border-l-4 border-l-neon-red' : 'border-l-4 border-l-f1-red';
  
  // Form border - using blue
  const formBorderClass = isDark ? 'border-l-4 border-l-electric-blue' : 'border-l-4 border-l-race-blue';
  
  // Events and support border - using green
  const sectionsBorderClass = isDark ? 'border-l-4 border-l-neon-green' : 'border-l-4 border-l-green-600';
  
  // Contact Form Component - extracted to reuse and reposition on mobile
  const ContactFormComponent = () => (
    <div className={`${cardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${formBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <MessageSquare className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${primaryTextClass}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.contactForm.title}</h2>
      </div>
      <p className={`text-xs sm:text-sm mb-5 sm:mb-8 ${subTextClass}`}>{t.contactForm.subtitle}</p>
      
      {formSubmitted ? (
        <div className={`${isDark ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-green-50 border border-green-200 text-green-700'} p-4 sm:p-6 rounded-md text-center`}>
          <p className="text-sm font-medium">{t.contactForm.success}</p>
          <p className="text-xs sm:text-sm mt-2">{t.contactForm.successDetail}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="name" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.name}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full p-2 sm:p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-xs sm:text-sm`}
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="email" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.email}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full p-2 sm:p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-xs sm:text-sm`}
              required
            />
          </div>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="subject" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.subject}</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className={`w-full p-2 sm:p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-xs sm:text-sm`}
              required
            />
          </div>
          <div className="mb-5 sm:mb-6">
            <label htmlFor="message" className={`block mb-1 sm:mb-2 text-xs sm:text-sm font-medium ${headingTextClass}`}>{t.contactForm.message}</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={5}
              className={`w-full p-2 sm:p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-xs sm:text-sm`}
              required
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className={`px-6 sm:px-8 py-2 sm:py-3 ${primaryBtnClass} text-white rounded-md transition-colors text-xs sm:text-sm font-['Titillium_Web'] font-medium`}
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
    <div className={`${cardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${sectionsBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <Users className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${isDark ? 'text-neon-green' : 'text-green-600'}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.events}</h2>
      </div>
      <p className={`mb-4 sm:mb-6 text-xs sm:text-sm ${subTextClass}`}>{t.sections.eventsDetail}</p>
      <a href="mailto:etkinlik@padokclub.com" className={`${isDark ? 'text-neon-green' : 'text-green-600'} hover:underline font-medium text-sm sm:text-base`}>etkinlik@padokclub.com</a>
    </div>
  );

  // Technical Support Section Component
  const SupportComponent = () => (
    <div className={`${cardBgClass} p-6 sm:p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${sectionsBorderClass}`}>
      <div className="flex items-center mb-4 sm:mb-6">
        <Wrench className={`w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 ${isDark ? 'text-neon-green' : 'text-green-600'}`} />
        <h2 className={`text-base sm:text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.support}</h2>
      </div>
      <p className={`mb-4 sm:mb-6 text-xs sm:text-sm ${subTextClass}`}>{t.sections.supportDetail}</p>
      <a href="mailto:destek@padokclub.com" className={`${isDark ? 'text-neon-green' : 'text-green-600'} hover:underline font-medium text-sm sm:text-base`}>destek@padokclub.com</a>
    </div>
  );

  return (
    <div className="mb-12 sm:mb-16 px-3 sm:px-6 md:px-10 lg:px-16">
      {/* Contact Cards - scaled down on mobile */}
      <div className="mb-8 sm:mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Phone className={`w-4 h-4 sm:w-6 sm:h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.phone}</h3>
              <a href="tel:+90XXXXXXXXXX" className={`text-[10px] sm:text-xs hover:${primaryTextClass}`}>+90 (XXX) XXX XX XX</a>
            </div>
          </div>
          
          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Mail className={`w-4 h-4 sm:w-6 sm:h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.email}</h3>
              <a href="mailto:info@padokclub.com" className={`text-[10px] sm:text-xs ${primaryTextClass} hover:underline`}>info@padokclub.com</a>
            </div>
          </div>
          
          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Instagram className={`w-4 h-4 sm:w-6 sm:h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.instagram}</h3>
              <a href="https://instagram.com/padokclub" target="_blank" rel="noopener noreferrer" className={`text-[10px] sm:text-xs ${primaryTextClass} hover:underline`}>@padokclub</a>
            </div>
          </div>

          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <MapPin className={`w-4 h-4 sm:w-6 sm:h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 ${headingTextClass}`}>{t.contactInfo.address}</h3>
              <p className="text-[10px] sm:text-xs">Levent Mah, Levent Cad No:51</p>
              <p className="text-[10px] sm:text-xs mb-1 sm:mb-2">34330 Beşiktaş / İstanbul</p>
              <Link 
                href="https://maps.app.goo.gl/epxeP5PZGRGeCkC88" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`mt-0.5 sm:mt-1 inline-flex items-center text-[10px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2 rounded ${isDark ? 'text-neon-red' : 'text-f1-red'} hover:underline`}
              >
                <MapPin className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> {t.contactInfo.getDirections}
              </Link>
            </div>
          </div>

          <div className={`${cardBgClass} p-3 sm:p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-4 sm:h-6 mb-1 sm:mb-2">
              <Clock className={`w-4 h-4 sm:w-6 sm:h-6 ${primaryTextClass}`} />
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