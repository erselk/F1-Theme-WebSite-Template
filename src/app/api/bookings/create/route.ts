import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      refNumber, 
      venue, 
      name, 
      phone, 
      date, 
      startTime, 
      endTime, 
      people, 
      totalPrice, 
      status = 'CONFIRMED' 
    } = body;

    // Validate required fields
    if (!refNumber || !venue || !name || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse date and time strings into DateTime objects
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Get or create user based on phone number (as anonymous user)
    let user = await prisma.user.findFirst({
      where: { 
        email: `${phone.replace(/\D/g, '')}@anonymous.user`
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: `${phone.replace(/\D/g, '')}@anonymous.user`,
          role: 'USER'
        }
      });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        refNumber,
        name,
        email: `${phone.replace(/\D/g, '')}@anonymous.user`,
        phone,
        startTime: startDateTime,
        endTime: endDateTime,
        people: Number(people),
        totalPrice: Number(totalPrice),
        status: status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
        notes: `Venue: ${venue}`,
        userId: user.id,
      }
    });

    // Create a payment record for the booking
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId: user.id,
        amount: Number(totalPrice),
        currency: 'TRY',
        status: 'SUCCEEDED',
        provider: 'iyzico',
        paymentId: `PAY-${Math.random().toString(36).substring(2, 15)}`
      }
    });

    return NextResponse.json({ 
      success: true, 
      booking,
      message: 'Booking created successfully'
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}