'use client';

import { useState } from 'react';
import { translateText, translateFields, translateToMultipleLanguages } from '@/services/translation-service';

type SupportedLanguage = 'en' | 'tr';

/**
 * Çeviri işlemleri için özel hook
 * 
 * @returns Çeviri fonksiyonları ve durumu
 */
export default function useTranslate() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tek bir metni çevirir
   * 
   * @param text Çevrilecek metin
   * @param from Kaynak dil kodu
   * @param to Hedef dil kodu
   * @returns Çevrilen metin veya hata durumunda null
   */
  const translate = async (
    text: string, 
    from: SupportedLanguage = 'tr', 
    to: SupportedLanguage = 'en'
  ) => {
    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await translateText({ text, from, to });
      
      if (!result.success) {
        setError(result.error || 'Çeviri sırasında bir hata oluştu');
        return null;
      }
      
      return result.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Çeviri sırasında beklenmeyen bir hata oluştu';
      setError(errorMessage);
      console.error('Çeviri hatası:', err);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };
  
  /**
   * Bir nesnenin belirli alanlarını çevirir
   * 
   * @param obj Çevrilecek nesne
   * @param fields Çevrilecek alan adları
   * @param from Kaynak dil kodu
   * @param to Hedef dil kodu
   * @returns Çevrilmiş nesne
   */
  const translateObject = async <T extends Record<string, any>>(
    obj: T,
    fields: string[],
    from: SupportedLanguage = 'tr',
    to: SupportedLanguage = 'en'
  ) => {
    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await translateFields(obj, fields, from, to);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nesne çevirisi sırasında bir hata oluştu';
      setError(errorMessage);
      console.error('Nesne çeviri hatası:', err);
      return obj; // Hata durumunda orijinal nesneyi döndür
    } finally {
      setIsTranslating(false);
    }
  };
  
  /**
   * Bir nesnenin alanlarını birden çok dile çevirir
   * 
   * @param obj Çevrilecek nesne
   * @param fields Çevrilecek alan adları
   * @param from Kaynak dil kodu
   * @param targetLanguages Hedef dil kodları
   * @returns Çevrilmiş nesne
   */
  const translateObjectToMultipleLanguages = async <T extends Record<string, any>>(
    obj: T,
    fields: string[],
    from: SupportedLanguage = 'tr',
    targetLanguages: SupportedLanguage[] = ['en']
  ) => {
    setIsTranslating(true);
    setError(null);
    
    try {
      const result = await translateToMultipleLanguages(obj, fields, from, targetLanguages);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Çoklu dil çevirisi sırasında bir hata oluştu';
      setError(errorMessage);
      console.error('Çoklu dil çeviri hatası:', err);
      return obj; // Hata durumunda orijinal nesneyi döndür
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    translateObject,
    translateObjectToMultipleLanguages,
    isTranslating,
    error,
    clearError: () => setError(null)
  };
}