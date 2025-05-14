'use client';

import React from 'react';

interface FormStepIndicatorProps {
  steps: string[];
  currentStep: number;
  onGoToStep: (stepIndex: number) => void;
}

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  steps,
  currentStep,
  onGoToStep,
}) => {
  return (
    <div className="flex justify-between mb-4 sm:mb-6 max-w-lg mx-auto">
      {steps.map((step, index) => (
        <div 
          key={index} 
          onClick={() => onGoToStep(index)}
          className={`cursor-pointer flex flex-col items-center ${index === currentStep ? "text-primary font-bold" : "text-gray-400"} ${index < currentStep ? "hover:underline" : ""}`}
          style={{ minWidth: '60px' }}
        >
          <span className="text-center px-1 sm:px-2 text-xs sm:text-base font-medium">{step}</span>
        </div>
      ))}
    </div>
  );
};

export default React.memo(FormStepIndicator); 