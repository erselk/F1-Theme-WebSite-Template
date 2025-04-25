import mongoose, { Schema } from 'mongoose';

// Blog şeması
const blogSchema = new Schema({
  id: String,
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  coverImage: String,
  thumbnailImage: String,
  publishDate: String,
  author: {
    name: String,
    avatar: String
  },
  title: {
    tr: String,
    en: String
  },
  excerpt: {
    tr: String,
    en: String
  },
  content: {
    tr: String,
    en: String
  },
  category: {
    type: String,
    enum: ['f1', 'technology', 'events', 'interviews', 'other']
  }
}, {
  timestamps: true
});

// Eğer model zaten tanımlanmışsa, onu kullan, yoksa yeni bir model oluştur
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;