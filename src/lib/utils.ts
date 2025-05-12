import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Admin API istekleri için kimlik doğrulama başlıklarıyla fetch işlemi yapar
 * @param url İstek yapılacak URL
 * @param options Fetch options
 * @returns Fetch response
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Auth token'ı session'dan al (gerekirse cookie'den vb. alınabilir)
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
  
  // URL'nin tam URL olup olmadığını kontrol et
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  return fetch(fullUrl, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Para birimini belirli bir dile göre formatlar
 * @param amount Formatlanacak miktar
 * @param currency Para birimi kodu (TRY, USD, vb.)
 * @param locale Dil ayarı (tr-TR, en-US, vb.)
 * @returns Formatlanmış para birimi
 */
export function formatCurrency(amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * MongoDB objelerini düz JavaScript nesnelerine çeviren yardımcı fonksiyon
 * Özellikle ObjectId buffer sorunlarını çözer ve Client Components'e aktarılabilir hale getirir
 * @param data MongoDB objesi veya obje dizisi
 * @returns Serileştirilmiş düz JavaScript nesnesi
 */
export function serializeMongoData(data: any, cache = new WeakMap()): any {
  // Null veya undefined değerler için doğrudan dön
  if (data === null || data === undefined) {
    return data;
  }

  // İlkel değerler (string, number, boolean) için doğrudan dön
  if (typeof data !== 'object') {
    return data;
  }
  
  // Döngüsel referans kontrolü - eğer daha önce işlendiyse döndür
  if (cache.has(data)) {
    return cache.get(data);
  }
  
  // Dizi için elemanları tek tek serileştir
  if (Array.isArray(data)) {
    const result = [];
    // Önce boş diziyi cache'e ekle, sonra doldur
    cache.set(data, result);
    
    for (let i = 0; i < data.length; i++) {
      result.push(serializeMongoData(data[i], cache));
    }
    return result;
  }

  // Tarih nesnesi ise ISO string'e çevir
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Sonuç nesnesini oluştur
  const result: Record<string, any> = {};
  // Döngüsel referansları önlemek için sonuç nesnesini hemen cache'e ekle
  cache.set(data, result);
  
  // _id alanını stringe çevir - buffer sorunu için kritik
  if (data._id) {
    // toString yöntemi varsa kullan (ObjectId için)
    if (typeof data._id === 'object' && data._id.toString) {
      result._id = data._id.toString();
    } else {
      result._id = data._id;
    }
  }

  // Mongoose döküman methodları varsa kaldır (toObject, save vs.)
  if (data.toObject) {
    try {
      // toObject Mongoose metodunu kullan
      const plainObject = data.toObject({ getters: true });
      
      // _id alanı buffer içerdiği için özel işlem
      if (plainObject._id && typeof plainObject._id === 'object') {
        plainObject._id = data._id.toString();
      }
      
      // İç içe nesneleri recursive olarak işle
      // plainObject'i döndürmek yerine result nesnesini doldurup onu döndürüyoruz
      Object.assign(result, serializeMongoData(plainObject, cache));
      return result;
    } catch (error) {
      // toObject başarısız olursa daha güvenli bir yöntem dene
      try {
        const jsonString = JSON.stringify(data);
        const parsed = JSON.parse(jsonString);
        Object.assign(result, parsed);
        
        // _id için özel işlem
        if (data._id && typeof data._id === 'object' && data._id.toString) {
          result._id = data._id.toString();
        }
        
        return result;
      } catch (jsonError) {
        console.error("MongoDB data serialization error:", jsonError);
        result._id = data._id ? data._id.toString() : null;
        return result;
      }
    }
  }

  // Tarih veya özel ObjectId olmayan normal objeler için tüm özellikleri serileştir
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = serializeMongoData(data[key], cache);
    }
  }
  
  return result;
}

/**
 * MongoDB verilerini direkt JSON.stringify ve JSON.parse ile düzleştiren alternatif fonksiyon
 * Hızlı çözüm gerektiren durumlar için
 * @param data MongoDB verisi
 * @returns Düz JavaScript nesnesi
 */
export function quickSerializeMongoData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  try {
    // JSON serileştirme/ayrıştırma ile en hızlı dönüşüm
    const jsonString = JSON.stringify(data);
    const plainObject = JSON.parse(jsonString);

    // _id buffer için özel düzeltme
    if (data._id && plainObject._id && typeof plainObject._id === 'object') {
      plainObject._id = data._id.toString();
    }

    return plainObject;
  } catch (error) {
    console.error("Quick serialization error:", error);
    // Hata durumunda _id'yi düzelt
    return { 
      ...data,
      _id: data._id ? data._id.toString() : null 
    };
  }
}