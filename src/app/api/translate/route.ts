import { NextRequest, NextResponse } from 'next/server';
// Fix the import to use the correct method from Azure SDK
import { createClient } from "@azure-rest/ai-translation-text";

// Desteklenen diller
type SupportedLanguage = 'en' | 'tr';

// Microsoft Translator API ayarları
const MS_TRANSLATOR_API_KEY = process.env.MS_TRANSLATOR_API_KEY;
const MS_TRANSLATOR_REGION = process.env.MS_TRANSLATOR_REGION || 'germanywestcentral';

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
      // Azure SDK ile çeviri istemcisi oluştur
      const credential = {
        key: MS_TRANSLATOR_API_KEY,
        region: MS_TRANSLATOR_REGION
      };
      
      const client = createClient(credential);
      
      // Çeviri işlemini gerçekleştir
      const translateResponse = await client.path("/translate").post({
        body: [{ text }],
        queryParameters: {
          from: from,
          to: [to]
        }
      });
      
      if (translateResponse.status !== "200") {
        throw new Error(`Translation API error: ${translateResponse.status}`);
      }
      
      const responseBody = translateResponse.body;
      
      if (!responseBody || !Array.isArray(responseBody) || responseBody.length === 0) {
        throw new Error("Empty response from Translator API");
      }
      
      // Çeviri sonucunu al
      const translatedText = responseBody[0].translations[0].text;
      const detectedLanguage = responseBody[0].detectedLanguage || { language: from, score: 1 };
      
      // Çeviri sonucunu formatla ve geri dön
      return NextResponse.json({
        translatedText,
        detectedLanguage: {
          language: detectedLanguage.language,
          confidence: detectedLanguage.score * 100
        },
        success: true
      });
    } catch (apiError) {
      console.error("Azure Translator API error:", apiError);
      throw new Error(`Azure Translator API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
    }
  } catch (error) {
    console.error('Translation API error:', error);
    
    // Olası hata durumunda detaylı hata bilgisini döndür
    const errorMessage = error instanceof Error ? error.message : 'Unknown translation error';
    
    return NextResponse.json(
      {
        error: errorMessage,
        success: false
      },
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