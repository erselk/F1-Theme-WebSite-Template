import mongoose, { Schema } from 'mongoose';

// Çift dil desteği olan metin için şema
const localizedTextSchema = {
  tr: String,
  en: String
};

// Bilet tipi için şema
const ticketSchema = new Schema({
  id: String,
  name: localizedTextSchema,
  price: Number,
  description: localizedTextSchema,
  maxPerOrder: Number,
  availableCount: Number,
  maxSalesCount: Number,
  variant: String
}, { _id: false });

// Satın alınan bilet şeması
const soldTicketSchema = new Schema({
  // _id alanını açıkça MongoDB ObjectId olarak tanımlıyoruz
  _id: {
    type: Schema.Types.ObjectId,
    auto: true // MongoDB tarafından otomatik olarak üretilecek
  },
  ticketId: String,
  orderId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  quantity: {
    type: Number,
    default: 1
  },
  price: Number,
  status: {
    type: String,
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed'
  }
}, { 
  timestamps: true 
});

// Event Reservation şeması - admin/reservations/events için
const eventReservationSchema = new Schema({
  eventId: String,
  slug: String,
  date: String, // ISO date string
  title: localizedTextSchema,
  location: localizedTextSchema,
  tickets: {
    type: [ticketSchema],
    default: []
  },
  // Satılan biletlerin detaylı listesi
  soldTickets: {
    type: [soldTicketSchema],
    default: []
  },
  // Rezervasyon istatistikleri
  reservationStats: {
    totalReservations: {
      type: Number,
      default: 0
    },
    totalSold: {
      type: Number,
      default: 0
    },
    soldByTicketType: {
      type: Map,
      of: Number,
      default: new Map()
    },
    revenue: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Eğer model zaten tanımlanmışsa, onu kullan, yoksa yeni bir model oluştur
const EventReservation = mongoose.models.EventReservation || mongoose.model('EventReservation', eventReservationSchema);

export default EventReservation;