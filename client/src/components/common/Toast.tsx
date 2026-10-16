import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: {
    message: string;
    type?: ToastType;
    title?: string;
    duration?: number;
  }) => string;
  success: (message: string, title?: string, duration?: number) => string;
  error: (message: string, title?: string, duration?: number) => string;
  info: (message: string, title?: string, duration?: number) => string;
  warning: (message: string, title?: string, duration?: number) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message,
      type = 'info',
      title,
      duration = 4000,
    }: {
      message: string;
      type?: ToastType;
      title?: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title: title || 'Success', type: 'success', duration }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title: title || 'Error', type: 'error', duration }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title: title || 'Notice', type: 'info', duration }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) =>
      showToast({ message, title: title || 'Warning', type: 'warning', duration }),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, info, warning, removeToast }}
    >
      {children}
      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({
  toast,
  onClose,
}) => {
  const getIconAndStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          borderColor: 'border-emerald-200/80',
          badgeBg: 'bg-emerald-50',
          titleColor: 'text-emerald-900',
          barColor: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          borderColor: 'border-rose-200/80',
          badgeBg: 'bg-rose-50',
          titleColor: 'text-rose-900',
          barColor: 'bg-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          borderColor: 'border-amber-200/80',
          badgeBg: 'bg-amber-50',
          titleColor: 'text-amber-900',
          barColor: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-pink-500 shrink-0" />,
          borderColor: 'border-pink-200/80',
          badgeBg: 'bg-pink-50',
          titleColor: 'text-pink-900',
          barColor: 'bg-pink-500',
        };
    }
  };

  const style = getIconAndStyle();

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white border ${style.borderColor} shadow-xl shadow-pink-200/40 animate-toast transition-all duration-200 relative overflow-hidden`}
    >
      <div className={`p-1.5 rounded-xl ${style.badgeBg} shrink-0 mt-0.5`}>
        {style.icon}
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {toast.title && (
          <h4 className={`text-xs font-bold uppercase tracking-wider ${style.titleColor}`}>
            {toast.title}
          </h4>
        )}
        <p className="text-sm font-medium text-slate-700 leading-snug break-words mt-0.5">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onClose}
        aria-label="Close notification"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Decorative accent top line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.barColor}`} />
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
