'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useStore();

  useEffect(() => {
    if (isLoaded && !user.isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoaded, user.isAuthenticated, router, pathname]);

  // While checking local session / hydrating store
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat flex flex-col items-center justify-center p-4 selection:bg-[#C2185B]/25">
        <div className="bg-white/95 backdrop-blur-md border border-[#F8BBD0] rounded-3xl p-8 shadow-2xl shadow-[#C2185B]/10 flex flex-col items-center max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md border-3 border-[#C2185B] bg-white p-1 mb-4 animate-pulse">
            <Image
              src="/logo.png"
              alt="Logo Kitchen Chaacake"
              width={80}
              height={80}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <h2 className="text-base font-black text-[#311B1E] tracking-tight">Kitchen Chaacake</h2>
          <p className="text-xs text-[#8D5B68] font-bold mt-0.5 mb-4">Memverifikasi Izin Akses...</p>
          <Loader2 className="w-6 h-6 text-[#C2185B] animate-spin" />
        </div>
      </div>
    );
  }

  // If user is not authenticated, do not render protected children
  if (!user.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat flex flex-col items-center justify-center p-4 selection:bg-[#C2185B]/25">
        <div className="bg-white/95 backdrop-blur-md border border-rose-200 rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-base font-black text-[#311B1E]">Akses Terbatas</h2>
          <p className="text-xs text-[#8D5B68] mt-1 mb-4 leading-relaxed font-medium">
            Halaman ini hanya dapat diakses oleh pengelola yang telah masuk. Mengalihkan ke halaman login...
          </p>
          <div className="flex items-center gap-2 text-xs font-black text-[#C2185B]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Memproses pengalihan...</span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
