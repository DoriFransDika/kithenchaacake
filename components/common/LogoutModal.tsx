'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, X, ShieldCheck } from 'lucide-react';
import { useStore } from '@/lib/store';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter();
  const { logout, user } = useStore();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout();
    onClose();
    router.replace('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shrink-0">
              <LogOut className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <h3 className="font-black text-[#311B1E] text-base sm:text-lg leading-tight">
                Keluar dari Sistem?
              </h3>
              <p className="text-xs text-[#8D5B68] font-bold mt-0.5">
                Kitchen Chaacake OS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FFEBEF] text-[#83274E] flex items-center justify-center hover:bg-[#F8BBD0]/40 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-[#FFEBEF]/60 border border-[#F8BBD0] text-xs text-[#5D4037] space-y-1.5">
          <p className="font-bold text-[#311B1E]">
            Pengguna: <span className="text-[#C2185B] font-black">{user.name || user.email || 'Owner Utama'}</span>
          </p>
          <p className="text-[11px] text-[#8D5B68] leading-relaxed">
            Sesi Anda akan ditutup. Anda harus memasukkan email dan kata sandi kembali untuk membuka pusat kendali toko.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-black text-[#6D4C41] hover:bg-neutral-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar Sistem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
