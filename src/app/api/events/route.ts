import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllEvents, 
  getFeaturedEvents, 
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent
} from '@/lib/db/events';

// GET all events or featured events
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get('featured') === 'true';
    const slug = searchParams.get('slug');
    
    if (slug) {
      const event = await getEventBySlug(slug);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    }
    
    const events = featured ? await getFeaturedEvents() : await getAllEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' }, 
      { status: 500 }
    );
  }
}

// POST a new event
export async function POST(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const eventData = await req.json();
    const event = await createEvent(eventData);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' }, 
      { status: 500 }
    );
  }
}

// PUT to update an event
export async function PUT(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Event slug is required' }, 
        { status: 400 }
      );
    }
    
    const eventData = await req.json();
    const event = await updateEvent(slug, eventData);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' }, 
      { status: 500 }
    );
  }
}

// DELETE an event
export async function DELETE(req: NextRequest) {
  try {
    // In production, you should add authentication here
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Event slug is required' }, 
        { status: 400 }
      );
    }
    
    await deleteEvent(slug);
    return NextResponse.json(
      { message: 'Event deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' }, 
      { status: 500 }
    );
  }
}