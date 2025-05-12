import useSWR from 'swr';

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
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    url, 
    fetcher, 
    {
      revalidateOnFocus: true, // Sayfa odağı değiştiğinde yeniden doğrula
      revalidateOnReconnect: true, // Yeniden bağlandığında doğrula
      refreshInterval: 10000, // 10 saniyede bir yeniden doğrula (otomatik yenileme)
      shouldRetryOnError: true, // Hata durumunda tekrar dene
      dedupingInterval: 2000, // 2 saniye içinde aynı isteği tekrar etme
      errorRetryCount: 3, // Hata olursa 3 kez dene
      ...options, // Kullanıcı tarafından sağlanan ek seçenekler
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate // Verileri manuel olarak güncellemek için
  };
} 