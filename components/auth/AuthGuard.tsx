'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShieldAlert, Loader2, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
}

// 5 minutes of inactivity before automatic logout
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
// Warning shows 30 seconds before logout
const WARNING_THRESHOLD_MS = 30 * 1000;
const STORAGE_LAST_ACTIVE_KEY = 'chaacake_last_active';

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded, logout } = useStore();

  const [warningSeconds, setWarningSeconds] = useState<number | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Reset activity timestamp on user interaction
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, String(now));
    } catch {
      // ignore
    }
    setWarningSeconds(null);
  }, []);

  // Handle immediate logout when inactivity timeout reached
  const handleAutoLogout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_LAST_ACTIVE_KEY);
    } catch {
      // ignore
    }
    logout();
    router.replace('/login?reason=timeout');
  }, [logout, router]);

  // Activity listeners across all user inputs
  useEffect(() => {
    if (!isLoaded || !user.isAuthenticated) return;

    // Initialize last active time
    recordActivity();

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleEvent = () => recordActivity();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // Check inactivity periodically every 1 second
    const interval = setInterval(() => {
      let storedTime = lastActiveRef.current;
      try {
        const fromStorage = Number(localStorage.getItem(STORAGE_LAST_ACTIVE_KEY));
        if (fromStorage && !isNaN(fromStorage)) {
          storedTime = Math.max(storedTime, fromStorage);
        }
      } catch {
        // ignore
      }

      const elapsed = Date.now() - storedTime;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(interval);
        handleAutoLogout();
      } else if (elapsed >= INACTIVITY_TIMEOUT_MS - WARNING_THRESHOLD_MS) {
        const remaining = Math.max(1, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
        setWarningSeconds(remaining);
      } else {
        setWarningSeconds(null);
      }
    }, 1000);

    // Also check immediately when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        let storedTime = lastActiveRef.current;
        try {
          const fromStorage = Number(localStorage.getItem(STORAGE_LAST_ACTIVE_KEY));
          if (fromStorage && !isNaN(fromStorage)) storedTime = Math.max(storedTime, fromStorage);
        } catch {
          // ignore
        }
        if (Date.now() - storedTime >= INACTIVITY_TIMEOUT_MS) {
          handleAutoLogout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [isLoaded, user.isAuthenticated, recordActivity, handleAutoLogout]);

  // Redirect if not authenticated
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

  return (
    <>
      {/* Imminent Inactivity Timeout Warning Banner (30s Countdown) */}
      {warningSeconds !== null && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 shadow-2xl shadow-amber-900/20 animate-in slide-in-from-top-4 duration-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900">
                Sesi Otomatis Berakhir ({warningSeconds}d)
              </p>
              <p className="text-[11px] text-amber-800 font-medium">
                Tidak ada aktivitas selama 5 menit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={recordActivity}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md shadow-amber-500/30 transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tetap Masuk</span>
          </button>
        </div>
      )}

      {children}
    </>
  );
}
