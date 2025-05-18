import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  profileImage?: string; 
  bio?: string;          
  articles?: string[];
}

const AuthorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: '/images/avatar.webp' 
  },
  bio: {
    type: String,
    trim: true
  },
  articles: [{
    type: String
  }]
}, {
  timestamps: true 
});

export default mongoose.models.Author || mongoose.model<IAuthor>('Author', AuthorSchema);