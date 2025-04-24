import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllBookings,
  getBookingByRef,
  getBookingsByUser,
  createSimulatorBooking,
  createEventBooking,
  updateBookingStatus,
  cancelBooking
} from '@/lib/db/bookings';
import { BookingStatus } from '@prisma/client';

// GET bookings with various filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refNumber = searchParams.get('refNumber');
    const userId = searchParams.get('userId');
    
    // Return a specific booking by reference number
    if (refNumber) {
      const booking = await getBookingByRef(refNumber);
      
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      
      return NextResponse.json(booking);
    }
    
    // Return all bookings for a specific user
    if (userId) {
      const bookings = await getBookingsByUser(userId);
      return NextResponse.json(bookings);
    }
    
    // Return all bookings (admin only in production)
    const bookings = await getAllBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' }, 
      { status: 500 }
    );
  }
}

// POST a new booking
export async function POST(req: NextRequest) {
  try {
    const bookingData = await req.json();
    const { bookingType, ...data } = bookingData;
    
    let booking;
    
    // Create either a simulator booking or event booking
    if (bookingType === 'simulator') {
      booking = await createSimulatorBooking(data);
    } else if (bookingType === 'event') {
      booking = await createEventBooking(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid booking type' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' }, 
      { status: 500 }
    );
  }
}

// PUT to update a booking status
export async function PUT(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const { searchParams } = new URL(req.url);
    const refNumber = searchParams.get('refNumber');
    
    if (!refNumber) {
      return NextResponse.json(
        { error: 'Booking reference number is required' }, 
        { status: 400 }
      );
    }
    
    const { status } = await req.json();
    
    if (!status || !Object.values(BookingStatus).includes(status as BookingStatus)) {
      return NextResponse.json(
        { error: 'Valid booking status is required' }, 
        { status: 400 }
      );
    }
    
    const booking = await updateBookingStatus(refNumber, status as BookingStatus);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' }, 
      { status: 500 }
    );
  }
}

// DELETE (cancel) a booking
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refNumber = searchParams.get('refNumber');
    
    if (!refNumber) {
      return NextResponse.json(
        { error: 'Booking reference number is required' }, 
        { status: 400 }
      );
    }
    
    await cancelBooking(refNumber);
    return NextResponse.json(
      { message: 'Booking cancelled successfully' }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' }, 
      { status: 500 }
    );
  }
}