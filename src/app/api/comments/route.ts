import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongo-service';

// API endpoint for handling comments
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const commentData = await req.json();
    
    // Validate required fields
    if (!commentData.author || !commentData.email || !commentData.content || !commentData.eventSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate reCAPTCHA (would be implemented here in production)
    const recaptchaValid = commentData.recaptcha || false; // In real app, verify with Google's API
    
    if (!recaptchaValid) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Prepare the comment for insertion
    const comment = {
      author: commentData.author,
      email: commentData.email,
      content: {
        en: commentData.content.en,
        tr: commentData.content.tr
      },
      rating: commentData.rating || 5,
      date: new Date().toISOString(),
      eventSlug: commentData.eventSlug,
      createdAt: new Date()
    };
    
    // Insert into the comments collection
    const result = await db.collection('comments').insertOne(comment);
    
    // Also update the event document to include the comment reference
    await db.collection('events').updateOne(
      { slug: commentData.eventSlug },
      { $push: { commentIds: result.insertedId } }
    );
    
    return NextResponse.json({ 
      success: true,
      commentId: result.insertedId,
      message: "Comment added successfully" 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error adding comment:", error);
    
    return NextResponse.json(
      { error: "Failed to add comment", details: error.message },
      { status: 500 }
    );
  }
}

// API endpoint for fetching comments by event slug
export async function GET(req: NextRequest) {
  try {
    // Get event slug from the request URL
    const { searchParams } = new URL(req.url);
    const eventSlug = searchParams.get('eventSlug');
    
    if (!eventSlug) {
      return NextResponse.json(
        { error: "Event slug is required" },
        { status: 400 }
      );
    }
    
    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Fetch comments for this event
    const comments = await db.collection('comments')
      .find({ eventSlug })
      .sort({ createdAt: -1 }) // Newest first
      .toArray();
    
    return NextResponse.json({ comments }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    
    return NextResponse.json(
      { error: "Failed to fetch comments", details: error.message },
      { status: 500 }
    );
  }
}