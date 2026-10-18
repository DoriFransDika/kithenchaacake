'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Sparkles, AlertTriangle, CheckCircle2, X, Heart, LogOut } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { SupabaseSyncButton } from '@/components/common/SupabaseSyncButton';
import { LogoutModal } from '@/components/common/LogoutModal';

export function Header() {
  const { notifications, markNotificationRead } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const unreadCount = notifications.length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F8BBD0] px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Mobile Brand / Tablet Greeting with Logo */}
        <div className="flex items-center gap-3">
          <div className="md:hidden relative w-10 h-10 rounded-full overflow-hidden shadow-xs border-2 border-[#C2185B] bg-white p-0.5 shrink-0">
            <Image
              src="/logo.png"
              alt="Logo Kitchen Chaacake"
              width={40}
              height={40}
              className="w-full h-full object-contain rounded-full"
              priority
            />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-black text-[#311B1E] flex items-center gap-2">
              Kitchen Chaacake
              <span className="hidden sm:inline-block text-[11px] font-black text-[#C2185B] bg-[#FFEBEF] px-2.5 py-0.5 rounded-full border border-[#F8BBD0]">
                Pusat Kendali
              </span>
            </h2>
            <p className="text-xs text-[#8D5B68] font-medium hidden sm:block">
              Cake & Bakery • Selamat Menikmati
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <SupabaseSyncButton />

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-200 relative',
                showNotifications
                  ? 'bg-[#FFEBEF] border-[#C2185B] text-[#C2185B]'
                  : 'bg-white/80 border-[#F8BBD0] text-[#5D4037] hover:text-[#C2185B] hover:bg-[#FFEBEF]'
              )}
              aria-label="Pemberitahuan"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C2185B] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#F8BBD0] rounded-3xl shadow-[0_15px_45px_rgba(194,24,91,0.12)] p-5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F8BBD0]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#FFEBEF] text-[#C2185B] flex items-center justify-center border border-[#F8BBD0]">
                      <Bell className="w-4 h-4 text-[#C2185B]" />
                    </div>
                    <h3 className="font-black text-sm text-[#311B1E]">Peringatan & Aktivitas</h3>
                  </div>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                    {unreadCount} pesan
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#8D5B68] text-center py-6">Tidak ada notifikasi baru.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3.5 rounded-2xl border text-xs transition-all relative group',
                          notif.severity === 'warning'
                            ? 'bg-[#FFF5F7] border-rose-200 text-[#311B1E]'
                            : notif.severity === 'success'
                            ? 'bg-[#F2FBF6] border-emerald-200 text-[#311B1E]'
                            : 'bg-white border-[#F8BBD0] text-[#311B1E]'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-bold">
                            {notif.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            <span className="text-[#311B1E] font-black">{notif.title}</span>
                          </div>
                          <button
                            onClick={() => markNotificationRead(notif.id)}
                            className="text-[#8D5B68] hover:text-[#C2185B] p-0.5 opacity-70 group-hover:opacity-100"
                            title="Tandai selesai"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-[#5D4037] leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="mt-1.5 inline-block text-[10px] text-[#8D5B68] font-mono">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="h-10 px-3 sm:px-3.5 rounded-2xl flex items-center gap-1.5 border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 transition-all duration-200 text-xs font-black shadow-xs active:scale-95 shrink-0"
            title="Keluar dari sistem"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />

      {/* Backdrop */}
      {showNotifications && (
        <div
          onClick={() => setShowNotifications(false)}
          className="fixed inset-0 z-30 bg-transparent"
        />
      )}
    </>
  );
}
