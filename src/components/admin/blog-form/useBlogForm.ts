'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { BlogPost } from '@/types';
import { Author, ImageFile, FormErrors, generateSlugFromEnglishTitle } from './types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { createTimezoneDate, getCurrentDate, toISOStringWithTimezone, DEFAULT_TIMEZONE } from '@/lib/date-utils';

interface UseBlogFormProps {
  blog?: BlogPost & { author?: Author };
  onSubmit: (blogData: Partial<BlogPost>) => void;
  onCancel: () => void;
}

export default function useBlogForm({ blog, onSubmit, onCancel }: UseBlogFormProps) {
  const isEditMode = !!blog;
  
  // Image selector modals state
  const [coverSelectorOpen, setCoverSelectorOpen] = useState(false);
  const [thumbnailSelectorOpen, setThumbnailSelectorOpen] = useState(false);

  // State for authors from server
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
  const [isAuthorsLoaded, setIsAuthorsLoaded] = useState(false);
  const [authorSelectorOpen, setAuthorSelectorOpen] = useState(false);

  // Default images that already exist in the project
  const defaultCoverImage = '/images/logouzun.png';
  const defaultThumbnailImage = '/images/logokare.png';

  // Form state
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: { tr: '', en: '' },
    excerpt: { tr: '', en: '' },
    content: { tr: '', en: '' },
    publishDate: toISOStringWithTimezone(new Date(), DEFAULT_TIMEZONE),
    author_id: '',
    coverImage: defaultCoverImage,
    thumbnailImage: defaultThumbnailImage,
    category: 'f1',
    slug: ''
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Form language selection (for input language and auto-translation)
  const [formLanguage, setFormLanguage] = useState<LanguageType>('tr');

  // Preview images
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Add a separate state for date input
  const [dateInputValue, setDateInputValue] = useState<string>('');

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
    
    // Sayfa yüklendiğinde yazarları otomatik olarak getir
    fetchAuthors();
  }, []);

  // Initialize form with blog data if in edit mode
  useEffect(() => {
    if (blog) {
      let authorIdToSet = '';
      // Gelen blog verisinde populate edilmiş author nesnesi olabilir veya sadece author_id olabilir.
      if ((blog as any).author && typeof (blog as any).author === 'object' && (blog as any).author._id) {
        authorIdToSet = (blog as any).author._id;
      } else if (blog.author_id) { 
        authorIdToSet = blog.author_id;
      }

      // FormData'yı blog verisiyle ve çıkarılan author_id ile güncelle
      // Önce blogdaki diğer alanları al, sonra bizim author_id'mizi ekle/üzerine yaz
      const { author, ...restOfBlog } = blog as any; // author'ı ayır
      
      setFormData(prev => ({
        ...prev, // Önceki state'i koru (başlangıç değerleri vb.)
        ...restOfBlog, // Gelen blog verisindeki diğer alanları al (title, content vb.)
        title: { ...(blog.title || { tr: '', en: '' }) }, // title, excerpt, content için deep copy
        excerpt: { ...(blog.excerpt || { tr: '', en: '' }) },
        content: { ...(blog.content || { tr: '', en: '' }) },
        author_id: authorIdToSet, // author_id'yi ayarla
        // publishDate, coverImage, thumbnailImage, category, slug gibi alanlar restOfBlog'dan gelmeli
        // veya blog objesinden direkt alınmalı. BlogPost tipiyle uyumlu olmalı.
        publishDate: blog.publishDate || prev.publishDate,
        coverImage: blog.coverImage || prev.coverImage,
        thumbnailImage: blog.thumbnailImage || prev.thumbnailImage,
        category: blog.category || prev.category,
        slug: blog.slug || prev.slug,
      }));
      
      // Initialize date input value if there's a blog publish date
      if (blog.publishDate) {
        try {
          const dateObj = createTimezoneDate(blog.publishDate);
          const formattedDate = dateObj.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
          setDateInputValue(formattedDate);
        } catch (e) {
          setDateInputValue('');
        }
      }
    }
  }, [blog]);

  // Fetch authors from the server
  const fetchAuthors = async () => {
    // Eğer yazarlar zaten yüklendiyse tekrar yükleme
    if (isAuthorsLoaded || isLoadingAuthors) return;
    
    try {
      setIsLoadingAuthors(true);
      const response = await fetch('/api/authors');
      
      if (!response.ok) {
        throw new Error('Yazarlar yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      // API değişikliği - response { authors: [...] } şeklinde dönüyor
      if (data && data.authors && Array.isArray(data.authors)) {
        setAuthors(data.authors);
      } else if (data && Array.isArray(data)) {
        setAuthors(data);
      } else {
        setAuthors([]);
      }
      
      // Yazarların yüklendiğini işaretleyelim
      setIsAuthorsLoaded(true);
    } catch (error) {
      setAuthors([]);
    } finally {
      setIsLoadingAuthors(false);
    }
  };

  // Text input changes handler
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'publishDate') {
      setDateInputValue(value);
      setFormData(prev => ({
        ...prev,
        publishDate: value ? toISOStringWithTimezone(new Date(value)) : ''
      }));
      return;
    }

    if (name === 'title' || name === 'excerpt' || name === 'content') {
      setFormData(prev => {
        // prev[name] 'in bir nesne olduğundan emin olalım.
        const currentLanguagedFields = prev[name as 'title' | 'excerpt' | 'content'];
        return {
          ...prev,
          [name]: {
            ...(typeof currentLanguagedFields === 'object' && currentLanguagedFields !== null ? currentLanguagedFields : { tr: '', en: '' }),
            [formLanguage]: value
          }
        };
      });
    } else { 
      // Diğer düz string alanlar (slug, category)
      // author_id dropdown ile yönetildiği için buraya girmemeli.
      if (name !== 'author_id') {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
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
        author_id: ''
      }));
      return;
    }
    
    const selectedAuthor = authors.find(author => author._id === selectedAuthorId);
    
    if (selectedAuthor) {
      setFormData(prev => ({
        ...prev,
        author_id: selectedAuthor._id
      }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors: FormErrors = {};
    
    // Check required fields - only validate the current language
    const currentLang = formLanguage;
    
    // Check required fields - tüm alanlar zorunlu
    if (!formData.title?.[currentLang]?.trim()) {
      errors['title'] = true;
    }
    if (!formData.excerpt?.[currentLang]?.trim()) {
      errors['excerpt'] = true;
    }
    if (!formData.content?.[currentLang]?.trim()) {
      errors['content'] = true;
    }
    if (!formData.slug?.trim()) {
      errors['slug'] = true;
    }
    if (!formData.publishDate) { // publishDate için null/undefined/boş string kontrolü
      errors['publishDate'] = true;
    }
    if (!formData.coverImage) {
      errors['coverImage'] = true;
    }
    if (!formData.thumbnailImage) {
      errors['thumbnailImage'] = true;
    }
    if (!formData.category) {
      errors['category'] = true;
    }
    // Yazar seçimi zorunlu
    if (!formData.author_id) {
      errors['author_id'] = true;
    }

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

  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
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
          // Orijinal blog ile karşılaştırarak sadece değişen alanları çevir
          const translatedFormData = await translateChangedFields(formData, blog, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
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
          // Tüm form verilerini çevirip güncelle
          const translatedFormData = await translateMultiLangObject(formData, fromLang, toLang);
          
          // Update form data with translations
          setFormData(translatedFormData);
          
          return true;
        } catch (error) {
          // Kullanıcıya hata mesajı göster
          alert(fromLang === 'tr' 
            ? `Çeviri işlemi sırasında bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            : `An error occurred during translation: ${error instanceof Error ? error.message : 'Unknown error'}`);
          
          return false;
        }
      }
    } catch (error) {
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

  // Yazar seçici açıldığında yazarları yükle
  const handleAuthorSelectorOpen = () => {
    setAuthorSelectorOpen(true);
    fetchAuthors();
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
        } else {
          alert(formLanguage === 'tr' 
            ? 'Görsel yüklenirken bir hata oluştu.'
            : 'An error occurred while uploading the image.');
        }
      } catch (error) {
        alert(formLanguage === 'tr' 
          ? 'Görsel yüklenirken bir hata oluştu.'
          : 'An error occurred while uploading the image.');
      }
    }
  };

  // Modified form submission to use the translation function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setShowValidationErrors(true);
      scrollToFirstError();
      return;
    }
    
    // Ensure correct publishDate format with timezone
    const finalData = {
      ...formData,
      publishDate: formData.publishDate ? toISOStringWithTimezone(new Date(formData.publishDate)) : ''
    };
    
    // Make sure author_id is correctly set
    if (!finalData.author_id && authors.length > 0) {
      finalData.author_id = authors[0]._id; // Fallback to first author if not set
    }
    
    // Remove temporary fields like author object if it exists
    const { author, ...dataToSubmit } = finalData as any; 
    
    onSubmit(dataToSubmit);
  };

  return {
    formData,
    formLanguage,
    setFormLanguage,
    dateInputValue,
    validationErrors,
    showValidationErrors,
    authors,
    isEditMode,
    coverPreview,
    thumbnailPreview,
    coverSelectorOpen,
    setCoverSelectorOpen,
    thumbnailSelectorOpen,
    setThumbnailSelectorOpen,
    authorSelectorOpen,
    setAuthorSelectorOpen,
    handleInputChange,
    handleAuthorSelect,
    handleSubmit,
    handleCoverImageSelection,
    handleThumbnailImageSelection,
    handleAuthorSelectorOpen,
    fetchAuthors,
    hasError
  };
} 