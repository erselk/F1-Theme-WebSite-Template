import { connectToDatabase } from './mongodb';
import Blog from '@/models/Blog';
import Event from '@/models/Event';

// Verileri içeren JSON dosyalarını okumak için örnek veri setleri
import blogs from '@/data/blogs-data.json';
import events from '@/data/events-data.json';

/**
 * MongoDB'ye örnek verileri yükler
 */
export async function seedDatabase() {
  try {
    // Veritabanına bağlan
    await connectToDatabase();
    console.log('Veritabanı bağlantısı başarılı.');

    // Blog verilerini yükle
    const blogCount = await Blog.countDocuments();
    
    if (blogCount === 0) {
      // Eğer blog_data.json yoksa gerçek verilerimizi kullan
      const blogData = Array.isArray(blogs) ? blogs : [];
      
      if (blogData.length === 0) {
        console.log('Blog verileri bulunamadı. Örnek veriler oluşturuluyor.');
        // Eğer gerçek veri yoksa, örnek veri oluştur
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
        console.log('1 örnek blog başarıyla eklendi.');
      } else {
        await Blog.insertMany(blogData);
        console.log(`${blogData.length} blog başarıyla eklendi.`);
      }
    } else {
      console.log('Blog verileri zaten mevcut, atlıyorum.');
    }

    // Event verilerini yükle
    const eventCount = await Event.countDocuments();
    
    if (eventCount === 0) {
      // Eğer events_data.json yoksa gerçek verilerimizi kullan
      const eventData = Array.isArray(events) ? events : [];
      
      if (eventData.length === 0) {
        console.log('Etkinlik verileri bulunamadı. Örnek veriler oluşturuluyor.');
        // Eğer gerçek veri yoksa, örnek veri oluştur
        const exampleEvent = {
          id: "example1",
          slug: "example-event",
          bannerImage: "/images/suan.jpg",
          squareImage: "/images/suan.jpg", 
          price: 500,
          isFeatured: true,
          date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Bir hafta sonra
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
        console.log('1 örnek etkinlik başarıyla eklendi.');
      } else {
        await Event.insertMany(eventData);
        console.log(`${eventData.length} etkinlik başarıyla eklendi.`);
      }
    } else {
      console.log('Etkinlik verileri zaten mevcut, atlıyorum.');
    }

    console.log('Veri tabanı hazırlığı başarıyla tamamlandı!');
    return { success: true };
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    return { success: false, error };
  }
}