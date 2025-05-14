'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ConfirmationFormData {
  venue: string;
  people: string;
  date: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  name: string;
  surname: string;
  phone: string;
}

interface FormStepConfirmationProps {
  formData: ConfirmationFormData;
  getVenueName: (id: string) => string;
  getFormattedDate: (dateString: string) => string;
  getFormattedTime: (hour: string, minute: string) => string;
  showPrice: boolean;
  price: number;
  paymentError: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  venueNeedsPayment: () => boolean;
  translations: {
    confirmReservation: string;
    selectedVenue: string;
    peopleCount: string;
    people: string;
    date: string;
    time: string;
    fullName: string;
    contact: string;
    totalPrice: string;
    proceedToPayment: string;
    completeReservation: string;
    redirectingToPayment: string;
  };
}

const FormStepConfirmation: React.FC<FormStepConfirmationProps> = ({
  formData,
  getVenueName,
  getFormattedDate,
  getFormattedTime,
  showPrice,
  price,
  paymentError,
  isSubmitting,
  onSubmit,
  venueNeedsPayment,
  translations,
}) => {
  return (
    <motion.div 
      className="space-y-4 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="stepConfirmation"
    >
      <h3 className="text-sm sm:text-xl font-semibold mb-4 text-center">
        {translations.confirmReservation}
      </h3>
      
      <div className="space-y-3 bg-background p-5 rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.selectedVenue}:</div>
          <div className="text-sm sm:text-sm font-medium">
            {getVenueName(formData.venue) || 'Seçilmedi'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.peopleCount}:</div>
          <div className="text-sm sm:text-sm font-medium">{formData.people} {translations.people}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.date}:</div>
          <div className="text-sm sm:text-sm font-medium">
            {getFormattedDate(formData.date)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.time}:</div>
          <div className="text-sm sm:text-sm font-medium">
            {getFormattedTime(formData.startHour, formData.startMinute)} - {getFormattedTime(formData.endHour, formData.endMinute)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.fullName}:</div>
          <div className="text-sm sm:text-sm font-medium">{formData.name} {formData.surname}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm sm:text-sm text-muted-foreground">{translations.contact}:</div>
          <div className="text-sm sm:text-sm font-medium">{formData.phone}</div>
        </div>
        
        {showPrice && price > 0 && (
          <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-border">
            <div className="text-sm sm:text-sm font-medium">{translations.totalPrice}:</div>
            <div className="text-sm sm:text-sm font-bold text-primary">{price} TL</div>
          </div>
        )}

        {paymentError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded mt-4">
            <p>{paymentError}</p>
          </div>
        )}
      </div>
      
      {isSubmitting ? (
        <div className="text-center py-8">
          <div>
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <div className="text-muted-foreground">
              {translations.redirectingToPayment}
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onSubmit}
            className="btn-primary"
          >
            {venueNeedsPayment() ? translations.proceedToPayment : translations.completeReservation}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(FormStepConfirmation); 