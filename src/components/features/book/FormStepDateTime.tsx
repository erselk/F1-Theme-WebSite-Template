'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DatePicker from "@/lib/datepicker/dist";
import AnalogueTimePicker24h from './AnalogueTimePicker24h';

interface TimeValue { hours: number; minutes: number; }

interface FormStepDateTimeProps {
  selectedDate: Date;
  onDateChange: (date: Date | null) => void;
  timeRange: [string, string] | null;
  analoguePickerKey: string;
  defaultAnalogueStartTime: TimeValue;
  defaultAnalogueEndTime: TimeValue;
  onAnalogueTimeChange: (data: { startTime: TimeValue; endTime: TimeValue; currentType: 'start' | 'end' }) => void;
  formData: { startHour: string; startMinute: string; endHour: string; endMinute: string; };
  onDropdownTimeChange: (field: string, value: string) => void;
  generateHourOptions: (isStartTime: boolean) => string[];
  generateMinuteOptions: (isStartTime: boolean, selectedHour: string) => string[];
  minuteOptions: string[];
  language: 'tr' | 'en';
  showPrice: boolean;
  price: number;
  dateTimeError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitDisabled: boolean;
  translations: {
    whenComing: string;
    startTime: string;
    endTime: string;
    totalPrice: string;
    confirm: string;
    minuteLabel?: string; // Opsiyonel dakika etiketi için
  };
}

const FormStepDateTime: React.FC<FormStepDateTimeProps> = ({
  selectedDate,
  onDateChange,
  timeRange,
  analoguePickerKey,
  defaultAnalogueStartTime,
  defaultAnalogueEndTime,
  onAnalogueTimeChange,
  formData,
  onDropdownTimeChange,
  generateHourOptions,
  generateMinuteOptions,
  minuteOptions,
  language,
  showPrice,
  price,
  dateTimeError,
  onSubmit,
  isSubmitDisabled,
  translations,
}) => {
  return (
    <motion.div 
      className="space-y-6 transition-all duration-300 flex flex-col items-center justify-center w-full mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="stepDateTime"
    >
      <h3 className="text-base sm:text-2xl font-semibold mb-3 sm:mb-5 text-center">
        {translations.whenComing}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 w-full items-start px-1 sm:px-0">
        <div className="w-full sm:w-auto mx-auto flex justify-center">
          <DatePicker
            selected={selectedDate}
            onChange={onDateChange}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            inline
            calendarClassName="border border-border dark:border-border-dark rounded-lg p-1 bg-background dark:bg-background-dark shadow-md w-fit text-xs sm:text-sm"
            dayClassName={() => "text-center hover:bg-primary/10 p-1 sm:p-1.5"}
            monthClassName={() => "font-medium text-center text-sm sm:text-base"}
            wrapperClassName="w-full max-w-[280px] sm:max-w-[260px] mx-auto"
            locale={language}
          />
        </div>
        
        <div className="w-fit flex-col items-center hidden lg:flex mx-auto">
          <AnalogueTimePicker24h
            key={analoguePickerKey}
            defaultStartTime={defaultAnalogueStartTime}
            defaultEndTime={defaultAnalogueEndTime}
            selectedDate={selectedDate}
            language={language}
            showPrice={showPrice && price > 0}
            price={price}
            onTimeChange={onAnalogueTimeChange}
          />
        </div>

        <div className="w-full lg:hidden p-2 bg-background rounded-md border border-border">
          <div className="w-full grid grid-cols-2 gap-2 text-xs">
            <div>
              <label htmlFor="startHourMobile" className="block text-[10px] font-medium text-muted-foreground mb-0.5">{translations.startTime}</label>
              <select 
                id="startHourMobile" 
                name="startHour"
                value={formData.startHour}
                onChange={(e) => onDropdownTimeChange('startHour', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-xs focus:ring-primary focus:border-primary"
              >
                {generateHourOptions(true).map(hour => <option key={`sh-${hour}`} value={hour}>{hour}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="startMinuteMobile" className="block text-[10px] font-medium text-muted-foreground mb-0.5">{translations.minuteLabel || 'Dakika'}</label>
              <select 
                id="startMinuteMobile" 
                name="startMinute"
                value={formData.startMinute}
                onChange={(e) => onDropdownTimeChange('startMinute', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-xs focus:ring-primary focus:border-primary"
              >
                {generateMinuteOptions(true, formData.startHour).map(minute => <option key={`sm-${minute}`} value={minute}>{minute}</option>)}
              </select>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-2 mt-2 text-xs">
            <div>
              <label htmlFor="endHourMobile" className="block text-[10px] font-medium text-muted-foreground mb-0.5">{translations.endTime}</label>
              <select 
                id="endHourMobile" 
                name="endHour"
                value={formData.endHour}
                onChange={(e) => onDropdownTimeChange('endHour', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-xs focus:ring-primary focus:border-primary"
              >
                {generateHourOptions(false).map(hour => <option key={`eh-${hour}`} value={hour}>{hour}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="endMinuteMobile" className="block text-[10px] font-medium text-muted-foreground mb-0.5">{translations.minuteLabel || 'Dakika'}</label>
              <select 
                id="endMinuteMobile" 
                name="endMinute"
                value={formData.endMinute}
                onChange={(e) => onDropdownTimeChange('endMinute', e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background text-xs focus:ring-primary focus:border-primary"
              >
                {generateMinuteOptions(false, formData.endHour).map(minute => <option key={`em-${minute}`} value={minute}>{minute}</option>)}
              </select>
            </div>
          </div>
            {showPrice && price > 0 && (
            <div className="pt-2 text-xs text-center">
              <span className="font-medium">{translations.totalPrice}: </span>
              <span className="font-bold text-primary">{price} TL</span>
            </div>
          )}
        </div>
      </div>

      {dateTimeError && (
        <div className="text-center pt-2 text-sm text-red-500 dark:text-red-400">
          {dateTimeError}
        </div>
      )}

      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitDisabled}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {translations.confirm}
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(FormStepDateTime); 