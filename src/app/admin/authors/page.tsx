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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Yazarlar Yönetimi</h1>
        <Link 
          href="/admin/authors/add" 
          className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Yeni Yazar Ekle
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
      
      {authors.length === 0 ? (
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
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 className="text-lg font-medium mb-2">Henüz yazar bulunmuyor</h3>
          <p className="text-medium-grey mb-4">İlk yazarı eklemek için &quot;Yeni Yazar Ekle&quot; butonuna tıklayın.</p>
          <Link 
            href="/admin/authors/add" 
            className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Yeni Yazar Ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
            <thead className={`${isDark ? 'bg-dark-grey' : 'bg-very-light-grey'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Profil
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İsim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Yazılar
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-medium-grey uppercase tracking-wider">
                  Eklenme Tarihi
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-medium-grey uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-dark-grey' : 'divide-light-grey'}`}>
              {authors.map((author) => (
                <tr key={author._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 relative overflow-hidden rounded-full border border-gray-200">
                      <Image
                        src={author.profileImage || '/api/files/680e8849803166580a5ca610'}
                        alt={author.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">
                      {author.name}
                    </div>
                    <div className="text-xs text-medium-grey">{author._id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {author.articles?.length || 0} yazı
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(author.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/authors/edit/${author._id}`}
                      className="text-electric-blue hover:text-blue-600 mr-3"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => deleteAuthor(author._id!)}
                      disabled={isDeleting === author._id}
                      className="text-f1-red hover:text-red-700 disabled:opacity-50"
                    >
                      {isDeleting === author._id ? 'Siliniyor...' : 'Sil'}
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