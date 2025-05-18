import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, details } = body;
    
    if (!slug || !details || !details.orderId) {
      return NextResponse.json(
        { error: 'Missing required data: slug and complete details with orderId are required' },
        { status: 400 }
      );
    }
    
    // Find the event by slug
    const event = await prisma.event.findUnique({
      where: { slug }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if this order already exists to prevent duplicates
    const existingPurchase = await prisma.ticketPurchase.findUnique({
      where: { orderId: details.orderId }
    });

    if (existingPurchase) {
      return NextResponse.json(
        { message: 'Purchase already recorded', id: existingPurchase.id },
        { status: 200 }
      );
    }
    
    // Create a new ticket purchase record
    const ticketPurchase = await prisma.ticketPurchase.create({
      data: {
        orderId: details.orderId,
        eventId: event.id,
        fullName: details.fullName,
        email: details.email,
        phone: details.phone || null,
        amount: parseFloat(details.amount) / 100, // Convert from cents to actual currency
        tickets: details.tickets || [],
        status: 'COMPLETED',
        details: details, // Store the complete details as JSON
        purchaseDate: details.timestamp ? new Date(details.timestamp) : new Date(),
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Ticket purchase recorded successfully',
      purchaseId: ticketPurchase.id
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Bilet satın alma kaydı hatası' },
      { status: 500 }
    );
  }
}