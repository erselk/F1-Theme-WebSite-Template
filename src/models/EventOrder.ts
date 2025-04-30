import mongoose, { Schema } from 'mongoose';

// Ticket item schema for an order
export interface OrderTicket {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Event order schema
export interface EventOrder {
  orderId: string;
  eventSlug: string;
  eventName: {
    tr: string;
    en: string;
  };
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  tickets: OrderTicket[];
  totalAmount: number;
  orderDate: Date;
}

const eventOrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  eventSlug: { type: String, required: true, index: true },
  eventName: {
    tr: { type: String, required: true },
    en: { type: String, required: true }
  },
  customerInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false }
  },
  tickets: [{
    id: { type: String, required: true },
    name: { type: Schema.Types.Mixed, required: true }, // Can be string or object with language keys
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

// Create the model if it doesn't exist already
const EventOrder = mongoose.models.EventOrder || mongoose.model('EventOrder', eventOrderSchema);

export default EventOrder;