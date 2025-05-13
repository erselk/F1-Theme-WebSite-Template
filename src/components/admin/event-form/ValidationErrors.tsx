'use client';

import { FormErrors } from './types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { useMemo } from 'react';

interface ValidationErrorsProps {
  errors: FormErrors;
  showErrors: boolean;
  formLanguage: LanguageType;
}

export const ErrorMessage = ({ show, formLanguage }: { show: boolean; formLanguage: 'tr' | 'en' }) => (
  show ? (
    <p className="text-f1-red text-sm mt-1">
      {formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}
    </p>
  ) : null
);

// Hata mesajlarını okunaklı formata dönüştüren yardımcı fonksiyon
const getErrorFieldName = (fieldKey: string, formLanguage: LanguageType): string => {
  // Hata alanının temel adını ayıkla (örn: "title", "tickets[0].name" -> "title", "tickets")
  const mainField = fieldKey.includes('[') ? fieldKey.split('[')[0] : fieldKey;
  
  // Hangi dile göre hata mesajını göstereceğiz
  if (formLanguage === 'tr') {
    switch(mainField) {
      case 'title': return 'Başlık';
      case 'description': return 'Açıklama';
      case 'location': return 'Konum';
      case 'date': return 'Tarih';
      case 'tickets': return 'Bilet Bilgileri';
      case 'rules': return 'Etkinlik Kuralları';
      case 'schedule': return 'Etkinlik Programı';
      case 'bannerImage': return 'Banner Görseli';
      case 'squareImage': return 'Kare Görsel';
      case 'gallery': return 'Galeri Görselleri';
      default: return fieldKey;
    }
  } else {
    switch(mainField) {
      case 'title': return 'Title';
      case 'description': return 'Description';
      case 'location': return 'Location';
      case 'date': return 'Date';
      case 'tickets': return 'Ticket Information';
      case 'rules': return 'Event Rules';
      case 'schedule': return 'Event Schedule';
      case 'bannerImage': return 'Banner Image';
      case 'squareImage': return 'Square Image';
      case 'gallery': return 'Gallery Images';
      default: return fieldKey;
    }
  }
};

export default function ValidationErrors({ errors, showErrors, formLanguage }: ValidationErrorsProps) {
  // Hata mesajı için en önemli hata alanlarını belirle
  const missingFields = useMemo(() => {
    if (!showErrors || Object.keys(errors).length === 0) return [];
    
    // Hata alanlarını grupla
    const errorGroups: Record<string, number> = {};
    
    Object.keys(errors).forEach(key => {
      const mainField = key.includes('[') ? key.split('[')[0] : key;
      errorGroups[mainField] = (errorGroups[mainField] || 0) + 1;
    });
    
    // Hata gruplarını insan tarafından okunabilir şekilde dönüştür
    return Object.keys(errorGroups).map(key => ({
      field: getErrorFieldName(key, formLanguage),
      count: errorGroups[key]
    }));
  }, [errors, showErrors, formLanguage]);

  if (!showErrors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-f1-red/10 border border-f1-red text-f1-red rounded-md shadow-md">
      <div className="flex items-start">
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
          className="mr-2 mt-0.5 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12" y2="16"></line>
        </svg>
        
        <div>
          <p className="font-semibold">
            {formLanguage === 'tr' 
              ? `Lütfen tüm zorunlu alanları doldurun (${Object.keys(errors).length} eksik alan)`
              : `Please fill in all required fields (${Object.keys(errors).length} missing fields)`}
          </p>
          
          {missingFields.length > 0 && (
            <ul className="mt-2 pl-5 list-disc text-sm">
              {missingFields.map((item, index) => (
                <li key={index}>
                  {item.field} {item.count > 1 && `(${item.count} ${formLanguage === 'tr' ? 'alan' : 'fields'})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 