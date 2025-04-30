import { connectToDatabase } from '@/lib/db/mongodb';
import EventReservation from '@/models/EventReservation';

interface PurchaseData {
  eventId: string;
  eventSlug: string;
  orderId: string;
  fullName: string;
  email: string;
  phone?: string;
  tickets: {
    id: string;
    name: { tr: string; en: string };
    price: number;
    quantity: number;
  }[];
  amount: number;
  timestamp: number;
}

export async function saveTicketPurchase(purchaseData: PurchaseData): Promise<boolean> {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Calculate the total quantity and amount
    const totalQuantity = purchaseData.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const totalAmount = purchaseData.amount;

    // Find the event reservation or create it if it doesn't exist
    let eventReservation = await EventReservation.findOne({ slug: purchaseData.eventSlug });

    if (!eventReservation) {
      // Create a new event reservation document
      eventReservation = new EventReservation({
        eventId: purchaseData.eventId,
        slug: purchaseData.eventSlug,
        date: new Date().toISOString(), // Default to current date
        title: {
          tr: 'Etkinlik',
          en: 'Event'
        },
        location: {
          tr: '',
          en: ''
        },
        tickets: purchaseData.tickets,
        soldTickets: [],
        reservationStats: {
          totalReservations: 0,
          totalSold: 0,
          soldByTicketType: {},
          revenue: 0
        }
      });

      // Try to get event details from the database later
      // For now, just use basic information from the purchase data
    }

    // Update the ticket sales information
    const ticketSales = purchaseData.tickets.map(ticket => {
      // Create individual ticket sale records without custom _id
      return {
        // _id alanını kaldırıyoruz, MongoDB otomatik oluşturacak
        ticketId: ticket.id,
        orderId: purchaseData.orderId,
        customerName: purchaseData.fullName,
        customerEmail: purchaseData.email,
        customerPhone: purchaseData.phone,
        purchaseDate: new Date(purchaseData.timestamp),
        quantity: ticket.quantity,
        price: ticket.price,
        status: 'completed'
      };
    });

    // Add the new ticket sales to the soldTickets array
    if (!eventReservation.soldTickets) {
      eventReservation.soldTickets = [];
    }
    eventReservation.soldTickets.push(...ticketSales);

    // Update the reservation stats
    if (!eventReservation.reservationStats) {
      eventReservation.reservationStats = {
        totalReservations: 0,
        totalSold: 0,
        soldByTicketType: {},
        revenue: 0
      };
    }

    // Increment total reservations
    eventReservation.reservationStats.totalReservations += 1;
    
    // Increment total sold tickets
    eventReservation.reservationStats.totalSold += totalQuantity;
    
    // Increment revenue
    eventReservation.reservationStats.revenue += totalAmount;
    
    // Update sold by ticket type
    if (!eventReservation.reservationStats.soldByTicketType) {
      eventReservation.reservationStats.soldByTicketType = {};
    }

    purchaseData.tickets.forEach(ticket => {
      const ticketId = ticket.id;
      const currentCount = eventReservation.reservationStats.soldByTicketType[ticketId] || 0;
      eventReservation.reservationStats.soldByTicketType[ticketId] = currentCount + ticket.quantity;
    });

    // Save the updated event reservation
    await eventReservation.save();

    return true;
  } catch (error) {
    console.error('Error saving ticket purchase:', error);
    return false;
  }
}