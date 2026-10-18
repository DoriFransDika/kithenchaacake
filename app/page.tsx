'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Boxes,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Flame,
  Tags
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

export default function LandingPage() {
  const { user } = useStore();
  const steps = [
    {
      num: '01',
      title: 'Belanja Bahan Baku',
      desc: 'Catat belanja tepung, mentega, gula, ragi, dan telur. Sistem otomatis menghitung harga satuan dan memberi peringatan saat persediaan menipis.',
      icon: Boxes,
      badge: 'Input Modal',
      color: 'bg-[#FCE4EC] text-[#D81B60] border-[#F8BBD0]',
    },
    {
      num: '02',
      title: 'Proses Produksi',
      desc: 'Pilih resep roti dan jumlah batch baking. Sistem akan memotong stok bahan baku secara otomatis sesuai gramasi dan menambah stok roti di etalase.',
      icon: Flame,
      badge: 'Kalkulasi Otomatis',
      color: 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]',
    },
    {
      num: '03',
      title: 'Penjualan Produk Jadi',
      desc: 'Kasir kilat untuk transaksi roti toko, pesanan katering, dan snack box. Mendukung pembayaran Tunai serta QRIS dengan pencatatan instan.',
      icon: ShoppingBag,
      badge: 'Kasir Cepat',
      color: 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]',
    },
    {
      num: '04',
      title: 'Pantau Laporan & Stok',
      desc: 'Evaluasi keuntungan bersih harian, grafik omset mingguan, hingga simulasi kalkulator HPP & margin laba untuk strategi harga terbaik.',
      icon: TrendingUp,
      badge: 'Laba Bersih',
      color: 'bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]',
    },
  ];

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat text-[#311B1E] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C2185B]/25 selection:text-[#311B1E]">
      {/* Warm pink ambient aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#FFEBEF]/40 via-[#FCE4EC]/30 to-transparent blur-[100px] pointer-events-none" />

      {/* Top Navbar with Store Logo */}
      <header className="w-full max-w-6xl mx-auto px-5 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md shadow-[#C2185B]/15 border-2 border-[#C2185B] bg-white p-0.5 shrink-0 transition-transform hover:scale-105">
            <Image
              src="/logo.png"
              alt="Logo Kitchen Chaacake"
              width={48}
              height={48}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <div>
            <span className="font-black text-[#311B1E] text-lg tracking-tight">Kitchen Chaacake</span>
            <span className="block text-[10px] text-[#C2185B] font-black uppercase tracking-wider">
              Selamat Menikmati • Kerinci
            </span>
          </div>
        </div>

        <Link
          href={user.isAuthenticated ? '/dashboard' : '/login'}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-[#FFEBEF] border-2 border-[#F8BBD0] text-xs font-black text-[#311B1E] transition-all shadow-xs"
        >
          <span>{user.isAuthenticated ? 'Ke Dashboard' : 'Masuk Sistem'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#C2185B]" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-5 pt-6 pb-16 flex flex-col items-center text-center z-10">
        {/* Logo Badge Big Display */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-xl shadow-[#C2185B]/20 border-4 border-[#C2185B] bg-white p-1 mb-5"
        >
          <Image
            src="/logo.png"
            alt="Logo Kitchen Chaacake"
            width={144}
            height={144}
            className="w-full h-full object-contain rounded-full"
            priority
          />
        </motion.div>

        {/* Device pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEBEF] border border-[#F8BBD0] text-[#311B1E] text-xs font-black mb-5 shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-[#C2185B] text-[#C2185B]" />
          <span>Selamat Menikmati • Dioptimalkan untuk HP & Tablet</span>
        </div>

        {/* Big Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#311B1E] tracking-tight max-w-3xl leading-[1.15]">
          Kitchen Chaacake <br />
          <span className="bg-gradient-to-r from-[#C2185B] via-[#E91E63] to-[#AD1457] bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        {/* Slogan */}
        <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#6D4C41] max-w-2xl leading-relaxed font-medium">
          Sistem manajemen cake & bakery privat: kontrol resep adonan, pantau stok bahan baku, etalase kue siap saji, dan pencatatan laba bersih otomatis.
        </p>

        {/* CTA Button with Rose Accent */}
        <div className="mt-8 flex items-center justify-center w-full sm:w-auto">
          <Link
            href={user.isAuthenticated ? '/dashboard' : '/login'}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-3xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white font-black text-sm shadow-lg shadow-[#C2185B]/30 hover:brightness-105 active:scale-95 transition-all"
          >
            <span>{user.isAuthenticated ? 'Buka Dashboard Anda' : 'Masuk ke Aplikasi (Login Pengelola)'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>

        {/* Protected System Card */}
        <div className="mt-6 p-3 px-5 rounded-2xl bg-white border border-[#F8BBD0] text-xs text-[#5D4037] flex items-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
          <span>Akses Privat: Masuk menggunakan akun terdaftar di sistem database Kitchen Chaacake</span>
        </div>

        {/* Cara Kerja Sistem Per-Step */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-black text-[#311B1E] tracking-tight">
              Panduan Cara Kerja Sistem (4-Step)
            </h2>
            <p className="text-xs sm:text-sm text-[#8D5B68] mt-1 max-w-lg mx-auto">
              Empat tahapan otomatisasi bisnis dari pembelian bahan hingga pencatatan laba bersih toko.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="p-6 rounded-3xl bg-white border-2 border-[#F8BBD0] hover:border-[#C2185B] shadow-md shadow-[#C2185B]/5 hover:shadow-xl hover:shadow-[#C2185B]/15 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-black text-[#A1887F] group-hover:text-[#C2185B] transition-colors">
                        STEP {st.num}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${st.color}`}>
                        {st.badge}
                      </span>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-[#FFEBEF]/60 flex items-center justify-center text-[#C2185B] mb-3 border border-[#F8BBD0]">
                      <Icon className="w-6 h-6 text-[#C2185B]" />
                    </div>

                    <h3 className="font-black text-[#311B1E] text-base mb-2">
                      {st.title}
                    </h3>

                    <p className="text-xs text-[#6D4C41] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F8BBD0] flex items-center text-[11px] font-black text-[#C2185B] group-hover:translate-x-0.5 transition-transform">
                    <span className="text-[#311B1E]">Lihat modul</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#C2185B]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-16 w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFEBEF] via-white to-[#FFF5F7] border-2 border-[#F8BBD0] text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[#C2185B]/5">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-[#311B1E]">Dirancang Sempurna untuk Dapur & Meja Kasir</h3>
            <p className="text-xs sm:text-sm text-[#5D4037] max-w-xl leading-relaxed">
              Tombol rose magenta elegan yang mudah dijangkau ibu jari, kartu pastel yang menenangkan mata saat di dapur, dan penyimpanan data tersinkronisasi 100% ke Supabase.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-black text-[#311B1E]">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> Kategori Kustom Fleksibel</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> Cepat Tanpa Loading Berat</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2E7D32]" /> 100% Privat untuk Toko</span>
            </div>
          </div>

          <Link
            href="/login"
            className="shrink-0 px-7 py-3.5 rounded-3xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white font-black text-xs flex items-center gap-2 shadow-md shadow-[#C2185B]/30 hover:brightness-105 transition-all"
          >
            <span>Buka Dapur Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#F8BBD0] py-6 text-center text-xs text-[#8D5B68]">
        <p>© 2026 Kitchen Chaacake Management System • Selamat Menikmati • Kerinci, Jambi</p>
      </footer>
    </div>
  );
}
