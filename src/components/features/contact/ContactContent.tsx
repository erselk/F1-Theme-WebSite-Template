'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import { MapPin, Clock, Phone, Mail, Instagram, Users, Wrench, ExternalLink, MessageSquare } from "lucide-react";
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
      contactForm: {
        title: "İletişim Formu",
        subtitle: "Bizimle ilgili bir sorunuz veya öneriniz mi var?",
        name: "Adınız Soyadınız",
        email: "E-posta",
        subject: "Konu",
        message: "Mesajınız",
        send: "Gönder",
        success: "Mesajınız iletilmiştir!",
        successDetail: "En kısa sürede size dönüş yapacağız."
      },
      contactInfo: {
        phone: "Telefon",
        email: "E-posta",
        instagram: "Instagram",
        address: "Adresimiz",
        getDirections: "Yol Tarifi Al",
        hours: "Ziyaret Saatleri",
        weekdays: "Hafta içi: 10:00–22:00",
        weekend: "Hafta sonu: 10:00–00:00"
      },
      sections: {
        events: "Etkinlik & İş Birlikleri",
        eventsDetail: "Etkinlik düzenlemek, özel gün rezervasyonu yapmak ya da marka iş birliği görüşmeleri için bizimle doğrudan iletişime geçebilirsiniz.",
        support: "Teknik Destek / Üyelik Soruları",
        supportDetail: "Sistem kullanımı, rezervasyon veya teknik sorunlar için bizimle iletişime geçebilirsiniz."
      }
    },
    en: {
      contactForm: {
        title: "Contact Form",
        subtitle: "Do you have a question or suggestion for us?",
        name: "Full Name",
        email: "Email",
        subject: "Subject",
        message: "Your Message",
        send: "Send",
        success: "Your message has been sent!",
        successDetail: "We will get back to you as soon as possible."
      },
      contactInfo: {
        phone: "Phone",
        email: "Email",
        instagram: "Instagram",
        address: "Address",
        getDirections: "Get Directions",
        hours: "Visiting Hours",
        weekdays: "Weekdays: 10:00–22:00",
        weekend: "Weekends: 10:00–00:00"
      },
      sections: {
        events: "Events & Partnerships",
        eventsDetail: "To organize an event, make a reservation for a special day, or discuss brand partnerships, please contact us directly.",
        support: "Technical Support / Membership",
        supportDetail: "Please contact us for system usage, reservations, or technical issues."
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
  // Using theme-dependent button styling with solid colors (no opacity)
  const primaryBtnClass = isDark 
    ? 'bg-[#FF0000] hover:bg-[#FF3333]' 
    : 'bg-[#E10600] hover:bg-[#E10600]';
  const primaryTextClass = isDark ? 'text-electric-blue' : 'text-race-blue';
  const shadowClass = isDark ? 'shadow-md shadow-shadow-color/25' : 'shadow-md shadow-shadow-color/10';
  const containerClass = isDark ? 'border border-carbon-grey/30' : 'border border-gray-200/70';
  
  // Contact info card accent colors - all using f1-red/f1-red-bright
  const contactBorderClass = isDark ? 'border-l-4 border-l-[#FF0000]' : 'border-l-4 border-l-[#E10600]';
  
  // Form border - using blue
  const formBorderClass = isDark ? 'border-l-4 border-l-[#00B2FF]' : 'border-l-4 border-l-[#0090D0]';
  
  // Events and support border - using green
  const sectionsBorderClass = isDark ? 'border-l-4 border-l-[#00D766]' : 'border-l-4 border-l-[#00A14B]';

  return (
    <div className="mb-20 px-6 md:px-10 lg:px-16">
      {/* Contact Channels - with aligned icons and consistent red borders */}
      <div className="mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-6">
          <div className={`${cardBgClass} p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-6 mb-2">
              <Phone className={`w-6 h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium mb-1 ${headingTextClass}`}>{t.contactInfo.phone}</h3>
              <a href="tel:+90XXXXXXXXXX" className={`text-xs hover:${primaryTextClass}`}>+90 (XXX) XXX XX XX</a>
            </div>
          </div>
          
          <div className={`${cardBgClass} p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-6 mb-2">
              <Mail className={`w-6 h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium mb-1 ${headingTextClass}`}>{t.contactInfo.email}</h3>
              <a href="mailto:info@padokclub.com" className={`text-xs ${primaryTextClass} hover:underline`}>info@padokclub.com</a>
            </div>
          </div>
          
          <div className={`${cardBgClass} p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-6 mb-2">
              <Instagram className={`w-6 h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium mb-1 ${headingTextClass}`}>{t.contactInfo.instagram}</h3>
              <a href="https://instagram.com/padokclub" target="_blank" rel="noopener noreferrer" className={`text-xs ${primaryTextClass} hover:underline`}>@padokclub</a>
            </div>
          </div>

          <div className={`${cardBgClass} p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-6 mb-2">
              <MapPin className={`w-6 h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium mb-1 ${headingTextClass}`}>{t.contactInfo.address}</h3>
              <p className="text-xs">Levent Mah, Levent Cad No:51</p>
              <p className="text-xs mb-2">34330 Beşiktaş / İstanbul</p>
              <a 
                href="https://maps.app.goo.gl/epxeP5PZGRGeCkC88" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`mt-1 inline-flex items-center text-xs py-1 px-2 rounded ${isDark ? 'text-[#FF0000]' : 'text-[#E10600]'} hover:underline`}
              >
                <MapPin className="w-3 h-3 mr-1" /> {t.contactInfo.getDirections}
              </a>
            </div>
          </div>

          <div className={`${cardBgClass} p-4 rounded-lg ${shadowClass} ${containerClass} ${contactBorderClass}`}>
            <div className="flex justify-center h-6 mb-2">
              <Clock className={`w-6 h-6 ${primaryTextClass}`} />
            </div>
            <div className="text-center">
              <h3 className={`text-sm font-medium mb-1 ${headingTextClass}`}>{t.contactInfo.hours}</h3>
              <p className="text-xs">{t.contactInfo.weekdays}</p>
              <p className="text-xs">{t.contactInfo.weekend}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form (left) and Other Sections (right) - Expanded form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 px-0">
        {/* Contact form on the left - with blue border */}
        <div className="md:col-span-5">
          <div className={`${cardBgClass} p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${formBorderClass}`}>
            <div className="flex items-center mb-6">
              <MessageSquare className={`w-7 h-7 mr-3 ${primaryTextClass}`} />
              <h2 className={`text-xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.contactForm.title}</h2>
            </div>
            <p className={`text-sm mb-8 ${subTextClass}`}>{t.contactForm.subtitle}</p>
            
            {formSubmitted ? (
              <div className={`${isDark ? 'bg-neon-green/10 border-neon-green/30 text-neon-green' : 'bg-green-50 border border-green-200 text-green-700'} p-6 rounded-md text-center`}>
                <p className="font-medium">{t.contactForm.success}</p>
                <p className="text-sm mt-2">{t.contactForm.successDetail}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="name" className={`block mb-2 text-sm font-medium ${headingTextClass}`}>{t.contactForm.name}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-sm`}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="email" className={`block mb-2 text-sm font-medium ${headingTextClass}`}>{t.contactForm.email}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-sm`}
                    required
                  />
                </div>
                <div className="mb-5">
                  <label htmlFor="subject" className={`block mb-2 text-sm font-medium ${headingTextClass}`}>{t.contactForm.subject}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-sm`}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className={`block mb-2 text-sm font-medium ${headingTextClass}`}>{t.contactForm.message}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full p-3 border ${isDark ? 'border-carbon-grey bg-dark-grey text-light-grey focus:border-electric-blue' : 'border-gray-300 text-dark-grey focus:border-race-blue'} rounded-md focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-electric-blue/30' : 'focus:ring-race-blue/30'} text-sm`}
                    required
                  ></textarea>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className={`px-8 py-3 ${primaryBtnClass} text-white rounded-md transition-colors text-sm font-['Titillium_Web'] font-medium shadow-sm ${isDark ? 'shadow-black/30' : 'shadow-gray-400/20'}`}
                  >
                    {t.contactForm.send}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Events & Partnerships and Technical Support stacked on the right - both with green borders */}
        <div className="md:col-span-7 flex flex-col space-y-8 lg:space-y-12">
          <div className={`${cardBgClass} p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${sectionsBorderClass}`}>
            <div className="flex items-center mb-6">
              <Users className={`w-8 h-8 mr-4 ${isDark ? 'text-[#00D766]' : 'text-[#00A14B]'}`} />
              <h2 className={`text-2xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.events}</h2>
            </div>
            <p className={`mb-8 text-lg ${subTextClass} px-2`}>{t.sections.eventsDetail}</p>
            <a href="mailto:etkinlik@padokclub.com" className={`${isDark ? 'text-[#00D766]' : 'text-[#00A14B]'} hover:underline font-medium text-lg ml-2`}>etkinlik@padokclub.com</a>
          </div>

          <div className={`${cardBgClass} p-8 lg:p-10 rounded-lg ${shadowClass} ${containerClass} ${sectionsBorderClass}`}>
            <div className="flex items-center mb-6">
              <Wrench className={`w-8 h-8 mr-4 ${isDark ? 'text-[#00D766]' : 'text-[#00A14B]'}`} />
              <h2 className={`text-2xl font-bold ${headingTextClass} font-['Titillium_Web']`}>{t.sections.support}</h2>
            </div>
            <p className={`mb-8 text-lg ${subTextClass} px-2`}>{t.sections.supportDetail}</p>
            <a href="mailto:destek@padokclub.com" className={`${isDark ? 'text-[#00D766]' : 'text-[#00A14B]'} hover:underline font-medium text-lg ml-2`}>destek@padokclub.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}