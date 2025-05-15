'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VenueOption {
  id: string;
  title: { tr: string; en: string };
  description: { tr: string; en: string }; 
  icon: string;
}

interface FormStepVenueProps {
  venueOptions: VenueOption[];
  selectedVenueId: string;
  onVenueSelect: (venueId: string) => void;
  language: 'tr' | 'en';
  translations: {
    whichVenue: string;
  };
}

const FormStepVenue: React.FC<FormStepVenueProps> = ({
  venueOptions,
  selectedVenueId,
  onVenueSelect,
  language,
  translations,
}) => {
  return (
    <motion.div 
      className="space-y-3 sm:space-y-6 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="stepVenue"
    >
      <h3 className="text-base sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 md:mb-5 text-center">
        {translations.whichVenue}
      </h3>
      <div className="grid grid-cols-5 gap-1 w-full px-1 sm:px-0 sm:max-w-xl sm:gap-2 mx-auto">
        {venueOptions.map((venue) => (
          <div 
            key={venue.id} 
            className={`p-1 sm:p-2 border rounded-lg cursor-pointer transition-colors text-center min-h-[4.5rem] sm:h-24 flex flex-col justify-around items-center ${selectedVenueId === venue.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-very-light-grey dark:hover:bg-dark-grey"}`}
            onClick={() => onVenueSelect(venue.id)}
          >
            <div className="text-[10px] leading-tight sm:text-sm font-medium break-words whitespace-normal">
              {venue.id === 'f1' ? (
                <>
                  <span className="sm:hidden">
                    {language === 'tr' ? (<>F1 Yarış <br />Simü-<br />lasyonu</>) : (<>F1 Racing <br />Simu-<br />lation</>)}
                  </span>
                  <span className="hidden sm:inline">{venue.title[language]}</span>
                </>
              ) : (
                venue.title[language]
              )}
            </div>
            <div className="text-base sm:text-2xl self-center">{venue.icon}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(FormStepVenue); 