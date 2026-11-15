import React from 'react';
import Modal from '../ui/Modal';

export default function ResetConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Demo State?"
      subtitle="This restores all medication intake logs, pill counts, and profile settings to the initial demo state."
      maxWidth="max-w-md"
    >
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
        >
          Confirm Reset
        </button>
      </div>
    </Modal>
  );
}
