import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlineX
} from 'react-icons/hi';
import './ConfirmModal.scss';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus the cancel button when modal opens
      setTimeout(() => confirmButtonRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, loading]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="bm-confirm-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={`bm-confirm-modal bm-confirm-modal--${type}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Close Button */}
        <button
          className="bm-confirm-modal__close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <HiOutlineX />
        </button>

        {/* Icon */}
        <div className={`bm-confirm-modal__icon bm-confirm-modal__icon--${type}`}>
          {type === 'danger' ? <HiOutlineTrash /> : <HiOutlineExclamationCircle />}
        </div>

        {/* Content */}
        <div className="bm-confirm-modal__content">
          <h3 id="confirm-modal-title" className="bm-confirm-modal__title">{title}</h3>
          <p className="bm-confirm-modal__message">
            {message}
            {itemName && (
              <>
                <br />
                <strong className="bm-confirm-modal__item-name">"{itemName}"</strong>
              </>
            )}
          </p>
          {type === 'danger' && (
            <p className="bm-confirm-modal__warning">
              This action cannot be undone.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="bm-confirm-modal__actions">
          <button
            className="bm-confirm-modal__btn bm-confirm-modal__btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            className={`bm-confirm-modal__btn bm-confirm-modal__btn--confirm bm-confirm-modal__btn--${type}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="bm-confirm-modal__spinner"></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <HiOutlineTrash />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
