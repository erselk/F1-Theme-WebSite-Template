import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongo-service';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || '';
    const excludeId = searchParams.get('excludeId') || '';
    const showPastEvents = searchParams.get('showPastEvents') === 'true';
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    // Connect to MongoDB
    const db = await connectToDatabase();
    const eventsCollection = db.collection('events');

    // Build query
    const query: any = {
      category: category,
      _id: { $ne: excludeId }
    };

    // Add date filter if not showing past events
    if (!showPastEvents) {
      query.date = { $gte: new Date().toISOString() };
    }

    // Get similar events
    const similarEvents = await eventsCollection
      .find(query)
      .limit(limit)
      .sort({ date: 1 })
      .toArray();

    // Transform MongoDB _id to id for consistency
    const transformedEvents = similarEvents.map(event => ({
      ...event,
      id: event._id.toString(),
      _id: undefined
    }));

    return NextResponse.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching similar events:', error);
    return NextResponse.json({ error: 'Failed to fetch similar events' }, { status: 500 });
  }
}