'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { BlogPost } from '@/types';
import { Author, ImageFile, FormErrors, generateSlugFromEnglishTitle } from './types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { createTimezoneDate, getCurrentDate, toISOStringWithTimezone, DEFAULT_TIMEZONE } from '@/lib/date-utils';

interface UseBlogFormProps {
  blog?: BlogPost;
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
    author: {
      name: '',
      avatar: '/images/avatar.webp'
    },
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
      console.log('Blog düzenleme modunda başlatılıyor, yazar:', blog.author);
      
      // Yazarın ID bilgisi varsa onu da ekleyelim
      const authorData = {
        ...blog.author,
        _id: blog.author?._id  // Eğer blog.author içinde _id varsa kullanıyoruz
      };
      
      setFormData({
        ...blog,
        // Create deep copies to avoid direct references
        title: { ...blog.title },
        excerpt: { ...blog.excerpt },
        content: { ...blog.content },
        author: authorData
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

  // Yazarlar yüklendiğinde, eğer blog varsa ve blog yazarının adı varsa ama ID'si yoksa
  // yazarlar listesinden eşleşen yazarı bul ve ID'sini ayarla
  useEffect(() => {
    if (blog && blog.author?.name && !blog.author?._id && authors.length > 0) {
      console.log('Yazarlar yüklendi, blog yazarı için ID aranıyor...');
      
      // İsme göre yazarı ara
      const matchingAuthor = authors.find(author => author.name === blog.author?.name);
      
      if (matchingAuthor) {
        console.log('Yazara ait ID bulundu:', matchingAuthor._id);
        
        // FormData içindeki yazara ID bilgisini ekle
        setFormData(prev => ({
          ...prev,
          author: {
            ...prev.author!,
            _id: matchingAuthor._id
          }
        }));
      } else {
        console.log('Yazarın ismi ile eşleşen bir yazar bulunamadı:', blog.author?.name);
      }
    }
  }, [authors, blog]);

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
      console.log('Authors from API:', data);
      
      // API değişikliği - response { authors: [...] } şeklinde dönüyor
      if (data && data.authors && Array.isArray(data.authors)) {
        setAuthors(data.authors);
        console.log('Yazarlar yüklendi:', data.authors.length);
      } else if (data && Array.isArray(data)) {
        setAuthors(data);
        console.log('Yazarlar yüklendi (alternatif):', data.length);
      } else {
        console.error('Expected authors data to be an array, but got:', data);
        setAuthors([]);
      }
      
      // Yazarların yüklendiğini işaretleyelim
      setIsAuthorsLoaded(true);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setAuthors([]);
    } finally {
      setIsLoadingAuthors(false);
    }
  };

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
    console.log('Seçilen yazar ID:', selectedAuthorId);
    
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
    console.log('Mevcut yazarlar:', authors);
    const selectedAuthor = authors.find(author => author._id === selectedAuthorId);
    console.log('Bulunan yazar:', selectedAuthor);
    
    if (selectedAuthor) {
      setFormData(prev => ({
        ...prev,
        author: {
          _id: selectedAuthor._id, // Yazar ID'sini de kaydediyoruz
          name: selectedAuthor.name,
          avatar: selectedAuthor.profileImage || '/images/avatar.webp'
        }
      }));
    } else {
      console.error(`ID'si ${selectedAuthorId} olan yazar bulunamadı!`);
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
    
    if (!dateInputValue) {
      errors['publishDate'] = true;
    }
    
    if (!formData.excerpt?.[currentLang]?.trim()) {
      errors['excerpt'] = true;
    }

    if (!formData.content?.[currentLang]?.trim()) {
      errors['content'] = true;
    }

    // Yazar ID veya name değeri eksikse hata
    if (!formData.author?._id && !formData.author?.name?.trim()) {
      errors['author.name'] = true;
    }

    if (!formData.category?.trim()) {
      errors['category'] = true;
    }
    
    // Kapak görseli ve küçük resim de zorunlu
    if (!formData.coverImage) {
      errors['coverImage'] = true;
    }
    
    if (!formData.thumbnailImage) {
      errors['thumbnailImage'] = true;
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
        // Generate a unique ID using timestamp
        const timestamp = Date.now();
        updatedData.id = `blog-${timestamp}`;
        
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
        } else if (updatedData.title?.tr) {
          // İngilizce başlık yoksa Türkçeyi kullan
          slug = generateSlugFromEnglishTitle(updatedData.title.tr);
        } else {
          // Fallback olarak random bir slug oluştur
          const randomPart = Math.random().toString(36).substring(2, 8);
          slug = `blog-${randomPart}`;
        }
      }
      
      // Yazar için articles dizisini güncelleme
      if (updatedData.author?._id) {
        try {
          // MongoDB'ye yazar güncellemesi yap
          // 1. Eğer düzenleme yapılıyorsa ve eski bir yazar varsa, o yazarın makale listesinden çıkar
          if (isEditMode && blog?.author?._id && blog.author._id !== updatedData.author._id) {
            await fetch(`/api/authors/${blog.author._id}/remove-article`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slug: blog.slug })
            });
          }
          
          // 2. Yeni yazara ekle (veya var olan yazarın makale listesini güncelle)
          await fetch(`/api/authors/${updatedData.author._id}/add-article`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug })
          });
        } catch (error) {
          console.error('Yazar güncellemesi sırasında hata:', error);
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