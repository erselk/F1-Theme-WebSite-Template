'use client';

import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { useEffect } from 'react';
import ImageSelector from '../ImageSelector';
import { BlogFormProps } from './types';
import FormLanguageSelector from './FormLanguageSelector';
import ValidationErrors from './ValidationErrors';
import MainInformation from './MainInformation';
import { ExcerptField, ContentField } from './ContentFields';
import ImageSection from './ImageSection';
import FormButtons from './FormButtons';
import useBlogForm from './useBlogForm';

export default function BlogForm({ blog, onSubmit, onCancel, isSubmitting }: BlogFormProps) {
  const { isDark } = useThemeLanguage();
  
  const {
    formData,
    formLanguage,
    setFormLanguage,
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
    handleInputChange,
    handleAuthorSelect,
    handleSubmit,
    handleCoverImageSelection,
    handleThumbnailImageSelection,
    handleAuthorSelectorOpen,
    fetchAuthors
  } = useBlogForm({ blog, onSubmit, onCancel });
  
  // Component yüklendiğinde yazarları getir
  useEffect(() => {
    fetchAuthors();
  }, []);

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-graphite' : 'bg-white'} shadow-md`}>
      {/* Language selection for content input */}
      <FormLanguageSelector 
        formLanguage={formLanguage} 
        onChange={setFormLanguage} 
        isDark={isDark} 
      />

      <ValidationErrors 
        errors={validationErrors} 
        showErrors={showValidationErrors} 
        formLanguage={formLanguage} 
      />

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Main Information */}
        <MainInformation 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          onAuthorSelect={handleAuthorSelect}
          onAuthorSelectorOpen={handleAuthorSelectorOpen}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
          authors={authors}
        />
        
        {/* Excerpt */}
        <ExcerptField 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
        />
        
        {/* Content */}
        <ContentField 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
        />
        
        {/* Images Section */}
        <ImageSection 
          coverImage={formData.coverImage || ''}
          thumbnailImage={formData.thumbnailImage || ''}
          coverPreview={coverPreview}
          thumbnailPreview={thumbnailPreview}
          onCoverSelectorOpen={() => setCoverSelectorOpen(true)}
          onThumbnailSelectorOpen={() => setThumbnailSelectorOpen(true)}
          isDark={isDark}
          formLanguage={formLanguage}
        />
        
        {/* Form Buttons */}
        <FormButtons 
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          isDark={isDark}
          formLanguage={formLanguage}
        />
      </form>

      {/* Image Selector Modals - Using the original ImageSelector component */}
      {coverSelectorOpen && (
        <ImageSelector 
          isOpen={coverSelectorOpen} 
          onClose={() => setCoverSelectorOpen(false)} 
          onSelect={handleCoverImageSelection}
          title={formLanguage === 'tr' ? 'Kapak Görseli Seç' : 'Select Cover Image'}
          category="blog"
        />
      )}

      {thumbnailSelectorOpen && (
        <ImageSelector 
          isOpen={thumbnailSelectorOpen} 
          onClose={() => setThumbnailSelectorOpen(false)} 
          onSelect={handleThumbnailImageSelection}
          title={formLanguage === 'tr' ? 'Küçük Görsel Seç' : 'Select Thumbnail Image'}
          category="blog"
        />
      )}
    </div>
  );
} 