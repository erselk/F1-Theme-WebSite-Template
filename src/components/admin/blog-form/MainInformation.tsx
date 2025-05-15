'use client';

import { ChangeEvent } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { BlogPost } from '@/types';
import { FormErrors, Author } from './types';
import { ErrorMessage } from './ValidationErrors';

interface MainInformationProps {
  formData: Partial<BlogPost>;
  formLanguage: 'tr' | 'en';
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onAuthorSelect: (e: ChangeEvent<HTMLSelectElement>) => void;
  onAuthorSelectorOpen: () => void;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  authors: Author[];
}

export default function MainInformation({
  formData,
  formLanguage,
  onInputChange,
  onAuthorSelect,
  onAuthorSelectorOpen,
  isDark,
  validationErrors,
  showValidationErrors,
  authors
}: MainInformationProps) {
  
  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };
  
  return (
    <div className={`p-2 sm:p-3 border rounded-md mb-3 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <h3 className={`text-sm sm:text-base font-medium mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-dark-grey'}`}>
        {formLanguage === 'tr' ? 'Ana Bilgiler' : 'Main Information'}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {/* Title - Single Language Input */}
        <div className="col-span-1 sm:col-span-2">
          <label 
            htmlFor="title" 
            className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
          >
            {formLanguage === 'tr' ? 'Başlık *' : 'Title *'}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title?.[formLanguage] || ''}
            onChange={onInputChange}
            className={`w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
              isDark
                ? 'bg-carbon-grey border border-dark-grey text-white'
                : 'bg-white border border-light-grey text-dark-grey'
            } ${hasError('title') ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
          />
          <ErrorMessage show={hasError('title')} formLanguage={formLanguage} />
        </div>
        
        {/* Hidden SEO URL (slug) - Hidden from UI but still part of the form data */}
        <input
          type="hidden"
          id="slug"
          name="slug"
          value={formData.slug || ''}
        />
        
        {/* Author Selection */}
        <div className="mb-2 sm:mb-3">
          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' ? 'Yazar *' : 'Author *'}
          </label>
          
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <div className="flex-1">
              <select
                name="author_id"
                value={formData.author_id || ''}
                onChange={onAuthorSelect}
                className={`w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md border ${
                  isDark 
                    ? 'bg-dark-grey border-carbon-grey text-silver focus:border-electric-blue' 
                    : 'bg-white border-light-grey text-medium-grey focus:border-race-blue'
                } ${hasError('author_id') ? 'border-red-500' : ''}`}
              >
                <option value="">{formLanguage === 'tr' ? 'Yazar Seçin *' : 'Select Author *'}</option>
                {authors && authors.length > 0 ? (
                  authors.map(author => (
                    <option key={author._id} value={author._id}>
                      {author.name} {author.articles?.length ? `(${author.articles.length} ${formLanguage === 'tr' ? 'makale' : 'articles'})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>{formLanguage === 'tr' ? 'Yazarlar yükleniyor...' : 'Loading authors...'}</option>
                )}
              </select>
              <ErrorMessage show={hasError('author_id')} formLanguage={formLanguage} />
            </div>
            
            <Link 
              href="/admin/authors/add"
              className={`px-2 py-1 sm:px-3 sm:py-2 text-xs rounded-md ${
                isDark
                  ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
                  : 'bg-race-blue text-white hover:bg-race-blue/80'
              } flex items-center justify-center whitespace-nowrap`}
            >
              <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {formLanguage === 'tr' ? 'Yeni Yazar Ekle' : 'Add New Author'}
            </Link>
          </div>
        </div>

        {/* Category */}
        <div className="col-span-1">
          <label 
            htmlFor="category" 
            className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}
          >
            {formLanguage === 'tr' ? 'Kategori *' : 'Category *'}
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category || 'f1'}
            onChange={onInputChange}
            className={`w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
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
          <ErrorMessage show={hasError('category')} formLanguage={formLanguage} />
        </div>
      </div>
    </div>
  );
} 