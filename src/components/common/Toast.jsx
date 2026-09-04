import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // expose both names so any component can use showToast or addToast
  const showToast = addToast;

  return (
    <ToastContext.Provider value={{ addToast, showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={20} className="toast-icon toast-icon--success" />;
      case 'error': return <AlertCircle size={20} className="toast-icon toast-icon--error" />;
      case 'warning': return <AlertTriangle size={20} className="toast-icon toast-icon--warning" />;
      default: return <Info size={20} className="toast-icon toast-icon--info" />;
    }
  };

  return (
    <div className={`toast toast--${toast.type}`} style={{ animation: 'slideInTop 0.3s ease-out' }}>
      {getIcon()}
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onRemove}>
        <X size={16} />
      </button>
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
