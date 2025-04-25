'use client';

import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { LanguageType } from '@/lib/ThemeLanguageContext';

interface CommentFormProps {
  eventId: string;
  locale: LanguageType;
  onCommentAdded?: () => void;
}

export function CommentForm({ eventId, locale, onCommentAdded }: CommentFormProps) {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(0);
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // reCAPTCHA
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  
  // Form validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = locale === 'tr' ? 'İsim gereklidir' : 'Name is required';
    }
    
    if (!email.trim()) {
      errors.email = locale === 'tr' ? 'E-posta gereklidir' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = locale === 'tr' ? 'Geçerli bir e-posta adresi girin' : 'Enter a valid email address';
    }
    
    if (!comment.trim()) {
      errors.comment = locale === 'tr' ? 'Yorum gereklidir' : 'Comment is required';
    } else if (comment.length < 10) {
      errors.comment = locale === 'tr' 
        ? 'Yorum en az 10 karakter olmalıdır' 
        : 'Comment must be at least 10 characters';
    }
    
    if (rating === 0) {
      errors.rating = locale === 'tr' ? 'Derecelendirme gereklidir' : 'Rating is required';
    }
    
    if (!captchaValue) {
      errors.captcha = locale === 'tr' ? 'CAPTCHA doğrulaması gereklidir' : 'CAPTCHA verification is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle reCAPTCHA change
  const handleCaptchaChange = (token: string | null) => {
    setCaptchaValue(token);
    
    // Clear captcha error if it exists
    if (token && validationErrors.captcha) {
      const { captcha, ...rest } = validationErrors;
      setValidationErrors(rest);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real implementation, this would call your backend API
      
      // Mock API call success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be your actual API call:
      /*
      const response = await fetch('/api/events/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          name,
          email,
          comment,
          rating,
          captchaToken: captchaValue,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const data = await response.json();
      */
      
      // Reset form after successful submission
      setName('');
      setEmail('');
      setComment('');
      setRating(0);
      setCaptchaValue(null);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      
      setSubmitSuccess(true);
      
      // Call the callback if provided
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitError(locale === 'tr' 
        ? 'Yorumunuz gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
        : 'An error occurred while submitting your comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Star rating rendering
  const renderStarRating = () => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
            aria-label={`${star} ${locale === 'tr' ? 'yıldız' : 'star'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-7 w-7 ${
                star <= rating ? 'text-electric-blue' : 'text-carbon-grey'
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        
        <span className="ml-2 text-sm text-silver">
          {rating > 0 ? (
            locale === 'tr' ? `${rating}/5 yıldız` : `${rating}/5 stars`
          ) : (
            <span className="text-carbon-grey">
              {locale === 'tr' ? 'Derecelendirme seçin' : 'Select rating'}
            </span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-graphite p-6 rounded-lg border border-carbon-grey mt-8">
      <h3 className="text-xl font-bold text-white mb-4">
        {locale === 'tr' ? 'Yorum Ekle' : 'Add Comment'}
      </h3>
      
      {/* Success message */}
      {submitSuccess && (
        <div className="bg-neon-green/10 border border-neon-green text-neon-green p-3 rounded-md mb-4">
          <p>
            {locale === 'tr'
              ? 'Yorumunuz başarıyla gönderildi. İncelendikten sonra yayınlanacaktır.'
              : 'Your comment was submitted successfully. It will be published after review.'}
          </p>
        </div>
      )}
      
      {/* Error message */}
      {submitError && (
        <div className="bg-neon-red/10 border border-neon-red text-neon-red p-3 rounded-md mb-4">
          <p>{submitError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-silver mb-1">
              {locale === 'tr' ? 'İsim' : 'Name'} <span className="text-neon-red">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 bg-dark-grey border rounded-md focus:outline-none focus:border-electric-blue text-white ${
                validationErrors.name ? 'border-neon-red' : 'border-carbon-grey'
              }`}
            />
            {validationErrors.name && (
              <p className="text-neon-red text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-silver mb-1">
              {locale === 'tr' ? 'E-posta' : 'Email'} <span className="text-neon-red">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-dark-grey border rounded-md focus:outline-none focus:border-electric-blue text-white ${
                validationErrors.email ? 'border-neon-red' : 'border-carbon-grey'
              }`}
            />
            {validationErrors.email && (
              <p className="text-neon-red text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-silver mb-1">
            {locale === 'tr' ? 'Derecelendirme' : 'Rating'} <span className="text-neon-red">*</span>
          </label>
          {renderStarRating()}
          {validationErrors.rating && (
            <p className="text-neon-red text-xs mt-1">{validationErrors.rating}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-silver mb-1">
            {locale === 'tr' ? 'Yorumunuz' : 'Your Comment'} <span className="text-neon-red">*</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 bg-dark-grey border rounded-md focus:outline-none focus:border-electric-blue text-white ${
              validationErrors.comment ? 'border-neon-red' : 'border-carbon-grey'
            }`}
          ></textarea>
          {validationErrors.comment && (
            <p className="text-neon-red text-xs mt-1">{validationErrors.comment}</p>
          )}
        </div>
        
        {/* reCAPTCHA */}
        <div className="mt-4">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // This is Google's test key - replace with your actual key
            onChange={handleCaptchaChange}
            theme="dark"
            className="overflow-hidden rounded-md"
          />
          {validationErrors.captcha && (
            <p className="text-neon-red text-xs mt-1">{validationErrors.captcha}</p>
          )}
          <p className="text-xs text-silver mt-1">
            {locale === 'tr' 
              ? 'Bu site reCAPTCHA tarafından korunmaktadır ve Google Gizlilik Politikası ve Hizmet Şartları geçerlidir.'
              : 'This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.'}
          </p>
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md text-white ${
              isSubmitting 
                ? 'bg-carbon-grey cursor-not-allowed' 
                : 'bg-neon-red hover:bg-neon-red/90'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...'}
              </div>
            ) : (
              locale === 'tr' ? 'Yorumu Gönder' : 'Submit Comment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}