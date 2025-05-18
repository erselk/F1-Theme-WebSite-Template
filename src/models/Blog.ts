import mongoose, { Schema } from 'mongoose';
import './Author';

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
    type: Schema.Types.ObjectId,
    ref: 'Author',
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

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;