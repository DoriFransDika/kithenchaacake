'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Boxes,
  ArrowRight,
  TrendingUp,
  Receipt,
  Heart
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { NotificationPanel } from '@/components/dashboard/NotificationPanel';
import { TransactionModal } from '@/components/keuangan/TransactionModal';
import { ItemModal } from '@/components/stok/ItemModal';
import { formatRupiah, cleanTrxDescription } from '@/lib/utils';
import { Check } from 'lucide-react';

import { AuthGuard } from '@/components/auth/AuthGuard';

export default function DashboardPage() {
  const { transactions } = useStore();

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat text-[#311B1E] flex flex-col md:flex-row font-sans">
      {/* Sidebar for Tablet / Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        {/* Header */}
        <Header />

        <main className="p-3 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 max-w-7xl w-full mx-auto">
          {/* Welcome Banner - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#F8BBD0] shadow-xs relative overflow-hidden"
          >
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shadow-xs border-2 border-[#C2185B] bg-white p-0.5 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo Kitchen Chaacake"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-full"
                  priority
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-lg font-black text-[#311B1E] tracking-tight truncate">
                    Kitchen Chaacake
                  </h2>
                  <span className="text-[#2E7D32] font-black text-[9px] sm:text-[10px] bg-[#E8F5E9] px-2 py-0.2 rounded-full border border-[#C8E6C9] shrink-0">
                    Buka
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-[#8D5B68] font-medium truncate">
                  Manajemen Toko & Buku Kas Kue • Kerinci
                </p>
              </div>
            </div>

            {/* Action Bar Pills - Consistent Styling */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 relative z-10 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-[#311B1E] hover:bg-[#1E0F12] text-white text-xs font-black active:scale-95 transition-all shadow-md shadow-[#311B1E]/20"
              >
                <Receipt className="w-3.5 h-3.5 stroke-[2.5] shrink-0 text-[#F48FB1]" />
                <span>Transaksi</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddMaterialOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] hover:brightness-105 text-white text-xs font-black active:scale-95 transition-all shadow-md shadow-[#C2185B]/25"
              >
                <Boxes className="w-3.5 h-3.5 text-white stroke-[2.5] shrink-0" />
                <span>Tambah Stok</span>
              </button>
            </div>
          </motion.div>

          {/* Floating Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#311B1E] text-white text-xs font-black shadow-xl border border-[#C2185B]"
              >
                <Check className="w-4 h-4 text-[#C2185B]" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bagian Atas: 4 Kotak Metrik Utama (Grid 2 Kolom di HP) */}
          <SummaryCards />

          {/* Bagian Tengah & Kanan: Grid Grafik & Panel Notifikasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Center Area: Sales Chart & Recent Transactions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grafik Penjualan Recharts */}
              <SalesChart />

              {/* Mutasi Keuangan Kasir & Dapur */}
              <div className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-sm sm:shadow-lg shadow-[#C2185B]/5">
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#F8BBD0]">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                      <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                    <h3 className="font-black text-sm sm:text-base text-[#311B1E]">Mutasi Keuangan Terkini</h3>
                  </div>
                  <Link
                    href="/keuangan"
                    className="text-[11px] sm:text-xs font-black text-[#C2185B] hover:text-[#AD1457] flex items-center gap-1 group"
                  >
                    <span>Buku Kas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                  {transactions.slice(0, 5).map((trx) => (
                    <div
                      key={trx.id}
                      className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 border border-[#F8BBD0] flex items-center justify-between gap-2.5 text-xs hover:border-[#C2185B] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${
                            trx.type === 'income' ? 'bg-[#2E7D32]' : 'bg-[#C2185B]'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="font-black text-[#311B1E] text-xs sm:text-sm truncate">
                            {cleanTrxDescription(trx.description)}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-[#8D5B68] mt-0.5 font-medium truncate">
                            {trx.date} • {trx.category} • <span className="text-[#311B1E] font-bold">{trx.paymentMethod}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-xs sm:text-sm ${
                            trx.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                          }`}
                        >
                          {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian Samping/Kanan: Panel Notifikasi Real-Time */}
            <div className="lg:col-span-1">
              <NotificationPanel />
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile (HP) */}
      <BottomNav />

      {/* Action Modals */}
      <TransactionModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
      <ItemModal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
        mode="material"
      />
    </div>
    </AuthGuard>
  );
}
