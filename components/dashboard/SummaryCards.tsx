'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { formatRupiah, formatNumber } from '@/lib/utils';

export function SummaryCards() {
  const { summary } = useStore();

  const cards = [
    {
      title: 'Masuk',
      amount: formatRupiah(summary.totalIncome),
      href: '/keuangan',
      icon: ArrowUpRight,
      bgGradient: 'from-white to-[#F1F8E9]',
      borderColor: 'border-[#DCEDC8]',
      iconBg: 'bg-[#E8F5E9] text-[#2E7D32]',
      accentColor: 'text-[#2E7D32]',
    },
    {
      title: 'Keluar',
      amount: formatRupiah(summary.totalExpense),
      href: '/keuangan',
      icon: ArrowDownRight,
      bgGradient: 'from-white to-[#FCE4EC]/60',
      borderColor: 'border-[#F8BBD0]',
      iconBg: 'bg-[#FCE4EC] text-[#C2185B]',
      accentColor: 'text-[#C2185B]',
    },
    {
      title: 'Laba',
      amount: formatRupiah(summary.netProfit),
      href: '/keuangan',
      icon: Wallet,
      bgGradient: 'from-white to-[#FFF5F7]',
      borderColor: 'border-[#F8BBD0]',
      iconBg: 'bg-[#FFEBEF] text-[#C2185B]',
      accentColor: 'text-[#C2185B]',
    },
    {
      title: 'Stok',
      amount: `${formatNumber(summary.readyProductsCount)} Pcs`,
      href: '/stok',
      icon: ShoppingBag,
      bgGradient: 'from-white to-[#FFEBEF]',
      borderColor: 'border-[#F8BBD0]',
      iconBg: 'bg-[#FFEBEF] text-[#C2185B]',
      accentColor: 'text-[#C2185B]',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Link key={idx} href={card.href} className="block group">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br ${card.bgGradient} border border-[#F8BBD0] hover:${card.borderColor} text-[#311B1E] shadow-xs relative overflow-hidden transition-all duration-150 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#6D4C41] truncate">
                  {card.title}
                </span>
                <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} shadow-2xs`}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <p className={`text-[11px] sm:text-base lg:text-lg font-black tracking-tight ${card.accentColor} truncate`}>
                  {card.amount}
                </p>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
