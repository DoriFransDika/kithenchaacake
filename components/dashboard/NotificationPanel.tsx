'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

export function NotificationPanel() {
  const { rawMaterials, finishedProducts, notifications } = useStore();

  const lowMaterials = rawMaterials.filter((m) => m.stock <= m.minStock);
  // Pisahkan produk: stok habis (0 pcs) vs hampir habis (>0, ≤ minStock)
  const outOfStockProducts = finishedProducts.filter((p) => p.stock <= 0);
  const lowStockProducts = finishedProducts.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  const totalAlerts = lowMaterials.length + outOfStockProducts.length + lowStockProducts.length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Critical Stock Warning Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-1.5 sm:border-2 border-[#F8BBD0] text-[#311B1E] shadow-sm sm:shadow-lg shadow-[#C2185B]/5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-[#F8BBD0]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            </span>
            <h3 className="font-black text-xs sm:text-sm text-[#311B1E]">Peringatan Stok</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-full bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
            {totalAlerts} Kritis
          </span>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          {/* 🔴 Produk Stok Habis (0 pcs) — Selalu muncul */}
          {outOfStockProducts.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                Stok Habis (0 pcs):
              </p>
              {outOfStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-rose-50 to-rose-100/70 border border-rose-300 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <p className="font-black text-[#311B1E] text-xs truncate">{prod.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-rose-600 font-bold">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-rose-700">
                      0 {prod.unit}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-rose-500 font-bold">HABIS</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🟡 Produk Hampir Habis (>0, ≤ minStock) */}
          {lowStockProducts.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2 pt-1">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#C2185B] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C2185B]" />
                Etalase Hampir Habis:
              </p>
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#FFEBEF]/60 border border-[#F8BBD0] flex items-center justify-between text-xs gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-black text-[#311B1E] text-xs truncate">{prod.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-[#6D4C41]">
                      Min. {prod.minStock} {prod.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#C2185B]">
                      {prod.stock} {prod.unit}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-[#C2185B] font-bold">Menipis</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 🔴 Bahan Baku Perlu Restock */}
          {lowMaterials.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2 pt-1">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#8D5B68]">
                Bahan Perlu Restock:
              </p>
              {lowMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FFEBEF]/80 to-[#FFF5F7] border border-[#F8BBD0] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#C2185B] animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <p className="font-black text-[#311B1E] text-xs truncate">{mat.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-[#6D4C41]">
                        Min: {mat.minStock} {mat.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#C2185B]">
                      {mat.stock} {mat.unit}
                    </span>
                    <p className="text-[9px] sm:text-[10px] text-[#8D5B68] font-bold">Tersisa</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalAlerts === 0 && (
            <div className="p-3 sm:p-4 text-center text-xs text-[#8D5B68]">
              Semua bahan baku dan produk di etalase dalam batas aman.
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border-1.5 sm:border-2 border-[#F8BBD0] text-[#311B1E] shadow-sm sm:shadow-lg shadow-[#C2185B]/5"
      >
        <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-[#F8BBD0]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2185B]" />
            </span>
            <h3 className="font-black text-xs sm:text-sm text-[#311B1E]">Aktivitas Kitchen Chaacake</h3>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#8D5B68]">Hari Ini</span>
        </div>

        <div className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
          {notifications.slice(0, 5).map((item) => (
            <div key={item.id} className="flex gap-2.5 text-xs">
              <div className="flex flex-col items-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1 ${
                    item.severity === 'warning'
                      ? 'bg-[#C2185B] ring-4 ring-[#FFEBEF]'
                      : item.severity === 'success'
                      ? 'bg-[#2E7D32] ring-4 ring-[#E8F5E9]'
                      : 'bg-[#C2185B] ring-4 ring-[#FFEBEF]'
                  }`}
                />
                <span className="w-0.5 flex-1 bg-[#F8BBD0] my-1" />
              </div>
              <div className="flex-1 pb-1.5 min-w-0">
                <p className="font-black text-[#311B1E] text-xs truncate">{item.title}</p>
                <p className="text-[10px] sm:text-[11px] text-[#5D4037] mt-0.5 leading-relaxed">{item.message}</p>
                <span className="text-[9px] sm:text-[10px] text-[#8D5B68] font-mono mt-0.5 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
