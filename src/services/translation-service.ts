// Web sitesi içinde barındırılan çeviri servisi
// Microsoft Azure Translator API kullanarak çeviri yapar

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

type SupportedLanguage = 'en' | 'tr';

interface TranslationRequest {
  text: string;
  from: SupportedLanguage;
  to: SupportedLanguage;
}

interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
  success: boolean;
  error?: string;
}

// Azure Translator API bilgileri
// API anahtarları burada hard-coded olarak tanımlanıyor, güvenlik için çevresel değişkenler tercih edilmelidir
const API_KEY = "Bhi1APwm3XrBov9N8P4W9j9aqt8a8B9QQ4WuSYgCxyRx0P9C5kv5JQQJ99BDACPV0roXJ3w3AAAbACOG4Lav"; // ANAHTAR 1
const API_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
const API_LOCATION = "germanywestcentral";

/**
 * Azure Translator API kullanarak metni çevirir
 */
export async function translateText({ text, from, to }: TranslationRequest): Promise<TranslationResponse> {
  // Aynı dile çeviri isteniyorsa direkt metni dön
  if (from === to || !text || text.trim() === '') {
    return {
      translatedText: text,
      success: true
    };
  }
  
  // Çıktıda "[to be translated]" ibaresi varsa temizle
  if (text.includes('[to be translated]')) {
    text = text.replace('[to be translated]', '').trim();
  }

  try {
    // console.log(`Translation request: ${from} to ${to} - \"${text.substring(0, 30)}${text.length > 30 ? '...' : ''}\"`);

    // Azure Translator API'ye istek gönder
    const response = await axios({
      baseURL: API_ENDPOINT,
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
        'Ocp-Apim-Subscription-Region': API_LOCATION,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString()
      },
      params: {
        'api-version': '3.0',
        'from': from,
        'to': to
      },
      data: [{
        'text': text
      }],
      responseType: 'json'
    });

    // console.log('Translation API response received:', response.status);

    // API yanıtını kontrol et
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const translations = response.data[0].translations;
      if (translations && translations.length > 0) {
        // console.log('Çeviri başarılı:', translations[0].text);
        return {
          translatedText: translations[0].text,
          success: true
        };
      }
    }
    
    throw new Error('API yanıtı beklenen formatta değil');
  } catch (error: any) {
    // console.error('Azure Translator API hatası:', error);
    
    // Daha detaylı hata bilgisi
    if (error.response) {
      // console.error('Hata durumu:', error.response.status);
      // console.error('Hata detayı:', error.response.data);
    }
    
    return {
      translatedText: text, // Hata durumunda orijinal metni geri dön
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen çeviri hatası'
    };
  }
}

/**
 * Bir nesne içindeki belirli tipteki alanları çevirir
 */
export async function translateMultiLangObject<T extends Record<string, any>>(
  obj: T, 
  from: SupportedLanguage, 
  to: SupportedLanguage
): Promise<T> {
  // Objede tanımsız veya null değerler varsa kontrol et
  if (!obj) {
    return obj;
  }
  
  // Debug için başlangıç mesajı
  // console.log(`Çeviri başlatılıyor: ${from} dilinden ${to} diline`);
  
  // Objeyi kopyala (referans değişiminden kaçınmak için)
  const result = { ...obj };
  
  // Nesne içinde dönüş yaparak çift dilli alanları bul ve çevir
  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const value = result[key];
      
      // Değerin varlığını kontrol et
      if (value === null || value === undefined) {
        continue;
      }
      
      // Obje tipini kontrol et
      if (typeof value === 'object') {
        // { tr: "...", en: "..." } formatındaki dil alanlarını bul
        if (value[from] && typeof value[from] === 'string') {
          const sourceText = value[from];
          
          // Debug mesajı
          // console.log(`Çevriliyor: Alan \"${key}.${from}\" - Değer: \"${sourceText.substring(0, 20)}${sourceText.length > 20 ? '...' : ''}\"`);
          
          if (sourceText.trim() !== '') {
            try {
              // API ile çevir
              const translation = await translateText({
                text: sourceText,
                from,
                to
              });
              
              // Çeviri başarılıysa hedef dil değerini güncelle
              if (translation.success) {
                value[to] = translation.translatedText;
                // console.log(`Çeviri tamamlandı: \"${sourceText.substring(0, 20)}${sourceText.length > 20 ? '...' : ''}\" => \"${translation.translatedText.substring(0, 20)}${translation.translatedText.length > 20 ? '...' : ''}\"`);
              } else {
                // console.warn(`Çeviri başarısız: ${key}.${from} => ${key}.${to}. Hata: ${translation.error}`);
              }
            } catch (error) {
              // console.error(`Çeviri hatası (${key}.${from} => ${key}.${to}):`, error);
            }
          }
        } else if (Array.isArray(value)) {
          // Array ise elemanlarını kontrol et
          // console.log(`Array kontrolü: ${key} (${value.length} eleman)`);
          for (let i = 0; i < value.length; i++) {
            if (typeof value[i] === 'object' && value[i] !== null) {
              // Alt nesneler için recursive çağrı
              // console.log(`Array elemanı çevriliyor: ${key}[${i}]`);
              value[i] = await translateMultiLangObject(value[i], from, to);
            }
          }
        } else {
          // İç içe nesneler için recursive çağrı
          // console.log(`İç içe nesne çevriliyor: ${key}`);
          result[key] = await translateMultiLangObject(value, from, to);
        }
      }
    }
  }
  
  // console.log('Çeviri işlemi tamamlandı.');
  return result;
}

