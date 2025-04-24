'use client';

import React, { useState } from 'react';
import { addComment } from '../actions';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface CommentFormProps {
  slug: string;
  locale: LanguageType;
}

export function CommentForm({ slug, locale }: CommentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
    recaptchaToken: 'dummy-token' // In a real app, this would be obtained from reCAPTCHA
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    isSuccess: boolean;
    message: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await addComment(slug, formData);
      
      if (result.success) {
        setFormStatus({
          isSuccess: true,
          message: locale === 'tr' 
            ? 'Yorumunuz başarıyla gönderildi! Sayfayı yenilediğinizde yorumunuz görünecek.'
            : 'Your comment was successfully submitted! It will appear when you refresh the page.'
        });
        setFormData({
          name: '',
          email: '',
          content: '',
          recaptchaToken: 'dummy-token'
        });
      } else {
        setFormStatus({
          isSuccess: false,
          message: locale === 'tr'
            ? `Yorum gönderilemedi: ${result.message}`
            : `Failed to submit comment: ${result.message}`
        });
      }
    } catch (error) {
      setFormStatus({
        isSuccess: false,
        message: locale === 'tr'
          ? 'Bir hata oluştu. Lütfen tekrar deneyiniz.'
          : 'An error occurred. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary bg-opacity-5 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">
        {locale === 'tr' ? 'Yorum Yapın' : 'Leave a Comment'}
      </h3>

      {formStatus && (
        <div className={`p-4 mb-4 rounded ${formStatus.isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {formStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {locale === 'tr' ? 'Adınız Soyadınız' : 'Full Name'}
            </label>
            <input 
              id="name"
              name="name"
              type="text" 
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {locale === 'tr' ? 'E-posta Adresiniz' : 'Email Address'}
            </label>
            <input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            {locale === 'tr' ? 'Yorumunuz' : 'Your Comment'}
          </label>
          <textarea 
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded-md min-h-[120px]"
            required
          ></textarea>
        </div>
        <div className="flex justify-center mb-4">
          {/* Recaptcha Placeholder - In a real app, this would be an actual reCAPTCHA component */}
          <div className="border border-gray-300 p-4 rounded w-full md:w-[300px] h-[78px] flex items-center justify-center">
            <span className="text-sm text-gray-500">reCAPTCHA</span>
          </div>
        </div>
        <button 
          type="submit"
          disabled={isSubmitting}
          className={`bg-primary text-white py-2 px-6 rounded-md transition ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'
          }`}
        >
          {isSubmitting 
            ? (locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...') 
            : (locale === 'tr' ? 'Yorum Gönder' : 'Submit Comment')
          }
        </button>
      </form>
    </div>
  );
}