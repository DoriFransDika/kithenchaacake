'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Boxes, Tags, Wallet, Calculator } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const { summary } = useStore();

  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Stok',
      href: '/stok',
      icon: Boxes,
      badge: summary.lowStockItemsCount > 0 ? `${summary.lowStockItemsCount}` : null,
    },
    {
      label: 'Kategori',
      href: '/kategori',
      icon: Tags,
      badge: null,
    },
    {
      label: 'Keuangan',
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1 pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-xl border-2 border-[#F8BBD0] rounded-3xl shadow-[0_12px_35px_rgba(194,24,91,0.12)] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-2xl transition-all duration-300 min-w-[58px]',
                isActive
                  ? 'text-white font-black'
                  : 'text-[#8D5B68] hover:text-[#C2185B]'
              )}
            >
              {/* Active Rose Pill Accent */}
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-r from-[#C2185B] to-[#D81B60] rounded-2xl shadow-md shadow-[#C2185B]/25" />
              )}

              {/* Icon with alert badge */}
              <div className="relative mb-0.5 z-10">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive ? 'scale-110 text-white' : 'text-[#8D5B68]'
                  )}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#C2185B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] leading-tight tracking-tight z-10 font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
