'use client';

import React, { useState } from 'react';
import { Receipt, X, Check, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { categories, finishedProducts, recordProductSale } = useStore();

  const productCategories = categories.filter((c) => c.type === 'product');

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [category, setCategory] = useState<string>('Penjualan Toko');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Calculator helper
  const [calcUnitPrice, setCalcUnitPrice] = useState('');
  const [calcPcs, setCalcPcs] = useState('');

  if (!isOpen) return null;

  const selectedProduct = finishedProducts.find((p) => p.id === selectedProductId);
  const readyProducts = finishedProducts.filter((p) => p.stock > 0);
  const parsedQty = Number(calcPcs) || parseInt(quantity) || 0;
  const exceedsStock = Boolean(selectedProduct && parsedQty > selectedProduct.stock);

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    setErrorMsg(null);
    if (!prodId) {
      setCategory('Penjualan Toko');
      return;
    }

    const prod = finishedProducts.find((p) => p.id === prodId);
    if (prod) {
      setCategory(prod.category || 'Penjualan Toko');
      setDescription(`Penjualan ${prod.name}`);
      if (prod.sellingPrice > 0) {
        setCalcUnitPrice(String(prod.sellingPrice));
      }
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setCategory('Penjualan Toko');
    setAmount('');
    setQuantity('');
    setCalcUnitPrice('');
    setCalcPcs('');
    setDescription('');
    setErrorMsg(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedProduct && parsedQty <= 0) {
      setErrorMsg(`Isi jumlah ${selectedProduct.name} yang terjual.`);
      return;
    }

    const finalQuantity = quantity.trim() || (calcPcs ? `${calcPcs} ${selectedProduct?.unit || 'pcs'}` : undefined);

    // Validasi stok & pengurangan stok produk dilakukan terpusat di store (Manajemen Stok)
    const res = recordProductSale({
      productId: selectedProductId || undefined,
      qty: parsedQty,
      amount: Number(amount),
      category,
      description,
      paymentMethod: 'Tunai',
      quantityLabel: finalQuantity,
    });

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    resetForm();
    onClose();
    onSuccess?.(res.message);
  };

  const calculatedTotal =
    calcUnitPrice && calcPcs ? Number(calcUnitPrice) * Number(calcPcs) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#C2185B]/10 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#F8BBD0]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#FFEBEF] text-[#C2185B]">
              <Receipt className="w-4 h-4 text-[#C2185B]" />
            </span>
            <h3 className="font-black text-[#311B1E] text-base">Catat Transaksi Penjualan</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#FFEBEF] text-[#8D5B68] flex items-center justify-center hover:bg-[#F8BBD0]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Catatan Aliran Data */}
        <div className="p-3 rounded-2xl bg-[#FFEBEF]/60 border border-[#F8BBD0] text-[#8D5B68] text-xs flex items-center gap-2 font-medium">
          <span className="text-base shrink-0">💡</span>
          <span>
            <strong className="text-[#311B1E]">Informasi:</strong> Harga jual diatur di sini, dan stok produk jadi yang dipilih otomatis berkurang saat transaksi disimpan.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Pilih Produk Jadi Ready (Untuk Pengurangan Stok Otomatis) */}
          {finishedProducts.length > 0 && (
            <div>
              <label className="block text-xs font-black text-[#311B1E] mb-1 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>Pilih Produk Ready (Stok Terpotong Otomatis)</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
              >
                <option value="">-- Pilih Produk Ready (Opsional) --</option>
                {readyProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.category} (Ready: {p.stock} {p.unit})
                  </option>
                ))}
              </select>
              {readyProducts.length === 0 && (
                <p className="mt-1 text-[11px] text-[#C2185B] font-semibold">
                  Semua stok produk saat ini sedang kosong (0 pcs).
                </p>
              )}
              {selectedProduct && (
                <div
                  className={`mt-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    exceedsStock
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span>Sisa Stok Tersedia:</span>
                  <span className="font-black">
                    {selectedProduct.stock} {selectedProduct.unit}
                    {parsedQty > 0 && !exceedsStock && (
                      <span className="font-semibold"> → sisa {selectedProduct.stock - parsedQty}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Kategori Penjualan */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-black text-[#311B1E]">
                Kategori Penjualan
              </label>
              {selectedProduct && (
                <span className="text-[10px] font-bold text-[#C2185B] bg-[#FFEBEF] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#F8BBD0]">
                  🔒 Terkunci (Mengikuti Produk)
                </span>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={Boolean(selectedProductId)}
              className={`w-full border-2 rounded-2xl px-3 py-2.5 text-xs font-bold focus:outline-none transition-all ${
                selectedProductId
                  ? 'bg-stone-100 border-[#F8BBD0] text-stone-600 cursor-not-allowed opacity-90'
                  : 'bg-[#FFEBEF]/40 border-[#F8BBD0] focus:border-[#C2185B] text-[#311B1E]'
              }`}
            >
              {category && !productCategories.some((cat) => cat.name === category) && category !== 'Penjualan Toko' && category !== 'Pesanan Khusus / Katering' && category !== 'Lainnya' && (
                <option value={category}>{category}</option>
              )}
              <option value="Penjualan Toko">Penjualan Toko (Umum)</option>
              {productCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
              <option value="Pesanan Khusus / Katering">Pesanan Khusus / Katering</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            {selectedProduct && (
              <p className="mt-1 text-[10px] text-[#8D5B68] font-medium">
                Kategori terkunci otomatis sesuai produk <strong>{selectedProduct.name}</strong> ({selectedProduct.category}).
              </p>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1">
              Keterangan Transaksi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Penjualan Roti Abon, pesanan katering"
              className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none placeholder-[#8D5B68]"
            />
          </div>

          {/* Jumlah / Kuantitas Barang */}
          <div>
            <label className="block text-xs font-black text-[#311B1E] mb-1">
              Jumlah / Kuantitas {selectedProduct ? `(${selectedProduct.unit})` : 'Barang'}
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val);
                const num = parseInt(val);
                if (!isNaN(num)) {
                  setCalcPcs(String(num));
                  if (calcUnitPrice) {
                    const tot = Number(calcUnitPrice) * num;
                    if (tot > 0) setAmount(String(tot));
                  }
                }
              }}
              placeholder={selectedProduct ? `Contoh: 5 ${selectedProduct.unit}` : 'Contoh: 5 pcs, 2 box'}
              className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none placeholder-[#8D5B68]"
            />
          </div>

          {/* Total Penjualan & Kalkulator Cepat */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-black text-[#311B1E] mb-1">
                Total Nominal Penjualan (Rp) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 50000"
                className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-sm text-[#311B1E] font-black focus:outline-none"
              />

              {/* Live Standard Rupiah Preview */}
              {amount && Number(amount) > 0 ? (
                <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-[#FFEBEF] border border-[#F8BBD0] text-xs font-bold text-[#C2185B] flex items-center justify-between">
                  <span className="text-[11px] text-[#8D5B68] font-medium">Nominal Standar:</span>
                  <span className="font-black text-sm text-[#C2185B]">{formatRupiah(Number(amount))}</span>
                </div>
              ) : null}
            </div>

            {/* Bantuan Hitung Cepat (Harga Satuan × Pcs) */}
            <div className="p-3 rounded-2xl bg-[#FFEBEF]/30 border border-[#F8BBD0] space-y-1.5">
              <span className="text-[10px] font-bold text-[#8D5B68] uppercase tracking-wide block">
                Atur Harga Jual & Hitung Otomatis:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-[#8D5B68] font-bold block">Harga per Item (Rp)</span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={calcUnitPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcUnitPrice(val);
                      if (val && calcPcs) {
                        const tot = Number(val) * Number(calcPcs);
                        if (tot > 0) setAmount(String(tot));
                      }
                    }}
                    placeholder="10000"
                    className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-2.5 py-1.5 text-xs text-[#311B1E] font-bold focus:outline-none mt-0.5"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#8D5B68] font-bold block">Jumlah Qty</span>
                  <input
                    type="number"
                    min="0"
                    value={calcPcs}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCalcPcs(val);
                      if (!quantity || !isNaN(Number(quantity))) {
                        setQuantity(val ? `${val} ${selectedProduct?.unit || 'pcs'}` : '');
                      }
                      if (val && calcUnitPrice) {
                        const tot = Number(calcUnitPrice) * Number(val);
                        if (tot > 0) setAmount(String(tot));
                      }
                    }}
                    placeholder="5"
                    className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-2.5 py-1.5 text-xs text-[#311B1E] font-bold focus:outline-none mt-0.5"
                  />
                </div>
              </div>
              {calculatedTotal > 0 && (
                <p className="text-[11px] text-[#C2185B] font-bold mt-1 text-right flex items-center justify-end gap-1">
                  <span>💡 Terhitung otomatis:</span>
                  <span className="font-black">{formatRupiah(calculatedTotal)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Pesan Validasi */}
          {(errorMsg || exceedsStock) && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {errorMsg ||
                  `Jumlah melebihi stok! ${selectedProduct?.name} hanya tersedia ${selectedProduct?.stock} ${selectedProduct?.unit}.`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#F8BBD0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-2xl border border-[#F8BBD0] text-xs font-black text-[#8D5B68] hover:bg-[#FFEBEF]/40 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={exceedsStock}
              className="px-5 py-2.5 rounded-2xl bg-[#C2185B] hover:bg-[#AD1457] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black shadow-md shadow-[#C2185B]/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
