import mongoose, { Schema } from 'mongoose';

const localizedTextSchema = {
  tr: String,
  en: String
};

const ticketSchema = new Schema({
  id: String,
  name: localizedTextSchema,
  price: Number,
  description: localizedTextSchema,
  maxPerOrder: Number,
  availableCount: Number,
  maxSalesCount: Number,
  variant: {
    type: String,
    enum: ['standard', 'premium', 'vip']
  },
  isSoldOut: Boolean,
  isComingSoon: Boolean
}, { _id: false });

const ruleSchema = new Schema({
  id: String,
  content: localizedTextSchema
}, { _id: false });

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
  date: String,
  location: localizedTextSchema,
  title: localizedTextSchema,
  description: localizedTextSchema,
  category: {
    type: String,
    enum: ['workshop', 'meetup', 'conference', 'race', 'party', 'other']
  },
  gallery: [String],
  schedule: {
    type: [{
      time: String,
      title: localizedTextSchema,
      description: localizedTextSchema
    }],
    default: []
  },
  rules: {
    type: [ruleSchema],
    default: []
  },
  tickets: {
    type: [ticketSchema],
    default: []
  }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;