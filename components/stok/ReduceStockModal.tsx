'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, AlertTriangle, Layers, Info, Check } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { getCategoryUnitGroup, UNIT_GROUP_CONFIG, UnitGroupType, formatNumber } from '@/lib/utils';

interface ReduceStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialCategoryName?: string;
  initialMaterialId?: string;
  initialMaterialName?: string;
}

export function ReduceStockModal({
  isOpen,
  onClose,
  initialCategoryId,
  initialCategoryName,
  initialMaterialId,
  initialMaterialName,
}: ReduceStockModalProps) {
  const { categories, rawMaterials, reduceCategoryStock, showToast } = useStore();

  const materialCategories = categories.filter((c) => c.type === 'material');

  const [categoryId, setCategoryId] = useState<string>('');
  const [materialId, setMaterialId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>(1);
  const [unit, setUnit] = useState<string>('kg');
  const [reason, setReason] = useState<string>('Dipakai produksi / masak dapur');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Kunci kategori jika dibuka dari kartu kategori atau bahan spesifik
  const isLockedCategory = Boolean(initialCategoryId || initialMaterialId);

  const currentCategory = categories.find((c) => c.id === categoryId);
  const currentCategoryName = initialCategoryName || currentCategory?.name || 'Bahan Baku';
  const unitGroup: UnitGroupType = getCategoryUnitGroup(currentCategory);
  const groupConfig = UNIT_GROUP_CONFIG[unitGroup];
  const availableUnits = groupConfig.units;
  const baseUnit = groupConfig.baseUnit;

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setAmount(1);
      const catId = initialCategoryId || materialCategories[0]?.id || '';
      setCategoryId(catId);
      setMaterialId(initialMaterialId || '');
      const catObj = categories.find((c) => c.id === catId);
      const grp = getCategoryUnitGroup(catObj);
      setUnit(UNIT_GROUP_CONFIG[grp].units[0].id);
      setReason('Dipakai produksi / masak dapur');
    }
  }, [isOpen, initialCategoryId, initialMaterialId]);

  if (!isOpen) return null;

  // Daftar bahan baku dalam kategori yang dipilih
  const materialsInCat = rawMaterials.filter(
    (m) =>
      (categoryId && m.categoryId === categoryId) ||
      m.category.toLowerCase().trim() === currentCategoryName.toLowerCase().trim()
  );

  // Bahan baku terpilih
  const selectedMaterial =
    rawMaterials.find((m) => m.id === materialId) ||
    (materialsInCat.length > 0 ? materialsInCat[0] : null);

  const availableStock = selectedMaterial ? Number(selectedMaterial.stock) : 0;

  // Konversi satuan
  const amountNum = Number(amount) || 0;
  let finalAmount = amountNum;

  if (unitGroup === 'weight') {
    finalAmount = unit === 'gr' ? Number((amountNum / 1000).toFixed(3)) : amountNum;
  } else if (unitGroup === 'volume') {
    finalAmount = unit === 'ml' ? Number((amountNum / 1000).toFixed(3)) : amountNum;
  } else {
    finalAmount = amountNum;
  }

  const isExceeding = finalAmount > availableStock;
  const remainingAfter = Math.max(0, Number((availableStock - finalAmount).toFixed(3)));

  const handleSelectCategory = (newCatId: string) => {
    setCategoryId(newCatId);
    setMaterialId('');
    const newCat = categories.find((c) => c.id === newCatId);
    const newGrp = getCategoryUnitGroup(newCat);
    const newUnits = UNIT_GROUP_CONFIG[newGrp].units;
    if (!newUnits.some((u) => u.id === unit)) {
      setUnit(newUnits[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalAmount || finalAmount <= 0) {
      setErrorMsg('Jumlah pengurangan harus lebih dari 0.');
      return;
    }

    if (finalAmount > availableStock) {
      setErrorMsg(`⚠️ Peringatan: Jumlah pengurangan (${finalAmount} ${baseUnit}) melebihi sisa stok aktif (${availableStock} ${baseUnit}).`);
      return;
    }

    const targetId = selectedMaterial?.id || categoryId || currentCategoryName;

    const res = reduceCategoryStock(
      targetId,
      finalAmount,
      reason.trim()
    );

    if (res.success) {
      showToast(res.message);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#F8BBD0]/50 flex items-center justify-between bg-gradient-to-r from-[#FFEBEF]/70 to-white">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#C2185B] text-white shadow-xs">
              <Minus className="w-5 h-5 stroke-[3]" />
            </span>
            <div>
              <h3 className="font-black text-lg text-[#311B1E]">Kurangi Stok Bahan</h3>
              <p className="text-xs text-[#83274E] font-medium">
                Catat pemakaian atau penyusutan stok bahan dapur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#83274E] hover:text-[#311B1E] hover:bg-[#FFEBEF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Warning Pop-up Banner saat jumlah melebihi sisa stok aktif */}
          {isExceeding && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs font-bold space-y-1.5 animate-in shake">
              <div className="flex items-center gap-2 text-rose-700 font-black">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Peringatan: Jumlah Melebihi Sisa Stok!</span>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
                Jumlah yang ingin dikurangi (<strong>{amountNum} {unit}</strong> = <strong>{finalAmount} {baseUnit}</strong>) melebihi sisa stok aktif saat ini (<strong>{availableStock} {baseUnit}</strong>). Stok fisik tidak dapat dikurangi hingga minus.
              </p>
            </div>
          )}

          {/* Kategori Bahan: Terkunci atau Pilihan Universal */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1.5">
              Kategori Bahan Baku
            </label>
            {isLockedCategory ? (
              <div className="p-3 rounded-2xl bg-[#FFEBEF]/40 border border-[#F8BBD0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentCategory && <CategoryIcon name={currentCategory.iconName} className="w-4 h-4 text-[#C2185B]" />}
                  <span className="text-xs font-black text-[#311B1E]">{currentCategoryName}</span>
                </div>
                <span className="text-[11px] font-bold text-[#83274E]">
                  Tersisa: <strong className="text-[#311B1E]">{availableStock} {baseUnit}</strong>
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <select
                  value={categoryId}
                  onChange={(e) => handleSelectCategory(e.target.value)}
                  className="w-full bg-[#FFEBEF]/30 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
                >
                  {materialCategories.map((c) => {
                    const mat = rawMaterials.find((m) => m.categoryId === c.id || m.category === c.name);
                    const s = mat ? mat.stock : 0;
                    const u = mat?.unit || UNIT_GROUP_CONFIG[getCategoryUnitGroup(c)].baseUnit;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} (Tersedia: {s} {u})
                      </option>
                    );
                  })}
                </select>
                <div className="flex items-center justify-between text-[10px] text-[#83274E] pt-0.5">
                  <span>Stok saat ini: <strong className="text-[#311B1E]">{availableStock} {baseUnit}</strong></span>
                  <span className="bg-[#FFEBEF] text-[#C2185B] px-2 py-0.5 rounded-full font-bold">
                    Grup: {groupConfig.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pilihan Merek Bahan Baku */}
          {materialsInCat.length > 1 ? (
            <div>
              <label className="block text-xs font-black text-[#311B1E] mb-1.5">
                Pilih Merek / Varian Bahan Baku
              </label>
              <select
                value={selectedMaterial?.id || ''}
                onChange={(e) => setMaterialId(e.target.value)}
                className="w-full bg-[#FFEBEF]/30 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
              >
                {materialsInCat.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — Tersedia: {m.stock} {m.unit}
                  </option>
                ))}
              </select>
            </div>
          ) : selectedMaterial?.name && selectedMaterial.name !== currentCategoryName ? (
            <div className="px-3 py-2 rounded-xl bg-[#FFEBEF]/60 border border-[#F8BBD0] text-[#311B1E] text-xs font-bold flex items-center justify-between">
              <span className="text-[#83274E]">Merek Bahan:</span>
              <span className="font-black text-[#311B1E]">{selectedMaterial.name}</span>
            </div>
          ) : null}

          {/* Berat / Jumlah Pengurangan & Satuan */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[#311B1E] mb-1">
                  Jumlah yang Dikurangi
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Contoh: 0.5"
                  className="w-full bg-[#FFEBEF]/30 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-[#311B1E] mb-1">
                  Satuan Ukuran
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-[#FFEBEF]/30 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
                >
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Konversi Pintar Gram -> Kg / Ml -> Liter */}
            {unitGroup === 'weight' && unit === 'gr' && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FFEBEF] border border-[#F8BBD0] text-[11px] text-[#C2185B] font-bold flex items-center justify-between">
                <span>🔄 Konversi Sistem:</span>
                <span className="text-xs font-black">-{finalAmount} kg</span>
              </div>
            )}
            {unitGroup === 'volume' && unit === 'ml' && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FFEBEF] border border-[#F8BBD0] text-[11px] text-[#C2185B] font-bold flex items-center justify-between">
                <span>🔄 Konversi Sistem:</span>
                <span className="text-xs font-black">-{finalAmount} liter</span>
              </div>
            )}
            {!isExceeding && finalAmount > 0 && (
              <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center justify-between">
                <span>Sisa stok setelah pengurangan:</span>
                <span className="font-black text-emerald-900">{remainingAfter} {baseUnit}</span>
              </div>
            )}
          </div>

          {/* Keterangan / Alasan Pengurangan */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1">
              Keterangan / Alasan Pengurangan
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Dipakai buat 30 roti sobek, tumpah, expired"
              className="w-full bg-[#FFEBEF]/30 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
            />
          </div>

          {/* Catatan Transparan Ke Mana Data Akan Pergi */}
          <div className="p-3.5 rounded-2xl bg-[#FFEBEF]/50 border border-[#F8BBD0] text-xs text-[#311B1E] space-y-1">
            <div className="flex items-center gap-1.5 font-black text-[11px] text-[#C2185B]">
              <Info className="w-3.5 h-3.5" />
              <span>Informasi Aliran Data:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#311B1E]/90 font-medium">
              Pengurangan stok ini akan memotong saldo inventaris kategori <strong>{currentCategoryName}</strong> sebanyak <strong>{finalAmount} {baseUnit}</strong> di database Supabase.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-[#F8BBD0]/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#F8BBD0] text-xs font-black text-[#83274E] hover:bg-[#FFEBEF]/40"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isExceeding}
              className={`px-5 py-2.5 rounded-2xl text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 ${
                isExceeding
                  ? 'bg-rose-300 cursor-not-allowed shadow-none'
                  : 'bg-[#C2185B] hover:bg-[#AD1457] shadow-[#C2185B]/20 active:scale-95'
              }`}
            >
              <Minus className="w-4 h-4 stroke-[3]" />
              <span>Simpan Pengurangan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
