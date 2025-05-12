'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useThemeLanguage, LanguageType } from '@/lib/ThemeLanguageContext';
import { Event, EventDescription, Ticket, MultiLanguageText } from '@/data/events';
import Image from 'next/image';
import { generateSlugFromEnglishTitle } from '@/data/events/utils';
import { PlusIcon, MinusIcon, TrashIcon, ArrowPathIcon, PhotoIcon } from '@heroicons/react/24/outline';
import useTranslate from '@/hooks/useTranslate';
import ImageSelector from './ImageSelector';

// Interface for image file data
interface ImageFile {
  id: string;
  filename: string;
  url: string;
  publicPath: string;
  createdAt: string;
  contentType: string;
}

// Function to generate ID in the format ddmmyyxxx
const generateEventId = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);
  
  // Random number between 001-999 for the last part
  const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  
  return `${day}${month}${year}${randomNum}`;
};

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const { isDark, language, setLanguage } = useThemeLanguage();
  const isEditMode = !!event;

  // Image selector modals state
  const [bannerSelectorOpen, setBannerSelectorOpen] = useState(false);
  const [squareSelectorOpen, setSquareSelectorOpen] = useState(false);
  const [gallerySelectorOpen, setGallerySelectorOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({
    title: { tr: '', en: '' },
    description: { tr: '', en: '' },
    location: { tr: '', en: '' },
    date: '',
    price: 0,
    category: 'other',
    isFeatured: false,
    bannerImage: '/images/logouzun.png',
    squareImage: '/images/logokare.png',
    slug: '',
    tickets: [], // Changed from default ticket to empty array
    rules: [], // Boş başlaması için boş dizi yapıldı
    gallery: ['/images/logouzun.png', '/images/logouzun.png', '/images/logouzun.png'],
    schedule: []
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Form language selection (for input language and auto-translation)
  const [formLanguage, setFormLanguage] = useState<LanguageType>('tr');

  // Preview images
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [squarePreview, setSquarePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  
  // Default images that already exist in the project
  const defaultBannerImage = '/images/logouzun.png';
  const defaultSquareImage = '/images/logokare.png';
  
  // Initialize form with default images that actually exist and set default date
  useEffect(() => {
    // Set default date as current date with time 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const formattedDate = today.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
    setDateInputValue(formattedDate);
    
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      bannerImage: defaultBannerImage,
      squareImage: defaultSquareImage,
      date: today.toISOString()
    }));
  }, []);

  // Add a separate state for date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Initialize form with event data if in edit mode
  useEffect(() => {
    if (event) {
      // Handle compatibility with old event structure
      const description = event.description && typeof event.description === 'object' 
        ? ('short' in event.description || 'long' in event.description)
          ? {
              tr: event.description.short?.tr || event.description.long?.tr || event.description?.tr || '',
              en: event.description.short?.en || event.description.long?.en || event.description?.en || '',
            }
          : event.description
        : { tr: '', en: '' };
      
      // Set default tickets if not present
      const tickets = event.tickets || [{
        id: 'standard',
        name: { tr: 'Standart Bilet', en: 'Standard Ticket' },
        price: event.price || 0,
        description: { tr: 'Etkinlik girişi', en: 'Event entry' },
        maxPerOrder: 5 // Default to 5 tickets per order
      }];
      
      // Rules handling - convert from API format to form format if needed
      let rules = [];
      if (event.rules) {
        if (typeof event.rules === 'object' && event.rules.tr && event.rules.en) {
          // Convert from API { tr: [str1, str2], en: [str1, str2] } format 
          // to form format: [{id: 'rule-xxx', content: {tr: str1, en: str1}}]
          rules = [];
          // Get the maximum length of either tr or en array
          const maxLength = Math.max(
            Array.isArray(event.rules.tr) ? event.rules.tr.length : 0, 
            Array.isArray(event.rules.en) ? event.rules.en.length : 0
          );
          
          for (let i = 0; i < maxLength; i++) {
            const ruleId = `rule-${Date.now()}-${i}`;
            rules.push({
              id: ruleId,
              content: {
                tr: Array.isArray(event.rules.tr) && i < event.rules.tr.length ? event.rules.tr[i] : '',
                en: Array.isArray(event.rules.en) && i < event.rules.en.length ? event.rules.en[i] : ''
              }
            });
          }
        } else if (Array.isArray(event.rules)) {
          // If rules is already in array format
          // Eski format {tr: '', en: ''} veya yeni format {id: '', content: {tr: '', en: ''}} olabilir
          rules = event.rules.map(rule => {
            if (rule.id && rule.content) {
              // Zaten yeni formatta
              return rule;
            } else {
              // Eski formattan yeni formata dönüştür
              const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              return {
                id: ruleId,
                content: {
                  tr: rule.tr || '',
                  en: rule.en || ''
                }
              };
            }
          });
        }
      }
      
      // If no valid rules found, set a default empty rule
      if (!rules || rules.length === 0) {
        const ruleId = `rule-${Date.now()}`;
        rules = [{ 
          id: ruleId, 
          content: { tr: '', en: '' } 
        }];
      }
      
      // Set default gallery if not present or ensure at least 3 images
      let gallery = event.gallery || [];
      
      // Eğer gallery dizisi boşsa veya yoksa 3 tane logouzun.png ekleyelim
      if (!gallery || gallery.length === 0) {
        gallery = ['/images/logouzun.png', '/images/logouzun.png', '/images/logouzun.png'];
      } 
      // Eğer gallery dizisinde 1 veya 2 görsel varsa, eksik görsel sayısını logouzun.png ile tamamlayalım
      else if (gallery.length < 3) {
        const missingCount = 3 - gallery.length;
        for(let i = 0; i < missingCount; i++) {
          gallery.push('/images/logouzun.png');
        }
      }
      
      // Handle schedule data
      let schedule = [];
      if (event.schedule) {
        if (Array.isArray(event.schedule)) {
          // If schedule is already an array, use it directly
          schedule = event.schedule;
        } else {
          // If it's not an array, try to convert it
          schedule = [];
        }
      }
      
      // If no valid schedule found, set as empty array
      if (!schedule || schedule.length === 0) {
        schedule = [];
      }

      setFormData({
        ...event,
        // Create deep copies to avoid direct references
        title: { ...event.title },
        description,
        location: { ...event.location },
        tickets: JSON.parse(JSON.stringify(tickets)),
        rules: JSON.parse(JSON.stringify(rules)),
        gallery: [...gallery],
        schedule: JSON.parse(JSON.stringify(schedule))
      });
      
      // Initialize date input value if there's an event date
      if (event.date) {
        try {
          const dateObj = new Date(event.date);
          const formattedDate = dateObj.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
          setDateInputValue(formattedDate);
        } catch (e) {
          console.error("Error formatting date:", e);
          setDateInputValue('');
        }
      }
    }
  }, [event]);

  // Text input changes handler - Modified for title and location fields
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      // Special handling for date field
      // Validate date input to prevent invalid date values
      if (e.target instanceof HTMLInputElement && e.target.type === 'datetime-local') {
        // Prevent year from having more than 4 digits
        const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
        if (!datePattern.test(value)) {
          return; // Reject inputs that don't match the expected pattern
        }
      }
      
      setDateInputValue(value);
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        date: value ? new Date(value).toISOString() : ''
      }));
      return;
    }
    
    if (name === 'title') {
      // Direct handling for title field
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        title: {
          ...prev.title!,
          [formLanguage]: value
        }
      }));
    } else if (name === 'location') {
      // Direct handling for location field
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        location: {
          ...prev.location!,
          [formLanguage]: value
        }
      }));
    } else if (name === 'description') {
      // Direct handling for description field
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        description: {
          ...prev.description!,
          [formLanguage]: value
        }
      }));
    } else if (name.includes('.')) {
      // Handle nested properties
      const parts = name.split('.');
      
      if (parts.length === 2) {
        // For other nested properties that don't need translation
        setFormData((prev: Partial<Event>) => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: value
          }
        }));
      }
    } else {
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Checkbox changes handler
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      [name]: checked
    }));
  };

  // Numeric value handler
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  // Ticket changes handlers - Modified for single language input
  const handleTicketChange = (index: number, field: string, value: string | number | boolean) => {
    setFormData((prev: Partial<Event>) => {
      const updatedTickets = [...(prev.tickets || [])];
      
      // Eğer durum değiştirilen alan isSoldOut veya isComingSoon ise, bunların aynı anda true olmasını engelle
      if (field === 'isSoldOut' && value === true) {
        // Eğer isSoldOut true yapılıyorsa, isComingSoon'u false yap
        updatedTickets[index] = {
          ...updatedTickets[index],
          isSoldOut: true,
          isComingSoon: false // isComingSoon'u otomatik olarak false yap
        };
        return { ...prev, tickets: updatedTickets };
      } else if (field === 'isComingSoon' && value === true) {
        // Eğer isComingSoon true yapılıyorsa, isSoldOut'u false yap
        updatedTickets[index] = {
          ...updatedTickets[index],
          isComingSoon: true,
          isSoldOut: false // isSoldOut'u otomatik olarak false yap
        };
        return { ...prev, tickets: updatedTickets };
      }
      
      // Diğer alanların düzenlenmesi için mevcut kodu kullan
      if (field.includes('.')) {
        // Handle fields like 'name' and 'description' that need translation
        const [parent, child] = field.split('.');
        if (child === 'tr' || child === 'en') {
          // If someone is explicitly setting a language field (e.g., in edit mode)
          updatedTickets[index] = {
            ...updatedTickets[index],
            [parent]: {
              ...updatedTickets[index][parent],
              [child]: value
            }
          };
        } else {
          // For our new single language input, store in the selected language
          updatedTickets[index] = {
            ...updatedTickets[index],
            [parent]: {
              ...updatedTickets[index][parent],
              [formLanguage]: value
            }
          };
        }
      } else if (field === 'name' || field === 'description') {
        // Special handling for translatable fields to ensure both language values exist
        updatedTickets[index] = {
          ...updatedTickets[index],
          [field]: {
            ...updatedTickets[index][field],
            [formLanguage]: value as string
          }
        };
      } else if (field === 'price') {
        // Ensure price is always a valid natural number (integer ≥ 0)
        let numValue = 0;
        if (typeof value === 'number') {
          numValue = Math.max(0, Math.floor(value));
        } else if (typeof value === 'string') {
          // Parse string value and ensure it's a non-negative integer
          const parsed = parseInt(value);
          numValue = !isNaN(parsed) ? Math.max(0, parsed) : 0;
        }
        
        updatedTickets[index] = {
          ...updatedTickets[index],
          [field]: numValue
        };
      } else {
        // For other non-translatable fields
        updatedTickets[index] = {
          ...updatedTickets[index],
          [field]: value
        };
      }
      
      return { ...prev, tickets: updatedTickets };
    });
  };

  // Handle ticket price increase
  const increaseTicketPrice = (index: number) => {
    setFormData((prev: Partial<Event>) => {
      const updatedTickets = [...(prev.tickets || [])];
      updatedTickets[index] = {
        ...updatedTickets[index],
        price: (updatedTickets[index].price || 0) + 1
      };
      return { ...prev, tickets: updatedTickets };
    });
  };

  // Handle ticket price decrease
  const decreaseTicketPrice = (index: number) => {
    setFormData((prev: Partial<Event>) => {
      const updatedTickets = [...(prev.tickets || [])];
      updatedTickets[index] = {
        ...updatedTickets[index],
        price: Math.max(0, (updatedTickets[index].price || 0) - 1)
      };
      return { ...prev, tickets: updatedTickets };
    });
  };

  const addTicket = () => {
    const ticketId = `ticket-${Date.now()}`;
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      tickets: [
        ...(prev.tickets || []),
        {
          id: ticketId,
          name: { tr: 'Yeni Bilet', en: 'New Ticket' },
          price: 0,
          description: { tr: '', en: '' },
          maxPerOrder: 5, // Default to 5 tickets per order
          isSoldOut: false,
          isComingSoon: false
        }
      ]
    }));
  };

  const removeTicket = (index: number) => {
    setFormData((prev: Partial<Event>) => {
      const updatedTickets = [...(prev.tickets || [])];
      updatedTickets.splice(index, 1);
      return { ...prev, tickets: updatedTickets };
    });
  };

  // Rules change handlers - Modified for single language input
  const handleRuleChange = (index: number, value: string) => {
    setFormData((prev: Partial<Event>) => {
      const updatedRules = [...(prev.rules || [])];
      
      // Yeni content yapısına uygun olarak güncelleme yapıyoruz
      updatedRules[index] = {
        ...updatedRules[index],
        content: {
          ...updatedRules[index]?.content || {},
          [formLanguage]: value
        }
      };
      
      // Ensure both languages have at least an empty string to prevent undefined errors
      if (!updatedRules[index].content.tr) updatedRules[index].content.tr = '';
      if (!updatedRules[index].content.en) updatedRules[index].content.en = '';
      
      return { ...prev, rules: updatedRules };
    });
  };

  const addRule = () => {
    const ruleId = `rule-${Date.now()}`;
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      rules: [
        ...(prev.rules || []),
        { 
          id: ruleId,
          content: { tr: '', en: '' }
        }
      ]
    }));
  };

  const removeRule = (index: number) => {
    setFormData((prev: Partial<Event>) => {
      const updatedRules = [...(prev.rules || [])];
      updatedRules.splice(index, 1);
      return { ...prev, rules: updatedRules };
    });
  };

  // Schedule handlers
  const handleProgramChange = (index: number, field: string, value: string) => {
    setFormData((prev: Partial<Event>) => {
      const updatedSchedule = [...(prev.schedule || [])];
      
      if (field === 'time') {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          time: value
        };
      } else if (field === 'title' || field === 'description') {
        updatedSchedule[index] = {
          ...updatedSchedule[index],
          [field]: {
            ...updatedSchedule[index][field],
            [formLanguage]: value
          }
        };
      }
      
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const addProgramItem = () => {
    setFormData((prev: Partial<Event>) => ({
      ...prev,
      schedule: [
        ...(prev.schedule || []),
        {
          time: '09:00',
          title: { tr: '', en: '' },
          description: { tr: '', en: '' }
        }
      ]
    }));
  };

  const removeProgramItem = (index: number) => {
    setFormData((prev: Partial<Event>) => {
      const updatedSchedule = [...(prev.schedule || [])];
      updatedSchedule.splice(index, 1);
      return { ...prev, schedule: updatedSchedule };
    });
  };

  // Auto-generate slug from English title
  useEffect(() => {
    if (formData.title?.en && !isEditMode) {
      const slug = generateSlugFromEnglishTitle(formData.title.en);
      
      setFormData((prev: Partial<Event>) => ({
        ...prev,
        slug
      }));
    }
  }, [formData.title?.en, isEditMode]);

  // Validate the form
  const validateForm = () => {
    const errors: {[key: string]: boolean} = {};
    
    // Check required fields - only validate the current language
    const currentLang = formLanguage;
    
    // Check required fields
    if (!formData.title?.[currentLang]?.trim()) {
      errors['title'] = true;
    }
    
    if (!formData.location?.[currentLang]?.trim()) {
      errors['location'] = true;
    }
    
    if (!dateInputValue) {
      errors['date'] = true;
    }
    
    if (!formData.description?.[currentLang]?.trim()) {
      errors['description'] = true;
    }

    // Check tickets - only validate if there are tickets
    if (formData.tickets && formData.tickets.length > 0) {
      formData.tickets.forEach((ticket, index) => {
        if (!ticket.name?.[currentLang]?.trim()) {
          errors[`ticket.${index}.name`] = true;
        }
        if (!ticket.id?.trim()) {
          errors[`ticket.${index}.id`] = true;
        }
      });
    }
    // Removed "else { errors['tickets'] = true; }" to make tickets optional
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Scroll to first error
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(validationErrors)[0];
    if (firstErrorField) {
      let selector = '';
      if (firstErrorField.startsWith('ticket.')) {
        // Extract ticket index and field
        const parts = firstErrorField.split('.');
        if (parts.length === 3) {
          const index = parseInt(parts[1]);
          const field = parts[2];
          selector = `[data-ticket-index="${index}"][data-field="${field}"]`;
        }
      } else {
        selector = `[name="${firstErrorField}"]`;
      }

      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  // Modified form submission to properly handle rule translations
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const isValid = validateForm();
    setShowValidationErrors(true);
    
    if (!isValid) {
      // Scroll to first error
      setTimeout(scrollToFirstError, 100);
      
      // Show error message
      return;
    }
    
    try {
      // Translate all content before submitting
      await translateAllFields();
      
      // Generate event ID if it's a new event (not in edit mode)
      let updatedData = {...formData};
      
      if (!isEditMode) {
        // Generate ID in format ddmmyyxxx
        updatedData.id = generateEventId();
      }
      
      // SLUG kontrolü - title.en değerinden oluşturulacak
      // Boşsa veya geçersizse yeniden oluştur
      let slug = updatedData.slug;
      if (!slug || slug.trim() === '' || slug === 'undefined' || slug.includes('undefined')) {
        if (updatedData.title?.en) {
          slug = generateSlugFromEnglishTitle(updatedData.title.en);
        } else if (updatedData.title?.tr) {
          // İngilizce başlık yoksa Türkçeyi kullan
          slug = generateSlugFromEnglishTitle(updatedData.title.tr);
        } else {
          // Fallback olarak random bir slug oluştur
          const randomPart = Math.random().toString(36).substring(2, 8);
          slug = `event-${randomPart}`;
        }
      }
      
      // Ensure all required fields are properly formatted
      updatedData = {
        ...updatedData,
        slug: slug, // Updated slug handling
        date: updatedData.date ? new Date(updatedData.date).toISOString() : new Date().toISOString(),
      };
      
      // Bilet durumları için isSoldOut ve isComingSoon değerlerinin doğru şekilde işlendiğinden emin ol
      if (updatedData.tickets && Array.isArray(updatedData.tickets)) {
        updatedData.tickets = updatedData.tickets.map(ticket => ({
          ...ticket,
          isSoldOut: ticket.isSoldOut || false,
          isComingSoon: ticket.isComingSoon || false
        }));
      }
      
      // Convert rules format to match MongoDB schema, ensuring both languages are properly set
      if (updatedData.rules && Array.isArray(updatedData.rules)) {
        // Kuralları doğrudan MongoDB modeline uygun formatta bırakalım
        // Boş kuralları filtreleyelim
        updatedData.rules = updatedData.rules.filter(rule => 
          rule && 
          rule.content && 
          (rule.content.tr.trim() || rule.content.en.trim())
        );
      }
      
      // Deep clone the data to avoid any reference issues
      const finalData = JSON.parse(JSON.stringify(updatedData));
      
      onSubmit(finalData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };

  // Generic error message component for fields
  const ErrorMessage = ({ show }: { show: boolean }) => (
    show ? (
      <p className="text-f1-red text-sm mt-1">
        {formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}
      </p>
    ) : null
  );

  // Translate function to process content in other language
  const translateAllFields = async () => {
    try {
      // Define source and target languages
      const fromLang = formLanguage as 'tr' | 'en';
      const toLang = fromLang === 'tr' ? 'en' : 'tr';
      
      // Düzenleme modunda sadece değişen alanları çevir, yeni ekleme modunda tümünü çevir
      if (isEditMode && event) {
        // Import translation service
        const { translateChangedFields } = await import('@/services/translation-service');
        
        try {
          // Orijinal event ile karşılaştırarak sadece değişen alanları çevir
          const translatedFormData = await translateChangedFields(formData, event, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
          console.error('Translation error:', error);
          
          // Kullanıcıya hata mesajı göster
          alert(fromLang === 'tr' 
            ? `Çeviri işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            : `An error occurred during translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          return false;
        }
      } else {
        // Yeni etkinlik ekleme modunda tüm alanları çevir
        const { translateMultiLangObject } = await import('@/services/translation-service');
        
        try {
          // Tüm form verilerini çevirip güncelle
          const translatedFormData = await translateMultiLangObject(formData, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
          console.error('Translation error:', error);
          
          // Kullanıcıya hata mesajı göster
          alert(fromLang === 'tr' 
            ? `Çeviri işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            : `An error occurred during translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          return false;
        }
      }
    } catch (error) {
      console.error('Translation service error:', error);
      
      // Kullanıcıya servis hatası göster
      alert(formLanguage === 'tr'
        ? 'Çeviri servisi yüklenemedi. Lütfen daha sonra tekrar deneyin.'
        : 'Translation service could not be loaded. Please try again later.');
      
      return false;
    }
  };

  // Handle image upload with MongoDB storage
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      // Önce local preview oluştur
      reader.onload = (event) => {
        if (event.target?.result) {
          // Set image preview
          if (name === 'bannerImage') {
            setBannerPreview(event.target.result as string);
          } else if (name === 'squareImage') {
            setSquarePreview(event.target.result as string);
          }
        }
      };
      
      reader.readAsDataURL(file);
      
      try {
        // Dosyayı sunucuya yükle
        const imageCategory = name === 'bannerImage' ? 'banner' : 'square';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', imageCategory);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Görsel yükleme hatası: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Form verisini güncelle
          setFormData(prev => ({
            ...prev,
            [name]: result.publicPath
          }));
        } else {
          console.error('Görsel yükleme hatası:', result.error);
          alert(formLanguage === 'tr' 
            ? 'Görsel yüklenirken bir hata oluştu.'
            : 'An error occurred while uploading the image.');
        }
      } catch (error) {
        console.error('Görsel yükleme hatası:', error);
        alert(formLanguage === 'tr' 
          ? 'Görsel yüklenirken bir hata oluştu.'
          : 'An error occurred while uploading the image.');
      }
    }
  };

  // Handle gallery image uploads with MongoDB storage
  const handleGalleryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newGalleryPaths: string[] = [];
      const newPreviews: string[] = [];
      
      // Varsayılan görsel yolu (varsayılan görselleri tespit etmek için)
      const defaultImagePath = '/images/logouzun.png';
      
      // Mevcut galeriyi ve önizlemeleri alalım
      const currentGallery = [...(formData.gallery || [])];
      
      // Önce varsayılan olmayan görselleri (özel görselleri) tespit edelim
      const customImages = currentGallery.filter(img => img !== defaultImagePath);
      
      // Dosyaları önce local preview için oku
      for (const file of filesArray) {
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onload = (event) => {
            if (event.target?.result) {
              newPreviews.push(event.target.result as string);
              resolve();
            }
          };
          reader.readAsDataURL(file);
        });
      }

      // Önizlemeleri ekle (optimistik UI güncellemesi için)
      const updatedPreviews = [...customImages.map(img => img), ...newPreviews];
      const previewsWithDefault = [...updatedPreviews];
      
      // En az 3 önizleme olmasını sağla
      if (previewsWithDefault.length < 3) {
        const missingCount = 3 - previewsWithDefault.length;
        for (let i = 0; i < missingCount; i++) {
          previewsWithDefault.push(defaultImagePath);
        }
      }
      
      setGalleryPreviews(previewsWithDefault);
      
      // MongoDB'ye yükleme işlemi
      for (const file of filesArray) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', 'gallery');
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Gallery image upload error: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (result.success) {
            // Successful upload, store the path
            newGalleryPaths.push(result.publicPath);
          }
        } catch (error) {
          console.error('Gallery image upload error:', error);
        }
      }
      
      // Tüm başarılı yüklemeleri formData'ya ekle
      if (newGalleryPaths.length > 0) {
        // Final gallery - özel görseller + yeni yüklenenler
        const finalGallery = [...customImages, ...newGalleryPaths];
        
        // En az 3 görsel olmasını sağla
        if (finalGallery.length < 3) {
          const missingCount = 3 - finalGallery.length;
          for (let i = 0; i < missingCount; i++) {
            finalGallery.push(defaultImagePath);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          gallery: finalGallery
        }));
      }
    }
  };

  // Galeri yüklendiğinde önizleme görselleri ile galerinin senkronize olmasını sağlar
  useEffect(() => {
    if (formData.gallery && formData.gallery.length > 0) {
      // Önizleme görsellerini formData.gallery'den yükle - burada varsayılan kontrol yapma
      const previews = formData.gallery.map(imagePath => imagePath);
      setGalleryPreviews(previews);
    }
  }, [formData.gallery]);

  // Galeri görselini kaldır fonksiyonunu düzeltelim
  const removeGalleryImage = (index: number) => {
    // Varsayılan görsel yolu
    const defaultImagePath = '/images/logouzun.png';
    
    setFormData(prev => {
      const updatedGallery = [...(prev.gallery || [])];
      
      // Silinecek görselin varsayılan mı yoksa özel mi olduğunu kontrol et
      const isDefaultImage = updatedGallery[index] === defaultImagePath;
      
      // Görseli kaldır 
      updatedGallery.splice(index, 1);
      
      // Kullanıcının yüklediği görselleri ve varsayılan görselleri ayır
      const customImages = updatedGallery.filter(img => img !== defaultImagePath);
      
      // Toplam görsellerin 3'ten az olması durumunda varsayılan görsellerle tamamla
      const finalGallery = [...customImages];
      
      // Kaç tane varsayılan görsel eklememiz gerekiyor?
      const neededDefaultCount = Math.max(0, 3 - finalGallery.length);
      
      // Eksik kalan miktarı varsayılan görsellerle tamamla
      for (let i = 0; i < neededDefaultCount; i++) {
        finalGallery.push(defaultImagePath);
      }
      
      return { ...prev, gallery: finalGallery };
    });
  };

  // Galeri görsellerinin ilk yüklenmesinde minimum 3 görsel kuralını uygula
  useEffect(() => {
    if (event) {
      // Set default gallery if not present or ensure at least 3 images
      let gallery = event.gallery || [];
      
      // Varsayılan görsel yolu
      const defaultImagePath = '/images/logouzun.png';
      
      // Kullanıcının yüklediği görselleri ve varsayılan görselleri ayır
      const customImages = gallery.filter(img => img !== defaultImagePath);
      
      // Eğer gallery dizisi boşsa veya yoksa 3 tane logouzun.png ekleyelim
      if (!gallery || customImages.length === 0) {
        gallery = [defaultImagePath, defaultImagePath, defaultImagePath];
      } 
      // Eğer gallery dizisinde 1 veya 2 görsel varsa, eksik görsel sayısını logouzun.png ile tamamlayalım
      else if (customImages.length < 3) {
        // Yeni bir dizi oluştur, önce kullanıcı görselleri
        const updatedGallery = [...customImages];
        
        // Kaç tane default görsel eklenmesi gerekiyor?
        const missingCount = 3 - customImages.length;
        
        // Default görselleri ekle
        for(let i = 0; i < missingCount; i++) {
          updatedGallery.push(defaultImagePath);
        }
        
        gallery = updatedGallery;
      }
      
      // Galeri görsellerini ayarla
      setFormData(prev => ({
        ...prev,
        gallery: gallery
      }));
    }
  }, [event]);

  // Galeri görsellerini form datadan kullanarak güncelleyen useEffect
  useEffect(() => {
    if (formData.gallery && formData.gallery.length > 0) {
      // Detaylı loglama ekleyelim
      console.log('Yüklenen galeri görselleri:', formData.gallery);
    }
  }, [formData.gallery]);

  // Handle image selection from modal
  const handleBannerImageSelection = (image: ImageFile) => {
    // MongoDB'den gelen görsel ise doğrudan URL'i kullan, değilse publicPath kullan
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      bannerImage: imageUrl
    }));
    setBannerPreview(null);
  };
  
  const handleSquareImageSelection = (image: ImageFile) => {
    // MongoDB'den gelen görsel ise doğrudan URL'i kullan, değilse publicPath kullan
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      squareImage: imageUrl
    }));
    setSquarePreview(null);
  };
  
  // Handle gallery image selection
  const handleGalleryImageSelection = (image: ImageFile) => {
    // Add the selected image to the gallery
    const defaultImagePath = '/images/logouzun.png';
    
    // MongoDB'den gelen görsel ise doğrudan URL'i kullan, değilse publicPath kullan
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => {
      // Get current gallery
      const currentGallery = [...(prev.gallery || [])];
      
      // Kullanıcının yüklediği görselleri ve varsayılan görselleri ayır
      const customImages = currentGallery.filter(img => img !== defaultImagePath);
      
      // Yeni görseli ekle
      customImages.push(imageUrl);
      
      // Eğer toplam görsel sayısı 3'ün altındaysa, eksik kalan görselleri varsayılan görsel ile tamamla
      const finalGallery = [...customImages];
      
      // Kaç tane varsayılan görsel eklememiz gerekiyor
      const neededDefaultCount = Math.max(0, 3 - finalGallery.length);
      
      // Eksik kalan miktarı varsayılan görsellerle tamamla
      for (let i = 0; i < neededDefaultCount; i++) {
        finalGallery.push(defaultImagePath);
      }
      
      return {
        ...prev,
        gallery: finalGallery
      };
    });
  };

  return (
    <div className={`p-3 sm:p-6 rounded-lg ${isDark ? 'bg-graphite' : 'bg-white'} shadow-md`}>
      {/* Language selection for content input */}
      <div className="mb-4 sm:mb-6">
        <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' ? 'İçerik Dili' : 'Content Language'}
        </label>
        <div className="flex items-center space-x-4">
          <select
            value={formLanguage}
            onChange={(e) => setFormLanguage(e.target.value as LanguageType)}
            className={`px-3 py-2 rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
                : 'bg-white border border-light-grey text-dark-grey'
            }`}
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
          
          <p className={`text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' 
              ? 'İçerik Türkçe girilecek ve yayınlanırken İngilizceye çevrilecek.'
              : 'Content will be entered in English and translated to Turkish when published.'}
          </p>
        </div>
      </div>

      {showValidationErrors && Object.keys(validationErrors).length > 0 && (
        <div className="mb-6 p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {formLanguage === 'tr' 
              ? `Lütfen tüm zorunlu alanları doldurun (${Object.keys(validationErrors).length} eksik alan)`
              : `Please fill in all required fields (${Object.keys(validationErrors).length} missing fields)`}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Information */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Ana Bilgiler' : 'Main Information'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {/* Title */}
            <div className="md:col-span-2">
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title?.[formLanguage] || ''}
                onChange={handleInputChange}
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } ${hasError('title') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              />
              <ErrorMessage show={hasError('title')} />
            </div>

            {/* Event Date and Category - Desktop: side by side, Mobile: stacked */}
            <div className="md:col-span-1">
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Etkinlik Tarihi ve Saati *' : 'Event Date and Time *'}
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                value={dateInputValue}
                onChange={handleInputChange}
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } ${hasError('date') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              />
              <ErrorMessage show={hasError('date')} />
            </div>

            <div className="md:col-span-1">
              <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Kategori *' : 'Category *'}
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category || 'other'}
                onChange={handleInputChange}
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
                    : 'bg-white border border-light-grey text-dark-grey'
                }`}
              >
                <option value="workshop">{formLanguage === 'tr' ? 'Atölye Çalışması' : 'Workshop'}</option>
                <option value="meetup">{formLanguage === 'tr' ? 'Buluşma' : 'Meetup'}</option>
                <option value="conference">{formLanguage === 'tr' ? 'Konferans' : 'Conference'}</option>
                <option value="party">{formLanguage === 'tr' ? 'Parti' : 'Party'}</option>
                <option value="other">{formLanguage === 'tr' ? 'Diğer' : 'Other'}</option>
              </select>
            </div>

            {/* Featured Checkbox */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured || false}
                  onChange={handleCheckboxChange}
                  className={`w-4 h-4 mr-2 ${
                    isDark
                      ? 'bg-carbon-grey border border-dark-grey text-electric-blue'
                      : 'bg-white border border-light-grey text-dark-grey'
                  }`}
                />
                <label className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {formLanguage === 'tr' ? 'Öne Çıkarılsın' : 'Featured'}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Konum Bilgileri' : 'Location Information'}
          </h3>
          
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
              {formLanguage === 'tr' ? 'Konum *' : 'Location *'}
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location?.[formLanguage] || ''}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
                isDark
                  ? 'bg-carbon-grey border border-dark-grey text-white'
                  : 'bg-white border border-light-grey text-dark-grey'
              } ${hasError('location') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
            />
            <ErrorMessage show={hasError('location')} />
          </div>
        </div>
        
        {/* Description */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
          </h3>
          
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
              {formLanguage === 'tr' ? 'Açıklama *' : 'Description *'}
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description?.[formLanguage] || ''}
              onChange={handleInputChange}
              className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base rounded-md ${
                isDark
                  ? 'bg-carbon-grey border border-dark-grey text-white'
                  : 'bg-white border border-light-grey text-dark-grey'
              } ${hasError('description') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
            ></textarea>
            <ErrorMessage show={hasError('description')} />
          </div>
        </div>
        
        {/* Ticket Types Section */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className={`text-sm sm:text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {formLanguage === 'tr' ? 'Bilet Tipleri' : 'Ticket Types'}
            </h3>
            
            <button
              type="button"
              onClick={addTicket}
              className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              }`}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
              <span className="hidden sm:inline">
                {formLanguage === 'tr' ? 'Yeni Bilet Tipi Ekle' : 'Add New Ticket Type'}
              </span>
            </button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {Array.isArray(formData.tickets) && formData.tickets.length > 0 ? (
              formData.tickets.map((ticket, index) => (
                <div 
                  key={ticket.id || `ticket-${index}`} 
                  className={`p-2 sm:p-3 border rounded-md ${
                    isDark ? 'border-dark-grey' : 'border-light-grey'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                      {formLanguage === 'tr' ? `Bilet #${index + 1}` : `Ticket #${index + 1}`}
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className={`p-1 rounded-md ${
                        isDark
                          ? 'text-silver hover:bg-dark-grey'
                          : 'text-medium-grey hover:bg-very-light-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu bilet tipini sil" : "Delete this ticket type"}
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {/* Ticket Name */}
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Bilet Adı *' : 'Ticket Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        data-ticket-index={index}
                        data-field="name"
                        value={ticket.name[formLanguage]}
                        onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        } ${hasError(`ticket.${index}.name`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                      />
                      <ErrorMessage show={hasError(`ticket.${index}.name`)} />
                    </div>
                    
                    {/* Ticket Price */}
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Fiyat (₺) *' : 'Price (₺) *'}
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={ticket.price}
                        onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        }`}
                      />
                      <p className="text-xs mt-1 italic text-green-500">
                        {formLanguage === 'tr' ? '0 seçilirse bilet ücretsiz olacaktır' : 'If 0 is selected, the ticket will be free'}
                      </p>
                    </div>
                    
                    {/* Ticket Description */}
                    <div className="md:col-span-1">
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
                      </label>
                      <textarea
                        rows={2}
                        value={ticket.description?.[formLanguage] || ''}
                        onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        }`}
                        placeholder={formLanguage === 'tr' 
                          ? "Bilet tipi hakkında açıklama girin" 
                          : "Enter description about this ticket type"}
                      />
                    </div>
                    
                    {/* Ticket Status */}
                    <div className="md:col-span-1 flex flex-col justify-end">
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Durum' : 'Status'}
                      </label>
                      <div className="flex flex-col gap-1 sm:gap-2 h-full justify-center">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`ticket-sold-out-${index}`}
                            checked={ticket.isSoldOut || false}
                            onChange={(e) => handleTicketChange(index, 'isSoldOut', e.target.checked)}
                            className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`ticket-sold-out-${index}`}
                            className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                          >
                            {formLanguage === 'tr' ? 'Tükendi' : 'Sold Out'}
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`ticket-coming-soon-${index}`}
                            checked={ticket.isComingSoon || false}
                            onChange={(e) => handleTicketChange(index, 'isComingSoon', e.target.checked)}
                            className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label 
                            htmlFor={`ticket-coming-soon-${index}`}
                            className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                          >
                            {formLanguage === 'tr' ? 'Yakında' : 'Coming Soon'}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' 
                  ? 'Henüz bilet eklenmemiş. Eklemek için "Yeni Bilet Tipi Ekle" butonunu kullanın.'
                  : 'No tickets added yet. Use the "Add New Ticket Type" button to add tickets.'}
              </div>
            )}
          </div>
        </div>
        
        {/* Rules Section */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className={`text-sm sm:text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {formLanguage === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
            </h3>
            
            <button
              type="button"
              onClick={addRule}
              className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              }`}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
              <span className="hidden sm:inline">
                {formLanguage === 'tr' ? 'Kural Ekle' : 'Add Rule'}
              </span>
            </button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {Array.isArray(formData.rules) && formData.rules.length > 0 ? (
              formData.rules.map((rule, index) => (
                <div 
                  key={index} 
                  className={`p-2 sm:p-3 border rounded-md ${
                    isDark ? 'border-dark-grey' : 'border-light-grey'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                      {formLanguage === 'tr' ? `Kural #${index + 1}` : `Rule #${index + 1}`}
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className={`p-1 rounded-md ${
                        isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu kuralı sil" : "Delete this rule"}
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                      {formLanguage === 'tr' ? 'Kural' : 'Rule'}
                    </label>
                    <textarea
                      rows={2}
                      value={rule.content[formLanguage]}
                      onChange={(e) => handleRuleChange(index, e.target.value)}
                      className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      }`}
                      placeholder={formLanguage === 'tr' 
                        ? "Etkinlik kuralı ekleyin" 
                        : "Add event rule"}
                    ></textarea>
                  </div>
                </div>
              ))
            ) : (
              <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' 
                  ? 'Henüz kural eklenmemiş. Eklemek için "Kural Ekle" butonunu kullanın.'
                  : 'No rules added yet. Use the "Add Rule" button to add rules.'}
              </div>
            )}
          </div>
        </div>

        {/* Program Section */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <div className="flex justify-between items-center mb-2 sm:mb-3">
            <h3 className={`text-sm sm:text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {formLanguage === 'tr' ? 'Etkinlik Programı' : 'Event Program'}
            </h3>
            
            <button
              type="button"
              onClick={addProgramItem}
              className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              }`}
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
              <span className="hidden sm:inline">
                {formLanguage === 'tr' ? 'Yeni Program Öğesi Ekle' : 'Add New Program Item'}
              </span>
            </button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            {formData.schedule?.length > 0 ? (
              formData.schedule.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-2 sm:p-3 border rounded-md ${
                    isDark ? 'border-dark-grey' : 'border-light-grey'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                      {formLanguage === 'tr' ? `Program #${index + 1}` : `Program #${index + 1}`}
                    </h4>
                    
                    <button
                      type="button"
                      onClick={() => removeProgramItem(index)}
                      className={`p-1 rounded-md ${
                        isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu program öğesini sil" : "Delete this program item"}
                    >
                      <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                    {/* Time */}
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Zaman *' : 'Time *'}
                      </label>
                      <input
                        type="time"
                        required
                        value={item.time}
                        onChange={(e) => handleProgramChange(index, 'time', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        }`}
                      />
                    </div>

                    {/* Title */}
                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={item.title[formLanguage]}
                        onChange={(e) => handleProgramChange(index, 'title', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        }`}
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                        {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
                      </label>
                      <textarea
                        rows={2}
                        value={item.description[formLanguage]}
                        onChange={(e) => handleProgramChange(index, 'description', e.target.value)}
                        className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                          isDark
                            ? 'bg-carbon-grey border border-dark-grey text-white'
                            : 'bg-white border border-light-grey text-dark-grey'
                        }`}
                        placeholder={formLanguage === 'tr' 
                          ? "Program öğesi hakkında açıklama" 
                          : "Description about this program item"}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' 
                  ? 'Henüz program öğesi eklenmemiş. Eklemek için "+" butonunu kullanın.'
                  : 'No program items added yet. Use the "+" button to add items.'}
              </div>
            )}
          </div>
        </div>
        
        {/* Images Section */}
        <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-sm sm:text-lg font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Görseller' : 'Images'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-2 sm:mb-4">
            {/* Banner Image */}
            <div className="flex flex-col items-center">
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Banner Görseli (16:9 önerilen)' : 'Banner Image (16:9 recommended)'}
              </label>
              
              <div className="mb-2 sm:mb-4 flex justify-center w-full max-w-[160px] sm:max-w-[284px]">
                {bannerPreview ? (
                  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={bannerPreview} 
                      alt={formLanguage === 'tr' ? "Banner önizleme" : "Banner preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 160px, 284px"
                      priority
                    />
                  </div>
                ) : formData.bannerImage ? (
                  <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.bannerImage} 
                      alt={formLanguage === 'tr' ? "Banner görseli" : "Banner image"} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 160px, 284px"
                      priority
                      unoptimized={formData.bannerImage.startsWith('/api/files/')}
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] flex items-center justify-center bg-gray-100 rounded-md">
                    <span className={isDark ? 'text-carbon-grey' : 'text-light-grey'}>
                      {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center w-full max-w-[160px] sm:max-w-[284px]">
                <button
                  type="button"
                  onClick={() => setBannerSelectorOpen(true)}
                  className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } flex items-center justify-center text-xs sm:text-sm`}
                >
                  <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
                </button>
              </div>

              <ImageSelector
                isOpen={bannerSelectorOpen}
                onClose={() => setBannerSelectorOpen(false)}
                onSelect={handleBannerImageSelection}
                category="banner"
                currentImage={formData.bannerImage}
              />
            </div>
            
            {/* Square Image */}
            <div className="flex flex-col items-center">
              <label className={`block text-xs sm:text-sm font-medium mb-1 sm:mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Kare Görseli (1:1 önerilen)' : 'Square Image (1:1 recommended)'}
              </label>
              
              <div className="mb-2 sm:mb-4 flex justify-center">
                {squarePreview ? (
                  <div className="relative w-[160px] h-[160px] bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={squarePreview} 
                      alt={formLanguage === 'tr' ? "Kare önizleme" : "Square preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="160px"
                      priority
                    />
                  </div>
                ) : formData.squareImage ? (
                  <div className="relative w-[160px] h-[160px] bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.squareImage} 
                      alt={formLanguage === 'tr' ? "Kare görseli" : "Square image"} 
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="160px"
                      priority
                      unoptimized={formData.squareImage.startsWith('/api/files/')}
                    />
                  </div>
                ) : (
                  <div className="w-[160px] h-[160px] flex items-center justify-center bg-gray-100 rounded-md">
                    <span className={isDark ? 'text-carbon-grey' : 'text-light-grey'}>
                      {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center w-full max-w-[160px]">
                <button
                  type="button"
                  onClick={() => setSquareSelectorOpen(true)}
                  className={`w-full px-2 py-1.5 sm:px-4 sm:py-2 rounded-md ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } flex items-center justify-center text-xs sm:text-sm`}
                >
                  <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
                </button>
              </div>

              <ImageSelector
                isOpen={squareSelectorOpen}
                onClose={() => setSquareSelectorOpen(false)}
                onSelect={handleSquareImageSelection}
                category="square"
                currentImage={formData.squareImage}
              />
            </div>
          </div>
          
          {/* Gallery Images */}
          <div>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <label className={`block text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                {formLanguage === 'tr' ? 'Galeri Görselleri' : 'Gallery Images'}
              </label>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setGallerySelectorOpen(true)}
                  className={`p-2 sm:px-4 sm:py-2 rounded-md ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } flex items-center justify-center`}
                >
                  <PhotoIcon className="w-6 h-6 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Gallery preview */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 mt-2">
              {formData.gallery && formData.gallery.length > 0 ? (
                formData.gallery.map((imagePath, index) => (
                  <div 
                    key={`gallery-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full h-20 sm:h-32 bg-gray-100 rounded-md overflow-hidden">
                      <Image 
                        src={imagePath}
                        alt={formLanguage === 'tr' 
                          ? `Galeri görseli ${index + 1}` 
                          : `Gallery image ${index + 1}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized={imagePath.startsWith('/api/files/')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className={`absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'bg-carbon-grey text-white' : 'bg-white text-dark-grey'
                      }`}
                      title={formLanguage === 'tr' ? "Bu görseli sil" : "Delete this image"}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className={`col-span-full py-6 text-center ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {formLanguage === 'tr' 
                    ? 'Henüz galeri görseli eklenmemiş. Görsel seçmek veya yüklemek için butonları kullanın.'
                    : 'No gallery images added yet. Use the buttons to select or upload images.'}
                </div>
              )}
            </div>
            
            {/* Gallery Image Selector Modal */}
            <ImageSelector
              isOpen={gallerySelectorOpen}
              onClose={() => setGallerySelectorOpen(false)}
              onSelect={handleGalleryImageSelection}
              category="gallery"
              currentImage={formData.gallery?.[0] || ''}
            />
          </div>
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-2 sm:space-x-3 mt-2 sm:mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
              isDark
                ? 'bg-carbon-grey text-silver hover:bg-dark-grey'
                : 'bg-light-grey text-medium-grey hover:bg-very-light-grey'
            } ${(isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {formLanguage === 'tr' ? 'İptal' : 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md ${
              isDark
                ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                : 'bg-race-blue text-white hover:bg-race-blue/80'
            } ${(isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {formLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...'}
              </span>
            ) : isEditMode 
              ? (formLanguage === 'tr' ? 'Güncelle' : 'Update')
              : (formLanguage === 'tr' ? 'Yayınla' : 'Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}