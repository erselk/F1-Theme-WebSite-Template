import { NextResponse } from 'next/server';
import { testFetchSomeEvents } from '@/services/mongo-service';

export const dynamic = 'force-dynamic'; // Cache'lemeyi engelle

export async function GET() {
  const result = await testFetchSomeEvents();
  if (result.success) {
    return NextResponse.json(result);
  } else {
    // Daha detaylı hata bilgisi için result nesnesinin tamamını döndür
    return NextResponse.json({ 
        message: "Error during testFetchSomeEvents", 
        details: result 
    }, { status: 500 });
  }
} 