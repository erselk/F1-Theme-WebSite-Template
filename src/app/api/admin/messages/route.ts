import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

// Admin API endpoint for getting all contact messages
export async function GET(req: NextRequest) {
  try {
    // Check for admin authentication here
    // This is a simplified version, in a real app you would check admin auth
    
    // Fetch contact messages from database
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      messages
    });
    
  } catch (error: any) {
    console.error("Mesajları getirme hatası:", error);
    
    return NextResponse.json(
      { error: "Mesajlar yüklenirken bir hata oluştu", details: error.message },
      { status: 500 }
    );
  }
} 