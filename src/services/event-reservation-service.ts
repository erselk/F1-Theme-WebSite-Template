'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import EventReservation from '@/models/EventReservation';
import { Event } from '@/types';
import { serializeMongoData } from '@/lib/utils';

// Helper function to normalize MongoDB objects
function normalizeReservationData(reservation: any): any {
  if (!reservation) return null;
  
  // Yeni serileştirme fonksiyonunu kullanarak _id ve diğer buffer içeren alanlar düzgün şekilde işlenecek
  return serializeMongoData(reservation);
}

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
    // Normalize the data before returning
    const normalizedReservations = reservations.map(res => normalizeReservationData(res));
    return { success: true, data: normalizedReservations };
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
    
    // Normalize the data before returning
    const normalizedReservation = normalizeReservationData(reservation);
    return { success: true, data: normalizedReservation };
  } catch (error) {
    console.error(`Error fetching reservation for event ${eventId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}