'use client';

import { useThemeLanguage } from '@/lib/ThemeLanguageContext';
import { EventFormProps } from './types';
import ImageSelector from '../ImageSelector';
import FormLanguageSelector from './FormLanguageSelector';
import ValidationErrors from './ValidationErrors';
import BasicInfoSection from './BasicInfoSection';
import LocationSection from './LocationSection';
import DescriptionSection from './DescriptionSection';
import TicketsSection from './TicketsSection';
import RulesSection from './RulesSection';
import ProgramSection from './ProgramSection';
import ImageSection from './ImageSection';
import FormButtons from './FormButtons';
import useEventForm from './useEventForm';

export default function EventForm({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) {
  const { isDark } = useThemeLanguage();
  
  const {
    formData,
    formLanguage,
    setFormLanguage,
    dateInputValue,
    setDateInputValue,
    validationErrors,
    showValidationErrors,
    isEditMode,
    bannerPreview,
    squarePreview,
    galleryPreviews,
    bannerSelectorOpen,
    setBannerSelectorOpen,
    squareSelectorOpen,
    setSquareSelectorOpen,
    gallerySelectorOpen,
    setGallerySelectorOpen,
    handleInputChange,
    handleCheckboxChange,
    handleNumberChange,
    handleTicketChange,
    increaseTicketPrice,
    decreaseTicketPrice,
    addTicket,
    removeTicket,
    handleRuleChange,
    addRule,
    removeRule,
    handleProgramChange,
    addProgramItem,
    removeProgramItem,
    handleSubmit,
    handleBannerImageSelection,
    handleSquareImageSelection,
    handleGalleryImageSelection,
    handleGalleryImageUpload,
    removeGalleryImage
  } = useEventForm({ event, onSubmit, onCancel });

  return (
    <div className={`p-6 rounded-lg ${isDark ? 'bg-graphite' : 'bg-white'} shadow-md`}>
      {/* Language selection for content input */}
      <FormLanguageSelector 
        formLanguage={formLanguage} 
        onChange={setFormLanguage} 
        isDark={isDark} 
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Ana Bilgiler */}
        <BasicInfoSection 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          onNumberChange={handleNumberChange}
          onCheckboxChange={handleCheckboxChange}
          dateInputValue={dateInputValue}
          setDateInputValue={setDateInputValue}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
        />
        
        {/* 2. Konum Bilgileri */}
        <LocationSection 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
        />

        {/* 3. Açıklama */}
        <DescriptionSection 
          formData={formData}
          formLanguage={formLanguage}
          onInputChange={handleInputChange}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
        />
        
        {/* 4. Bilet Tipleri */}
        <TicketsSection 
          formData={formData}
          formLanguage={formLanguage}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
          handleTicketChange={handleTicketChange}
          increaseTicketPrice={increaseTicketPrice}
          decreaseTicketPrice={decreaseTicketPrice}
          addTicket={addTicket}
          removeTicket={removeTicket}
        />
        
        {/* 5. Etkinlik Kuralları */}
        <RulesSection 
          formData={formData}
          formLanguage={formLanguage}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
          handleRuleChange={handleRuleChange}
          addRule={addRule}
          removeRule={removeRule}
        />
        
        {/* 6. Etkinlik Programı */}
        <ProgramSection 
          formData={formData}
          formLanguage={formLanguage}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
          handleProgramChange={handleProgramChange}
          addProgramItem={addProgramItem}
          removeProgramItem={removeProgramItem}
        />
        
        {/* 7. Görseller */}
        <ImageSection 
          formData={formData}
          formLanguage={formLanguage}
          bannerPreview={bannerPreview}
          squarePreview={squarePreview}
          galleryPreviews={galleryPreviews}
          isDark={isDark}
          validationErrors={validationErrors}
          showValidationErrors={showValidationErrors}
          onBannerSelectorOpen={() => setBannerSelectorOpen(true)}
          onSquareSelectorOpen={() => setSquareSelectorOpen(true)}
          onGallerySelectorOpen={() => setGallerySelectorOpen(true)}
          handleGalleryImageUpload={handleGalleryImageUpload}
          removeGalleryImage={removeGalleryImage}
        />
        
        {/* Doğrulama Hataları - Butonların Hemen Üzerinde */}
        {showValidationErrors && Object.keys(validationErrors).length > 0 && (
          <ValidationErrors 
            errors={validationErrors} 
            showErrors={showValidationErrors} 
            formLanguage={formLanguage} 
          />
        )}
        
        {/* Form Butonları */}
        <FormButtons 
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          isDark={isDark}
          formLanguage={formLanguage}
        />
      </form>

      {/* Image Selector Modals */}
      {bannerSelectorOpen && (
        <ImageSelector 
          isOpen={bannerSelectorOpen} 
          onClose={() => setBannerSelectorOpen(false)} 
          onSelect={handleBannerImageSelection}
          category="banner"
        />
      )}

      {squareSelectorOpen && (
        <ImageSelector 
          isOpen={squareSelectorOpen} 
          onClose={() => setSquareSelectorOpen(false)} 
          onSelect={handleSquareImageSelection}
          category="square"
        />
      )}

      {gallerySelectorOpen && (
        <ImageSelector 
          isOpen={gallerySelectorOpen} 
          onClose={() => setGallerySelectorOpen(false)} 
          onSelect={handleGalleryImageSelection}
          category="gallery"
        />
      )}
    </div>
  );
} 