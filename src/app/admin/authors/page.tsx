'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Author } from '@/models/Author';
import { useThemeLanguage } from '@/lib/ThemeLanguageContext';

export default function AuthorsListPage() {
  const router = useRouter();
  const { isDark, language } = useThemeLanguage();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Tüm yazarları yükle
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/authors');
        const data = await response.json();
        
        if (response.ok && data.authors) {
          // Yazarları isme göre sıralıyoruz
          const sortedAuthors = data.authors.sort((a: Author, b: Author) => 
            a.name.localeCompare(b.name)
          );
          
          setAuthors(sortedAuthors);
        } else {
          throw new Error(data.error || 'Yazarlar yüklenirken bir hata oluştu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Yazarlar yüklenirken bir hata oluştu');
        console.error('Yazarları yükleme hatası:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthors();
  }, []);

  // Yazar silme işlemi
  const deleteAuthor = async (id: string) => {
    if (!confirm('Bu yazarı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      setIsDeleting(id);
      setDeleteError(null);
      
      const response = await fetch(`/api/authors/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Yazar silinirken bir hata oluştu');
      }
      
      // Başarılı ise listeden kaldır
      setAuthors(authors.filter(author => author._id !== id));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Yazar silinirken bir hata oluştu');
      console.error('Yazar silme hatası:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  // Tarih formatını yerelleştir
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-electric-blue mb-2"></div>
          <span className="text-medium-grey">Yazarlar yükleniyor...</span>
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
        <h1 className="text-xl md:text-2xl font-bold">Yazarlar Yönetimi</h1>
        <Link 
          href="/admin/authors/add" 
          className="md:text-base px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors md:flex md:items-center md:gap-2 flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden md:inline">Yeni Yazar Ekle</span>
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
      
      {authors.length === 0 ? (
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 className="text-base md:text-lg font-medium mb-2">Henüz yazar bulunmuyor</h3>
          <p className="text-medium-grey text-sm mb-3 md:mb-4">İlk yazarı eklemek için ekleme butonuna tıklayın.</p>
          <Link 
            href="/admin/authors/add" 
            className="text-sm px-3 py-1.5 md:px-4 md:py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1 inline-flex"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Yeni Yazar Ekle</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 md:mx-0 rounded-md">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Profil
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İsim
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Yazılar
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider hidden md:table-cell">
                  Eklenme
                </th>
                <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {authors.map((author) => (
                <tr key={author._id}>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <div className="w-8 h-8 md:w-12 md:h-12 relative overflow-hidden rounded-full border border-gray-200">
                      <Image
                        src={author.profileImage || '/api/files/680e8849803166580a5ca610'}
                        alt={author.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">
                      {author.name}
                    </div>
                    <div className="text-xs text-medium-grey truncate hidden md:block">{author._id}</div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {author.articles?.length || 0} yazı
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm hidden md:table-cell">
                    {formatDate(author.createdAt)}
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                    <div className="flex justify-end space-x-1 md:space-x-3">
                      <Link
                        href={`/admin/authors/edit/${author._id}`}
                        className="text-electric-blue hover:text-blue-600"
                        title="Düzenle"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => deleteAuthor(author._id!)}
                        disabled={isDeleting === author._id}
                        className="text-f1-red hover:text-red-700 disabled:opacity-50"
                        title="Sil"
                      >
                        {isDeleting === author._id ? (
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