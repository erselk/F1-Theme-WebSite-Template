import { connectToDatabase } from './mongodb';
import Blog from '@/models/Blog';
import Event from '@/models/Event';

import blogs from '@/data/blogs-data.json';
import events from '@/data/events-data.json';

export async function seedDatabase() {
  try {
    await connectToDatabase();
    

    const blogCount = await Blog.countDocuments();
    
    if (blogCount === 0) {
      const blogData = Array.isArray(blogs) ? blogs : [];
      
      if (blogData.length === 0) {
        
        const exampleBlog = {
          id: "example1",
          slug: "example-blog-post",
          coverImage: "/images/about1.jpg",
          thumbnailImage: "/images/about1.jpg",
          publishDate: new Date().toISOString(),
          author: {
            name: "Admin",
            avatar: "/images/avatar.webp"
          },
          title: {
            tr: "Örnek Blog Yazısı",
            en: "Example Blog Post"
          },
          excerpt: {
            tr: "Bu bir örnek blog yazısıdır.",
            en: "This is an example blog post."
          },
          content: {
            tr: "Örnek içerik metni.",
            en: "Example content text."
          },
          category: "other"
        };
        
        await Blog.insertMany([exampleBlog]);
        
      } else {
        await Blog.insertMany(blogData);
        
      }
    } else {
      
    }

    const eventCount = await Event.countDocuments();
    
    if (eventCount === 0) {
      const eventData = Array.isArray(events) ? events : [];
      
      if (eventData.length === 0) {
        
        const exampleEvent = {
          id: "example1",
          slug: "example-event",
          bannerImage: "/images/suan.jpg",
          squareImage: "/images/suan.jpg", 
          price: 500,
          isFeatured: true,
          date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: {
            tr: "İstanbul",
            en: "Istanbul"
          },
          title: {
            tr: "Örnek Etkinlik",
            en: "Example Event"
          },
          description: {
            tr: "Bu bir örnek etkinliktir.",
            en: "This is an example event."
          },
          category: "other"
        };
        
        await Event.insertMany([exampleEvent]);
        
      } else {
        await Event.insertMany(eventData);
        
      }
    } else {
      
    }

    
    return { success: true };
  } catch (error) {
    
    return { success: false, error };
  }
}