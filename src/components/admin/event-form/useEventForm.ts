'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors, ImageFile, Rule, Schedule, Ticket, UseEventFormReturn, generateEventId, generateSlugFromEnglishTitle } from './types';

interface UseEventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
}

export default function useEventForm({ event, onSubmit, onCancel }: UseEventFormProps): UseEventFormReturn {
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
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
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
  
  // Add a separate state for date input
  const [dateInputValue, setDateInputValue] = useState<string>('');
  
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
      
      // Initialize gallery previews
      if (gallery && gallery.length > 0) {
        setGalleryPreviews([...gallery]);
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
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };
  
  // Tickets handlers
  const handleTicketChange = (index: number, field: string, value: string | number | boolean) => {
    console.log(`Bilet değişiyor - index: ${index}, alan: ${field}, değer:`, value);
    
    if (!formData.tickets) {
      console.error("formData.tickets bulunamadı");
      return;
    }
    
    const updatedTickets = [...formData.tickets];
    
    // `name` ve `description` gibi dil anahtarları içeren nesneler için özel işlem
    if (field === 'name' || field === 'description') {
      console.log(`${field} alanı için dil güncelleniyor: ${formLanguage}`);
      
      // Mevcut nesneyi kopyala veya boş bir nesne oluştur
      const currentValue = updatedTickets[index][field] || { tr: '', en: '' };
      
      // Sadece geçerli dil değerini güncelle
      updatedTickets[index] = {
        ...updatedTickets[index],
        [field]: {
          ...currentValue,
          [formLanguage]: value
        }
      };
    } 
    // Nokta içeren alan adları için (kullanılmıyorsa kaldırılabilir)
    else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      console.log(`Noktalı alan: ${parent}.${child}`);
      
      // Ebeveyn nesneyi kopyala veya boş bir nesne oluştur
      const parentObj = updatedTickets[index][parent as keyof Ticket] || {};
      
      // Update the nested property
      updatedTickets[index] = {
        ...updatedTickets[index],
        [parent]: {
          ...parentObj,
          [child]: value
        }
      };
    } else {
      // Normal alanlar için direkt güncelleme
      console.log(`Normal alan güncelleniyor: ${field}`);
      updatedTickets[index] = {
        ...updatedTickets[index],
        [field]: value
      };
    }
    
    console.log("Güncellenmiş biletler:", updatedTickets);
    
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };
  
  const increaseTicketPrice = (index: number) => {
    if (!formData.tickets) return;
    
    const updatedTickets = [...formData.tickets];
    const currentPrice = updatedTickets[index].price || 0;
    updatedTickets[index] = {
      ...updatedTickets[index],
      price: currentPrice + 50
    };
    
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };
  
  const decreaseTicketPrice = (index: number) => {
    if (!formData.tickets) return;
    
    const updatedTickets = [...formData.tickets];
    const currentPrice = updatedTickets[index].price || 0;
    updatedTickets[index] = {
      ...updatedTickets[index],
      price: Math.max(0, currentPrice - 50) // Prevent negative prices
    };
    
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };
  
  const addTicket = () => {
    // Generate a unique ID for the new ticket
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newTicket: Ticket = {
      id: ticketId,
      name: { tr: '', en: '' },
      description: { tr: '', en: '' },
      price: 0,
      maxPerOrder: 5
    };
    
    setFormData(prev => ({
      ...prev,
      tickets: [...(prev.tickets || []), newTicket]
    }));
  };
  
  const removeTicket = (index: number) => {
    if (!formData.tickets) return;
    
    const updatedTickets = [...formData.tickets];
    updatedTickets.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      tickets: updatedTickets
    }));
  };
  
  // Rules handlers
  const handleRuleChange = (index: number, value: string) => {
    if (!formData.rules) return;
    
    const updatedRules = [...formData.rules] as Rule[];
    
    // Update the rule content for the current language
    updatedRules[index] = {
      ...updatedRules[index],
      content: {
        ...updatedRules[index].content,
        [formLanguage]: value
      }
    };
    
    setFormData(prev => ({
      ...prev,
      rules: updatedRules
    }));
  };
  
  const addRule = () => {
    // Generate a unique ID for the new rule
    const ruleId = `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newRule: Rule = {
      id: ruleId,
      content: { tr: '', en: '' }
    };
    
    setFormData(prev => ({
      ...prev,
      rules: [...(prev.rules || []), newRule]
    }));
  };
  
  const removeRule = (index: number) => {
    if (!formData.rules) return;
    
    const updatedRules = [...formData.rules];
    updatedRules.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      rules: updatedRules
    }));
  };
  
  // Program/Schedule handlers
  const handleProgramChange = (index: number, field: string, value: string) => {
    console.log(`Program değişiyor - index: ${index}, alan: ${field}, değer:`, value);
    
    if (!formData.schedule) {
      console.error("formData.schedule bulunamadı");
      return;
    }
    
    const updatedSchedule = [...formData.schedule] as Schedule[];
    
    // `title` ve `description` gibi dil anahtarları içeren nesneler için özel işlem
    if (field === 'title' || field === 'description') {
      console.log(`${field} alanı için dil güncelleniyor: ${formLanguage}`);
      
      // Mevcut nesneyi kopyala veya boş bir nesne oluştur
      const currentValue = updatedSchedule[index][field] || { tr: '', en: '' };
      
      // Sadece geçerli dil değerini güncelle
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: {
          ...currentValue,
          [formLanguage]: value
        }
      };
    }
    // Nokta içeren alan adları için (kullanılmıyorsa kaldırılabilir)
    else if (field.includes('.')) {
      const [parent, child] = field.split('.');
      console.log(`Noktalı alan: ${parent}.${child}`);
      
      // Ebeveyn nesneyi kopyala veya boş bir nesne oluştur
      const parentObj = updatedSchedule[index][parent as keyof Schedule] || {};
      
      // Update the nested property
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [parent]: {
          ...parentObj,
          [child]: value
        }
      };
    } else {
      // Normal alanlar için direkt güncelleme
      console.log(`Normal alan güncelleniyor: ${field}`);
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value
      };
    }
    
    console.log("Güncellenmiş program:", updatedSchedule);
    
    setFormData(prev => ({
      ...prev,
      schedule: updatedSchedule
    }));
  };
  
  const addProgramItem = () => {
    // Generate a unique ID for the new program item
    const itemId = `schedule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newItem: Schedule = {
      id: itemId,
      time: '21:00', // Direkt varsayılan saati ayarla
      title: { tr: '', en: '' },
      description: { tr: '', en: '' }
    };
    
    setFormData(prev => ({
      ...prev,
      schedule: [...(prev.schedule || []), newItem]
    }));
  };
  
  const removeProgramItem = (index: number) => {
    if (!formData.schedule) return;
    
    const updatedSchedule = [...formData.schedule];
    updatedSchedule.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      schedule: updatedSchedule
    }));
  };
  
  // Belirli bir zaman formatında olup olmadığını kontrol eden fonksiyon
  const isValidTimeFormat = (timeStr: string): boolean => {
    // Boşsa geçersiz
    if (!timeStr) return false;
    
    // HH:MM formatında olup olmadığını kontrol et
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeStr);
  };
  
  // Form validation
  const validateForm = () => {
    const errors: FormErrors = {};
    
    // Check required fields - only validate the current language
    const currentLang = formLanguage;
    
    // Zorunlu temel alanlar
    // 1. Başlık - Her zaman zorunlu
    if (!formData.title?.[currentLang]?.trim()) {
      errors['title'] = true;
    }
    
    // 2. Etkinlik Tarihi ve Saati - Her zaman zorunlu
    if (!dateInputValue) {
      errors['date'] = true;
    }
    
    // 3. Kategori - Her zaman zorunlu
    if (!formData.category) {
      errors['category'] = true;
    }
    
    // 4. Konum - Her zaman zorunlu
    if (!formData.location?.[currentLang]?.trim()) {
      errors['location'] = true;
    }
    
    // 5. Açıklama - Her zaman zorunlu
    if (!formData.description?.[currentLang]?.trim()) {
      errors['description'] = true;
    }
    
    // 6. Bilet Validasyonu - Sadece eklenmiş biletlerin adı zorunlu
    if (formData.tickets && formData.tickets.length > 0) {
      formData.tickets.forEach((ticket, index) => {
        // Sadece bilet adı zorunlu, diğer alanlar opsiyonel
        if (!ticket.name?.[currentLang]?.trim()) {
          errors[`tickets[${index}].name`] = true;
        }
      });
    }
    
    // 7. Etkinlik Kuralları - Opsiyonel alan, validasyon yapılmasına gerek yok
    
    // 8. Etkinlik Programı - Sadece eklenmiş program öğelerinin başlığı zorunlu
    if (formData.schedule && formData.schedule.length > 0) {
      formData.schedule.forEach((item, index) => {
        // Başlık zorunlu
        if (!item.title?.[currentLang]?.trim()) {
          errors[`schedule[${index}].title`] = true;
        }
        
        // Saat değeri normalde otomatik doluyor, sadece geçerli bir format değilse hata ver
        const timeValue = item.time || '';
        if (timeValue !== '21:00' && !isValidTimeFormat(timeValue)) {
          errors[`schedule[${index}].time`] = true;
        }
      });
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Scroll to first error
  const scrollToFirstError = () => {
    const firstErrorField = Object.keys(validationErrors)[0];
    if (firstErrorField) {
      let selector = '';
      
      // Handle array fields like tickets[0].name
      if (firstErrorField.includes('[') && firstErrorField.includes(']')) {
        const parts = firstErrorField.split('.');
        if (parts.length > 1) {
          // For nested properties like tickets[0].name
          selector = `[name="${parts[1]}"]`;
        } else {
          // For simple array items like rules[0]
          selector = ''; // Can't directly select by index
        }
      } else {
        // Regular fields
        selector = `[name="${firstErrorField}"]`;
      }
      
      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const errContainer = document.querySelector(`.text-f1-red`);
          if (errContainer) {
            errContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  };
  
  // Helper function to check if field has error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };
  
  // Translate all multilanguage fields in form
  const translateAllFields = async () => {
    try {
      // Define source and target languages
      const fromLang = formLanguage as 'tr' | 'en';
      const toLang = fromLang === 'tr' ? 'en' : 'tr';
      
      // Handling for edit mode vs. create mode
      if (isEditMode && event) {
        // Import translation service
        const { translateChangedFields } = await import('@/services/translation-service');
        
        try {
          // Compare with original event and translate only changed fields
          const translatedFormData = await translateChangedFields(formData, event, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
          console.error('Translation error:', error);
          
          // Show error message to user
          alert(fromLang === 'tr' 
            ? `Çeviri işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            : `An error occurred during translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          return false;
        }
      } else {
        // In create mode, translate all fields
        const { translateMultiLangObject } = await import('@/services/translation-service');
        
        try {
          // Translate all form fields
          const translatedFormData = await translateMultiLangObject(formData, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
          console.error('Translation error:', error);
          
          // Show error message to user
          alert(fromLang === 'tr' 
            ? `Çeviri işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            : `An error occurred during translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          return false;
        }
      }
    } catch (error) {
      console.error('Translation service error:', error);
      
      // Show service error to user
      alert(formLanguage === 'tr'
        ? 'Çeviri servisi yüklenemedi. Lütfen daha sonra tekrar deneyin.'
        : 'Translation service could not be loaded. Please try again later.');
      
      return false;
    }
  };
  
  // Image handling
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      // Create local preview first
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
        // Upload the file to server
        const imageCategory = 'event';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', imageCategory);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Image upload error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Update form data with the uploaded image URL
          setFormData(prev => ({
            ...prev,
            [name]: result.publicPath
          }));
        } else {
          console.error('Image upload error:', result.error);
          alert(formLanguage === 'tr' 
            ? 'Görsel yüklenirken bir hata oluştu.'
            : 'An error occurred while uploading the image.');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        alert(formLanguage === 'tr' 
          ? 'Görsel yüklenirken bir hata oluştu.'
          : 'An error occurred while uploading the image.');
      }
    }
  };
  
  const handleGalleryImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      // Create local preview first
      reader.onload = (event) => {
        if (event.target?.result) {
          // Add to gallery previews
          setGalleryPreviews(prev => [...prev, event.target!.result as string]);
          
          // Hide the upload button if we have 3 images
          if ((formData.gallery?.length || 0) >= 3) {
            // Already have 3 images, don't show upload UI
          }
        }
      };
      
      reader.readAsDataURL(file);
      
      try {
        // Upload the file to server
        const imageCategory = 'event';
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('category', imageCategory);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });
        
        if (!response.ok) {
          throw new Error(`Gallery image upload error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Add to gallery array in form data
          setFormData(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), result.publicPath]
          }));
        } else {
          console.error('Gallery image upload error:', result.error);
          alert(formLanguage === 'tr' 
            ? 'Galeri görseli yüklenirken bir hata oluştu.'
            : 'An error occurred while uploading the gallery image.');
          
          // Remove the preview if upload failed
          setGalleryPreviews(prev => prev.slice(0, -1));
        }
      } catch (error) {
        console.error('Gallery image upload error:', error);
        alert(formLanguage === 'tr' 
          ? 'Galeri görseli yüklenirken bir hata oluştu.'
          : 'An error occurred while uploading the gallery image.');
        
        // Remove the preview if upload failed
        setGalleryPreviews(prev => prev.slice(0, -1));
      }
    }
  };
  
  const removeGalleryImage = (index: number) => {
    if (!formData.gallery) return;
    
    // Remove from gallery array
    const updatedGallery = [...formData.gallery];
    updatedGallery.splice(index, 1);
    
    // Remove from previews array
    const updatedPreviews = [...galleryPreviews];
    if (index < updatedPreviews.length) {
      updatedPreviews.splice(index, 1);
    }
    
    // Update state
    setFormData(prev => ({
      ...prev,
      gallery: updatedGallery
    }));
    setGalleryPreviews(updatedPreviews);
  };
  
  // Image selection from modal
  const handleBannerImageSelection = (image: ImageFile) => {
    // If the image is from MongoDB, use the URL directly, otherwise use publicPath
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      bannerImage: imageUrl
    }));
    setBannerPreview(null);
  };
  
  const handleSquareImageSelection = (image: ImageFile) => {
    // If the image is from MongoDB, use the URL directly, otherwise use publicPath
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      squareImage: imageUrl
    }));
    setSquarePreview(null);
  };
  
  const handleGalleryImageSelection = (image: ImageFile) => {
    // If the image is from MongoDB, use the URL directly, otherwise use publicPath
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    // Add to gallery array
    setFormData(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), imageUrl]
    }));
  };
  
  // Form submission
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
        // Generate a unique ID for the event
        updatedData.id = generateEventId();
        
        // Ensure date is current if not set
        if (!updatedData.date) {
          updatedData.date = new Date().toISOString();
        }
      }
      
      // Check if slug is valid
      let slug = updatedData.slug;
      if (!slug || slug.trim() === '' || slug === 'undefined' || slug.includes('undefined')) {
        if (updatedData.title?.en) {
          slug = generateSlugFromEnglishTitle(updatedData.title.en);
        } else if (updatedData.title?.tr) {
          // Use Turkish title if English title is not available
          slug = generateSlugFromEnglishTitle(updatedData.title.tr);
        } else {
          // Fallback to a random slug
          const randomPart = Math.random().toString(36).substring(2, 8);
          slug = `event-${randomPart}`;
        }
      }
      
      // Eğer yeni etkinlik oluşturuluyorsa, slug'ın benzersiz olması için sonuna rastgele karakterler ekle
      if (!isEditMode) {
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        slug = `${slug}-${randomSuffix}`;
      }
      
      // Format rules for API if needed
      let rules = updatedData.rules;
      if (rules && rules.length > 0) {
        // Filter out empty rules
        rules = rules.filter((rule: Rule) => 
          rule.content.tr.trim() !== '' || rule.content.en.trim() !== ''
        );
      }
      
      // Format schedule for API if needed
      let schedule = updatedData.schedule;
      if (schedule && schedule.length > 0) {
        // Filter out empty schedule items
        schedule = schedule.filter((item: Schedule) => 
          item.time.trim() !== '' && 
          (item.title.tr.trim() !== '' || item.title.en.trim() !== '')
        );
      }
      
      // Galeri görsellerini hazırla
      // Önce default olmayan kullanıcı görsellerini ayır
      const userGalleryImages = (updatedData.gallery || []).filter(img => 
        img !== defaultBannerImage && img !== defaultSquareImage
      );
      
      // Kullanıcı görsel sayısına göre varsayılan görselleri ekle
      let finalGallery = [...userGalleryImages];
      
      // Eğer kullanıcı hiç görsel yüklemediyse 3 default görsel ekle
      if (userGalleryImages.length === 0) {
        finalGallery = [defaultBannerImage, defaultBannerImage, defaultBannerImage];
      } 
      // Eğer kullanıcı 1 görsel yüklediyse, 2 default görsel ekle
      else if (userGalleryImages.length === 1) {
        finalGallery.push(defaultBannerImage);
        finalGallery.push(defaultBannerImage);
      }
      // Eğer kullanıcı 2 görsel yüklediyse, 1 default görsel ekle
      else if (userGalleryImages.length === 2) {
        finalGallery.push(defaultBannerImage);
      }
      // Eğer 3 veya daha fazla görsel varsa, sadece kullanıcı görsellerini kullan
      
      // Final data with all fields properly formatted
      updatedData = {
        ...updatedData,
        slug,
        rules,
        schedule,
        gallery: finalGallery,
        date: updatedData.date ? updatedData.date : new Date().toISOString(),
      };
      
      // Deep clone the data to avoid any reference issues
      const finalData = JSON.parse(JSON.stringify(updatedData));
      
      onSubmit(finalData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return {
    formData,
    formLanguage,
    setFormLanguage,
    dateInputValue,
    setDateInputValue,
    validationErrors,
    showValidationErrors,
    isEditMode,
    bannerPreview,
    squarePreview,
    galleryPreviews,
    bannerSelectorOpen,
    setBannerSelectorOpen,
    squareSelectorOpen,
    setSquareSelectorOpen,
    gallerySelectorOpen,
    setGallerySelectorOpen,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
    handleTicketChange,
    increaseTicketPrice,
    decreaseTicketPrice,
    addTicket,
    removeTicket,
    handleRuleChange,
    addRule,
    removeRule,
    handleProgramChange,
    addProgramItem,
    removeProgramItem,
    handleSubmit,
    handleBannerImageSelection,
    handleSquareImageSelection,
    handleGalleryImageSelection,
    handleGalleryImageUpload,
    removeGalleryImage,
    hasError
  };
} 