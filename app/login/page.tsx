'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Heart
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setErrorMsg('Email atau Password salah! Periksa kembali akun Anda.');
        setIsLoading(false);
      }
    } catch {
      setErrorMsg('Gagal melakukan proses autentikasi. Silakan coba beberapa saat lagi.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat text-[#311B1E] flex flex-col justify-center items-center p-4 selection:bg-[#C2185B]/25 selection:text-[#311B1E] relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#FFEBEF]/70 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#FCE4EC]/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card with Logo */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md border-2 border-[#F8BBD0] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-[#C2185B]/10 relative z-10">
        {/* Brand Header with Store Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg shadow-[#C2185B]/20 border-3 border-[#C2185B] bg-white p-1 mb-3">
            <Image
              src="/logo.png"
              alt="Logo Kitchen Chaacake"
              width={96}
              height={96}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#311B1E] tracking-tight">
            Kitchen Chaacake
          </h1>
          <p className="text-xs text-[#8D5B68] mt-0.5 font-bold">
            Selamat Menikmati • Kerinci, Jambi
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6D4C41] mb-1.5">
              Email Pengelola
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#C2185B]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/15 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#311B1E] font-bold placeholder-[#A1887F] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#6D4C41] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#C2185B]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] focus:ring-2 focus:ring-[#C2185B]/15 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#311B1E] font-bold placeholder-[#A1887F] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8D5B68] hover:text-[#C2185B]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Rose CTA Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-3xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white font-black text-xs sm:text-sm shadow-md shadow-[#C2185B]/30 hover:brightness-105 active:scale-98 transition-all"
          >
            {isLoading ? (
              <span>Membuka Kitchen Chaacake...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-[#8D5B68] hover:text-[#C2185B] transition-colors font-bold"
          >
            ← Kembali ke Halaman Utama
          </Link>
        </div>
      </div>
    </div>
  );
}
