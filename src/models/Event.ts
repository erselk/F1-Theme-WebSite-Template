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
  maxSalesCount: Number, // Maximum number of tickets that can be sold
  variant: {
    type: String,
    enum: ['standard', 'premium', 'vip']
  },
  isSoldOut: Boolean,
  isComingSoon: Boolean
}, { _id: false });

// Kural tipi için şema
const ruleSchema = new Schema({
  id: String,
  content: localizedTextSchema
}, { _id: false });

// Event şeması
const eventSchema = new Schema({
  id: String,
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  bannerImage: String,
  squareImage: String,
  isFeatured: Boolean,
  date: String, // ISO date string
  location: localizedTextSchema,
  title: localizedTextSchema,
  description: localizedTextSchema,
  category: {
    type: String,
    enum: ['workshop', 'meetup', 'conference', 'race', 'party', 'other']
  },
  // Galeri
  gallery: [String],
  // Etkinlik programı
  schedule: {
    type: [{
      time: String,
      title: localizedTextSchema,
      description: localizedTextSchema
    }],
    default: []
  },
  // Kurallar
  rules: {
    type: [ruleSchema],
    default: []
  },
  // Biletler
  tickets: {
    type: [ticketSchema],
    default: []
  }
}, {
  timestamps: true
});

// Eğer model zaten tanımlanmışsa, onu kullan, yoksa yeni bir model oluştur
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;