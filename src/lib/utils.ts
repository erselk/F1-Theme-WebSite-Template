import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
export function serializeMongoData(data: any): any {
  // Null veya undefined değerler için doğrudan dön
  if (data === null || data === undefined) {
    return data;
  }

  // Dizi için elemanları tek tek serileştir
  if (Array.isArray(data)) {
    return data.map(item => serializeMongoData(item));
  }

  // MongoDB dökümanını düz bir JavaScript objesine çevir
  if (typeof data === 'object') {
    // Tarih nesnesi ise ISO string'e çevir
    if (data instanceof Date) {
      return data.toISOString();
    }

    // _id alanını stringe çevir - buffer sorunu için kritik
    if (data._id) {
      // toString yöntemi varsa kullan (ObjectId için)
      if (typeof data._id === 'object' && data._id.toString) {
        data = {
          ...data,
          _id: data._id.toString()
        };
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
        return serializeMongoData(plainObject);
      } catch (error) {
        // toObject başarısız olursa JSON çevrimi dene
        try {
          return JSON.parse(JSON.stringify(data));
        } catch (jsonError) {
          console.error("MongoDB data serialization error:", jsonError);
          return { _id: data._id ? data._id.toString() : null };
        }
      }
    }

    // Tarih veya özel ObjectId olmayan normal objeler için tüm özellikleri serileştir
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeMongoData(data[key]);
      }
    }
    return result;
  }

  // İlkel değerler (string, number, boolean) için doğrudan dön
  return data;
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