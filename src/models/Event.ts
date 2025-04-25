import mongoose, { Schema } from 'mongoose';

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
  price: Number,
  isFeatured: Boolean,
  date: String, // ISO date string
  location: {
    tr: String,
    en: String
  },
  title: {
    tr: String,
    en: String
  },
  description: {
    tr: String,
    en: String
  },
  category: {
    type: String,
    enum: ['workshop', 'meetup', 'conference', 'race', 'other']
  }
}, {
  timestamps: true
});

// Eğer model zaten tanımlanmışsa, onu kullan, yoksa yeni bir model oluştur
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;