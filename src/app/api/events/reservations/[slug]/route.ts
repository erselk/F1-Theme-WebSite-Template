import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import EventReservation from '@/models/EventReservation';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Extract the event slug from the route parameters
    const { slug } = params;
    
    // Validate the slug
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Event slug is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find the event reservation by slug
    const eventReservation = await EventReservation.findOne({ slug });
    
    // If no event reservation is found, return 404
    if (!eventReservation) {
      return NextResponse.json(
        { success: false, error: 'Event reservation not found' },
        { status: 404 }
      );
    }
    
    // Return the event reservation data
    return NextResponse.json({
      success: true,
      data: eventReservation
    });
  } catch (error) {
    console.error('Error retrieving event reservation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve event reservation' },
      { status: 500 }
    );
  }
}