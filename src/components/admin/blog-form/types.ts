import { BlogPost } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';

// Benzersiz slug oluşturma fonksiyonu
export const generateSlugFromEnglishTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Alfanumerik olmayan karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
};

// Interface for image file data
export interface ImageFile {
  id: string;
  filename: string;
  url: string;
  publicPath: string;
  createdAt: string;
  contentType: string;
}

export interface BlogFormProps {
  blog?: BlogPost;
  onSubmit: (blogData: Partial<BlogPost>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export type FormErrors = { [key: string]: boolean };

export interface Author {
  _id: string;
  name: string;
  profileImage: string;
  articles?: string[]; // Yazarın makalelerinin slug listesi
} 