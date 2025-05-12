'use server';

import { connectToDatabase } from '@/lib/db/mongodb';
import Event from '@/models/Event';
import Blog from '@/models/Blog';
import Booking from '@/models/Booking';
import EventOrder from '@/models/EventOrder';
import EventReservation from '@/models/EventReservation';
import { serializeMongoData } from '@/lib/utils';

/**
 * Get admin dashboard statistics
 * Returns counts for events, blogs, reservations and orders
 */
export const getDashboardStats = async () => {
  try {
    await connectToDatabase();
    
    // Collect stats directly from MongoDB
    const [eventsCount, blogsCount, bookingsCount, eventOrdersCount] = await Promise.all([
      Event.countDocuments(),
      Blog.countDocuments(),
      Booking.countDocuments(),
      EventOrder.countDocuments()
    ]);
    
    // Calculate total revenue
    const bookings = await Booking.find();
    const eventOrders = await EventOrder.find();
    
    const bookingsRevenue = bookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0);
    
    const eventsRevenue = eventOrders.reduce((sum, order) => 
      sum + (order.totalPrice || 0), 0);
    
    // Get recent events
    const recentEvents = await Event.find()
      .sort({ eventDate: -1 })
      .limit(5);
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const stats = {
      totalEvents: eventsCount,
      totalBlogs: blogsCount,
      totalBookings: bookingsCount + eventOrdersCount,
      totalRevenue: bookingsRevenue + eventsRevenue,
      recentEvents: serializeMongoData(recentEvents),
      recentBookings: serializeMongoData(recentBookings)
    };
    
    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get today's events and ticket statistics
 */
export const getTodayEvents = async () => {
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
        const tickets = order.tickets?.reduce((t, ticket) => t + (ticket.quantity || 0), 0) || 0;
        return sum + tickets;
      }, 0);
      
      const totalRevenue = eventOrders.reduce((sum, order) => {
        return sum + (order.totalPrice || 0);
      }, 0);
      
      return {
        ...serializeMongoData(event),
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
};

/**
 * Get today's venue bookings
 */
export const getTodayBookings = async () => {
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
    
    return { success: true, data: serializeMongoData(bookings) };
  } catch (error) {
    console.error('Error fetching today bookings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bugünkü rezervasyonlar alınırken bir hata oluştu'
    };
  }
};

/**
 * Get all gallery images from the database
 */
export const getAllGalleryImages = async () => {
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
};

// Events endpoints
export const getAllEvents = async () => {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ eventDate: -1 });
    return { success: true, data: serializeMongoData(events) };
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return { success: false, error: error.message };
  }
};

export const getEventById = async (id: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findById(id);
    
    if (!event) {
      return { success: false, error: 'Etkinlik bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(event) };
  } catch (error: any) {
    console.error(`Error fetching event with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const createEvent = async (eventData: any) => {
  try {
    await connectToDatabase();
    const event = new Event(eventData);
    await event.save();
    return { success: true, data: serializeMongoData(event) };
  } catch (error: any) {
    console.error('Error creating event:', error);
    return { success: false, error: error.message };
  }
};

export const updateEvent = async (id: string, eventData: any) => {
  try {
    await connectToDatabase();
    const event = await Event.findByIdAndUpdate(
      id, 
      eventData, 
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return { success: false, error: 'Etkinlik bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(event) };
  } catch (error: any) {
    console.error(`Error updating event with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const deleteEvent = async (id: string) => {
  try {
    await connectToDatabase();
    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return { success: false, error: 'Etkinlik bulunamadı' };
    }
    
    return { success: true, data: 'Etkinlik başarıyla silindi' };
  } catch (error: any) {
    console.error(`Error deleting event with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

// Blogs endpoints
export const getAllBlogs = async () => {
  try {
    await connectToDatabase();
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return { success: true, data: serializeMongoData(blogs) };
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return { success: false, error: error.message };
  }
};

export const getBlogById = async (id: string) => {
  try {
    await connectToDatabase();
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return { success: false, error: 'Blog bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(blog) };
  } catch (error: any) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const createBlog = async (blogData: any) => {
  try {
    await connectToDatabase();
    const blog = new Blog(blogData);
    await blog.save();
    return { success: true, data: serializeMongoData(blog) };
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return { success: false, error: error.message };
  }
};

export const updateBlog = async (id: string, blogData: any) => {
  try {
    await connectToDatabase();
    const blog = await Blog.findByIdAndUpdate(
      id, 
      blogData, 
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return { success: false, error: 'Blog bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(blog) };
  } catch (error: any) {
    console.error(`Error updating blog with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const deleteBlog = async (id: string) => {
  try {
    await connectToDatabase();
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return { success: false, error: 'Blog bulunamadı' };
    }
    
    return { success: true, data: 'Blog başarıyla silindi' };
  } catch (error: any) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

// Authors endpoints
export const getAllAuthors = async () => {
  try {
    await connectToDatabase();
    // Yazarlar için bir model oluşturulduğunu varsayalım
    const authors = await connectToDatabase().collection('authors').find().toArray();
    return { success: true, data: serializeMongoData(authors) };
  } catch (error: any) {
    console.error('Error fetching authors:', error);
    return { success: false, error: error.message };
  }
};

export const getAuthorById = async (id: string) => {
  try {
    await connectToDatabase();
    const author = await connectToDatabase().collection('authors').findOne({ _id: id });
    
    if (!author) {
      return { success: false, error: 'Yazar bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(author) };
  } catch (error: any) {
    console.error(`Error fetching author with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const createAuthor = async (authorData: any) => {
  try {
    await connectToDatabase();
    const result = await connectToDatabase().collection('authors').insertOne(authorData);
    const author = await connectToDatabase().collection('authors').findOne({ _id: result.insertedId });
    
    return { success: true, data: serializeMongoData(author) };
  } catch (error: any) {
    console.error('Error creating author:', error);
    return { success: false, error: error.message };
  }
};

export const updateAuthor = async (id: string, authorData: any) => {
  try {
    await connectToDatabase();
    await connectToDatabase().collection('authors').updateOne(
      { _id: id },
      { $set: authorData }
    );
    
    const author = await connectToDatabase().collection('authors').findOne({ _id: id });
    
    if (!author) {
      return { success: false, error: 'Yazar bulunamadı' };
    }
    
    return { success: true, data: serializeMongoData(author) };
  } catch (error: any) {
    console.error(`Error updating author with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};

export const deleteAuthor = async (id: string) => {
  try {
    await connectToDatabase();
    const result = await connectToDatabase().collection('authors').deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      return { success: false, error: 'Yazar bulunamadı' };
    }
    
    return { success: true, data: 'Yazar başarıyla silindi' };
  } catch (error: any) {
    console.error(`Error deleting author with ID ${id}:`, error);
    return { success: false, error: error.message };
  }
};