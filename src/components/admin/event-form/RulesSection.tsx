'use client';

import { Event } from '@/types';
import { LanguageType } from '@/lib/ThemeLanguageContext';
import { FormErrors } from './types';
import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface RulesSectionProps {
  formData: Partial<Event>;
  formLanguage: LanguageType;
  isDark: boolean;
  validationErrors: FormErrors;
  showValidationErrors: boolean;
  handleRuleChange: (index: number, value: string) => void;
  addRule: () => void;
  removeRule: (index: number) => void;
}

export default function RulesSection({
  formData,
  formLanguage,
  isDark,
  validationErrors,
  showValidationErrors,
  handleRuleChange,
  addRule,
  removeRule
}: RulesSectionProps) {
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
          {formLanguage === 'tr' ? 'Etkinlik Kuralları' : 'Event Rules'}
        </h3>
        
        <button
          type="button"
          onClick={addRule}
          className={`p-1.5 sm:p-2 rounded-md flex items-center text-xs sm:text-sm ${
            isDark
              ? 'bg-electric-blue text-white hover:bg-electric-blue/80'
              : 'bg-race-blue text-white hover:bg-race-blue/80'
          }`}
        >
          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
          <span className="hidden sm:inline">
            {formLanguage === 'tr' ? 'Kural Ekle' : 'Add Rule'}
          </span>
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {Array.isArray(formData.rules) && formData.rules.length > 0 ? (
          formData.rules.map((rule, index) => (
            <div 
              key={index} 
              className={`p-2 sm:p-3 border rounded-md ${
                isDark ? 'border-dark-grey' : 'border-light-grey'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className={`text-xs sm:text-sm font-medium ${isDark ? 'text-white' : 'text-dark-grey'}`}>
                  {formLanguage === 'tr' ? `Kural #${index + 1}` : `Rule #${index + 1}`}
                </h4>
                
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className={`p-1 rounded-md ${
                    isDark ? 'text-silver hover:bg-dark-grey' : 'text-medium-grey hover:bg-very-light-grey'
                  }`}
                  title={formLanguage === 'tr' ? "Bu kuralı sil" : "Delete this rule"}
                >
                  <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
                  {formLanguage === 'tr' ? 'Kural' : 'Rule'}
                </label>
                <textarea
                  rows={2}
                  value={rule.content?.[formLanguage] || ''}
                  onChange={(e) => handleRuleChange(index, e.target.value)}
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md ${
                    isDark
                      ? 'bg-carbon-grey border border-dark-grey text-white'
                      : 'bg-white border border-light-grey text-dark-grey'
                  } ${hasError(`rules[${index}]`) ? 'border-f1-red ring-1 ring-f1-red' : ''}`}
                  placeholder={formLanguage === 'tr' 
                    ? "Etkinlik kuralı ekleyin" 
                    : "Add event rule"}
                ></textarea>
                <ErrorMessage show={hasError(`rules[${index}]`)} />
              </div>
            </div>
          ))
        ) : (
          <div className={`py-3 text-center text-xs sm:text-sm ${isDark ? 'text-silver' : 'text-medium-grey'}`}>
            {formLanguage === 'tr' 
              ? 'Henüz kural eklenmemiş. Eklemek için "Kural Ekle" butonunu kullanın.'
              : 'No rules added yet. Use the "Add Rule" button to add rules.'}
          </div>
        )}
      </div>
    </div>
  );
} 