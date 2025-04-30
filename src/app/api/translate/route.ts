import { NextRequest, NextResponse } from 'next/server';
// Correct import for Azure Translation API client
import { TranslationClient, AzureKeyCredential } from '@azure-rest/ai-translation-text';

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
      // Create client with Azure Key Credential
      const client = new TranslationClient(
        MS_TRANSLATOR_REGION,
        new AzureKeyCredential(MS_TRANSLATOR_API_KEY)
      );
      
      // Perform translation
      const response = await client.translate([text], [to], {
        from: from,
        textType: "plain"
      });
      
      if (!response || !response[0] || !response[0].translations || response[0].translations.length === 0) {
        throw new Error("Empty translations response from API");
      }
      
      // Get translation result
      const translatedText = response[0].translations[0].text || '';
      const detectedLanguage = response[0].detectedLanguage || { language: from, score: 1 };
      
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