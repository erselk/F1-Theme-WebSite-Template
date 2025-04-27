'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export default function BlogsListPage() {
  const router = useRouter();
  const { isDark, language } = useThemeLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Tüm blogları yükle
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blogs');
        const data = await response.json();
        
        if (response.ok && data.blogs) {
          // Blogları tarih sırasına göre sıralıyoruz (en yenisi önce)
          const sortedBlogs = data.blogs.sort((a: BlogPost, b: BlogPost) => 
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
          );
          
          setBlogs(sortedBlogs);
        } else {
          throw new Error(data.error || 'Bloglar yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bloglar yüklenirken bir hata oluştu');
        console.error('Blog yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);

  // Blog silme işlemi
  const deleteBlog = async (slug: string) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      setIsDeleting(slug);
      setDeleteError(null);
      
      const response = await fetch(`/api/blogs/${slug}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Blog silinirken bir hata oluştu');
      }
      
      // Başarılı ise listeden kaldır
      setBlogs(blogs.filter(blog => blog.slug !== slug));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Blog silinirken bir hata oluştu');
      console.error('Blog silme hatası:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Tarih formatını yerelleştir
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  // Kategori adını yerelleştir
  const getCategoryName = (category: string) => {
    const categories = {
      f1: { tr: 'Formula 1', en: 'Formula 1' },
      technology: { tr: 'Teknoloji', en: 'Technology' },
      events: { tr: 'Etkinlikler', en: 'Events' },
      interviews: { tr: 'Röportajlar', en: 'Interviews' },
      other: { tr: 'Diğer', en: 'Other' }
    };
    
    return categories[category as keyof typeof categories]?.[language as 'tr' | 'en'] || category;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-medium-grey">Bloglar yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
        <Link 
          href="/admin/blogs/add" 
          className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
        >
          Yeni Blog Ekle
        </Link>
      </div>
      
      {deleteError && (
        <div className="mb-6 p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            {deleteError}
          </div>
        </div>
      )}
      
      {blogs.length === 0 ? (
        <div className="bg-very-light-grey dark:bg-dark-grey rounded-md p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-medium-grey"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Henüz blog yazısı bulunmuyor</h3>
          <p className="text-medium-grey mb-4">İlk blog yazınızı eklemek için &quot;Yeni Blog Ekle&quot; butonuna tıklayın.</p>
          <Link 
            href="/admin/blogs/add" 
            className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors"
          >
            Yeni Blog Ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Görsel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Tarih
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Yazar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Kategori
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 relative">
                      <Image
                        src={blog.thumbnailImage || blog.coverImage}
                        alt={blog.title[language as 'tr' | 'en']}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      {blog.title[language as 'tr' | 'en']}
                    </div>
                    <div className="text-xs text-medium-grey">{blog.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(blog.publishDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {blog.author.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(blog.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-medium-grey hover:text-dark-grey mr-3"
                      target="_blank"
                    >
                      Görüntüle
                    </Link>
                    <Link
                      href={`/admin/blogs/edit/${blog.slug}`}
                      className="text-electric-blue hover:text-electric-blue-dark mr-3"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => deleteBlog(blog.slug)}
                      disabled={isDeleting === blog.slug}
                      className="text-f1-red hover:text-f1-red-dark disabled:opacity-50"
                    >
                      {isDeleting === blog.slug ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}