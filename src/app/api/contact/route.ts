import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// API endpoint for handling contact form submission
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const contactData = await req.json();
    
    // Validate required fields
    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
      return NextResponse.json(
        { error: "Tüm alanların doldurulması gerekiyor" },
        { status: 400 }
      );
    }
    
    console.log("Form verileri alındı:", contactData);
    
    // Veritabanına mesajı kaydet
    try {
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
        }
      });
      
      console.log("Mesaj başarıyla kaydedildi:", contactMessage);
      
      // Return success response
      return NextResponse.json({ 
        success: true,
        message: "Mesajınız başarıyla gönderildi",
        contactId: contactMessage.id
      }, { status: 200 });
      
    } catch (dbError: any) {
      console.error("Veritabanı kayıt hatası:", dbError);
      
      return NextResponse.json(
        { error: "Mesaj veritabanına kaydedilirken hata oluştu", details: dbError.message },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("İletişim formu kaydetme hatası:", error);
    
    return NextResponse.json(
      { error: "Mesaj işlenirken bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
} 