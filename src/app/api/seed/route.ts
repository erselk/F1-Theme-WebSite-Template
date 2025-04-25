import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';

export async function GET() {
  try {
    const result = await seedDatabase();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Veritabanı başarıyla hazırlandı', 
        success: true 
      });
    } else {
      return NextResponse.json({ 
        message: 'Veritabanı hazırlanırken bir hata oluştu', 
        error: result.error,
        success: false 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      message: 'Bir hata oluştu', 
      error, 
      success: false 
    }, { status: 500 });
  }
}