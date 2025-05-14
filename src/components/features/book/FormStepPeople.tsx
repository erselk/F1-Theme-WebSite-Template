'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FormStepPeopleProps {
  peopleOptions: (number | string)[];
  onPeopleSelect: (count: number | string) => void;
  translations: {
    howManyPeople: string;
  };
}

const FormStepPeople: React.FC<FormStepPeopleProps> = ({
  peopleOptions,
  onPeopleSelect,
  translations,
}) => {
  return (
    <motion.div 
      className="space-y-6 transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="stepPeople"
    >
      <h3 className="text-base sm:text-2xl font-semibold mb-3 sm:mb-5 text-center">
        {translations.howManyPeople}
      </h3>
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-[12rem] sm:max-w-xs mx-auto">
        {peopleOptions.map((count) => (
          <div 
            key={count} 
            className="aspect-square flex items-center justify-center border border-border rounded-md sm:rounded-lg cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors text-center text-sm sm:text-base font-medium p-1 sm:p-2"
            onClick={() => onPeopleSelect(count)}
          >
            {count}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default React.memo(FormStepPeople); 