import useSWR from 'swr';
import { useEffect } from 'react';

// Fetch işlemleri için kullanılacak fetcher fonksiyonu
const fetcher = async (url: string) => {
  const res = await fetch(url);
  
  // Hata kontrolü
  if (!res.ok) {
    const error = new Error('API isteği başarısız oldu');
    // Durum kodunu ve yanıtı hataya ekle
    (error as any).status = res.status;
    (error as any).info = await res.json();
    throw error;
  }
  
  return res.json();
};

// SWR ile API'dan veri çekmek için kullanılacak hook
export default function useSWRFetch<T = any>(url: string, options?: any) {
  // LocalStorage önbellek anahtarı
  const cacheKey = `swr-cache-${url}`;
  
  // İsteğe bağlı initialData opsiyonu
  const getInitialData = () => {
    if (typeof window === 'undefined') return undefined;
    
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        // Önbellek süresi dolmuş mu kontrol et (5 dakika)
        if (expiry > Date.now()) return data as T;
        localStorage.removeItem(cacheKey); // Süresi dolmuş veriyi temizle
      }
    } catch (e) {
      return null;
    }
    return undefined;
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url, 
    fetcher, 
    {
      revalidateOnFocus: true, // Sayfa odağı değiştiğinde yeniden doğrula
      revalidateOnReconnect: true, // Yeniden bağlandığında doğrula
      // refreshInterval kaldırıldı - sayfa yenilendiğinde veri çekilecek
      shouldRetryOnError: true, // Hata durumunda tekrar dene
      dedupingInterval: 2000, // 2 saniye içinde aynı isteği tekrar etme
      errorRetryCount: 3, // Hata olursa 3 kez dene
      fallbackData: getInitialData(), // Önbellekten başlangıç verisi
      ...options, // Kullanıcı tarafından sağlanan ek seçenekler
    }
  );
  
  // Başarılı veriyi önbelleğe kaydet
  useEffect(() => {
    if (data && !error && typeof window !== 'undefined') {
      try {
        const cacheData = {
          data,
          expiry: Date.now() + 5 * 60 * 1000 // 5 dakika geçerli
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        console.error('Cache save error:', e);
      }
    }
  }, [data, error, cacheKey]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate // Verileri manuel olarak güncellemek için
  };
} 