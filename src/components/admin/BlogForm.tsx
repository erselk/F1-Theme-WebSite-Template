'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useThemeLanguage, LanguageType } from '@/lib/ThemeLanguageContext';
import { BlogPost } from '@/types';
import Image from 'next/image';
import { PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import useTranslate from '@/hooks/useTranslate';
import ImageSelector from './ImageSelector';
import { createTimezoneDate, getCurrentDate, toISOStringWithTimezone, DEFAULT_TIMEZONE } from '@/lib/date-utils';

// Benzersiz slug oluşturma fonksiyonu
const generateSlugFromEnglishTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Alfanumerik olmayan karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
};

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
const generateBlogId = () => {
  const now = createTimezoneDate(null, DEFAULT_TIMEZONE);
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);
  
  // Random number between 001-999 for the last part
  const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  
  return `${day}${month}${year}${randomNum}`;
};

interface BlogFormProps {
  blog?: BlogPost;
  onSubmit: (blogData: Partial<BlogPost>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BlogForm({ blog, onSubmit, onCancel, isSubmitting }: BlogFormProps) {
  const { isDark, language, setLanguage } = useThemeLanguage();
  const isEditMode = !!blog;

  // Image selector modals state
  const [coverSelectorOpen, setCoverSelectorOpen] = useState(false);
  const [thumbnailSelectorOpen, setThumbnailSelectorOpen] = useState(false);

  // State for authors from server
  const [authors, setAuthors] = useState<Array<{_id: string, name: string, profileImage: string}>>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: { tr: '', en: '' },
    excerpt: { tr: '', en: '' },
    content: { tr: '', en: '' },
    publishDate: toISOStringWithTimezone(new Date(), DEFAULT_TIMEZONE),
    author: {
      name: '',
      avatar: '/images/avatar.webp'
    },
    coverImage: '/images/logouzun.png',
    thumbnailImage: '/images/logokare.png',
    category: 'f1',
    slug: ''
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<{[key: string]: boolean}>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Form language selection (for input language and auto-translation)
  const [formLanguage, setFormLanguage] = useState<LanguageType>('tr');

  // Preview images
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Default images that already exist in the project (updated to use event images)
  const defaultCoverImage = '/images/about1.jpg';
  const defaultThumbnailImage = '/images/about1.jpg';
  
  // Initialize form with default images that actually exist
  useEffect(() => {
    const now = getCurrentDate();
    
    setFormData(prev => ({
      ...prev,
      coverImage: defaultCoverImage,
      thumbnailImage: defaultThumbnailImage,
      // Set current date and time for new blog posts with timezone
      publishDate: toISOStringWithTimezone(now)
    }));

    // Format the current date/time for input field
    const formattedDate = now.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
    setDateInputValue(formattedDate);
    
    // Fetch authors from server
    fetchAuthors();
  }, []);
  
  // Fetch authors from the server
  const fetchAuthors = async () => {
    try {
      setIsLoadingAuthors(true);
      const response = await fetch('/api/authors');
      
      if (!response.ok) {
        throw new Error('Yazarlar yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // Make sure authors is always an array
      if (data && Array.isArray(data)) {
        setAuthors(data);
      } else if (data && data.authors && Array.isArray(data.authors)) {
        setAuthors(data.authors);
      } else {
        console.error('Expected authors data to be an array, but got:', data);
        setAuthors([]);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
      setAuthors([]);
    } finally {
      setIsLoadingAuthors(false);
    }
  };

  // Add a separate state for date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Initialize form with blog data if in edit mode
  useEffect(() => {
    if (blog) {
      setFormData({
        ...blog,
        // Create deep copies to avoid direct references
        title: { ...blog.title },
        excerpt: { ...blog.excerpt },
        content: { ...blog.content },
        author: { ...blog.author }
      });
      
      // Initialize date input value if there's a blog publish date
      if (blog.publishDate) {
        try {
          const dateObj = createTimezoneDate(blog.publishDate);
          const formattedDate = dateObj.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
          setDateInputValue(formattedDate);
        } catch (e) {
          console.error("Error formatting date:", e);
          setDateInputValue('');
        }
      }
    }
  }, [blog]);

  // Text input changes handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'publishDate') {
      // Special handling for date field with timezone
      setDateInputValue(value);
      setFormData(prev => ({
        ...prev,
        publishDate: value ? toISOStringWithTimezone(new Date(value)) : ''
      }));
      return;
    }

    if (name === 'author.name') {
      // Handling for author.name field
      setFormData(prev => ({
        ...prev,
        author: {
          ...prev.author!,
          name: value
        }
      }));
      return;
    }
    
    if (name === 'title' || name === 'excerpt' || name === 'content') {
      // Direct handling for title, excerpt, content fields
      setFormData(prev => ({
        ...prev,
        [name]: {
          ...prev[name as keyof typeof prev]!,
          [formLanguage]: value
        }
      }));
    } else if (name.includes('.')) {
      // Handle nested properties
      const parts = name.split('.');
      
      if (parts.length === 2) {
        // For other nested properties that don't need translation
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0] as keyof typeof prev],
            [parts[1]]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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

  // Handle author selection
  const handleAuthorSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedAuthorId = e.target.value;
    
    if (selectedAuthorId === '') {
      // Reset author info
      setFormData(prev => ({
        ...prev,
        author: {
          name: '',
          avatar: '/images/avatar.webp'
        }
      }));
      return;
    }
    
    // Find the selected author from authors array
    const selectedAuthor = authors.find(author => author._id === selectedAuthorId);
    
    if (selectedAuthor) {
      setFormData(prev => ({
        ...prev,
        author: {
          name: selectedAuthor.name,
          avatar: selectedAuthor.profileImage || '/images/avatar.webp'
        }
      }));
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
    
    if (!dateInputValue) {
      errors['publishDate'] = true;
    }
    
    if (!formData.excerpt?.[currentLang]?.trim()) {
      errors['excerpt'] = true;
    }

    if (!formData.content?.[currentLang]?.trim()) {
      errors['content'] = true;
    }

    if (!formData.author?.name?.trim()) {
      errors['author.name'] = true;
    }

    if (!formData.category?.trim()) {
      errors['category'] = true;
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
      const selector = `[name="${firstErrorField}"]`;

      if (selector) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  // Modified form submission to use the translation function
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
      
      // Generate blog ID if it's a new blog (not in edit mode)
      let updatedData = {...formData};
      
      if (!isEditMode) {
        // Generate ID in format ddmmyyxxx
        updatedData.id = generateBlogId();
        
        // Ensure publish date is current if not set
        if (!updatedData.publishDate) {
          updatedData.publishDate = toISOStringWithTimezone(new Date());
        }
      }
      
      // SLUG kontrolü - title.en değerinden oluşturulacak
      // Boşsa veya geçersizse yeniden oluştur
      let slug = updatedData.slug;
      if (!slug || slug.trim() === '' || slug === 'undefined' || slug.includes('undefined')) {
        if (updatedData.title?.en) {
          slug = generateSlugFromEnglishTitle(updatedData.title.en);
          console.log('Auto-generated slug from English title:', slug);
        } else if (updatedData.title?.tr) {
          // İngilizce başlık yoksa Türkçeyi kullan
          slug = generateSlugFromEnglishTitle(updatedData.title.tr);
          console.log('Auto-generated slug from Turkish title:', slug);
        } else {
          // Fallback olarak random bir slug oluştur
          const randomPart = Math.random().toString(36).substring(2, 8);
          slug = `blog-${randomPart}`;
          console.log('Generated random fallback slug:', slug);
        }
      }
      
      // Ensure all required fields are properly formatted
      updatedData = {
        ...updatedData,
        slug: slug,
        publishDate: updatedData.publishDate ? updatedData.publishDate : toISOStringWithTimezone(new Date()),
      };
      
      // Deep clone the data to avoid any reference issues
      const finalData = JSON.parse(JSON.stringify(updatedData));
      
      console.log('Submitting form data:', finalData);
      
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
          if (name === 'coverImage') {
            setCoverPreview(event.target.result as string);
          } else if (name === 'thumbnailImage') {
            setThumbnailPreview(event.target.result as string);
          }
        }
      };
      
      reader.readAsDataURL(file);
      
      try {
        // Dosyayı sunucuya yükle
        const imageCategory = 'blog';
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
          console.log(`${name} MongoDB'ye başarıyla yüklendi:`, result.publicPath);
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

  // Translate function to process content in other language
  const translateAllFields = async () => {
    try {
      // Define source and target languages
      const fromLang = formLanguage as 'tr' | 'en';
      const toLang = fromLang === 'tr' ? 'en' : 'tr';
      
      // Düzenleme modunda sadece değişen alanları çevir, yeni ekleme modunda tümünü çevir
      if (isEditMode && blog) {
        // Import translation service
        const { translateChangedFields } = await import('@/services/translation-service');
        
        try {
          console.log('Sadece değişen alanlar çevriliyor:', fromLang, 'dilinden', toLang, 'diline');
          
          // Orijinal blog ile karşılaştırarak sadece değişen alanları çevir
          const translatedFormData = await translateChangedFields(formData, blog, fromLang, toLang);
          
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
        // Yeni blog ekleme modunda tüm alanları çevir
        const { translateMultiLangObject } = await import('@/services/translation-service');
        
        try {
          console.log('Tüm alanlar çevriliyor:', fromLang, 'dilinden', toLang, 'diline');
          
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

  // Handle image selection from modal
  const handleCoverImageSelection = (image: ImageFile) => {
    // MongoDB'den gelen görsel ise doğrudan URL'i kullan, değilse publicPath kullan
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      coverImage: imageUrl
    }));
    setCoverPreview(null);
  };
  
  const handleThumbnailImageSelection = (image: ImageFile) => {
    // MongoDB'den gelen görsel ise doğrudan URL'i kullan, değilse publicPath kullan
    const imageUrl = image.url?.startsWith('/api/files/') ? image.url : image.publicPath;
    
    setFormData(prev => ({
      ...prev,
      thumbnailImage: imageUrl
    }));
    setThumbnailPreview(null);
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
            
            {/* Publish Date (hidden) - Hidden from UI but still part of the form data */}
            <input
              type="hidden"
              id="publishDate"
              name="publishDate"
              value={dateInputValue}
            />
            
            {/* Author Selection - Added to main information */}
            <div className="md:col-span-1">
              <label 
                htmlFor="author" 
                className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Yazar *' : 'Author *'}
              </label>
              <div className="flex space-x-2">
                <select
                  id="author"
                  name="author"
                  required
                  value={authors.find(a => a.name === formData.author?.name)?._id || ''}
                  onChange={handleAuthorSelect}
                  className={`flex-1 px-3 py-2 rounded-md ${
                    isDark
                      ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
                      : 'bg-white border border-light-grey text-dark-grey'
                  } ${hasError('author.name') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                  disabled={isLoadingAuthors}
                >
                  <option value="">
                    {isLoadingAuthors 
                      ? (formLanguage === 'tr' ? 'Yükleniyor...' : 'Loading...') 
                      : (formLanguage === 'tr' ? '-- Yazar Seçin --' : '-- Select Author --')}
                  </option>
                  {authors.map(author => (
                    <option key={author._id} value={author._id}>
                      {author.name}
                    </option>
                  ))}
                </select>
                <a 
                  href="/admin/authors/add"
                  className={`px-3 py-2 rounded-md whitespace-nowrap ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-blue-600'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } transition flex items-center`}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  {formLanguage === 'tr' ? 'Yeni' : 'New'}
                </a>
              </div>
              <ErrorMessage show={hasError('author.name')} />
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
                value={formData.category || 'f1'}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 rounded-md ${
                  isDark
                    ? 'bg-carbon-grey border border-dark-grey text-white [&>option]:bg-carbon-grey'
                    : 'bg-white border border-light-grey text-dark-grey'
                }`}
              >
                <option value="f1">{formLanguage === 'tr' ? 'Formula 1' : 'Formula 1'}</option>
                <option value="technology">{formLanguage === 'tr' ? 'Teknoloji' : 'Technology'}</option>
                <option value="events">{formLanguage === 'tr' ? 'Etkinlikler' : 'Events'}</option>
                <option value="interviews">{formLanguage === 'tr' ? 'Röportajlar' : 'Interviews'}</option>
                <option value="other">{formLanguage === 'tr' ? 'Diğer' : 'Other'}</option>
              </select>
              <ErrorMessage show={hasError('category')} />
            </div>
          </div>
        </div>
        
        {/* Excerpt */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'Özet' : 'Excerpt'}
          </h3>
          
          <div>
            <label 
              htmlFor="excerpt" 
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
            >
              {formLanguage === 'tr' ? 'Özet *' : 'Excerpt *'}
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              required
              rows={3}
              value={formData.excerpt?.[formLanguage] || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-md ${
                isDark
                  ? 'bg-carbon-grey border border-dark-grey text-white'
                  : 'bg-white border border-light-grey text-dark-grey'
              } ${hasError('excerpt') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              placeholder={formLanguage === 'tr' 
                ? "Blog yazısının kısa özeti (anasayfada görünecek)" 
                : "Short summary of the blog post (will appear on homepage)"}
            ></textarea>
            <ErrorMessage show={hasError('excerpt')} />
          </div>
        </div>
        
        {/* Content */}
        <div className={`p-4 border rounded-md mb-6 ${
          isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
            {formLanguage === 'tr' ? 'İçerik' : 'Content'}
          </h3>
          
          <div>
            <label 
              htmlFor="content" 
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
            >
              {formLanguage === 'tr' ? 'İçerik *' : 'Content *'}
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={12}
              value={formData.content?.[formLanguage] || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 rounded-md ${
                isDark
                  ? 'bg-carbon-grey border border-dark-grey text-white'
                  : 'bg-white border border-light-grey text-dark-grey'
              } ${hasError('content') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
              placeholder={formLanguage === 'tr' 
                ? "Blog yazısının içeriği. Paragraflar arasında çift satır boşluğu bırakın." 
                : "Content of the blog post. Leave double line breaks between paragraphs."}
            ></textarea>
            <ErrorMessage show={hasError('content')} />
            <p className={`text-xs mt-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
              {formLanguage === 'tr' ? 'Paragraflar arasında çift satır boşluğu bırakın (Enter tuşuna iki kez basın).' : 'Leave double line breaks between paragraphs (press Enter key twice).'}
            </p>
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
            {/* Cover Image */}
            <div>
              <label 
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Kapak Görseli (16:9 önerilen)' : 'Cover Image (16:9 recommended)'}
              </label>
              
              <div className="mb-4">
                {coverPreview ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={coverPreview} 
                      alt={formLanguage === 'tr' ? "Kapak önizleme" : "Cover preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : formData.coverImage ? (
                  <div className="relative w-full h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.coverImage} 
                      alt={formLanguage === 'tr' ? "Kapak görseli" : "Cover image"} 
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
              
              <div className="flex items-center">
                {/* Select Image Button */}
                <button
                  type="button"
                  onClick={() => setCoverSelectorOpen(true)}
                  className={`w-full px-4 py-2 rounded-md ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } flex items-center justify-center`}
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
                </button>
              </div>

              {/* Cover Image Selector Modal */}
              <ImageSelector
                isOpen={coverSelectorOpen}
                onClose={() => setCoverSelectorOpen(false)}
                onSelect={handleCoverImageSelection}
                category="blog" // Sadece upload kategorisi için kullanılıyor
                currentImage={formData.coverImage}
              />
            </div>
            
            {/* Thumbnail Image */}
            <div>
              <label 
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
              >
                {formLanguage === 'tr' ? 'Küçük Görsel (Liste için)' : 'Thumbnail Image (For Listing)'}
              </label>
              
              <div className="mb-4">
                {thumbnailPreview ? (
                  <div className="relative w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={thumbnailPreview} 
                      alt={formLanguage === 'tr' ? "Küçük görsel önizleme" : "Thumbnail preview"} 
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : formData.thumbnailImage ? (
                  <div className="relative w-40 h-40 bg-gray-100 rounded-md overflow-hidden">
                    <Image 
                      src={formData.thumbnailImage} 
                      alt={formLanguage === 'tr' ? "Küçük görsel" : "Thumbnail image"} 
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
              
              <div className="flex items-center">
                {/* Select Image Button */}
                <button
                  type="button"
                  onClick={() => setThumbnailSelectorOpen(true)}
                  className={`w-full px-4 py-2 rounded-md ${
                    isDark
                      ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                      : 'bg-race-blue text-white hover:bg-race-blue/80'
                  } flex items-center justify-center`}
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  {formLanguage === 'tr' ? 'Görsel Seç' : 'Select Image'}
                </button>
              </div>

              {/* Thumbnail Image Selector Modal */}
              <ImageSelector
                isOpen={thumbnailSelectorOpen}
                onClose={() => setThumbnailSelectorOpen(false)}
                onSelect={handleThumbnailImageSelection}
                category="blog"
                currentImage={formData.thumbnailImage}
              />
            </div>
          </div>
        </div>
        
        {/* Form Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${
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
            className={`px-4 py-2 rounded-md ${
              isDark
                ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                : 'bg-race-blue text-white hover:bg-race-blue/80'
            } ${(isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
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