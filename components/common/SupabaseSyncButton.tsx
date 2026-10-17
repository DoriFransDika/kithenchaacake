'use client';

import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, UploadCloud, Copy, Check, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { DeleteDatabaseModal } from './DeleteDatabaseModal';

export function SupabaseSyncButton() {
  const {
    supabaseStatus,
    isSupabaseLoading,
    syncWithSupabase,
    seedSupabaseDatabase,
    clearEntireDatabase,
    categories,
    rawMaterials,
    finishedProducts,
    transactions,
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isClearDbModalOpen, setIsClearDbModalOpen] = useState(false);

  const handleCopySchemaPath = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setFeedback('Menyinkronkan data dari Supabase...');
    await syncWithSupabase();
    setFeedback('Selesai diperbarui!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSeed = async () => {
    setFeedback('Mengunggah data ke Supabase...');
    const res = await seedSupabaseDatabase();
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-all duration-200',
          supabaseStatus === 'connected'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            : supabaseStatus === 'needs_setup'
            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
        )}
        title="Status Koneksi Supabase"
      >
        <Database className={cn('w-3.5 h-3.5', supabaseStatus === 'connected' ? 'text-emerald-600' : 'text-amber-600')} />
        <span className="hidden sm:inline">
          {supabaseStatus === 'connected'
            ? 'Supabase Aktif'
            : supabaseStatus === 'needs_setup'
            ? 'Setup Supabase'
            : 'Supabase'}
        </span>
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            supabaseStatus === 'connected'
              ? 'bg-emerald-500'
              : supabaseStatus === 'needs_setup'
              ? 'bg-amber-500'
              : 'bg-stone-400'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#F8BBD0] rounded-3xl shadow-[0_20px_50px_rgba(194,24,91,0.15)] p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F8BBD0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#311B1E]">Integrasi Supabase</h4>
                  <p className="text-[10px] text-[#8D5B68] font-mono">aivmrlglexmzbryjvaui.supabase.co</p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[10px] font-black px-2 py-0.5 rounded-full border',
                  supabaseStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                )}
              >
                {supabaseStatus === 'connected' ? 'Terhubung' : 'Perlu Setup Tabel'}
              </span>
            </div>

            {/* Status Information */}
            <div className="py-3 space-y-2.5">
              {supabaseStatus === 'needs_setup' ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">Tabel Belum Dibuat di Supabase</p>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Jalankan skrip SQL di Supabase SQL Editor agar database siap menyimpan data:
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-amber-100/70 px-2.5 py-1.5 rounded-xl text-[11px] font-mono">
                    <span>supabase/schema.sql</span>
                    <button
                      onClick={handleCopySchemaPath}
                      className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-sans font-bold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">{copied ? 'Tersalin' : 'Salin Nama'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">Database Supabase Siap & Terhubung!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Setiap perubahan kategori, stok bahan, produk cake & roti, dan kasir langsung tersinkronkan ke Supabase.
                  </p>
                </div>
              )}

              {/* Data Summary Counter */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 bg-[#FFEBEF]/50 rounded-xl border border-[#F8BBD0]">
                  <p className="text-[10px] text-[#8D5B68] font-bold">Kategori / Bahan</p>
                  <p className="font-black text-[#311B1E]">
                    {categories.length} / {rawMaterials.length}
                  </p>
                </div>
                <div className="p-2 bg-[#FFEBEF]/50 rounded-xl border border-[#F8BBD0]">
                  <p className="text-[10px] text-[#8D5B68] font-bold">Produk / Transaksi</p>
                  <p className="font-black text-[#311B1E]">
                    {finishedProducts.length} / {transactions.length}
                  </p>
                </div>
              </div>

              {feedback && (
                <p className="text-xs text-center font-bold text-[#C2185B] bg-[#FFEBEF] p-2 rounded-xl border border-[#F8BBD0]">
                  {feedback}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#F8BBD0] flex flex-col gap-2">
              <button
                onClick={handleSync}
                disabled={isSupabaseLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#FFEBEF]/60 hover:bg-[#FFEBEF] text-[#311B1E] rounded-2xl text-xs font-bold border border-[#F8BBD0] transition-all disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isSupabaseLoading && 'animate-spin text-[#C2185B]')} />
                <span>Tarik Ulang Data dari Supabase</span>
              </button>

              <button
                onClick={handleSeed}
                disabled={isSupabaseLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white rounded-2xl text-xs font-black shadow-xs hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Data Sekarang ke Supabase</span>
              </button>

              <button
                onClick={() => setIsClearDbModalOpen(true)}
                disabled={isSupabaseLoading}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold border border-rose-200 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Kosongkan Seluruh Database</span>
              </button>
            </div>
          </div>
        </>
      )}

      <DeleteDatabaseModal
        isOpen={isClearDbModalOpen}
        onClose={() => setIsClearDbModalOpen(false)}
        onConfirm={async () => {
          const res = await clearEntireDatabase();
          setFeedback(res.message);
          setTimeout(() => setFeedback(null), 4000);
        }}
        title="Kosongkan Seluruh Database Supabase"
        itemCountText={`${categories.length} Kategori, ${rawMaterials.length} Bahan, ${finishedProducts.length} Produk, ${transactions.length} Transaksi`}
        description="Tindakan ini akan mengosongkan seluruh tabel di database Supabase (kategori, bahan baku, produk roti, transaksi keuangan, notifikasi) serta penyimpanan lokal."
        warningNote="PERINGATAN: Seluruh database akan dikosongkan. Anda dapat mengunggah kembali data awal dengan tombol 'Upload Data Sekarang' kapan saja."
        confirmButtonText="Ya, Kosongkan Seluruh Database"
      />
    </div>
  );
}
