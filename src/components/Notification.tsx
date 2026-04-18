import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

export default function Notification({ isOpen, onClose, message, type = 'info', title }: NotificationProps) {
  const config = {
    success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  };

  const { icon: Icon, color, bg, border } = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`w-full max-w-sm ${bg} border ${border} rounded-3xl p-6 shadow-2xl relative overflow-hidden`}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 transition"
            >
              <X size={20} className="text-gray-400" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`${color} p-3 rounded-2xl bg-white shadow-sm mb-4`}>
                <Icon size={32} />
              </div>
              
              {title && (
                <h3 className={`text-xl font-bold mb-2 ${color}`}>
                  {title}
                </h3>
              )}
              
              <p className="text-gray-700 font-medium text-lg leading-snug">
                {message}
              </p>

              <button
                onClick={onClose}
                className="mt-6 w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg active:scale-95"
              >
                Theek Hai
              </button>
            </div>
            
            {/* Decorative background shape */}
            <div className={`absolute -bottom-8 -right-8 w-24 h-24 ${color} opacity-5 rounded-full blur-2xl`} />
            <div className={`absolute -top-8 -left-8 w-24 h-24 ${color} opacity-5 rounded-full blur-2xl`} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
