import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ConfigModal.scss';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  title?: string;
}

export default function ConfigModal({ isOpen, onClose, onCreate, title = "Create New Configuration" }: ConfigModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setName("");
      setDescription("");
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="config-modal-backdrop" onClick={handleBackdropClick}>
      <div className="config-modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="config-name">Configuration Name *</label>
            <input
              id="config-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Config, Development Settings"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="config-description">Description (optional)</label>
            <textarea
              id="config-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this configuration..."
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Create Configuration
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
