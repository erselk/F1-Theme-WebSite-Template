import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';

export interface MultiLanguageText {
  tr: string;
  en: string;
}

export interface ImageFile {
  id: string;
  filename: string;
  url: string;
  publicPath: string;
  createdAt: string;
  contentType: string;
}

// Benzersiz slug oluşturma fonksiyonu
export const generateSlugFromEnglishTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Alfanumerik olmayan karakterleri kaldır
    .replace(/[\s_-]+/g, '-') // Boşlukları ve alt çizgileri tire ile değiştir
    .replace(/^-+|-+$/g, ''); // Baştaki ve sondaki tireleri kaldır
};

// Function to generate ID in the format ddmmyyxxx
export const generateEventId = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);
  
  // Random number between 001-999 for the last part
  const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  
  return `${day}${month}${year}${randomNum}`;
};

export interface EventFormProps {
  event?: Event;
  onSubmit: (eventData: Partial<Event>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface Rule {
  id: string;
  content: MultiLanguageText;
}

export interface Schedule {
  id: string;
  time: string;
  title: MultiLanguageText;
  description: MultiLanguageText;
}

export interface Ticket {
  id: string;
  name: MultiLanguageText;
  price: number;
  description: MultiLanguageText;
  maxPerOrder?: number;
}

export type FormErrors = { [key: string]: boolean };

export interface UseEventFormReturn {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  setFormLanguage: (lang: LanguageType) => void;
  dateInputValue: string;
  setDateInputValue: React.Dispatch<React.SetStateAction<string>>;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  isEditMode: boolean;
  bannerPreview: string | null;
  squarePreview: string | null;
  galleryPreviews: string[];
  bannerSelectorOpen: boolean;
  setBannerSelectorOpen: (open: boolean) => void;
  squareSelectorOpen: boolean;
  setSquareSelectorOpen: (open: boolean) => void;
  gallerySelectorOpen: boolean;
  setGallerySelectorOpen: (open: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTicketChange: (index: number, field: string, value: string | number | boolean) => void;
  increaseTicketPrice: (index: number) => void;
  decreaseTicketPrice: (index: number) => void;
  addTicket: () => void;
  removeTicket: (index: number) => void;
  handleRuleChange: (index: number, value: string) => void;
  addRule: () => void;
  removeRule: (index: number) => void;
  handleProgramChange: (index: number, field: string, value: string) => void;
  addProgramItem: () => void;
  removeProgramItem: (index: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleBannerImageSelection: (image: ImageFile) => void;
  handleSquareImageSelection: (image: ImageFile) => void;
  handleGalleryImageSelection: (image: ImageFile) => void;
  handleGalleryImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeGalleryImage: (index: number) => void;
  hasError: (fieldName: string) => boolean;
} 