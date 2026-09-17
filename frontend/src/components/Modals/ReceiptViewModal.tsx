import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface ReceiptViewModalProps {
  imageUrl: string | null;
  title: string;
  onClose: () => void;
}

export const ReceiptViewModal: React.FC<ReceiptViewModalProps> = ({ imageUrl, title, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-card rounded-2xl border border-slate-700/80 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">{title} - Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center bg-slate-950/60 rounded-xl p-3 max-h-[70vh] overflow-hidden">
          <img
            src={imageUrl}
            alt="Expense receipt"
            className="max-h-[60vh] max-w-full object-contain rounded-lg border border-slate-800 shadow-lg"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
