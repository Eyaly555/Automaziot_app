import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

// Toast manager singleton
class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Set<(toasts: Toast[]) => void> = new Set();

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  show(type: ToastType, options: ToastOptions) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      id,
      type,
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
    };

    this.toasts.push(toast);
    this.notify();

    // Auto-remove after duration (use nullish coalescing to ensure duration is defined)
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }
}

const toastManager = new ToastManager();

// Toast API
export const toast = {
  success: (options: ToastOptions) => toastManager.show('success', options),
  error: (options: ToastOptions) => toastManager.show('error', options),
  warning: (options: ToastOptions) => toastManager.show('warning', options),
  info: (options: ToastOptions) => toastManager.show('info', options),
  dismiss: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),
};

// Toast component
const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    error: {
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    info: {
      icon: <Info className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  };

  const style = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.2 }}
      className={`
        max-w-md w-full shadow-lg rounded-lg border-2 pointer-events-auto
        ${style.bgColor} ${style.borderColor}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${style.color}`}>
            {style.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${style.color}`}>
              {toast.title}
            </p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-600">
                {toast.message}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className={`flex-shrink-0 rounded-md hover:bg-white/50 p-1 transition-colors ${style.color}`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Toast container component
export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    // Fix: Cleanup function should return void, not the boolean from unsubscribe()
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-4 left-4 z-50 pointer-events-none" dir="ltr">
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={toastManager.remove.bind(toastManager)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Initialize toast container on first import
if (typeof document !== 'undefined') {
  const initToastContainer = () => {
    const existingContainer = document.getElementById('toast-root');
    if (!existingContainer) {
      const container = document.createElement('div');
      container.id = 'toast-root';
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<ToastContainer />);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToastContainer);
  } else {
    initToastContainer();
  }
}
