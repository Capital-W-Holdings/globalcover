'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { ModalProps } from '@/types';

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-sand-950/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-lg transform rounded-2xl bg-white shadow-2xl transition-all animate-scale-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between border-b border-sand-200 px-6 py-4">
              <h2 
                id="modal-title"
                className="text-xl font-display font-semibold text-sand-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 hover:text-sand-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Close button without title */}
          {!title && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 hover:text-sand-700 transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          {/* Content */}
          <div className="px-6 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
