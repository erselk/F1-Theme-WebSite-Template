'use client';

import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TicketsSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  handleTicketChange: (index: number, field: string, value: string | number | boolean) => void;
  increaseTicketPrice: (index: number) => void;
  decreaseTicketPrice: (index: number) => void;
  addTicket: () => void;
  removeTicket: (index: number) => void;
}

export default function TicketsSection({
  formData,
  formLanguage,
  isDark,
  validationErrors,
  showValidationErrors,
  handleTicketChange,
  increaseTicketPrice,
  decreaseTicketPrice,
  addTicket,
  removeTicket
}: TicketsSectionProps) {
  const hasError = (fieldName: string) => {
    return showValidationErrors && validationErrors[fieldName];
  };

  const ErrorMessage = ({ show }: { show: boolean }) => (
    show ? <p className="mt-1 text-xs text-f1-red">{formLanguage === 'tr' ? 'Bu alan zorunludur' : 'This field is required'}</p> : null
  );

  return (
    <div className={`p-2 sm:p-4 border rounded-md mb-2 sm:mb-4 ${
      isDark ? 'border-carbon-grey bg-dark-grey bg-opacity-50' : 'border-light-grey bg-very-light-grey bg-opacity-50'
    }`}>
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className={`text-sm sm:text-lg font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
          {formLanguage === 'tr' ? 'Bilet Tipleri' : 'Ticket Types'}
        </h3>
        
        <button
          type="button"
          onClick={addTicket}
          className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
            isDark
              ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
              : 'bg-race-blue text-white hover:bg-race-blue/80'
          }`}
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
          <span className="hidden sm:inline">
            {formLanguage === 'tr' ? 'Yeni Bilet Tipi Ekle' : 'Add New Ticket Type'}
          </span>
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {Array.isArray(formData.tickets) && formData.tickets.length > 0 ? (
          formData.tickets.map((ticket, index) => (
            <div 
              key={ticket.id || `ticket-${index}`} 
              className={`p-2 sm:p-3 border rounded-md ${
                isDark ? 'border-dark-grey' : 'border-light-grey'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                  {formLanguage === 'tr' ? `Bilet #${index + 1}` : `Ticket #${index + 1}`}
                </h4>
                
                <button
                  type="button"
                  onClick={() => removeTicket(index)}
                  className={`p-1 rounded-md ${
                    isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                  }`}
                  title={formLanguage === 'tr' ? "Bu bilet tipini sil" : "Delete this ticket type"}
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                {/* Ticket Name */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Bilet Adı *' : 'Ticket Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    data-ticket-index={index}
                    data-field="name"
                    value={ticket.name?.[formLanguage] || ''}
                    onChange={(e) => {
                      handleTicketChange(index, 'name', e.target.value);
                    }}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    } ${hasError(`ticket.${index}.name`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                  />
                  <ErrorMessage show={hasError(`ticket.${index}.name`)} />
                </div>
                
                {/* Ticket Price */}
                <div>
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Fiyat (₺) *' : 'Price (₺) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={ticket.price || 0}
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    } ${hasError(`ticket.${index}.price`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                  />
                  <p className="text-xs mt-1 italic text-green-500">
                    {formLanguage === 'tr' ? '0 seçilirse bilet ücretsiz olacaktır' : 'If 0 is selected, the ticket will be free'}
                  </p>
                </div>
                
                {/* Ticket Description */}
                <div className="md:col-span-1">
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Açıklama' : 'Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={ticket.description?.[formLanguage] || ''}
                    onChange={(e) => {
                      handleTicketChange(index, 'description', e.target.value);
                    }}
                    className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                      isDark
                        ? 'bg-carbon-grey border border-dark-grey text-white'
                        : 'bg-white border border-light-grey text-dark-grey'
                    }`}
                    placeholder={formLanguage === 'tr' 
                      ? "Bilet tipi hakkında açıklama girin" 
                      : "Enter description about this ticket type"}
                  />
                </div>
                
                {/* Ticket Status */}
                <div className="md:col-span-1 flex flex-col justify-end">
                  <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                    {formLanguage === 'tr' ? 'Durum' : 'Status'}
                  </label>
                  <div className="flex flex-col gap-1 sm:gap-2 h-full justify-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`ticket-sold-out-${index}`}
                        checked={ticket.isSoldOut || false}
                        onChange={(e) => handleTicketChange(index, 'isSoldOut', e.target.checked)}
                        className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`ticket-sold-out-${index}`}
                        className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                      >
                        {formLanguage === 'tr' ? 'Tükendi' : 'Sold Out'}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`ticket-coming-soon-${index}`}
                        checked={ticket.isComingSoon || false}
                        onChange={(e) => handleTicketChange(index, 'isComingSoon', e.target.checked)}
                        className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={`ticket-coming-soon-${index}`}
                        className={`text-xs sm:text-sm font-medium ${isDark ? 'text-silver' : 'text-medium-grey'}`}
                      >
                        {formLanguage === 'tr' ? 'Yakında' : 'Coming Soon'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' 
              ? 'Henüz bilet eklenmemiş. Eklemek için "Yeni Bilet Tipi Ekle" butonunu kullanın.'
              : 'No tickets added yet. Use the "Add New Ticket Type" button to add tickets.'}
          </div>
        )}
      </div>
    </div>
  );
} 