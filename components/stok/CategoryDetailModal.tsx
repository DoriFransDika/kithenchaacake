'use client';

import React from 'react';
import { X, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Category, RawMaterial, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  items: (RawMaterial | FinishedProduct)[];
  type: 'material' | 'product';
}

export function CategoryDetailModal({
  isOpen,
  onClose,
  category,
  items,
  type,
}: CategoryDetailModalProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#F8BBD0]/60 flex items-center justify-between bg-gradient-to-r from-[#FFEBEF]/70 to-white">
          <div className="flex items-center gap-3">
            <span className={`p-2.5 rounded-2xl border ${category.bgColor} ${category.textColor} border-[#F8BBD0] flex items-center justify-center`}>
              <CategoryIcon name={category.iconName} className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-[#311B1E]">Detail Kategori: {category.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#F8BBD0] text-[#83274E]">
                  {type === 'material' ? 'Bahan Baku Dapur' : 'Produk Jadi Ready'}
                </span>
              </div>
              <p className="text-xs text-[#83274E] font-medium mt-0.5">
                Daftar rincian total stok individu per produk ({items.length} item)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#83274E] border border-[#F8BBD0] flex items-center justify-center hover:bg-[#FFEBEF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Products / Materials with Individual Stock Counts */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-10 text-[#83274E]">
              <Layers className="w-10 h-10 mx-auto text-[#F8BBD0] opacity-70 mb-2" />
              <p className="font-bold text-xs">Belum ada barang dalam kategori ini.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isLow = !isOutOfStock && item.stock <= item.minStock;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isOutOfStock
                        ? 'bg-rose-50/60 border-rose-200'
                        : isLow
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-[#FFEBEF]/25 border-[#F8BBD0]/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#311B1E] truncate">
                          {item.name}
                        </h4>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 shrink-0 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Kritis
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Aman
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#83274E] font-medium mt-0.5">
                        Min. Stok Aman: {item.minStock} {item.unit}
                      </p>
                    </div>

                    {/* Total Stok Individu Per Produk */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-[#83274E] block">Total Stok</span>
                      <p
                        className={`text-sm sm:text-base font-black ${
                          isOutOfStock ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-[#2E7D32]'
                        }`}
                      >
                        {item.stock}{' '}
                        <span className="text-xs font-semibold text-[#83274E]">{item.unit}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#F8BBD0]/60 bg-[#FFEBEF]/40 flex items-center justify-between">
          <div className="text-xs text-[#83274E]">
            Total Produk:{' '}
            <strong className="text-[#311B1E] font-black">{items.length} varian</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C2185B] text-white text-xs font-black hover:bg-[#AD1457] shadow-sm transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
