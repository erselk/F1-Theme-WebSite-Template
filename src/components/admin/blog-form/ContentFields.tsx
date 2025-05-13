'use client';

import { ChangeEvent } from 'react';
import { BlogPost } from '@/types';
import { FormErrors } from './types';
import { ErrorMessage } from './ValidationErrors';

interface ContentFieldsProps {
  formData: Partial<BlogPost>;
  formLanguage: 'tr' | 'en';
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
}

export function ExcerptField({
  formData,
  formLanguage,
  onInputChange,
  isDark,
  validationErrors,
  showValidationErrors,
}: ContentFieldsProps) {
  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };
  
  return (
    <div className={`p-2 sm:p-3 border rounded-md mb-3 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Özet' : 'Excerpt'}
      </h3>
      
      <div>
        <label 
          htmlFor="excerpt" 
          className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
        >
          {formLanguage === 'tr' ? 'Özet *' : 'Excerpt *'}
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          required
          rows={2}
          value={formData.excerpt?.[formLanguage] || ''}
          onChange={onInputChange}
          className={`w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white'
              : 'bg-white border border-light-grey text-dark-grey'
          } ${hasError('excerpt') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
          placeholder={formLanguage === 'tr' 
            ? "Blog yazısının kısa özeti (anasayfada görünecek)" 
            : "Short summary of the blog post (will appear on homepage)"}
        ></textarea>
        <ErrorMessage show={hasError('excerpt')} formLanguage={formLanguage} />
      </div>
    </div>
  );
}

export function ContentField({
  formData,
  formLanguage,
  onInputChange,
  isDark,
  validationErrors,
  showValidationErrors,
}: ContentFieldsProps) {
  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };
  
  return (
    <div className={`p-2 sm:p-3 border rounded-md mb-3 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'İçerik' : 'Content'}
      </h3>
      
      <div>
        <label 
          htmlFor="content" 
          className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
        >
          {formLanguage === 'tr' ? 'İçerik *' : 'Content *'}
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={8}
          value={formData.content?.[formLanguage] || ''}
          onChange={onInputChange}
          className={`w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
            isDark
              ? 'bg-carbon-grey border border-dark-grey text-white'
              : 'bg-white border border-light-grey text-dark-grey'
          } ${hasError('content') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
          placeholder={formLanguage === 'tr' 
            ? "Blog yazısının içeriği. Paragraflar arasında çift satır boşluğu bırakın." 
            : "Content of the blog post. Leave double line breaks between paragraphs."}
        ></textarea>
        <ErrorMessage show={hasError('content')} formLanguage={formLanguage} />
        <p className={`text-xs mt-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
          {formLanguage === 'tr' ? 'Paragraflar arasında çift satır boşluğu bırakın (Enter tuşuna iki kez basın).' : 'Leave double line breaks between paragraphs (press Enter key twice).'}
        </p>
      </div>
    </div>
  );
} 