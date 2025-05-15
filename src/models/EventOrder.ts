import mongoose, { Schema } from 'mongoose';

// Ticket item schema for an order
export interface OrderTicket {
  id: string;
  name: {
    tr: string;
    en: string;
  };
  price: number;
  quantity: number;
}

// Event order schema
export interface EventOrder {
  orderId: string;
  eventId: string;
  eventSlug: string;
  eventName: {
    tr: string;
    en: string;
  };
  eventLocation?: {
    tr: string;
    en: string;
  };
  eventSchedule?: {
    tr: string[];
    en: string[];
  };
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  tickets: OrderTicket[];
  totalAmount: number;
  eventDate: Date;
  orderPlacementTime: Date;
}

const eventOrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  eventId: { type: String, required: true, index: true },
  eventSlug: { type: String, required: true, index: true },
  eventName: {
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  eventLocation: {
    tr: { type: String, required: false },
    en: { type: String, required: false }
  },
  eventSchedule: {
    tr: { type: [String], required: false },
    en: { type: [String], required: false }
  },
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false }
  },
  tickets: [{
    id: { type: String, required: true },
    name: {
      tr: { type: String, required: true },
      en: { type: String, required: true }
    },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  eventDate: { type: Date, required: true },
  orderPlacementTime: { type: Date, required: true }
}, {
  timestamps: true
});

// Create the model if it doesn't exist already
const EventOrder = mongoose.models.EventOrder || mongoose.model('EventOrder', eventOrderSchema);

export default EventOrder;