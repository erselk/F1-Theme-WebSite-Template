import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Fetch all events with their related ticket purchases
    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        date: true,
        location: true,
        squareImage: true,
        ticketPurchases: {
          select: {
            id: true,
            orderId: true,
            fullName: true,
            email: true,
            phone: true,
            amount: true,
            tickets: true,
            purchaseDate: true,
            details: true,
          }
        }
      },
      orderBy: {
        date: 'desc', // We'll do additional sorting on the client side
      }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events with purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event purchases' },
      { status: 500 }
    );
  }
}