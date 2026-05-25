import React from 'react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
      <h3 className="font-bold text-lg text-black">{title}</h3>
      <p className="py-4 text-gray-400">{message}</p>
      <div className="flex justify-end gap-3">
        <button className="btn btn-ghost text-black" onClick={onCancel}>Annuler</button>
        <button className="btn btn-error" onClick={onConfirm}>Supprimer</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;