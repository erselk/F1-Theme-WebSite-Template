import { NextRequest, NextResponse } from 'next/server';
import { AzureKeyCredential } from '@azure/core-auth';
import { default as TextTranslationClient, isUnexpected } from '@azure-rest/ai-translation-text';

// Desteklenen diller
type SupportedLanguage = 'en' | 'tr';

// Microsoft Translator API ayarları
const MS_TRANSLATOR_API_KEY = process.env.MS_TRANSLATOR_API_KEY;
const MS_TRANSLATOR_REGION = process.env.MS_TRANSLATOR_REGION || 'germanywestcentral';
const MS_TRANSLATOR_ENDPOINT = 'https://api.cognitive.microsofttranslator.com';

export async function POST(req: NextRequest) {
  try {
    // İstek gövdesinden veriyi al
    const body = await req.json();
    const { text, from, to } = body;

    // Parametreleri doğrula
    if (!text) {
      return NextResponse.json(
        { error: 'Missing required parameter: text' },
        { status: 400 }
      );
    }

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters: from or to' },
        { status: 400 }
      );
    }

    // API anahtarı kontrolü
    if (!MS_TRANSLATOR_API_KEY) {
      return NextResponse.json(
        { error: 'Microsoft Translator API key is missing' },
        { status: 500 }
      );
    }

    // Aynı dile çeviri isteniyorsa doğrudan geri dön
    if (from === to) {
      return NextResponse.json({
        translatedText: text,
        detectedLanguage: { language: from, confidence: 100 },
        success: true
      });
    }

    try {
      // Create credential
      const credential = {
        key: MS_TRANSLATOR_API_KEY,
        region: MS_TRANSLATOR_REGION
      };
      
      // Create client
      const client = TextTranslationClient(MS_TRANSLATOR_ENDPOINT, credential);
      
      // Setup translation request
      const inputText = [{ text: text }];
      
      // Perform translation
      const translateResponse = await client.path("/translate").post({
        body: inputText,
        queryParameters: {
          to: to,
          from: from
        },
      });
      
      if (isUnexpected(translateResponse)) {
        throw new Error(translateResponse.body.error?.message || "Translation API returned an error");
      }
      
      const translations = translateResponse.body;
      if (!translations || translations.length === 0 || !translations[0].translations || translations[0].translations.length === 0) {
        throw new Error("Empty translations response from API");
      }
      
      // Get translation result
      const translatedText = translations[0].translations[0].text || '';
      const detectedLanguage = translations[0].detectedLanguage || { language: from, score: 1 };
      
      // Return formatted translation result
      return NextResponse.json({
        translatedText,
        detectedLanguage: {
          language: detectedLanguage.language || from,
          confidence: (detectedLanguage.score || 1) * 100
        },
        success: true
      });
    } catch (apiError) {
      return NextResponse.json(
        { success: false, error: apiError instanceof Error ? apiError.message : 'Azure Translator API hatası' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Çeviri API hatası' },
      { status: 500 }
    );
  }
}

// Desteklenen dillerin listesini getir - GET method için
export async function GET() {
  return NextResponse.json({
    languages: [
      { code: 'tr', name: 'Türkçe' },
      { code: 'en', name: 'English' }
    ]
  });
}