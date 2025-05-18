import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('adminToken') : null;
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

export function formatCurrency(amount: number, currency: string = 'TRY', locale: string = 'tr-TR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function serializeMongoData(data: any, cache = new WeakMap()): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (cache.has(data)) {
    return cache.get(data);
  }

  if (Array.isArray(data)) {
    const result = [];
    cache.set(data, result);
    for (let i = 0; i < data.length; i++) {
      result.push(serializeMongoData(data[i], cache));
    }
    return result;
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  const result: Record<string, any> = {};
  cache.set(data, result);

  if (data._id) {
    if (typeof data._id === 'object' && data._id.toString) {
      result._id = data._id.toString();
    } else {
      result._id = data._id;
    }
  }

  if (data.toObject) {
    try {
      const plainObject = data.toObject({ getters: true });
      if (plainObject._id && typeof plainObject._id === 'object') {
        plainObject._id = data._id.toString();
      }
      Object.assign(result, serializeMongoData(plainObject, cache));
      return result;
    } catch (error) {
      try {
        const jsonString = JSON.stringify(data);
        const parsed = JSON.parse(jsonString);
        Object.assign(result, parsed);
        if (data._id && typeof data._id === 'object' && data._id.toString) {
          result._id = data._id.toString();
        }
        return result;
      } catch (jsonError) {
        result._id = data._id ? data._id.toString() : null;
        return result;
      }
    }
  }

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      result[key] = serializeMongoData(data[key], cache);
    }
  }
  return result;
}

export function quickSerializeMongoData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  try {
    const jsonString = JSON.stringify(data);
    const plainObject = JSON.parse(jsonString);

    if (data._id && plainObject._id && typeof plainObject._id === 'object') {
      plainObject._id = data._id.toString();
    }

    return plainObject;
  } catch (error) {
    return {
      ...data,
      _id: data._id ? data._id.toString() : null
    };
  }
}