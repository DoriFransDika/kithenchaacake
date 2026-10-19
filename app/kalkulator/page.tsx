'use client';

import React, { useState } from 'react';
import {
  Calculator,
  TrendingUp,
  Percent,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { formatRupiah } from '@/lib/utils';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function CalculatorPage() {
  const { categories } = useStore();

  // Kategori produk jual (opsional)
  const productCategories = categories.filter((c) => c.type === 'product');

  // Input states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<number>(5000);
  const [pcs, setPcs] = useState<number>(20);
  const [totalCost, setTotalCost] = useState<number>(60000);
  const [targetMargin, setTargetMargin] = useState<number>(50);

  // Kalkulasi
  const costPerPcs = pcs > 0 ? Math.round(totalCost / pcs) : 0;
  const rawRecPrice = costPerPcs * (1 + targetMargin / 100);
  const recommendedSellingPrice = costPerPcs > 0 ? Math.ceil(rawRecPrice / 500) * 500 : 0;

  // Laba berdasarkan harga jual saat ini
  const profitPerPcs = sellingPrice - costPerPcs;
  const totalRevenue = sellingPrice * pcs;
  const totalProfit = totalRevenue - totalCost;
  const isProfitable = profitPerPcs >= 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat text-[#311B1E] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        <Header />

        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#F8BBD0] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                  <Calculator className="w-5 h-5 text-[#C2185B]" />
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-[#311B1E] tracking-tight">
                  Kalkulator Untung & Rekomendasi Harga
                </h2>
              </div>
              <p className="text-xs text-[#8D5B68] mt-1 font-medium">
                Hitung modal per pcs, tentukan target untung, dan dapatkan saran harga jual terbaik untuk kue & roti Anda.
              </p>
            </div>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Input Card (7 Kolom) */}
            <div className="lg:col-span-7 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-2 border-[#F8BBD0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F8BBD0]">
                <h3 className="font-black text-sm sm:text-base text-[#311B1E]">
                  Data Modal & Penjualan
                </h3>
                <span className="text-xs font-bold text-[#8D5B68]">
                  Isi formulir sederhana di bawah
                </span>
              </div>

              {/* Pilihan Kategori Produk (Opsional) */}
              <div>
                <label className="block text-xs font-black text-[#311B1E] mb-1.5">
                  Kategori Produk Jadi <span className="text-[10px] text-[#8D5B68] font-normal">(Opsional)</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-4 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none appearance-none"
                  >
                    <option value="">-- Pilih Kategori Produk Jadi (Boleh Kosong) --</option>
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <Layers className="w-4 h-4 text-[#8D5B68] absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Grid 3 Input Utama: Modal Total, Jumlah Pcs, Harga Jual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Total Modal */}
                <div>
                  <label className="block text-xs font-black text-[#311B1E] mb-1.5">
                    Total Modal (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={totalCost || ''}
                    onChange={(e) => setTotalCost(Number(e.target.value) || 0)}
                    placeholder="Contoh: 60000"
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8D5B68] mt-1 block">Biaya bahan adonan</span>
                </div>

                {/* Jumlah Jadi (Pcs) */}
                <div>
                  <label className="block text-xs font-black text-[#311B1E] mb-1.5">
                    Jumlah Jadi (Pcs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pcs || ''}
                    onChange={(e) => setPcs(Number(e.target.value) || 0)}
                    placeholder="Contoh: 20"
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8D5B68] mt-1 block">Hasil kue yang matang</span>
                </div>

                {/* Rencana Harga Jual */}
                <div>
                  <label className="block text-xs font-black text-[#311B1E] mb-1.5">
                    Harga Jual / Pcs (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                    placeholder="Contoh: 5000"
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl px-3.5 py-2.5 text-xs text-[#311B1E] font-bold focus:outline-none"
                  />
                  <span className="text-[10px] text-[#8D5B68] mt-1 block">Harga yang ingin dipasang</span>
                </div>
              </div>

              {/* Slider Target Keuntungan */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-[#311B1E]">
                    Target Keuntungan
                  </label>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                    +{targetMargin}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full accent-[#C2185B] cursor-pointer h-2.5 bg-[#F8BBD0]/60 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-[#8D5B68] font-bold mt-1">
                  <span>10% (Pesanan Banyak / Grosir)</span>
                  <span>50% (Standar Toko)</span>
                  <span>100%+ (Kue Spesial / Custom)</span>
                </div>
              </div>
            </div>

            {/* Results Card (5 Kolom) */}
            <div className="lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-[#FFF5F7]/90 to-[#FFEBEF]/90 backdrop-blur-md border-2 border-[#F8BBD0] shadow-sm sm:shadow-lg shadow-[#C2185B]/5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F8BBD0]">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                    Hasil Perhitungan
                  </span>
                  {selectedCategory && (
                    <span className="text-xs font-bold text-[#C2185B] truncate max-w-[150px]">
                      {selectedCategory}
                    </span>
                  )}
                </div>

                {/* Output 1: Modal per Pcs */}
                <div className="p-3.5 rounded-2xl bg-white/90 border border-[#F8BBD0] shadow-xs">
                  <span className="text-[11px] font-bold text-[#8D5B68] uppercase tracking-wider block">
                    1. Modal per Pcs
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-[#311B1E]">
                      {formatRupiah(costPerPcs)}
                    </span>
                    <span className="text-xs font-bold text-[#8D5B68]">
                      / potong roti
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8D5B68] mt-1">
                    Dihitung dari total modal {formatRupiah(totalCost)} dibagi {pcs} pcs.
                  </p>
                </div>

                {/* Output 2: Rekomendasi Harga Jual */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFEBEF] to-[#FCE4EC]/70 border-2 border-[#C2185B] shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#C2185B] uppercase tracking-wider">
                      2. Rekomendasi Jual
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#C2185B] border border-[#F8BBD0]">
                      Target Untung +{targetMargin}%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl sm:text-2xl font-black text-[#C2185B]">
                      {formatRupiah(recommendedSellingPrice)}
                    </span>
                    <span className="text-xs font-bold text-[#8D5B68]">
                      / potong roti
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8D5B68] mt-1">
                    Harga saran yang dibulatkan agar pas dan mudah saat transaksi uang kembalian.
                  </p>
                </div>

                {/* Output 3: Estimasi Laba */}
                <div
                  className={`p-3.5 rounded-2xl border-2 transition-all ${
                    isProfitable
                      ? 'bg-[#E8F5E9]/80 border-[#C8E6C9]'
                      : 'bg-[#FCE4EC]/80 border-[#F8BBD0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider ${
                        isProfitable ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                      }`}
                    >
                      3. Perkiraan Laba (Keuntungan)
                    </span>
                    {isProfitable ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#2E7D32]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Untung
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#C2185B]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Rugi
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-[10px] text-[#8D5B68] font-bold block">
                        Laba / Pcs:
                      </span>
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isProfitable ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                        }`}
                      >
                        {isProfitable ? '+' : ''}
                        {formatRupiah(profitPerPcs)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8D5B68] font-bold block">
                        Laba Total ({pcs} pcs):
                      </span>
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isProfitable ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                        }`}
                      >
                        {isProfitable ? '+' : ''}
                        {formatRupiah(totalProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Sederhana */}
              <div className="p-3 rounded-2xl bg-white/70 border border-[#F8BBD0] text-center">
                <p className="text-[11px] text-[#8D5B68] font-medium leading-relaxed">
                  💡 <strong>Tips Kitchen Chaacake:</strong> Geser slider target keuntungan untuk melihat simulasi rekomendasi harga jual yang ideal.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
    </AuthGuard>
  );
}
