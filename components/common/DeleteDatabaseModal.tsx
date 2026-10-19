'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

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
  const { user, login } = useStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail(user.email || '');
      setPassword('');
      setShowPassword(false);
      setAuthError(null);
    }
  }, [isOpen, user.email]);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setAuthError('Email dan kata sandi pemilik wajib diisi untuk verifikasi keamanan.');
      return;
    }

    setIsDeleting(true);
    setAuthError(null);

    try {
      const verified = await login(cleanEmail, cleanPass);
      if (!verified) {
        setAuthError('Verifikasi gagal: Email atau kata sandi pemilik tidak sesuai.');
        setIsDeleting(false);
        return;
      }

      await onConfirm();
      onClose();
    } catch {
      setAuthError('Terjadi kesalahan saat memverifikasi kredensial.');
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

          {/* Body Content & Credentials Verification */}
          <form onSubmit={handleConfirm}>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-[#311B1E]/90 leading-relaxed">
                {description}
              </p>

              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-900 leading-relaxed">
                  <strong className="font-black block text-rose-950 mb-0.5">Peringatan Keamanan Database:</strong>
                  {warningNote}
                </div>
              </div>

              {/* Form Input Verifikasi Kredensial Pemilik */}
              <div className="p-4 rounded-2xl bg-[#FFEBEF]/50 border border-[#F8BBD0] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-[#311B1E]">
                  <ShieldCheck className="w-4 h-4 text-[#C2185B]" />
                  <span>Verifikasi Kredensial Pemilik Toko</span>
                </div>
                <p className="text-[11px] text-[#8D5B68] leading-normal font-medium">
                  Konfirmasi email dan kata sandi pemilik untuk mengizinkan tindakan penghapusan database ini.
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#311B1E] mb-1">
                      Email Pemilik <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#8D5B68] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setAuthError(null);
                        }}
                        placeholder="email.pemilik@domain.com"
                        className="w-full bg-white border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-[#311B1E] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#311B1E] mb-1">
                      Kata Sandi Pemilik <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#8D5B68] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAuthError(null);
                        }}
                        placeholder="Masukkan kata sandi..."
                        className="w-full bg-white border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-xl pl-9 pr-9 py-2 text-xs font-bold text-[#311B1E] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D5B68] hover:text-[#311B1E]"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {authError && (
                  <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{authError}</span>
                  </div>
                )}
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
                type="submit"
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C2185B] hover:bg-[#AD1457] text-white text-xs font-black shadow-md shadow-[#C2185B]/30 active:scale-95 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi & Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmButtonText}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
