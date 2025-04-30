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