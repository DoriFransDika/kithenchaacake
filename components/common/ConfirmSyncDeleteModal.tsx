'use client';

import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';

interface ConfirmSyncDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName: string;
  sourceModule: 'Keuangan' | 'Stok';
  impactDescription: string;
  isDeleting?: boolean;
}

export function ConfirmSyncDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  sourceModule,
  impactDescription,
  isDeleting = false,
}: ConfirmSyncDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-rose-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
        {/* Header with Alert Icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[#FFEBEF] text-[#C2185B] shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <h3 className="font-black text-[#311B1E] text-base sm:text-lg leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[#C2185B] font-bold mt-0.5">
                Sinkronisasi 2 Arah (Stok & Keuangan)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-[#FFEBEF] text-[#83274E] flex items-center justify-center hover:bg-[#F8BBD0]/40 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Card */}
        <div className="p-4 rounded-2xl bg-[#FFEBEF]/60 border border-[#F8BBD0] space-y-2">
          <div className="text-xs font-black text-[#311B1E] flex items-center gap-1.5">
            <span>⚠️ Konfirmasi Penghapusan Terintegrasi</span>
          </div>
          <p className="text-xs text-[#311B1E] font-medium leading-relaxed">
            Anda akan menghapus data: <strong className="text-[#C2185B] underline">{itemName}</strong> dari menu{' '}
            <strong>{sourceModule === 'Keuangan' ? 'Buku Kas Keuangan' : 'Manajemen Stok'}</strong>.
          </p>
          <div className="p-2.5 rounded-xl bg-white/90 border border-[#F8BBD0] text-xs text-[#83274E] font-semibold">
            🔗 <strong>Dampak Dua Arah:</strong> {impactDescription}
          </div>
        </div>

        {/* Safety Note */}
        <p className="text-[11px] text-[#83274E] font-medium">
          Tindakan ini permanen dan langsung disinkronkan ke database Supabase toko secara aman.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[#F8BBD0]/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-2xl border border-[#F8BBD0] text-xs font-black text-[#83274E] hover:bg-[#FFEBEF]/40 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-2xl bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-black shadow-md shadow-[#C2185B]/20 active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Keduanya'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
