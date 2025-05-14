'use client';

import React from "react";
import { format, addHours, isBefore, isToday, parseISO, getDay } from 'date-fns';
import DatePicker, { registerLocale } from "@/lib/datepicker/dist";
import "@/lib/datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { tr, enUS } from 'date-fns/locale';
import CallPromptModal from './CallPromptModal';
import FormStepIndicator from './FormStepIndicator';
import FormStepVenue from './FormStepVenue';
import FormStepPeople from './FormStepPeople';
import FormStepDateTime from './FormStepDateTime';
import FormStepContact from './FormStepContact';
import FormStepConfirmation from './FormStepConfirmation';
import { 
  getFormattedTimeString,
  getVenueName as getVenueNameHelper,
  getFormattedDate as getFormattedDateHelper,
  venueNeedsPayment as venueNeedsPaymentHelper,
  isDateTimeValid as isDateTimeValidHelper,
  isNameValid as isNameValidHelper,
  isPhoneValid as isPhoneValidHelper,
  generateHourOptions as generateHourOptionsHelper,
  generateMinuteOptions as generateMinuteOptionsHelper,
  minuteOptions as minuteOptionsHelper
} from './reservationForm.helpers';
import { OPENING_HOURS, styleOverrides } from './reservationForm.config';
import { useReservationFormLogic, VenueOption } from './useReservationFormLogic';

// Register locales for date picker
registerLocale('tr', tr);
registerLocale('en', enUS);

// Font imports
import "@fontsource/titillium-web/600.css";
import "@fontsource/inter/400.css";
import "@fontsource/barlow-condensed/500.css";

interface ReservationFormProps {
  selectedVenue: string | null;
  venueOptions: VenueOption[];
  onSubmit: () => void;
}

export default function ReservationForm({
  selectedVenue: initialSelectedVenue,
  venueOptions,
  onSubmit: onFormSubmit,
}: ReservationFormProps) {

  const {
    currentStep,
    price,
    showPrice,
    isSubmitting,
    showPaymentRedirect,
    showCallPrompt,
    setShowCallPrompt,
    contactStep,
    selectedDate,
    timeRange,
    dateTimeError,
    paymentError,
    formData,
    language,
    isDark,
    t,
    checkmarkVariants,
    currentOpeningHourForSelectedDate,
    peopleOptions,
    currentSteps,
    handleChange,
    handlePeopleSelect,
    handleVenueSelect,
    goToStep,
    nextStep,
    handleDateTimeSubmit,
    handleContactFieldSubmit,
    makeCall,
    handleSubmit,
    handleDateChange,
    handleAnalogueTimeChange,
    handleDropdownTimeChange,
  } = useReservationFormLogic({
    initialSelectedVenue,
    venueOptions,
    onFormSubmitProp: onFormSubmit,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <style jsx global>{styleOverrides}</style>
      
      <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
        {t.reservation}
      </h2>
      
      <FormStepIndicator 
        steps={currentSteps}
        currentStep={currentStep} 
        onGoToStep={goToStep} 
      />
      
      <div className="bg-card p-3 sm:p-6 rounded-lg border border-border shadow-md">
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <FormStepVenue 
              venueOptions={venueOptions}
              selectedVenueId={formData.venue}
              onVenueSelect={handleVenueSelect}
              translations={{
                whichVenue: t.whichVenue
              }}
            />
          )}

          {currentStep === 1 && (
            showCallPrompt ? (
              null
            ) : (
              <FormStepPeople 
                peopleOptions={peopleOptions}
                onPeopleSelect={handlePeopleSelect}
                translations={{
                  howManyPeople: t.howManyPeople
                }}
              />
            )
          )}

          {currentStep === 2 && (
            <FormStepDateTime
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              timeRange={timeRange}
              analoguePickerKey={selectedDate.toISOString()} 
              defaultAnalogueStartTime={{
                hours: timeRange ? parseInt(timeRange[0].split(':')[0]) : currentOpeningHourForSelectedDate,
                minutes: timeRange ? parseInt(timeRange[0].split(':')[1]) : 0
              }}
              defaultAnalogueEndTime={{
                hours: timeRange ? parseInt(timeRange[1].split(':')[0]) : currentOpeningHourForSelectedDate + 1,
                minutes: timeRange ? parseInt(timeRange[1].split(':')[1]) : 0
              }}
              onAnalogueTimeChange={handleAnalogueTimeChange}
              formData={{
                startHour: formData.startHour,
                startMinute: formData.startMinute,
                endHour: formData.endHour,
                endMinute: formData.endMinute,
              }}
              onDropdownTimeChange={handleDropdownTimeChange} 
              generateHourOptions={(isStart) => generateHourOptionsHelper(selectedDate, isStart, formData.startHour, formData.startMinute)}
              generateMinuteOptions={(isStart, selHour) => generateMinuteOptionsHelper(selectedDate, selHour, isStart, formData.startHour, formData.startMinute)}
              minuteOptions={minuteOptionsHelper}
              language={language as 'tr' | 'en'}
              showPrice={showPrice}
              price={price}
              dateTimeError={dateTimeError}
              onSubmit={handleDateTimeSubmit} 
              isSubmitDisabled={!isDateTimeValidHelper(formData.date, timeRange)}
              translations={{
                whenComing: t.whenComing,
                startTime: t.startTime,
                endTime: t.endTime,
                totalPrice: t.totalPrice,
                confirm: t.confirm,
                minuteLabel: t.minuteLabel
              }}
            />
          )}

          {currentStep === 3 && (
            <FormStepContact 
              contactStep={contactStep}
              formData={{
                name: formData.name,
                surname: formData.surname,
                phone: formData.phone
              }}
              onFieldChange={handleChange} 
              onSubmitSubStep={handleContactFieldSubmit} 
              isNameValid={() => isNameValidHelper(formData.name, formData.surname)}
              isPhoneValid={() => isPhoneValidHelper(formData.phone)}
              translations={{
                contactInfo: t.contactInfo,
                firstName: t.firstName,
                lastName: t.lastName,
                phone: t.phone,
                confirm: t.confirm
              }}
            />
          )}

          {currentStep === 4 && (
            <FormStepConfirmation 
              formData={formData} 
              getVenueName={(id) => getVenueNameHelper(id, venueOptions)}
              getFormattedDate={(dateStr) => getFormattedDateHelper(dateStr, language)}
              getFormattedTime={getFormattedTimeString}
              showPrice={showPrice}
              price={price}
              paymentError={paymentError} 
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              venueNeedsPayment={() => venueNeedsPaymentHelper(formData.venue)}
              translations={{
                confirmReservation: t.confirmReservation,
                selectedVenue: t.selectedVenue,
                peopleCount: t.peopleCount,
                people: t.people,
                date: t.date,
                time: t.time,
                fullName: t.fullName,
                contact: t.contact,
                totalPrice: t.totalPrice,
                proceedToPayment: t.proceedToPayment,
                completeReservation: t.completeReservation,
                redirectingToPayment: t.redirectingToPayment
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showPaymentRedirect && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-xl text-center">
              <p>{t.redirectingToPayment}</p>
            </div>
          </motion.div>
        )}

        {showCallPrompt && (
          <CallPromptModal 
            translations={{
              callForMore: t.callForMore,
              callNow: t.callNow,
              goBack: t.goBack
            }}
            onCall={makeCall}
            onClose={() => setShowCallPrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}