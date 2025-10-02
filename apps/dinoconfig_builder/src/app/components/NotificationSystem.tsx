import React from 'react';
import { IoCheckmark, IoClose, IoWarning } from "react-icons/io5";
import { Notification, ConfirmDialog, PromptDialog } from '../types';
import './NotificationSystem.scss';

interface NotificationSystemProps {
  notifications: Notification[];
  confirmDialog: ConfirmDialog;
  promptDialog: PromptDialog;
  onRemoveNotification: (id: string) => void;
  onConfirmDialog: () => void;
  onCancelDialog: () => void;
  onPromptConfirm: (value: string) => void;
  onPromptCancel: () => void;
}

export default function NotificationSystem({
  notifications,
  confirmDialog,
  promptDialog,
  onRemoveNotification,
  onConfirmDialog,
  onCancelDialog,
  onPromptConfirm,
  onPromptCancel
}: NotificationSystemProps) {
  return (
    <>
      {/* Notification Container */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => onRemoveNotification(notification.id)}
          />
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <ConfirmDialogModal
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={onConfirmDialog}
          onCancel={onCancelDialog}
        />
      )}

      {/* Prompt Dialog */}
      {promptDialog.isOpen && (
        <PromptDialogModal
          title={promptDialog.title}
          message={promptDialog.message}
          defaultValue={promptDialog.defaultValue}
          onConfirm={onPromptConfirm}
          onCancel={onPromptCancel}
        />
      )}
    </>
  );
}

function NotificationToast({ notification, onClose }: {
  notification: Notification;
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <IoCheckmark />;
      case 'error':
        return <IoClose />;
      case 'warning':
        return <IoWarning />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  };

  return (
    <div
      className="notification-toast"
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'slideInRight 0.3s ease-out',
        minWidth: '300px',
        maxWidth: '500px'
      }}
    >
      {getIcon() && <span style={{ fontSize: '18px' }}>{getIcon()}</span>}
      <span style={{ flex: 1 }}>{notification.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <IoClose />
      </button>
    </div>
  );
}

function ConfirmDialogModal({ title, message, onConfirm, onCancel }: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptDialogModal({ title, message, defaultValue, onConfirm, onCancel }: {
  title: string;
  message: string;
  defaultValue: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = React.useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="modal-input"
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

