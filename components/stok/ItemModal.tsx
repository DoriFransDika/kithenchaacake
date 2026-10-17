'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Boxes, Croissant, AlertTriangle, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Category, RawMaterial, FinishedProduct } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { formatRupiah, getCategoryUnitGroup, UNIT_GROUP_CONFIG, UnitGroupType } from '@/lib/utils';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'material' | 'product';
  itemToEdit?: RawMaterial | FinishedProduct | null;
  onSuccess?: (msg: string) => void;
}

export function ItemModal({ isOpen, onClose, mode, itemToEdit, onSuccess }: ItemModalProps) {
  const { categories, finishedProducts, addNewMaterial, updateMaterial, updateProduct, addReadyProductStock } = useStore();

  const isMaterial = mode === 'material';
  const isEditing = Boolean(itemToEdit);

  const availableCategories = categories.filter((c) =>
    isMaterial ? c.type === 'material' : c.type === 'product'
  );

  // Common fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState<number | string>(1);
  const [minStock, setMinStock] = useState<number | string>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Satuan input dinamis sesuai grup kategori (bahan baku). Produk ready dikunci "pcs".
  const [inputUnit, setInputUnit] = useState<string>('kg');

  // Material specific: Total harga beli untuk pencatatan otomatis keuangan
  const [totalCost, setTotalCost] = useState<number | string>('');

  const currentCategory = categories.find((c) => c.id === categoryId) || availableCategories[0];
  const unitGroup: UnitGroupType = isMaterial ? getCategoryUnitGroup(currentCategory) : 'count';
  const groupConfig = UNIT_GROUP_CONFIG[unitGroup];
  const availableUnits = groupConfig.units;

  useEffect(() => {
    setErrorMsg(null);
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategoryId(itemToEdit.categoryId);
      setStock(itemToEdit.stock);
      setMinStock(isMaterial ? itemToEdit.minStock : 5);

      if ('costPerUnit' in itemToEdit) {
        const cat = categories.find((c) => c.id === itemToEdit.categoryId);
        const grp = getCategoryUnitGroup(cat);
        const validUnits = UNIT_GROUP_CONFIG[grp].units;
        const matched = validUnits.find((u) => u.id === itemToEdit.unit);
        setInputUnit(matched ? matched.id : validUnits[0].id);
        setTotalCost(Math.round(itemToEdit.costPerUnit * itemToEdit.stock) || '');
      }
    } else {
      const initialCat = availableCategories[0];
      const initialGroup = isMaterial ? getCategoryUnitGroup(initialCat) : 'count';
      setName('');
      setCategoryId(initialCat?.id || '');
      setStock(isMaterial ? 1 : '');
      setMinStock(isMaterial ? 1 : 5);
      setInputUnit(UNIT_GROUP_CONFIG[initialGroup].units[0].id);
      setTotalCost('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemToEdit, isOpen, mode]);

  if (!isOpen) return null;

  // Konversi Cerdas Sesuai Grup Satuan:
  // - Berat: gr -> kg (/ 1000)
  // - Volume: ml -> liter (/ 1000)
  // - Unit/Hitung: nilai tetap sesuai satuan pilihan
  const stockNum = Number(stock) || 0;
  const finalStock = stockNum;
  const savedUnit: RawMaterial['unit'] = (inputUnit as RawMaterial['unit']) || 'kg';

  const handleSelectCategory = (newCatId: string) => {
    setCategoryId(newCatId);
    const newCat = categories.find((c) => c.id === newCatId);
    const newGroup = isMaterial ? getCategoryUnitGroup(newCat) : 'count';
    const newUnits = UNIT_GROUP_CONFIG[newGroup].units;
    setInputUnit(newUnits[0].id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);
    const catObj = availableCategories.find((c) => c.id === categoryId) || availableCategories[0];
    const categoryName = catObj ? catObj.name : (isMaterial ? 'Tepung & Gandum' : 'Roti Manis');

    if (isMaterial) {
      if (!name.trim()) {
        setErrorMsg('Nama merek atau jenis bahan baku wajib diisi (contoh: Tepung Segitiga Biru).');
        return;
      }
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock <= 0) {
        setErrorMsg('Jumlah stok bahan harus angka lebih dari 0.');
        return;
      }

      const parsedTotalCost = Number(totalCost) || 0;
      const calculatedCostPerUnit = finalStock > 0 ? Math.round(parsedTotalCost / finalStock) : 0;

      if (isEditing && itemToEdit) {
        updateMaterial(itemToEdit.id, {
          name: name.trim(),
          category: categoryName,
          categoryId: catObj?.id || categoryId,
          stock: finalStock,
          minStock: Number(minStock) || 1,
          unit: savedUnit,
          costPerUnit: calculatedCostPerUnit,
        });
      } else {
        addNewMaterial(
          {
            name: name.trim(),
            category: categoryName,
            categoryId: catObj?.id || categoryId,
            stock: finalStock,
            minStock: Number(minStock) || 1,
            unit: savedUnit,
            costPerUnit: calculatedCostPerUnit,
          },
          parsedTotalCost
        );
      }
    } else {
      // ===== PRODUK READY: satuan dikunci "pcs", batas warning otomatis dikunci 5 pcs =====
      const qty = Number(stock);
      const min = 5; // Batas warning dikunci di 5 pcs
      if (!catObj) {
        setErrorMsg('Belum ada kategori produk. Buat dulu di menu Kelola Kategori.');
        return;
      }
      if (!name.trim()) {
        setErrorMsg('Nama produk wajib diisi.');
        return;
      }
      if (!Number.isInteger(qty) || qty < (isEditing ? 0 : 1)) {
        setErrorMsg(isEditing ? 'Jumlah stok harus angka bulat ≥ 0.' : 'Jumlah stok harus angka bulat minimal 1 pcs.');
        return;
      }

      if (isEditing && itemToEdit) {
        const duplicate = finishedProducts.find(
          (p) =>
            p.id !== itemToEdit.id &&
            p.categoryId === catObj.id &&
            p.name.toLowerCase().trim() === name.trim().toLowerCase()
        );
        if (duplicate) {
          setErrorMsg(`Produk "${duplicate.name}" sudah ada di kategori ${catObj.name}.`);
          return;
        }
        updateProduct(itemToEdit.id, {
          name: name.trim(),
          category: catObj.name,
          categoryId: catObj.id,
          stock: qty,
          minStock: 5,
          unit: 'pcs',
        });
        onSuccess?.(`Produk ${name.trim()} berhasil diperbarui.`);
      } else {
        const res = addReadyProductStock({ categoryId: catObj.id, name, stock: qty, minStock: 5 });
        if (!res.success) {
          setErrorMsg(res.message);
          return;
        }
        onSuccess?.(res.message);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#F8BBD0] flex items-center justify-between bg-gradient-to-r from-[#FFF5F7] to-[#FFEBEF]/40">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0] shadow-xs">
              {isMaterial ? <Boxes className="w-5 h-5" /> : <Croissant className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-black text-lg text-[#311B1E]">
                {isEditing
                  ? isMaterial ? 'Ubah Rincian Bahan' : 'Ubah Produk Ready'
                  : isMaterial ? 'Tambah Stok Bahan Baku' : 'Input Stok Produk Ready'}
              </h3>
              <p className="text-xs text-[#8D5B68] font-medium">
                {isMaterial ? 'Catat belanja bahan dapur & simpan pengeluaran kas' : 'Stok keluar otomatis saat transaksi di Keuangan Toko'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8D5B68] hover:text-[#311B1E] hover:bg-[#FFEBEF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Pilihan Kategori */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1.5">
              Pilihan Kategori {isMaterial ? 'Bahan Baku' : 'Produk'}
            </label>
            {availableCategories.length === 0 ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900">
                Belum ada kategori {isMaterial ? 'bahan baku' : 'produk'}. Tambahkan dulu lewat menu{' '}
                <strong>Kelola Kategori</strong>.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-[#FFEBEF]/40 rounded-2xl border border-[#F8BBD0]">
                {availableCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCategory(c.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${isSelected
                          ? 'border-[#C2185B] bg-[#FFEBEF] text-[#C2185B] shadow-xs'
                          : 'border-[#F8BBD0] bg-white text-[#8D5B68] hover:bg-white/80'
                        }`}
                    >
                      <CategoryIcon name={c.iconName} className="w-4 h-4 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nama Merek / Barang */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1.5 flex items-center justify-between">
              <span>{isMaterial ? 'Nama Merek / Bahan' : 'Nama Produk'} <span className="text-rose-600">*</span></span>
              {isMaterial && (
                <span className="text-[10px] text-[#8D5B68] font-medium">Misal: Cakra Kembar, Segitiga Biru, Gulaku</span>
              )}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMaterial ? 'Contoh: Tepung Segitiga Biru, Ragi Saf-Instant' : 'Contoh: Roti Coklat Keju'}
              className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none placeholder-[#8D5B68]"
            />
          </div>

          {/* Stok Awal & Satuan */}
          {isMaterial ? (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#311B1E] mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#311B1E] mb-1">
                    Satuan Ukuran
                  </label>
                  <select
                    value={inputUnit}
                    onChange={(e) => setInputUnit(e.target.value)}
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
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
              <div className="flex items-center justify-between text-[10px] text-[#8D5B68] font-semibold px-1">
                <span>Basis Satuan: <strong className="text-[#311B1E]">{groupConfig.label} ({groupConfig.desc})</strong></span>
                <span className="bg-[#FFEBEF] text-[#C2185B] px-2 py-0.5 rounded-full font-bold border border-[#F8BBD0]">
                  Pilihan: {inputUnit}
                </span>
              </div>
            </div>
          ) : (
            /* Produk Ready: Jumlah + satuan "pcs" terkunci (Batas warning otomatis terkunci di 5 pcs) */
            <div className="space-y-1.5">
              <div>
                <label htmlFor="ready-product-qty" className="block text-xs font-black text-[#311B1E] mb-1">
                  {isEditing ? 'Jumlah Stok Saat Ini' : 'Jumlah Stok Masuk'}
                </label>
                <div className="flex items-stretch rounded-2xl border-2 border-[#F8BBD0] focus-within:border-[#C2185B] bg-[#FFEBEF]/40 overflow-hidden">
                  <input
                    id="ready-product-qty"
                    type="number"
                    inputMode="numeric"
                    min={isEditing ? 0 : 1}
                    step="1"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="flex-1 min-w-0 bg-transparent px-3 py-2 text-xs text-[#311B1E] font-bold focus:outline-none"
                  />
                  <span
                    className="px-3 flex items-center gap-1 bg-[#C2185B] text-white text-[11px] font-black select-none"
                    title="Satuan produk ready dikunci pcs"
                  >
                    <Lock className="w-3 h-3" />
                    pcs
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#8D5B68] font-medium">
                {isEditing
                  ? '💡 Ubah angka stok jika ingin mengoreksi jumlah fisik di etalase.'
                  : '💡 Jika produk dengan nama & kategori yang sama sudah ada, stok akan ditambahkan ke produk tersebut.'}
              </p>
            </div>
          )}

          {/* Kolom Total Biaya Belanja (Khusus Bahan Baku) */}
          {isMaterial && (
            <div>
              <label className="block text-xs font-black text-[#311B1E] mb-1">
                Total Harga Beli / Belanja (Rp)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="Contoh: 35000 (Boleh kosong jika tidak dicatat kas)"
                className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
              />
              {/* Pratinjau Format Rupiah Standar */}
              {totalCost && Number(totalCost) > 0 ? (
                <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-[#FFEBEF] border border-[#F8BBD0] text-xs font-bold text-[#C2185B] flex items-center justify-between">
                  <span className="text-[11px] text-[#8D5B68] font-medium">Nominal Standar:</span>
                  <span className="font-black text-xs text-[#C2185B]">{formatRupiah(Number(totalCost))}</span>
                </div>
              ) : null}
              <p className="text-[10px] text-[#8D5B68] mt-1 font-medium">
                💡 Total belanja ini otomatis dicatat sebagai pengeluaran kas toko ke database.
              </p>
            </div>
          )}

          {/* Pesan Validasi */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#F8BBD0] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-[#F8BBD0] text-xs font-black text-[#8D5B68] hover:bg-[#FFEBEF]/40"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] hover:brightness-105 text-white text-xs font-black shadow-md shadow-[#C2185B]/25 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambahkan Stok'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
