import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  refNumber: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  phone: String,
  venue: {
    tr: String,
    en: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  people: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'CONFIRMED'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  notes: String,
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;