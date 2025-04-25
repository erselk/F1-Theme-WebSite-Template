'use client';

import React, { useState, useRef } from 'react';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import ReCAPTCHA from 'react-google-recaptcha';

interface CommentFormProps {
  slug: string;
  locale: LanguageType;
}

export function CommentForm({ slug, locale }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // reCAPTCHA site key - should be moved to environment variables in production
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // This is Google's test key

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Validate reCAPTCHA
    if (!recaptchaValue) {
      setSubmitError(locale === 'tr' 
        ? 'Lütfen robot olmadığınızı doğrulayın.' 
        : 'Please verify that you are not a robot.');
      return;
    }
    
    // Basic validation
    if (!name.trim() || !email.trim() || !comment.trim()) {
      setSubmitError(locale === 'tr' 
        ? 'Lütfen tüm alanları doldurun.' 
        : 'Please fill in all fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setSubmitError(locale === 'tr' 
        ? 'Geçerli bir e-posta adresi girin.' 
        : 'Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would be an API call to save the comment
      // For now, we'll simulate an API call with a timeout
      
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     slug,
      //     name,
      //     email,
      //     comment,
      //     recaptchaToken: recaptchaValue,
      //   }),
      // });
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // if (!response.ok) throw new Error('Failed to submit comment');
      
      // Success
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setComment('');
      setRecaptchaValue(null);
      
      // Reset reCAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
      // In a real application, you might want to refetch comments here
      // or add the comment to the local state
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitError(locale === 'tr' 
        ? 'Yorumunuz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
        : 'There was an error submitting your comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle reCAPTCHA change
  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  return (
    <div className="comment-form">
      <h3 className="text-xl font-bold mb-4 text-light-grey">
        {locale === 'tr' ? 'Yorum Ekle' : 'Add Comment'}
      </h3>
      
      {/* Success message */}
      {submitSuccess && (
        <div className="bg-neon-green/10 border border-neon-green text-neon-green p-4 rounded-lg mb-4 animate-scaleUp">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {locale === 'tr' 
              ? 'Yorumunuz başarıyla gönderildi! Sayfayı yenilediğinizde yorumunuz görünecek.' 
              : 'Your comment was submitted successfully! It will appear when you refresh the page.'}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {submitError && (
        <div className="bg-neon-red/10 border border-neon-red text-neon-red p-4 rounded-lg mb-4 animate-scaleUp">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {submitError}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-silver">
              {locale === 'tr' ? 'Adınız' : 'Your Name'} <span className="text-neon-red">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-dark-grey border border-carbon-grey focus:border-electric-blue focus:outline-none text-light-grey"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-silver">
              {locale === 'tr' ? 'E-posta Adresiniz' : 'Your Email'} <span className="text-neon-red">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md bg-dark-grey border border-carbon-grey focus:border-electric-blue focus:outline-none text-light-grey"
              required
            />
            <p className="text-xs mt-1 text-silver">
              {locale === 'tr' 
                ? 'E-posta adresiniz yayınlanmayacaktır.' 
                : 'Your email will not be published.'}
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1 text-silver">
            {locale === 'tr' ? 'Yorumunuz' : 'Your Comment'} <span className="text-neon-red">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 rounded-md bg-dark-grey border border-carbon-grey focus:border-electric-blue focus:outline-none text-light-grey"
            required
          ></textarea>
        </div>
        
        {/* reCAPTCHA */}
        <div className="flex justify-center md:justify-start">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
            theme="dark"
            hl={locale === 'tr' ? 'tr' : 'en'}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-carbon-grey text-silver cursor-not-allowed'
              : 'bg-electric-blue hover:bg-electric-blue/90 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...'}
            </>
          ) : (
            <>{locale === 'tr' ? 'Yorum Gönder' : 'Post Comment'}</>
          )}
        </button>
      </form>
    </div>
  );
}