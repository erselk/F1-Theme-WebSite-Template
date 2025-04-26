// Çeviri servisi
// Google Translate API kullanarak yorumları çevirir

import axios from 'axios';

// Translation service için tip tanımları
type SupportedLanguage = 'en' | 'tr';

interface TranslationRequest {
  text: string;
  from: SupportedLanguage;
  to: SupportedLanguage;
}

interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: SupportedLanguage;
  success: boolean;
  error?: string;
}

/**
 * Metni bir dilden diğerine çevirir
 * Google Translate API kullanılır
 * 
 * @param text Çevrilecek metin
 * @param from Kaynak dil kodu ('en' veya 'tr')
 * @param to Hedef dil kodu ('en' veya 'tr')
 * @returns Çevrilmiş metin response'u
 */
export async function translateText({ text, from, to }: TranslationRequest): Promise<TranslationResponse> {
  // Aynı dile çeviri isteniyorsa direkt metni dön
  if (from === to) {
    return {
      translatedText: text,
      success: true
    };
  }
  
  try {
    // Google Cloud Translation API - API key .env dosyasından alınır
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    // API key yoksa hata döndür
    if (!apiKey) {
      console.warn('Google Translate API key is missing. Using fallback translation.');
      return fallbackTranslate({ text, from, to });
    }
    
    // Google Translate API'yi çağır
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        q: text,
        source: from,
        target: to,
        format: 'text'
      }
    );
    
    // API yanıtını kontrol et
    if (response.data && 
        response.data.data && 
        response.data.data.translations && 
        response.data.data.translations.length > 0) {
      
      return {
        translatedText: response.data.data.translations[0].translatedText,
        success: true
      };
    }
    
    throw new Error('Invalid response from translation API');
    
  } catch (error) {
    console.error('Translation API error:', error);
    
    // API hatası durumunda fallback çeviriye yönlendir
    return fallbackTranslate({ text, from, to });
  }
}

/**
 * Google Translate API kullanılamadığında bazı yaygın çeviriler için fallback çeviri yapar
 * Ya da basit bir dil algılama ve manuel çeviri tablosu kullanır
 */
function fallbackTranslate({ text, from, to }: TranslationRequest): TranslationResponse {
  // Basit çeviri tablosu - gerçek uygulama için genişletilmeli
  const commonTranslations: Record<string, Record<string, string>> = {
    en: {
      tr: {
        "Great event!": "Harika bir etkinlik!",
        "I enjoyed it very much": "Çok keyif aldım",
        "The organization was perfect": "Organizasyon mükemmeldi",
        "I will definitely attend again": "Kesinlikle tekrar katılacağım",
        "It was fantastic": "Harikaydı",
        "Thank you for organizing": "Organize ettiğiniz için teşekkürler",
        "Could be better": "Daha iyi olabilirdi",
        "Good job": "İyi iş"
      }
    },
    tr: {
      en: {
        "Harika bir etkinlik!": "Great event!",
        "Çok keyif aldım": "I enjoyed it very much",
        "Organizasyon mükemmeldi": "The organization was perfect",
        "Kesinlikle tekrar katılacağım": "I will definitely attend again",
        "Harikaydı": "It was fantastic",
        "Organize ettiğiniz için teşekkürler": "Thank you for organizing",
        "Daha iyi olabilirdi": "Could be better",
        "İyi iş": "Good job"
      }
    }
  };
  
  // Eşleşen çeviri varsa kullan
  if (commonTranslations[from]?.[to]?.[text]) {
    return {
      translatedText: commonTranslations[from][to][text],
      success: true
    };
  }
  
  // Çeviri bulunamadığında orijinal metne bir not ekle
  return {
    translatedText: `${text} [${from} to ${to} translation not available]`,
    success: false,
    error: 'No translation available for this text'
  };
}

/**
 * Verilen metindeki dilin ne olduğunu tespit eder (basit implementasyon)
 * 
 * @param text Dili tespit edilecek metin
 * @returns Tespit edilen dil kodu ('en' veya 'tr')
 */
export function detectLanguage(text: string): SupportedLanguage {
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