'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  itemCountText: string;
  warningNote?: string;
  confirmButtonText?: string;
}

export function DeleteDatabaseModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemCountText,
  warningNote = 'Data yang dihapus dari Supabase dan penyimpanan lokal tidak dapat dikembalikan lagi.',
  confirmButtonText = 'Ya, Hapus Permanen Sekarang',
}: DeleteDatabaseModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-r from-rose-50 to-orange-50 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#311B1E]">{title}</h3>
                <p className="text-[11px] text-rose-700 font-bold">{itemCountText}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 rounded-xl text-[#83274E] hover:text-[#311B1E] hover:bg-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-[#311B1E]/90 leading-relaxed">
              {description}
            </p>

            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-rose-900 leading-relaxed">
                <strong className="font-black block text-rose-950 mb-0.5">Peringatan Penghapusan Database:</strong>
                {warningNote}
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="p-5 bg-[#FFEBEF]/40 border-t border-[#F8BBD0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-[#83274E] hover:text-[#311B1E] hover:bg-white border border-[#F8BBD0] transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-black shadow-md shadow-[#C2185B]/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus dari Supabase...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmButtonText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
