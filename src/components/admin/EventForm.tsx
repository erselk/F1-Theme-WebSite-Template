'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useThemeLanguage, LanguageType } from '@/lib/ThemeLanguageContext';
import { Event, EventDescription, Ticket, MultiLanguageText } from '@/data/events';
import Image from 'next/image';
import { generateSlugFromEnglishTitle, simpleTranslate } from '@/data/events/utils';
import { PlusIcon, MinusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const { isDark, language, setLanguage } = useThemeLanguage();
  const isEditMode = !!event;

  // Form state
  const [formData, setFormData] = useState<Partial<Event>>({
    title: { tr: '', en: '' },
    description: { 
      short: { tr: '', en: '' },
      long: { tr: '', en: '' }
    },
    location: { tr: '', en: '' },
    date: '',
    price: 0,
    category: 'other',
    isFeatured: false,
    bannerImage: '/images/events/banner/default.jpg',
    squareImage: '/images/events/square/default.jpg',
    slug: '',
    tickets: [{ 
      id: 'standard', 
      name: { tr: 'Standart Bilet', en: 'Standard Ticket' }, 
      price: 0, 
      description: { tr: '', en: '' } 
    }],
    rules: [{ tr: '', en: '' }],
    gallery: []
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
  const defaultBannerImage = '/images/events/banner/suan.jpg';
  const defaultSquareImage = '/images/events/square/suan.jpg';
  
  // Initialize form with default images that actually exist
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bannerImage: defaultBannerImage,
      squareImage: defaultSquareImage
    }));
  }, []);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Make sure left panel stays open
  const [isNavPanelOpen, setIsNavPanelOpen] = useState(true);

  // Add a separate state for date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Initialize form with event data if in edit mode
  useEffect(() => {
    if (event) {
      // Handle compatibility with old event structure
      const description = event.description && typeof event.description === 'object' && !('short' in event.description)
        ? {
            short: {
              tr: (event.description as any).tr?.split('\n\n')[0] || '',
              en: (event.description as any).en?.split('\n\n')[0] || '',
            },
            long: {
              tr: (event.description as any).tr || '',
              en: (event.description as any).en || '',
            }
          }
        : event.description;
      
      // Set default tickets if not present
      const tickets = event.tickets || [{
        id: 'standard',
        name: { tr: 'Standart Bilet', en: 'Standard Ticket' },
        price: event.price || 0,
        description: { tr: 'Etkinlik girişi', en: 'Event entry' }
      }];
      
      // Set default rules if not present
      const rules = event.rules || [{ tr: '', en: '' }];
      
      // Set default gallery if not present
      const gallery = event.gallery || [];

      setFormData({
        ...event,
        // Create deep copies to avoid direct references
        title: { ...event.title },
        description,
        location: { ...event.location },
        tickets: JSON.parse(JSON.stringify(tickets)),
        rules: JSON.parse(JSON.stringify(rules)),
        gallery: [...gallery]
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
      setDateInputValue(value);
      setFormData(prev => ({
        ...prev,
        date: value ? new Date(value).toISOString() : ''
      }));
      return;
    }
    
    if (name === 'title') {
      // Direct handling for title field
      setFormData(prev => ({
        ...prev,
        title: {
          ...prev.title!,
          [formLanguage]: value
        }
      }));
    } else if (name === 'location') {
      // Direct handling for location field
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location!,
          [formLanguage]: value
        }
      }));
    } else if (name.includes('.')) {
      // Handle nested properties
      const parts = name.split('.');
      
      if (parts.length === 2) {
        if (parts[0] === 'description') {
          // For description.short and description.long
          setFormData(prev => ({
            ...prev,
            description: {
              ...prev.description!,
              [parts[1]]: {
                ...prev.description?.[parts[1]],
                [formLanguage]: value
              }
            }
          }));
        } else {
          // For other nested properties that don't need translation
          setFormData(prev => ({
            ...prev,
            [parts[0]]: {
              ...prev[parts[0]],
              [parts[1]]: value
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Checkbox changes handler
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Numeric value handler
  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  // Ticket changes handlers - Modified for single language input
  const handleTicketChange = (index: number, field: string, value: string | number) => {
    setFormData(prev => {
      const updatedTickets = [...(prev.tickets || [])];
      
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
        
        // Debug for ticket description changes
        console.log(`Updated ticket ${index} ${field} in ${formLanguage}:`, updatedTickets[index][field]);
      } else if (field === 'price') {
        // Ensure price is always a valid number or 0
        const numValue = typeof value === 'number' ? value : (parseFloat(value) || 0);
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

  const addTicket = () => {
    const ticketId = `ticket-${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      tickets: [
        ...(prev.tickets || []),
        {
          id: ticketId,
          name: { tr: 'Yeni Bilet', en: 'New Ticket' },
          price: 0,
          description: { tr: '', en: '' }
        }
      ]
    }));
  };

  const removeTicket = (index: number) => {
    setFormData(prev => {
      const updatedTickets = [...(prev.tickets || [])];
      updatedTickets.splice(index, 1);
      return { ...prev, tickets: updatedTickets };
    });
  };

  // Rules change handlers - Modified for single language input
  const handleRuleChange = (index: number, value: string) => {
    setFormData(prev => {
      const updatedRules = [...(prev.rules || [])];
      updatedRules[index] = {
        ...updatedRules[index],
        [formLanguage]: value
      };
      
      return { ...prev, rules: updatedRules };
    });
  };

  const addRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [
        ...(prev.rules || []),
        { tr: '', en: '' }
      ]
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => {
      const updatedRules = [...(prev.rules || [])];
      updatedRules.splice(index, 1);
      return { ...prev, rules: updatedRules };
    });
  };

  // Auto-generate slug from English title
  useEffect(() => {
    if (formData.title?.en && !isEditMode) {
      const slug = generateSlugFromEnglishTitle(formData.title.en);
      
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  }, [formData.title?.en, isEditMode]);

  // Modified translation function to fix the translation issues
  const translateAllFields = async () => {
    setIsTranslating(true);
    const source = formLanguage;
    const target = source === 'tr' ? 'en' : 'tr';
    
    try {
      // Create a deep copy of the form data to work with
      const updatedData = JSON.parse(JSON.stringify(formData));
      
      // Translate title
      if (updatedData.title?.[source]) {
        const translatedTitle = await simpleTranslate(updatedData.title[source], source, target);
        updatedData.title[target] = translatedTitle;
      }
      
      // Translate descriptions
      if (updatedData.description?.short?.[source]) {
        const translatedShortDesc = await simpleTranslate(updatedData.description.short[source], source, target);
        updatedData.description.short[target] = translatedShortDesc;
      }
      
      if (updatedData.description?.long?.[source]) {
        const translatedLongDesc = await simpleTranslate(updatedData.description.long[source], source, target);
        updatedData.description.long[target] = translatedLongDesc;
      }
      
      // Translate location
      if (updatedData.location?.[source]) {
        const translatedLocation = await simpleTranslate(updatedData.location[source], source, target);
        updatedData.location[target] = translatedLocation;
      }
      
      // Translate tickets
      if (updatedData.tickets) {
        for (let index = 0; index < updatedData.tickets.length; index++) {
          const ticket = updatedData.tickets[index];
          
          if (ticket.name[source]) {
            const translatedName = await simpleTranslate(ticket.name[source], source, target);
            updatedData.tickets[index].name[target] = translatedName;
          }
          
          if (ticket.description[source]) {
            const translatedDesc = await simpleTranslate(ticket.description[source], source, target);
            updatedData.tickets[index].description[target] = translatedDesc;
          }
        }
      }
      
      // Translate rules
      if (updatedData.rules) {
        for (let index = 0; index < updatedData.rules.length; index++) {
          const rule = updatedData.rules[index];
          
          if (rule[source]) {
            const translatedRule = await simpleTranslate(rule[source], source, target);
            updatedData.rules[index][target] = translatedRule;
          }
        }
      }
      
      console.log("Updated form data after translation:", updatedData);
      // Update form data with all translations
      setFormData(updatedData);
      
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

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
    
    if (!formData.description?.short?.[currentLang]?.trim()) {
      errors['description.short'] = true;
    }
    
    if (!formData.description?.long?.[currentLang]?.trim()) {
      errors['description.long'] = true;
    }

    // Check tickets
    if (formData.tickets && formData.tickets.length > 0) {
      formData.tickets.forEach((ticket, index) => {
        if (!ticket.name?.[currentLang]?.trim()) {
          errors[`ticket.${index}.name`] = true;
        }
        if (!ticket.id?.trim()) {
          errors[`ticket.${index}.id`] = true;
        }
      });
    } else {
      errors['tickets'] = true; // At least one ticket is required
    }
    
    console.log('Validation results:', {
      errors,
      hasErrors: Object.keys(errors).length > 0,
      formData: JSON.stringify(formData)
    });
    
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

  // Modified form submission to use the fixed translation function
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
      setIsTranslating(true);
      
      // Translate all content before submitting
      await translateAllFields();
      
      // Submit the form with translated data
      console.log('Submitting form data:', formData);
      
      onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setIsTranslating(false);
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

  // Handle image upload
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          // Set image preview
          if (name === 'bannerImage') {
            setBannerPreview(event.target.result as string);
          } else if (name === 'squareImage') {
            setSquarePreview(event.target.result as string);
          }
          
          // In a real application, you would upload the image to the server here
          // For now, we're just saving the file name
          setFormData(prev => ({
            ...prev,
            [name]: `/images/events/${name === 'bannerImage' ? 'banner' : 'square'}/${file.name}`
          }));
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Handle gallery image uploads
  const handleGalleryImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newPreviews: string[] = [];
      const newGalleryPaths: string[] = [];
      
      filesArray.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviews.push(event.target.result as string);
            newGalleryPaths.push(`/images/events/gallery/${file.name}`);
            
            // If all files are processed
            if (newPreviews.length === filesArray.length) {
              setGalleryPreviews(prev => [...prev, ...newPreviews]);
              
              setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), ...newGalleryPaths]
              }));
            }
          }
        };
        
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove a gallery image
  const removeGalleryImage = (index: number) => {
    setFormData(prev => {
      const updatedGallery = [...(prev.gallery || [])];
      updatedGallery.splice(index, 1);
      return { ...prev, gallery: updatedGallery };
    });
    
    setGalleryPreviews(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-graphite' : 'bg-white'} shadow-md`}>
      {/* Language selection for content input */}
      <div className="mb-6">
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' ? 'İçerik Dili' : 'Content Language'}
        </label>
        <div className="flex items-center space-x-4">
          <select
            value={formLanguage}
            onChange={(e) => setFormLanguage(e.target.value as LanguageType)}
            className={`px-3 py-2 rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white'
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
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Ana Bilgiler' : 'Main Information'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title - Single Language Input */}
            <div className="col-span-2">
              <label 
                htmlFor="title" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title?.[formLanguage] || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } ${hasError('title') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              />
              <ErrorMessage show={hasError('title')} />
            </div>
            
            {/* Hidden SEO URL (slug) - Hidden from UI but still part of the form data */}
            <input
              type="hidden"
              id="slug"
              name="slug"
              value={formData.slug || ''}
            />
            
            {/* Event Date */}
            <div className="md:col-span-1">
              <label 
                htmlFor="date" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Etkinlik Tarihi ve Saati *' : 'Event Date and Time *'}
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                value={dateInputValue}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } ${hasError('date') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              />
              <ErrorMessage show={hasError('date')} />
            </div>

            {/* Category */}
            <div className="md:col-span-1">
              <label 
                htmlFor="category" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Kategori *' : 'Category *'}
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category || 'other'}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
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
          </div>
        </div>
        
        {/* Location */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Konum Bilgileri' : 'Location Information'}
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Location - Single Language Input */}
            <div>
              <label 
                htmlFor="location" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Konum *' : 'Location *'}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location?.[formLanguage] || ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } ${hasError('location') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              />
              <ErrorMessage show={hasError('location')} />
            </div>
          </div>
        </div>
        
        {/* Descriptions - Now split into short and long descriptions */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Açıklamalar' : 'Descriptions'}
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Short Description */}
            <div>
              <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-silver' : 'text-dark-grey'}`}>
                {formLanguage === 'tr' ? 'Kısa Açıklama' : 'Short Description'}
              </h4>
              
              <div>
                {/* Short Description - Single Language Input */}
                <div>
                  <label 
                    htmlFor="description.short" 
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                  >
                    {formLanguage === 'tr' ? 'Kısa Açıklama *' : 'Short Description *'}
                  </label>
                  <textarea
                    id="description.short"
                    name="description.short"
                    required
                    rows={2}
                    value={formData.description?.short?.[formLanguage] || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    } ${hasError('description.short') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    placeholder={formLanguage === 'tr' 
                      ? "Etkinliğin kısa açıklaması (liste görünümünde gösterilecek)" 
                      : "Short description of the event (shown in list view)"}
                  ></textarea>
                  <ErrorMessage show={hasError('description.short')} />
                </div>
              </div>
            </div>
            
            {/* Long Description */}
            <div>
              <h4 className={`text-md font-medium mb-3 ${isDark ? 'text-silver' : 'text-dark-grey'}`}>
                {formLanguage === 'tr' ? 'Detaylı Açıklama' : 'Detailed Description'}
              </h4>
              
              <div>
                {/* Long Description - Single Language Input */}
                <div>
                  <label 
                    htmlFor="description.long" 
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                  >
                    {formLanguage === 'tr' ? 'Detaylı Açıklama *' : 'Detailed Description *'}
                  </label>
                  <textarea
                    id="description.long"
                    name="description.long"
                    required
                    rows={6}
                    value={formData.description?.long?.[formLanguage] || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    } ${hasError('description.long') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    placeholder={formLanguage === 'tr' 
                      ? "Etkinliğin detaylı açıklaması (etkinlik detay sayfasında gösterilecek)" 
                      : "Detailed description of the event (shown on event detail page)"}
                  ></textarea>
                  <ErrorMessage show={hasError('description.long')} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ticket Types Section */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {formLanguage === 'tr' ? 'Bilet Tipleri' : 'Ticket Types'}
            </h3>
            
            <button
              type="button"
              onClick={addTicket}
              className={`px-3 py-1 rounded-md flex items-center ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              }`}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {formLanguage === 'tr' ? 'Yeni Bilet Tipi Ekle' : 'Add New Ticket Type'}
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.tickets?.map((ticket, index) => (
              <div 
                key={ticket.id} 
                className={`p-4 border rounded-md ${
                  isDark ? 'border-dark-grey' : 'border-light-grey'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                    {formLanguage === 'tr' ? `Bilet #${index + 1}` : `Ticket #${index + 1}`}
                  </h4>
                  
                  {formData.tickets && formData.tickets.length > 1 && (
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
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ticket Name - Single Language Input */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                    >
                      {formLanguage === 'tr' ? 'Bilet Adı *' : 'Ticket Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      data-ticket-index={index}
                      data-field="name"
                      value={ticket.name[formLanguage]}
                      onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                      className={`w-full px-3 py-2 rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      } ${hasError(`ticket.${index}.name`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    />
                    <ErrorMessage show={hasError(`ticket.${index}.name`)} />
                  </div>
                  
                  {/* Ticket Price */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                    >
                      {formLanguage === 'tr' ? 'Fiyat (₺) *' : 'Price (₺) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(index, 'price', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      }`}
                    />
                  </div>
                  
                  {/* Ticket ID */}
                  <div>
                    <label 
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                    >
                      {formLanguage === 'tr' ? 'Bilet ID *' : 'Ticket ID *'}
                    </label>
                    <input
                      type="text"
                      required
                      data-ticket-index={index}
                      data-field="id"
                      value={ticket.id}
                      onChange={(e) => handleTicketChange(index, 'id', e.target.value)}
                      className={`w-full px-3 py-2 rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      } ${hasError(`ticket.${index}.id`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                      {formLanguage === 'tr' 
                        ? 'Sadece harfler, rakamlar ve tireler (-) kullanın' 
                        : 'Use only letters, numbers, and hyphens (-)'}
                    </p>
                    <ErrorMessage show={hasError(`ticket.${index}.id`)} />
                  </div>
                  
                  {/* Ticket Description - Single Language Input */}
                  <div className="md:col-span-2">
                    <label 
                      className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                    >
                      {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
                    </label>
                    <textarea
                      rows={2}
                      data-ticket-index={index}
                      data-field="description"
                      value={ticket.description[formLanguage] || ''}
                      onChange={(e) => handleTicketChange(index, 'description', e.target.value)}
                      className={`w-full px-3 py-2 rounded-md ${
                        isDark
                          ? 'bg-carbon-grey border border-dark-grey text-white'
                          : 'bg-white border border-light-grey text-dark-grey'
                      }`}
                      placeholder={formLanguage === 'tr' 
                        ? "Bilet tipi hakkında açıklama" 
                        : "Description about this ticket type"}
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rules Section */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
              {formLanguage === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
            </h3>
            
            <button
              type="button"
              onClick={addRule}
              className={`px-3 py-1 rounded-md flex items-center ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              }`}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              {formLanguage === 'tr' ? 'Kural Ekle' : 'Add Rule'}
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.rules?.map((rule, index) => (
              <div 
                key={index} 
                className={`p-4 border rounded-md ${
                  isDark ? 'border-dark-grey' : 'border-light-grey'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
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
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Rule - Single Language Input */}
                <div>
                  <label 
                    className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                  >
                    {formLanguage === 'tr' ? 'Kural' : 'Rule'}
                  </label>
                  <textarea
                    rows={2}
                    value={rule[formLanguage]}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    className={`w-full px-3 py-2 rounded-md ${
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
            ))}
          </div>
        </div>
        
        {/* Images Section */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Görseller' : 'Images'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Banner Image */}
            <div>
              <label 
                htmlFor="bannerImage" 
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Banner Görseli (16:9 önerilen)' : 'Banner Image (16:9 recommended)'}
              </label>
              
              <div className="mb-2">
                {bannerPreview ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={bannerPreview} 
                      alt={formLanguage === 'tr' ? "Banner önizleme" : "Banner preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : formData.bannerImage ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.bannerImage} 
                      alt={formLanguage === 'tr' ? "Banner görseli" : "Banner image"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <span className={isDark ? 'text-carbon-grey' : 'text-light-grey'}>
                      {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                    </span>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="bannerImage"
                name="bannerImage"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-md ${
                  isDark
                    ? 'file:bg-electric-blue file:text-white'
                    : 'file:bg-race-blue file:text-white'
                }`}
              />
            </div>
            
            {/* Square Image */}
            <div>
              <label 
                htmlFor="squareImage" 
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Kare Görseli (1:1 önerilen)' : 'Square Image (1:1 recommended)'}
              </label>
              
              <div className="mb-2">
                {squarePreview ? (
                  <div className="relative w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={squarePreview} 
                      alt={formLanguage === 'tr' ? "Kare önizleme" : "Square preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : formData.squareImage ? (
                  <div className="relative w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.squareImage} 
                      alt={formLanguage === 'tr' ? "Kare görseli" : "Square image"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <span className={isDark ? 'text-carbon-grey' : 'text-light-grey'}>
                      {formLanguage === 'tr' ? 'Görsel yok' : 'No image'}
                    </span>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                id="squareImage"
                name="squareImage"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white'
                    : 'bg-white border border-light-grey text-dark-grey'
                } file:mr-3 file:py-2 file:px-4 file:border-0 file:rounded-md ${
                  isDark
                    ? 'file:bg-electric-blue file:text-white'
                    : 'file:bg-race-blue file:text-white'
                }`}
              />
            </div>
          </div>
          
          {/* Gallery Images */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label 
                htmlFor="galleryImages" 
                className={`block text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Galeri Görselleri' : 'Gallery Images'}
              </label>
              
              <div className="flex items-center">
                <span className={`text-xs mr-3 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {formLanguage === 'tr' 
                    ? `${formData.gallery?.length || 0} görsel` 
                    : `${formData.gallery?.length || 0} images`}
                </span>
                
                <label
                  htmlFor="galleryImages"
                  className={`px-3 py-1 rounded-md flex items-center cursor-pointer ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  }`}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  {formLanguage === 'tr' ? 'Görsel Ekle' : 'Add Image'}
                </label>
                <input
                  type="file"
                  id="galleryImages"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryImageUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            {/* Gallery preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
              {galleryPreviews.length > 0 ? (
                galleryPreviews.map((preview, index) => (
                  <div 
                    key={`preview-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                      <Image 
                        src={preview} 
                        alt={formLanguage === 'tr' 
                          ? `Galeri görseli ${index + 1}` 
                          : `Gallery image ${index + 1}`} 
                        fill
                        style={{ objectFit: 'cover' }}
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
              ) : formData.gallery && formData.gallery.length > 0 ? (
                formData.gallery.map((imagePath, index) => (
                  <div 
                    key={`gallery-${index}`}
                    className="relative group"
                  >
                    <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                      <Image 
                        src={imagePath} 
                        alt={formLanguage === 'tr' 
                          ? `Galeri görseli ${index + 1}` 
                          : `Gallery image ${index + 1}`} 
                        fill
                        style={{ objectFit: 'cover' }}
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
                    ? 'Henüz galeri görseli eklenmemiş. Eklemek için "Görsel Ekle" butonunu kullanın.'
                    : 'No gallery images added yet. Use the "Add Image" button to add images.'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isTranslating}
            className={`px-4 py-2 rounded-md ${
              isDark
                ? 'bg-carbon-grey text-silver hover:bg-dark-grey'
                : 'bg-light-grey text-medium-grey hover:bg-very-light-grey'
            } ${(isSubmitting || isTranslating) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {formLanguage === 'tr' ? 'İptal' : 'Cancel'}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || isTranslating}
            className={`px-4 py-2 rounded-md ${
              isDark
                ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                : 'bg-race-blue text-white hover:bg-race-blue/80'
            } ${(isSubmitting || isTranslating) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting || isTranslating ? (
              <span className="flex items-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
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
                {isTranslating 
                  ? (formLanguage === 'tr' ? 'Çeviriliyor...' : 'Translating...') 
                  : (formLanguage === 'tr' ? 'Kaydediliyor...' : 'Saving...')}
              </span>
            ) : isEditMode 
              ? (formLanguage === 'tr' ? 'Güncelle ve Yayınla' : 'Update and Publish')
              : (formLanguage === 'tr' ? 'Ekle ve Yayınla' : 'Add and Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}