import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { HiOutlineX, HiOutlineExclamation } from 'react-icons/hi';
import './ConfirmDialog.scss';

export type ConfirmTone = 'danger' | 'warning' | 'primary';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx.confirm;
};

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> =>
    new Promise(resolve => {
      setPending({
        tone: 'primary',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        ...opts,
        resolve,
      });
    }), []);

  const close = (result: boolean) => {
    if (!pending) return;
    pending.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <>
          <div className="bm-confirm-backdrop" onClick={() => close(false)} />
          <div className={`bm-confirm bm-confirm--${pending.tone}`} role="alertdialog" aria-modal="true">
            <button className="bm-confirm-x" onClick={() => close(false)} aria-label="Close">
              <HiOutlineX />
            </button>
            <div className="bm-confirm-icon"><HiOutlineExclamation /></div>
            <h3 className="bm-confirm-title">{pending.title}</h3>
            {pending.description && (
              <p className="bm-confirm-desc">{pending.description}</p>
            )}
            <div className="bm-confirm-actions">
              <button className="bm-confirm-btn bm-confirm-btn--ghost" onClick={() => close(false)}>
                {pending.cancelLabel}
              </button>
              <button
                className={`bm-confirm-btn bm-confirm-btn--${pending.tone}`}
                onClick={() => close(true)}
                autoFocus
              >
                {pending.confirmLabel}
              </button>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  );
};
