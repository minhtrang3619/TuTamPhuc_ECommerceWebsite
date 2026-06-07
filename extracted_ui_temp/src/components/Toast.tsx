/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'info';
}

export default function Toast({ message, isVisible, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 w-full max-w-sm px-4"
        >
          <div className="bg-primary text-white py-3 px-4.5 rounded-sm shadow-xl flex items-center justify-between border border-[#ece0dc]/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-medium font-sans">
              {type === 'success' ? (
                <Sparkles size={14} className="text-primary-fixed shrink-0" />
              ) : (
                <Info size={14} className="text-primary-fixed shrink-0" />
              )}
              <span>{message}</span>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
