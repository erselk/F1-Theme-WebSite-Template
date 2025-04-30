'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import EventReservation from '@/models/EventReservation';
import { Event } from '@/types';

/**
 * Updates or creates reservation tracking data for an event
 * This function is intentionally disabled as requested
 * @param event The event data
 */
export async function updateEventReservationTracking(event: Event) {
  // Function intentionally disabled
  console.log('Event reservation tracking has been disabled');
  return { success: true };
}

/**
 * Get all event reservation tracking data
 */
export async function getAllEventReservations() {
  try {
    await connectToDatabase();
    const reservations = await EventReservation.find({}).sort({ date: 1 });
    return { success: true, data: reservations };
  } catch (error) {
    console.error('Error fetching event reservations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get reservation tracking for a specific event
 * @param eventId The ID of the event
 */
export async function getEventReservationById(eventId: string) {
  try {
    await connectToDatabase();
    const reservation = await EventReservation.findOne({ eventId });
    
    if (!reservation) {
      return { success: false, error: 'Event reservation tracking not found' };
    }
    
    return { success: true, data: reservation };
  } catch (error) {
    console.error(`Error fetching reservation for event ${eventId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}