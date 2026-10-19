'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Boxes, Edit2, Trash2, PackageX, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';
import { Category, RawMaterial } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, getItemMinStock } from '@/lib/utils';

export function getMaterialStatus(m: RawMaterial, minStock: number): 'out' | 'low' | 'safe' {
  if (m.stock <= 0) return 'out';
  if (m.stock <= minStock) return 'low';
  return 'safe';
}

interface MaterialListProps {
  materials: RawMaterial[];
  categories: Category[];
  onEdit: (m: RawMaterial) => void;
  onDelete: (m: RawMaterial) => void;
  onReduce: (m: RawMaterial) => void;
  onAdd: () => void;
}

const STATUS_STYLE = {
  out: {
    card: 'border-rose-400 bg-gradient-to-b from-white to-rose-50/70',
    badge: 'bg-rose-100 text-rose-700 border-rose-300 font-black',
    stock: 'text-rose-600',
    label: 'Kritis (Habis)',
    Icon: PackageX,
  },
  low: {
    card: 'border-amber-300 bg-gradient-to-b from-white to-amber-50/60',
    badge: 'bg-amber-100 text-amber-800 border-amber-200 font-black',
    stock: 'text-amber-700',
    label: 'Kritis (Menipis)',
    Icon: AlertTriangle,
  },
  safe: {
    card: 'border-[#F8BBD0] bg-white/95',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-black',
    stock: 'text-[#2E7D32]',
    label: 'Aman',
    Icon: CheckCircle2,
  },
} as const;

export function MaterialList({
  materials,
  categories,
  onEdit,
  onDelete,
  onReduce,
  onAdd,
}: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/90 backdrop-blur-md border border-[#F8BBD0]">
        <Boxes className="w-12 h-12 text-[#BCAAA4] mx-auto mb-3 opacity-60" />
        <h3 className="font-black text-[#311B1E] text-base">Belum ada bahan baku yang cocok</h3>
        <p className="text-xs text-[#8D5B68] mt-1">
          Input bahan baku dapur baru atau sesuaikan kata kunci pencarian & filter kategori.
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white text-xs font-black shadow-md shadow-[#C2185B]/25 active:scale-95 transition-all"
        >
          + Tambah Bahan Baku
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
      <AnimatePresence initial={false}>
        {materials.map((m) => {
          const minStock = getItemMinStock(m, categories);
          const status = getMaterialStatus(m, minStock);
          const style = STATUS_STYLE[status];
          const cat = categories.find((c) => c.id === m.categoryId);

          return (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group p-3 sm:p-4 rounded-2xl sm:rounded-3xl backdrop-blur-md border shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${style.card}`}
            >
              <div>
                {/* 1. Header Kartu: Kategori Pemberitahuan & Aksi Edit/Delete */}
                <div className="flex items-start justify-between gap-1">
                  <span
                    className={`text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-xl flex items-center gap-1 truncate max-w-[75%] ${
                      cat ? `${cat.bgColor} ${cat.textColor}` : 'bg-stone-100 text-stone-600'
                    }`}
                    title={`Kategori: ${cat?.name || m.category}`}
                  >
                    {cat && <CategoryIcon name={cat.iconName} className="w-3 h-3 shrink-0" />}
                    <span className="truncate">{cat?.name || m.category}</span>
                  </span>

                  <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      id={`edit-material-${m.id}`}
                      onClick={() => onEdit(m)}
                      className="p-1 rounded-md text-[#8D5B68] hover:text-[#311B1E] hover:bg-[#FFEBEF]"
                      title="Ubah Bahan"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      id={`delete-material-${m.id}`}
                      onClick={() => onDelete(m)}
                      className="p-1 rounded-md text-[#8D5B68] hover:text-rose-600 hover:bg-rose-50"
                      title="Hapus Bahan"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2. Nama Merek / Jenis Bahan Baku */}
                <h4
                  className="font-black text-xs sm:text-sm text-[#311B1E] mt-2 truncate"
                  title={m.name}
                >
                  {m.name}
                </h4>

                {/* 3. Status Badge & Min Stock */}
                <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                  <span
                    className={`px-1.5 py-0.5 rounded-full font-black border text-[9px] sm:text-[10px] ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="text-[#8D5B68] font-medium text-[9px] sm:text-[10px]">
                    Min: {minStock} {m.unit}
                  </span>
                </div>

                {/* 4. Total Persediaan Stok */}
                <div className="mt-2.5 p-2 rounded-xl bg-[#FFEBEF]/40 border border-[#F8BBD0]">
                  <span className="text-[9px] font-bold text-[#8D5B68] block">
                    Stok Tersedia
                  </span>
                  <p className={`text-sm sm:text-lg font-black mt-0.5 ${style.stock}`}>
                    {m.stock}{' '}
                    <span className="text-xs font-semibold text-[#8D5B68]">{m.unit}</span>
                  </p>
                  {m.costPerUnit > 0 && (
                    <span className="text-[9px] text-[#8D5B68] font-medium block truncate mt-0.5">
                      Beli: {formatRupiah(m.costPerUnit)}/{m.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* 5. Aksi Kurangi Stok Bahan */}
              <div className="mt-3 pt-2.5 border-t border-[#F8BBD0]/80">
                <button
                  type="button"
                  id={`reduce-material-${m.id}`}
                  onClick={() => onReduce(m)}
                  className="w-full py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition-all"
                >
                  <Minus className="w-3 h-3 stroke-[3]" />
                  <span>Kurangi Stok</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
