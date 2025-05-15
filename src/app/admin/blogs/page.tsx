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
          setError(null); // Başarılı olursa hatayı temizle
        } else {
          let errorMessage = 'Bloglar yüklenirken bilinmeyen bir sunucu hatası oluştu.'; // Varsayılan mesaj
          if (data && data.message) { // API'dan gelen .message alanını önceliklendir
            errorMessage = data.message;
          } else if (data && data.error) {
            if (typeof data.error === 'string') {
              errorMessage = data.error;
            } else if (typeof data.error === 'object' && data.error.message && typeof data.error.message === 'string') {
              errorMessage = data.error.message;
            } else if (typeof data.error === 'object') {
              // Eğer data.error bir nesne ama .message yoksa, nesneyi stringify et (debug için)
              // Production'da daha genel bir mesaj göstermek daha iyi olabilir.
              errorMessage = JSON.stringify(data.error);
            }
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        // err.message zaten string olmalı (new Error ile oluşturulduğu için)
        setError(err instanceof Error ? err.message : 'Bloglar yüklenirken bir ağ hatası oluştu.');
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
        let deleteErrorMessage = 'Blog silinirken bilinmeyen bir sunucu hatası oluştu.';
        if (data && data.message) {
          deleteErrorMessage = data.message;
        } else if (data && data.error) {
          if (typeof data.error === 'string') {
            deleteErrorMessage = data.error;
          } else if (typeof data.error === 'object' && data.error.message && typeof data.error.message === 'string') {
            deleteErrorMessage = data.error.message;
          } else if (typeof data.error === 'object') {
            deleteErrorMessage = JSON.stringify(data.error);
          }
        }
        throw new Error(deleteErrorMessage);
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
    <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Blog Yönetimi</h1>
        <Link 
          href="/admin/blogs/add" 
          className="md:text-base px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors md:flex md:items-center md:gap-2 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden md:inline">Yeni Blog Ekle</span>
        </Link>
      </div>
      
      {deleteError && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md">
          <div className="flex items-center text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 flex-shrink-0"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12" y2="16"></line>
            </svg>
            <span className="truncate">{deleteError}</span>
          </div>
        </div>
      )}
      
      {blogs.length === 0 ? (
        <div className="bg-very-light-grey dark:bg-dark-grey rounded-md p-4 md:p-6 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-3 md:mb-4 text-medium-grey"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
          </svg>
          <h3 className="text-base md:text-lg font-medium mb-2">Henüz blog yazısı bulunmuyor</h3>
          <p className="text-medium-grey text-sm mb-3 md:mb-4">İlk blog yazınızı eklemek için ekleme butonuna tıklayın.</p>
          <Link 
            href="/admin/blogs/add" 
            className="text-sm px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue-dark transition-colors flex items-center gap-1 inline-flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Yeni Blog Ekle</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 md:mx-0 rounded-md">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Görsel
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Başlık
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Tarih
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Yazar
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Kategori
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <div className="w-10 h-10 md:w-16 md:h-16 relative">
                      <Image
                        src={blog.thumbnailImage || blog.coverImage}
                        alt={blog.title[language as 'tr' | 'en']}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-md"
                      />
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">
                      {blog.title[language as 'tr' | 'en']}
                    </div>
                    <div className="text-xs text-medium-grey truncate max-w-[120px]">
                      {blog.slug.length > 20 ? `${blog.slug.substring(0, 20)}...` : blog.slug}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {formatDate(blog.publishDate)}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {blog.author?.name || 'Belirtilmemiş'}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getCategoryName(blog.category)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                    <div className="flex justify-end space-x-1 md:space-x-3">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-medium-grey hover:text-dark-grey"
                        target="_blank"
                        title="Görüntüle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/blogs/edit/${blog.slug}`}
                        className="text-electric-blue hover:text-electric-blue-dark"
                        title="Düzenle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deleteBlog(blog.slug)}
                        disabled={isDeleting === blog.slug}
                        className="text-f1-red hover:text-f1-red-dark disabled:opacity-50"
                        title="Sil"
                      >
                        {isDeleting === blog.slug ? (
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-f1-red border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
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