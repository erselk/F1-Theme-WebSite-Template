'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CallPromptModalProps {
  translations: {
    callForMore: string;
    callNow: string;
    goBack: string;
  };
  onCall: () => void;
  onClose: () => void;
}

const CallPromptModal: React.FC<CallPromptModalProps> = ({
  translations,
  onCall,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-border"
      >
        <p className="mb-4 text-lg">
          {translations.callForMore}
        </p>
        <button
          type="button"
          onClick={onCall}
          className="btn-primary inline-flex items-center px-4 py-2 mb-3 w-full justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {translations.callNow}
        </button>
        <button
          type="button"
          className="block mx-auto text-primary hover:underline text-sm"
          onClick={onClose}
        >
          {translations.goBack}
        </button>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(CallPromptModal); 