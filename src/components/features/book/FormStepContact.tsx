'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ContactFormData {
  name: string;
  surname: string;
  phone: string;
}

interface FormStepContactProps {
  contactStep: number;
  formData: ContactFormData;
  onFieldChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitSubStep: (e: React.FormEvent) => void;
  isNameValid: () => boolean;
  isPhoneValid: () => boolean;
  translations: {
    contactInfo: string;
    firstName: string;
    lastName: string;
    phone: string;
    confirm: string;
  };
}

const FormStepContact: React.FC<FormStepContactProps> = ({
  contactStep,
  formData,
  onFieldChange,
  onSubmitSubStep,
  isNameValid,
  isPhoneValid,
  translations,
}) => {
  return (
    <motion.div 
      className="space-y-5 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="stepContact"
    >
      <h3 className="text-sm sm:text-2xl font-semibold mb-5 text-center">
        {translations.contactInfo}
      </h3>
      
      {contactStep === 0 && (
        <motion.div 
          key="contactName"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm sm:text-lg font-medium mb-3 text-center">
                {translations.firstName}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onFieldChange}
                className="w-full p-4 rounded border border-border bg-background text-center text-sm sm:text-base"
                placeholder={translations.firstName}
                required
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm sm:text-lg font-medium mb-3 text-center">
                {translations.lastName}
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                value={formData.surname}
                onChange={onFieldChange}
                className="w-full p-4 rounded border border-border bg-background text-center text-sm sm:text-base"
                placeholder={translations.lastName}
                required
              />
            </div>
          </div>
          
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onSubmitSubStep}
              disabled={!isNameValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.confirm}
            </button>
          </div>
        </motion.div>
      )}
      
      {contactStep === 1 && (
        <motion.div 
          key="contactPhone"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="phone" className="block text-sm sm:text-lg font-medium mb-3 text-center">
              {translations.phone}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onFieldChange}
              className="w-full p-4 rounded border border-border bg-background text-center text-sm sm:text-base"
              placeholder="05xx xxx xx xx"
              required
            />
          </div>
          
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={onSubmitSubStep}
              disabled={!isPhoneValid()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.confirm}
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(FormStepContact); 