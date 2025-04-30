'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import Blog from '@/models/Blog';
import Booking from '@/models/Booking';
import EventOrder from '@/models/EventOrder';
import EventReservation from '@/models/EventReservation';

/**
 * Get admin dashboard statistics
 * Returns counts for events, blogs, reservations and orders
 */
export async function getDashboardStats() {
  try {
    await connectToDatabase();
    
    // Count total events
    const totalEvents = await Event.countDocuments({});
    
    // Count total blogs
    const totalBlogs = await Blog.countDocuments({});
    
    // Count total venue bookings
    const totalBookings = await Booking.countDocuments({});
    
    // Count total event tickets
    const totalEventOrders = await EventOrder.countDocuments({});
    
    // Get total people from bookings and event orders
    const bookings = await Booking.find({});
    const bookingPeople = bookings.reduce((sum, booking) => {
      const people = typeof booking.people === 'number' ? booking.people : 0;
      return sum + people;
    }, 0);
    
    const eventOrders = await EventOrder.find({});
    const ticketsPeople = eventOrders.reduce((sum, order) => {
      const tickets = typeof order.tickets === 'number' ? order.tickets : 0;
      return sum + tickets;
    }, 0);
    
    // Calculate total reservations (bookings + event tickets)
    const totalReservations = totalBookings + totalEventOrders;
    
    // Calculate total people
    const totalPeople = bookingPeople + ticketsPeople;
    
    return { 
      success: true, 
      data: {
        totalEvents,
        totalBlogs,
        totalBookings,
        totalEventOrders,
        totalReservations,
        totalPeople
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'İstatistikler alınırken bir hata oluştu'
    };
  }
}

/**
 * Get today's events and ticket statistics
 */
export async function getTodayEvents() {
  try {
    await connectToDatabase();
    
    // Get today's date range (start of day to end of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all events happening today
    const events = await Event.find({
      date: { $gte: today, $lt: tomorrow }
    }).sort({ date: 1 });
    
    // Get total tickets sold for each event today
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const eventId = event._id.toString();
      const eventOrders = await EventOrder.find({ eventId });
      
      const totalTickets = eventOrders.reduce((sum, order) => {
        const tickets = typeof order.tickets === 'number' ? order.tickets : 0;
        return sum + tickets;
      }, 0);
      
      const totalRevenue = eventOrders.reduce((sum, order) => {
        const amount = typeof order.amount === 'number' ? order.amount : 0;
        return sum + amount;
      }, 0);
      
      return {
        ...event.toObject(),
        totalTickets,
        totalRevenue
      };
    }));
    
    return { success: true, data: eventsWithStats };
  } catch (error) {
    console.error('Error fetching today events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bugünkü etkinlikler alınırken bir hata oluştu'
    };
  }
}

/**
 * Get today's venue bookings
 */
export async function getTodayBookings() {
  try {
    await connectToDatabase();
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Find all bookings for today
    const bookings = await Booking.find({
      startTime: { $gte: today, $lt: tomorrow }
    }).sort({ startTime: 1 });
    
    // Normalize booking data
    const normalizedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      return {
        ...bookingObj,
        refNumber: bookingObj.refNumber || 'unknown',
        name: bookingObj.name || 'Bilinmeyen Müşteri',
        email: bookingObj.email || '',
        phone: bookingObj.phone || '',
        venue: bookingObj.venue || 'Bilinmeyen Alan',
        people: typeof bookingObj.people === 'number' ? bookingObj.people : 1,
        totalPrice: typeof bookingObj.totalPrice === 'number' ? bookingObj.totalPrice : 0
      };
    });
    
    return { success: true, data: normalizedBookings };
  } catch (error) {
    console.error('Error fetching today bookings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bugünkü rezervasyonlar alınırken bir hata oluştu'
    };
  }
}

/**
 * Get all gallery images from the database
 */
export async function getAllGalleryImages() {
  try {
    await connectToDatabase();
    
    // Assuming images are stored in a collection or as part of another model
    // This implementation might need adaptation based on how images are stored
    const images = await connectToDatabase().collection('images').find({}).toArray();
    
    return { success: true, data: images };
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Galeri resimleri alınırken bir hata oluştu'
    };
  }
}