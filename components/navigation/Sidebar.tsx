'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Tags,
  Wallet,
  Calculator,
  LogOut,
  Sparkles,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, summary } = useStore();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Manajemen Stok',
      href: '/stok',
      icon: Boxes,
      badge: summary.lowStockItemsCount > 0 ? `${summary.lowStockItemsCount} Alert` : null,
      badgeColor: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    {
      label: 'Kelola Kategori',
      href: '/kategori',
      icon: Tags,
      badge: 'Baru',
      badgeColor: 'bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]',
    },
    {
      label: 'Keuangan Toko',
      href: '/keuangan',
      icon: Wallet,
      badge: null,
    },
    {
      label: 'Kalkulator',
      href: '/kalkulator',
      icon: Calculator,
      badge: null,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white/95 backdrop-blur-md border-r border-[#F8BBD0] text-[#311B1E] select-none shrink-0 h-screen sticky top-0 shadow-[4px_0_30px_rgba(194,24,91,0.04)] z-30">
      {/* Brand Header with Store Logo */}
      <div className="p-5 border-b border-[#F8BBD0] flex items-center gap-3 bg-gradient-to-b from-[#FFF5F7] to-white">
        <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-md shadow-[#C2185B]/15 border-2 border-[#C2185B] bg-white p-0.5 shrink-0 transition-transform duration-300 hover:scale-105">
          <Image
            src="/logo.png"
            alt="Logo Kitchen Chaacake"
            width={48}
            height={48}
            className="w-full h-full object-contain rounded-full"
            priority
          />
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-[#311B1E] text-lg tracking-tight">Kitchen Chaacake</h1>
          </div>
          <p className="text-[11px] text-[#8D5B68] font-bold tracking-tight">Selamat Menikmati • Kerinci</p>
        </div>
      </div>

      {/* User Badge Profile */}
      <div className="p-3.5 mx-4 my-3 rounded-3xl bg-gradient-to-r from-[#FFEBEF] to-[#FFF5F7] border border-[#F8BBD0] flex items-center gap-3 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#D81B60] border border-[#C2185B]/40 flex items-center justify-center text-white font-black text-sm shadow-xs">
          KC
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-black text-[#311B1E] truncate">{user.name || 'Owner Utama'}</p>
          <p className="text-[11px] text-[#C2185B] font-bold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Dapur Aktif • Kitchen Chaacake
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-4 py-1 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-black uppercase tracking-wider text-[#8D5B68] px-3 py-1">
          Menu Kitchen Chaacake
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white shadow-md shadow-[#C2185B]/30 font-black'
                  : 'text-[#5D4037] hover:text-[#C2185B] hover:bg-[#FFEBEF]/80'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-white' : 'text-[#8D5B68] group-hover:text-[#C2185B]'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-black px-2 py-0.5 rounded-full',
                    isActive ? 'bg-white text-[#C2185B]' : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Warm Bakery Banner */}
      <div className="p-4 mx-4 mb-3 rounded-3xl bg-gradient-to-br from-[#FFEBEF] via-[#FFF5F7] to-white border border-[#F8BBD0] text-[#311B1E] shadow-xs">
        <div className="flex items-center gap-2 text-[#C2185B] text-xs font-black mb-1">
          <Heart className="w-3.5 h-3.5 fill-[#C2185B]" />
          <span>Etalase Cake & Roti</span>
        </div>
        <p className="text-xs text-[#5D4037] leading-relaxed font-medium">
          Tersedia <strong className="text-[#311B1E] font-black">{summary.readyProductsCount} pcs</strong> produk siap saji untuk etalase hari ini.
        </p>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-[#F8BBD0]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-[#8D5B68] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}