/**
 * Sadece değişen alanları çeviren optimizasyon fonksiyonu
 * @param newData Güncel verileri içeren nesne
 * @param originalData Orijinal verileri içeren nesne
 * @param from Kaynak dil
 * @param to Hedef dil
 * @returns Çevrilmiş yeni veri nesnesi
 */
export async function translateChangedFields<T extends Record<string, any>>(
  newData: T,
  originalData: T,
  from: SupportedLanguage,
  to: SupportedLanguage
): Promise<T> {
  if (!newData || !originalData) {
    return newData;
  }

  // Sonuç nesnesini kopyala
  const result = { ...newData };

  // Nesne içinde dönüş yaparak değişen çift dilli alanları bul ve çevir
  for (const key in result) {
    if (result.hasOwnProperty(key)) {
      const newValue = result[key];
      const originalValue = originalData[key];
      
      // Değerin varlığını kontrol et
      if (newValue === null || newValue === undefined) {
        continue;
      }
      
      // Obje tipini kontrol et
      if (typeof newValue === 'object' && !Array.isArray(newValue)) {
        // { tr: "...", en: "..." } formatındaki dil alanlarını bul
        if (newValue[from] && typeof newValue[from] === 'string') {
          const sourceText = newValue[from];
          
          // Değişim olup olmadığını kontrol et
          const hasChanged = !originalValue || 
                            originalValue[from] !== sourceText || 
                            !originalValue[to];
          
          if (hasChanged && sourceText.trim() !== '') {
            // console.log(`Değişen alan tespit edildi: \"${key}.${from}\" - Çeviriliyor...`);
            
            try {
              // API ile çevir
              const translation = await translateText({
                text: sourceText,
                from,
                to
              });
              
              // Çeviri başarılıysa hedef dil değerini güncelle
              if (translation.success) {
                newValue[to] = translation.translatedText;
                // console.log(`Çeviri tamamlandı: ${key}.${from} => ${key}.${to}`);
              } else {
                // console.warn(`Çeviri başarısız: ${key}.${from} => ${key}.${to}. Hata: ${translation.error}`);
              }
            } catch (error) {
              // console.error(`Çeviri hatası (${key}.${from} => ${key}.${to}):`, error);
            }
          } else {
            // console.log(`Alan \"${key}.${from}\" değişmemiş, çeviri atlanıyor.`);
          }
        } else {
          // İç içe nesneler için recursive çağrı
          if (originalValue && typeof originalValue === 'object') {
            result[key] = await translateChangedFields(newValue, originalValue, from, to);
          } else {
            result[key] = await translateMultiLangObject(newValue, from, to);
          }
        }
      } else if (Array.isArray(newValue)) {
        // Array kontrolü
        if (Array.isArray(originalValue)) {
          // Array elemanlarını karşılaştır ve gerekli olanları çevir
          for (let i = 0; i < newValue.length; i++) {
            if (typeof newValue[i] === 'object' && newValue[i] !== null) {
              // Eşleşen orijinal eleman
              const originalItem = i < originalValue.length ? originalValue[i] : null;
              
              if (originalItem && typeof originalItem === 'object') {
                // Değişen alanları çevir
                newValue[i] = await translateChangedFields(newValue[i], originalItem, from, to);
              } else {
                // Yeni eklenen elemanları tamamen çevir
                newValue[i] = await translateMultiLangObject(newValue[i], from, to);
              }
            }
          }
        } else {
          // Orijinalde array yoksa tüm elemanları çevir
          for (let i = 0; i < newValue.length; i++) {
            if (typeof newValue[i] === 'object' && newValue[i] !== null) {
              newValue[i] = await translateMultiLangObject(newValue[i], from, to);
            }
          }
        }
      }
    }
  }
  
  return result;
}

/**
 * Tüm form verilerini çevirecek fonksiyon - iki dil arasında eşleşmeyi sağlar
 */
export async function translateForm<T extends Record<string, any>>(
  formData: T, 
  activeLanguage: SupportedLanguage
): Promise<T> {
  // Aktif olmayan dili hesapla
  const targetLanguage = activeLanguage === 'tr' ? 'en' : 'tr';
  
  // Debug mesajı
  // console.log(`Form çevirisi başlatılıyor: ${activeLanguage} => ${targetLanguage}`);
  
  // Tüm form verilerini recursive olarak çevir
  const translatedData = await translateMultiLangObject(formData, activeLanguage, targetLanguage);
  return translatedData;
}

/**
 * Verilen metindeki dilin ne olduğunu tespit eder
 * 
 * @param text Dili tespit edilecek metin
 * @returns Tespit edilen dil kodu ('en' veya 'tr')
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text) return 'en';
  
  // Türkçeye özgü karakterler
  const turkishChars = ['ç', 'ş', 'ğ', 'ü', 'ö', 'ı'];
  const lowercaseText = text.toLowerCase();
  
  // Türkçe karakterler varsa
  const hasTurkishChars = turkishChars.some(char => lowercaseText.includes(char));
  
  // Yaygın Türkçe kelimeler
  const commonTurkishWords = ['ve', 'bir', 'için', 'bu', 'ile', 'olarak', 'çok', 'daha', 'var', 'ben', 'ama'];
  const words = lowercaseText.split(/\s+/);
  const hasTurkishWords = words.some(word => commonTurkishWords.includes(word));
  
  // Kriterlerden biri geçerliyse Türkçe kabul et, aksi halde İngilizce
  return (hasTurkishChars || hasTurkishWords) ? 'tr' : 'en';
}