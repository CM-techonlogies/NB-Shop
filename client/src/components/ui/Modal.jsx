import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    full: 'max-w-full h-full md:h-auto',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none p-0 md:p-4">
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`pointer-events-auto w-full bg-white rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] ${sizeClasses[size]}`}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                  <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {!title && (
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors bg-white/80 backdrop-blur">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="overflow-y-auto flex-1 p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
