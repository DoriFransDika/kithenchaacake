'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useStore } from '@/lib/store';

export function FloatingToast() {
  const { toast, showToast } = useStore();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <aside
      aria-label="Notifikasi Sistem"
      className="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -25, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 backdrop-blur-md ${
            isSuccess
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/20'
              : isError
              ? 'bg-rose-600 text-white border-rose-400 shadow-rose-950/20'
              : 'bg-[#311B1E] text-white border-[#F8BBD0] shadow-[#311B1E]/30'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isSuccess
                  ? 'bg-emerald-500/80 text-white'
                  : isError
                  ? 'bg-rose-500/80 text-white'
                  : 'bg-white/10 text-pink-300'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              ) : isError ? (
                <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Info className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider opacity-80">
                {isSuccess ? 'Berhasil' : isError ? 'Peringatan / Galat' : 'Informasi'}
              </p>
              <p className="text-xs font-bold leading-snug break-words">
                {toast.message}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => showToast('', 'info')}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
