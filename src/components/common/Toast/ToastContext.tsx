import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineInformationCircle,
  HiOutlineX,
} from 'react-icons/hi';
import './Toast.scss';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastContextValue {
  show: (input: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const DEFAULT_DURATION = 4500;

let _idCounter = 0;
const newId = () => `t_${Date.now().toString(36)}_${(++_idCounter).toString(36)}`;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback((input: Omit<Toast, 'id'>) => {
    const id = newId();
    const toast: Toast = { id, durationMs: DEFAULT_DURATION, ...input };
    setToasts(prev => [...prev, toast]);
    if (toast.durationMs && toast.durationMs > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), toast.durationMs);
    }
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) =>
    show({ kind: 'success', title, description }), [show]);
  const error = useCallback((title: string, description?: string) =>
    show({ kind: 'error', title, description, durationMs: 7000 }), [show]);
  const warning = useCallback((title: string, description?: string) =>
    show({ kind: 'warning', title, description }), [show]);
  const info = useCallback((title: string, description?: string) =>
    show({ kind: 'info', title, description }), [show]);

  // Cleanup all timers on unmount
  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info, dismiss }}>
      {children}
      <div className="bm-toast-container" role="region" aria-label="Notifications">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <HiOutlineCheckCircle />,
  error:   <HiOutlineExclamationCircle />,
  warning: <HiOutlineExclamationCircle />,
  info:    <HiOutlineInformationCircle />,
};

const ToastItem = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  return (
    <div className={`bm-toast bm-toast--${toast.kind}`} role="status">
      <div className="bm-toast-icon">{ICONS[toast.kind]}</div>
      <div className="bm-toast-body">
        <div className="bm-toast-title">{toast.title}</div>
        {toast.description && <div className="bm-toast-desc">{toast.description}</div>}
      </div>
      <button className="bm-toast-close" onClick={onDismiss} aria-label="Dismiss">
        <HiOutlineX />
      </button>
    </div>
  );
};
