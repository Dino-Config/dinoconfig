import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './FieldEditModal.scss';

interface FieldEditModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const FieldEditModal: React.FC<FieldEditModalProps> = ({ isOpen, title, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="field-edit-modal-backdrop" onClick={handleBackdropClick}>
      <div className="field-edit-modal">
        <div className="field-edit-modal__header">
          <h2>{title}</h2>
          <button
            type="button"
            className="field-edit-modal__close"
            onClick={onClose}
            aria-label="Close edit field modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="field-edit-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default FieldEditModal;

