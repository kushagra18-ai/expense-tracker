import React from 'react';
import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-secondary">{message}</p>
        <div className="flex justify-end gap-3 mt-4">
          <button className="btn btn--secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
