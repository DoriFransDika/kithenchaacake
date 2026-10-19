'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  X,
  Search,
  Trash2,
  Share2,
  Check,
  Filter,
  Calendar,
  Clock,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';

import { DeleteDatabaseModal } from '@/components/common/DeleteDatabaseModal';
import { ConfirmSyncDeleteModal } from '@/components/common/ConfirmSyncDeleteModal';
import { TransactionModal } from '@/components/keuangan/TransactionModal';
import {
  formatRupiah,
  cleanTrxDescription,
  extractTrxMaterialRef,
  getTransactionQuantity,
  getTransactionItemName,
  extractTrxProductRef,
} from '@/lib/utils';
import { Transaction } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function FinancePage() {
  const {
    transactions,
    summary,
    finishedProducts,
    rawMaterials,
    deleteTransaction,
    deleteTransactionWithSync,
    clearTransactionData
  } = useStore();
  const [isClearFinanceOpen, setIsClearFinanceOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrxForDetail, setSelectedTrxForDetail] = useState<Transaction | null>(null);
  const [trxToDeleteSync, setTrxToDeleteSync] = useState<Transaction | null>(null);
  const [isDeletingSync, setIsDeletingSync] = useState(false);

  // Filters: Rentang Waktu (Hari, Minggu, Bulan, Tahun, Semua) & Jenis Transaksi
  type FinanceTimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
  const [timeRange, setTimeRange] = useState<FinanceTimeRange>('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredTransactions = React.useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter((t) => {
      // 1. Filter Type (Masuk / Keluar / Semua)
      const matchesType = filterType === 'all' || t.type === filterType;

      // 2. Filter Rentang Waktu
      const matchesTime = (() => {
        if (timeRange === 'all') return true;
        if (!t.date) return true;
        if (timeRange === 'daily') return t.date === todayStr;

        try {
          const trxDate = new Date(t.date);
          if (isNaN(trxDate.getTime())) return true;

          if (timeRange === 'weekly') {
            const diffDays = (now.getTime() - trxDate.getTime()) / (1000 * 3600 * 24);
            return diffDays >= 0 && diffDays <= 7;
          }
          if (timeRange === 'monthly') {
            return trxDate.getMonth() === currentMonth && trxDate.getFullYear() === currentYear;
          }
          if (timeRange === 'yearly') {
            return trxDate.getFullYear() === currentYear;
          }
        } catch {
          return true;
        }
        return true;
      })();

      // 3. Pencarian Produk / Kategori
      const q = productSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        getTransactionItemName(t, finishedProducts, rawMaterials).toLowerCase().includes(q);

      return matchesType && matchesTime && matchesSearch;
    })
    .sort((a, b) => {
      // Urutkan transaksi terbaru di bagian paling atas (latest first)
      const dateComp = (b.date || '').localeCompare(a.date || '');
      if (dateComp !== 0) return dateComp;
      return (b.id || '').localeCompare(a.id || '');
    });
  }, [transactions, filterType, timeRange, productSearchQuery, finishedProducts, rawMaterials]);

  // Kalkulasi Ringkasan Dinamis Sesuai Filter
  const dynamicSummary = React.useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }, [filteredTransactions]);

  // Informasi Pelacakan Penjualan Produk Spesifik
  const productSalesInfo = React.useMemo(() => {
    if (!productSearchQuery.trim()) return null;
    const q = productSearchQuery.toLowerCase().trim();
    const salesTrx = filteredTransactions.filter(
      (t) =>
        t.type === 'income' &&
        (t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          getTransactionItemName(t, finishedProducts, rawMaterials).toLowerCase().includes(q))
    );
    const totalSales = salesTrx.reduce((sum, t) => sum + t.amount, 0);
    return {
      query: productSearchQuery.trim(),
      count: salesTrx.length,
      totalSales,
    };
  }, [filteredTransactions, productSearchQuery, finishedProducts, rawMaterials]);

  // Group transactions by date for daily breakdown
  const groupedTransactions = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((trx) => {
      const dateKey = trx.date || 'Hari Ini';
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(trx);
    });

    const groups: {
      dateKey: string;
      displayDate: string;
      items: Transaction[];
      totalIn: number;
      totalOut: number;
    }[] = [];

    // Sort dates descending
    const sortedKeys = Array.from(map.keys()).sort((a, b) => (b > a ? 1 : b < a ? -1 : 0));

    sortedKeys.forEach((key) => {
      const items = (map.get(key) || []).sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      let displayDate = key;
      try {
        const d = new Date(key);
        if (!isNaN(d.getTime())) {
          displayDate = d.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        }
      } catch {}

      const totalIn = items
        .filter((i) => i.type === 'income')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const totalOut = items
        .filter((i) => i.type === 'expense')
        .reduce((acc, curr) => acc + curr.amount, 0);

      groups.push({
        dateKey: key,
        displayDate,
        items,
        totalIn,
        totalOut,
      });
    });

    return groups;
  }, [filteredTransactions]);

  const handleDeleteTrx = (trx: Transaction) => {
    const isMaterialExpense =
      trx.type === 'expense' &&
      (trx.category === 'Belanja Bahan Baku' ||
        Boolean(extractTrxMaterialRef(trx.description)) ||
        trx.description.toLowerCase().includes('belanja'));

    const isProductSale = trx.type === 'income' && Boolean(extractTrxProductRef(trx.description));

    if (isMaterialExpense || isProductSale) {
      setTrxToDeleteSync(trx);
    } else {
      if (confirm(`Hapus catatan transaksi: "${cleanTrxDescription(trx.description)}"?`)) {
        deleteTransaction(trx.id);
        showToast('Transaksi berhasil dihapus.');
        if (selectedTrxForDetail?.id === trx.id) {
          setSelectedTrxForDetail(null);
        }
      }
    }
  };

  const handleConfirmDeleteSync = async () => {
    if (!trxToDeleteSync) return;
    setIsDeletingSync(true);
    try {
      const res = await deleteTransactionWithSync(trxToDeleteSync.id, true);
      showToast(res.message);
      if (selectedTrxForDetail?.id === trxToDeleteSync.id) {
        setSelectedTrxForDetail(null);
      }
      setTrxToDeleteSync(null);
    } catch {
      showToast('Gagal menghapus transaksi.');
    } finally {
      setIsDeletingSync(false);
    }
  };

  const handleCopySummary = () => {
    const text = `*Laporan Keuangan Kitchen Chaacake*\n` +
      `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}\n` +
      `📈 Pemasukan: ${formatRupiah(summary.totalIncome)}\n` +
      `📉 Pengeluaran: ${formatRupiah(summary.totalExpense)}\n` +
      `💰 Laba Bersih: ${formatRupiah(summary.netProfit)}\n` +
      `🥐 Total Stok Etalase: ${summary.readyProductsCount} pcs\n` +
      `Dibuat otomatis oleh Sistem Kitchen Chaacake.`;

    navigator.clipboard.writeText(text);
    showToast('Ringkasan keuangan disalin ke clipboard!');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat text-[#311B1E] flex flex-col md:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-28 md:pb-12">
        <Header />

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#311B1E] text-white text-xs font-black shadow-xl border border-[#F8BBD0]"
            >
              <Check className="w-4 h-4 text-[#C2185B]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-sm sm:shadow-lg shadow-[#C2185B]/5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
                </span>
                <h2 className="text-base sm:text-2xl font-black text-[#311B1E] tracking-tight">
                  Buku Kas & Keuangan Toko
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-[#8D5B68] mt-1 font-medium">
                Pencatatan mutasi kas masuk omset dan kas keluar belanja dapur real-time.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopySummary}
                className="justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-[#FFEBEF] border border-[#F8BBD0] text-[#311B1E] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Salin ringkasan ke WA"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2185B]" />
                <span className="truncate">Salin Laporan</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="justify-center px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#C2185B] hover:bg-[#AD1457] text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#C2185B]/25 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                <span className="truncate">Transaksi</span>
              </button>
              <button
                type="button"
                onClick={() => setIsClearFinanceOpen(true)}
                className="col-span-2 sm:col-span-1 justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                title="Hapus Seluruh Data Transaksi dari Supabase"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                <span className="truncate">Hapus Pembukuan</span>
              </button>
            </div>
          </div>

          {/* Time Range Filter Bar (Hari Ini, Per Minggu, Per Bulan, Per Tahun, Semua) */}
          <div className="p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-sm sm:shadow-md shadow-[#C2185B]/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2 px-1 sm:px-2">
                <span className="p-1.5 sm:p-2 rounded-xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0] shrink-0">
                  <Calendar className="w-4 h-4 text-[#C2185B]" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#311B1E] leading-tight">
                    Filter Rentang Waktu
                  </h3>
                  <p className="text-[10px] text-[#8D5B68] font-medium leading-tight mt-0.5">
                    {timeRange === 'daily' && 'Menampilkan mutasi kas hari ini'}
                    {timeRange === 'weekly' && 'Menampilkan mutasi kas 7 hari terakhir'}
                    {timeRange === 'monthly' && 'Menampilkan mutasi kas bulan berjalan'}
                    {timeRange === 'yearly' && 'Menampilkan mutasi kas tahun berjalan'}
                    {timeRange === 'all' && 'Menampilkan seluruh riwayat transaksi kasir & dapur'}
                  </p>
                </div>
              </div>

              {/* Segmented Filter Control */}
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 bg-[#FFEBEF]/40 rounded-xl sm:rounded-2xl border border-[#F8BBD0] w-full lg:w-auto">
                {[
                  { id: 'daily', label: 'Hari Ini' },
                  { id: 'weekly', label: 'Per Minggu' },
                  { id: 'monthly', label: 'Per Bulan' },
                  { id: 'yearly', label: 'Per Tahun' },
                  { id: 'all', label: 'Semua' },
                ].map((item) => {
                  const isActive = timeRange === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTimeRange(item.id as FinanceTimeRange)}
                      className={`py-2 px-1.5 sm:px-3.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black transition-all text-center truncate ${
                        isActive
                          ? 'bg-[#C2185B] text-white shadow-sm'
                          : 'text-[#8D5B68] hover:text-[#311B1E] hover:bg-white/90'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mini Financial Summary: Dynamic Filtered Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#C8E6C9] shadow-xs">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8D6E63] mb-1">
                <span className="font-bold truncate">Total Pemasukan</span>
                <span className="p-1 rounded-lg bg-[#E8F5E9] text-[#2E7D32] shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#2E7D32] truncate">
                {formatRupiah(dynamicSummary.totalIncome)}
              </p>
            </div>

            <div className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-xs">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#8D6E63] mb-1">
                <span className="font-bold truncate">Total Pengeluaran</span>
                <span className="p-1 rounded-lg bg-[#FCE4EC] text-[#C2185B] shrink-0">
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#C2185B] truncate">
                {formatRupiah(dynamicSummary.totalExpense)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/95 to-[#FFEBEF]/90 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-xs flex sm:flex-col justify-between items-center sm:items-stretch">
              <div className="flex items-center gap-1.5 sm:justify-between text-[10px] sm:text-xs text-[#8D5B68] sm:mb-1">
                <span className="p-1 rounded-lg bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0] shrink-0">
                  <Wallet className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold">Laba Bersih</span>
              </div>
              <p className="text-sm sm:text-lg lg:text-xl font-black text-[#C2185B] truncate">
                {formatRupiah(dynamicSummary.netProfit)}
              </p>
            </div>
          </div>

          {/* Product Sales Highlight Tracker (jika pencarian produk aktif) */}
          {productSalesInfo && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FFF5F7] to-[#FFEBEF] border-2 border-[#F8BBD0] text-[#311B1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#C2185B] text-white shadow-xs">
                  <Receipt className="w-4 h-4 stroke-[2.5]" />
                </span>
                <div>
                  <span className="text-[10px] font-black text-[#C2185B] uppercase tracking-wide block">
                    Pelacakan Penjualan Produk Spesifik
                  </span>
                  <h4 className="font-black text-xs sm:text-sm text-[#311B1E]">
                    &ldquo;{productSalesInfo.query}&rdquo;
                  </h4>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-[#8D5B68] font-semibold block">Total Omset Produk:</span>
                  <span className="text-sm sm:text-base font-black text-[#2E7D32]">
                    {formatRupiah(productSalesInfo.totalSales)}
                  </span>
                </div>
                <span className="text-xs font-black bg-white px-3 py-1 rounded-xl border border-[#F8BBD0] text-[#311B1E] shadow-xs">
                  {productSalesInfo.count} Transaksi
                </span>
              </div>
            </div>
          )}

          {/* Transactions Table & Filters */}
          <div className="p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-xs sm:shadow-md shadow-[#C2185B]/5 space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F8BBD0]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C2185B]" />
                <h3 className="font-black text-sm sm:text-base text-[#311B1E]">
                  Tabel Transaksi ({filteredTransactions.length})
                </h3>
              </div>

              {/* Filter Type & Search Produk */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                {/* Type Filter */}
                <div className="flex items-center p-1 bg-white/80 rounded-2xl border border-[#F8BBD0] text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      filterType === 'all' ? 'bg-[#C2185B] text-white shadow-xs' : 'text-[#8D5B68] hover:text-[#311B1E]'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('income')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      filterType === 'income' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'text-[#8D5B68] hover:text-[#311B1E]'
                    }`}
                  >
                    Masuk (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('expense')}
                    className={`px-2.5 py-1 rounded-xl font-black transition-all ${
                      filterType === 'expense' ? 'bg-[#FCE4EC] text-[#C2185B]' : 'text-[#8D5B68] hover:text-[#311B1E]'
                    }`}
                  >
                    Keluar (-)
                  </button>
                </div>

                {/* Search Produk Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#8D5B68] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Pencarian produk / menu roti..."
                    className="w-full bg-white/90 border border-[#F8BBD0] focus:border-[#C2185B] rounded-2xl pl-9 pr-8 py-1.5 text-xs text-[#311B1E] font-bold focus:outline-none placeholder-[#8D5B68]"
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D5B68] hover:text-[#311B1E]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Product Chips for Instant Filtering */}
            {finishedProducts.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-[10px] font-bold text-[#8D5B68] shrink-0 mr-1">Rekomendasi Produk:</span>
                {finishedProducts.slice(0, 6).map((prod) => {
                  const isSelected = productSearchQuery.toLowerCase() === prod.name.toLowerCase();
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => setProductSearchQuery(isSelected ? '' : prod.name)}
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#C2185B] text-white border-[#C2185B] shadow-xs'
                          : 'bg-[#FFEBEF]/40 text-[#8D5B68] border-[#F8BBD0] hover:bg-[#FFEBEF]'
                      }`}
                    >
                      {prod.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scrollable Container with Daily Grouped Table */}
            <div className="max-h-[520px] overflow-y-auto overflow-x-auto rounded-2xl border border-[#F8BBD0] bg-white/70 divide-y divide-[#F8BBD0] scroll-smooth shadow-inner">
              {groupedTransactions.length === 0 ? (
                <div className="text-center py-12 text-[#8D5B68] text-xs">
                  Tidak ada catatan mutasi transaksi yang cocok dengan filter saat ini.
                </div>
              ) : (
                groupedTransactions.map((group) => (
                  <div key={group.dateKey} className="relative">
                    {/* Sticky Day Header */}
                    <div className="sticky top-0 z-10 px-3.5 sm:px-4 py-2 bg-[#FFEBEF]/95 backdrop-blur-md border-b border-[#F8BBD0] flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#C2185B]" />
                        <span className="text-xs font-black text-[#311B1E]">{group.displayDate}</span>
                        <span className="text-[10px] text-[#8D5B68] font-bold">({group.items.length} transaksi)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[10px] sm:text-xs font-black">
                        {group.totalIn > 0 && (
                          <span className="text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                            +{formatRupiah(group.totalIn)}
                          </span>
                        )}
                        {group.totalOut > 0 && (
                          <span className="text-[#C2185B] bg-[#FCE4EC] px-2 py-0.5 rounded-full border border-[#F8BBD0]">
                            -{formatRupiah(group.totalOut)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Minimalist Structured Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#F8BBD0]/80 text-[10px] uppercase font-black text-[#8D5B68] bg-white/50">
                            <th className="py-2.5 px-3 min-w-[140px]">Jenis Produk</th>
                            <th className="py-2.5 px-3 text-center w-24">Jumlah</th>
                            <th className="py-2.5 px-2 text-center w-24">Jenis</th>
                            <th className="py-2.5 px-3 text-right w-32">Nominal</th>
                            <th className="py-2.5 px-3 min-w-[150px]">Keterangan</th>
                            <th className="py-2.5 px-2 text-center w-14">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F8BBD0]/60">
                          {group.items.map((trx) => {
                            const itemName = getTransactionItemName(trx, finishedProducts, rawMaterials);
                            const qtyStr = getTransactionQuantity(trx);
                            const cleanDesc = cleanTrxDescription(trx.description);

                            return (
                              <tr
                                key={trx.id}
                                onClick={() => setSelectedTrxForDetail(trx)}
                                className="hover:bg-[#FFEBEF]/30 transition-colors cursor-pointer group"
                              >
                                {/* 1. Jenis Produk */}
                                <td className="py-2.5 px-3">
                                  <p className="font-black text-[#311B1E] text-xs truncate max-w-[170px] sm:max-w-xs" title={itemName}>
                                    {itemName}
                                  </p>
                                </td>

                                {/* 2. Jumlah */}
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  <span
                                    className={`inline-block text-xs font-black px-2 py-0.5 rounded-lg border ${
                                      qtyStr !== '-'
                                        ? trx.type === 'income'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-[#FFEBEF]/50 text-[#311B1E] border-[#F8BBD0]'
                                        : 'text-[#8D5B68]/40 border-transparent font-normal'
                                    }`}
                                  >
                                    {qtyStr}
                                  </span>
                                </td>

                                {/* 3. Jenis */}
                                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                  {trx.type === 'income' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                                      <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                                      Masuk
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]">
                                      <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                                      Keluar
                                    </span>
                                  )}
                                </td>

                                {/* 4. Nominal */}
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <span
                                    className={`text-xs sm:text-sm font-black ${
                                      trx.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                                    }`}
                                  >
                                    {trx.type === 'income' ? '+' : '-'} {formatRupiah(trx.amount)}
                                  </span>
                                </td>

                                {/* 5. Keterangan */}
                                <td className="py-2.5 px-3 min-w-0">
                                  <p className="text-xs text-[#311B1E]/80 font-medium line-clamp-1 max-w-[180px] sm:max-w-sm" title={cleanDesc}>
                                    {cleanDesc || '-'}
                                  </p>
                                </td>

                                {/* Aksi */}
                                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTrxForDetail(trx);
                                    }}
                                    className="px-2 py-1 rounded-lg text-[10px] font-black bg-white border border-[#F8BBD0] text-[#8D5B68] hover:text-[#C2185B] hover:border-[#C2185B] shadow-2xs"
                                  >
                                    Lihat
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNav />


      {/* Transaction Modal (Reused across Dashboard & Keuangan) */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Detail Transaction Modal */}
      {selectedTrxForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-2 border-[#F8BBD0] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8BBD0]">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-[#FFEBEF] text-[#C2185B]">
                  <Receipt className="w-4 h-4 text-[#C2185B]" />
                </span>
                <h3 className="font-black text-[#311B1E] text-sm">Detail Transaksi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrxForDetail(null)}
                className="w-7 h-7 rounded-full bg-[#FFEBEF] text-[#8D5B68] flex items-center justify-center hover:bg-[#F8BBD0]/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nominal Display */}
            <div className="text-center p-4 rounded-2xl bg-[#FFEBEF]/40 border border-[#F8BBD0]">
              <p className="text-[10px] uppercase font-bold text-[#8D5B68]">Nominal Mutasi</p>
              <h2
                className={`text-2xl font-black mt-1 ${
                  selectedTrxForDetail.type === 'income' ? 'text-[#2E7D32]' : 'text-[#C2185B]'
                }`}
              >
                {selectedTrxForDetail.type === 'income' ? '+' : '-'} {formatRupiah(selectedTrxForDetail.amount)}
              </h2>
              <span
                className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  selectedTrxForDetail.type === 'income'
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FCE4EC] text-[#C2185B]'
                }`}
              >
                {selectedTrxForDetail.type === 'income' ? 'Uang Masuk / Penjualan' : 'Uang Keluar / Biaya'}
              </span>
            </div>

            {/* Detailed Key-Values */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F8BBD0]/60">
                <span className="text-[#8D5B68] font-medium">Jenis Produk:</span>
                <span className="font-black text-[#311B1E] text-right max-w-[65%]">
                  {getTransactionItemName(selectedTrxForDetail, finishedProducts, rawMaterials)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F8BBD0]/60">
                <span className="text-[#8D5B68] font-medium">Keterangan:</span>
                <span className="font-black text-[#311B1E] text-right max-w-[65%]">
                  {cleanTrxDescription(selectedTrxForDetail.description)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F8BBD0]/60">
                <span className="text-[#8D5B68] font-medium">Jumlah / Kuantitas:</span>
                <span className="font-black text-[#311B1E]">
                  {getTransactionQuantity(selectedTrxForDetail)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F8BBD0]/60">
                <span className="text-[#8D5B68] font-medium">Kategori:</span>
                <span className="font-bold text-[#C2185B]">{selectedTrxForDetail.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F8BBD0]/60">
                <span className="text-[#8D5B68] font-medium">Tanggal:</span>
                <span className="font-bold text-[#311B1E]">{selectedTrxForDetail.date}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#F8BBD0] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDeleteTrx(selectedTrxForDetail);
                }}
                className="px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 flex items-center gap-1 border border-rose-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrxForDetail(null)}
                className="px-4 py-2 rounded-xl bg-[#C2185B] text-white text-xs font-black hover:bg-[#AD1457] transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Synchronized Stock & Finance Deletion Confirmation Modal */}
      {trxToDeleteSync && (
        <ConfirmSyncDeleteModal
          isOpen={Boolean(trxToDeleteSync)}
          onClose={() => setTrxToDeleteSync(null)}
          onConfirm={handleConfirmDeleteSync}
          title={
            trxToDeleteSync.type === 'income'
              ? 'Hapus Penjualan & Kembalikan Stok'
              : 'Hapus Pengeluaran & Sinkronkan Stok'
          }
          itemName={cleanTrxDescription(trxToDeleteSync.description)}
          sourceModule="Keuangan"
          impactDescription={
            trxToDeleteSync.type === 'income'
              ? `Catatan ini merupakan penjualan produk ready. Menghapusnya akan otomatis mengembalikan ${
                  extractTrxProductRef(trxToDeleteSync.description)?.qty ?? 0
                } pcs ke stok produk di Manajemen Stok.`
              : 'Catatan ini merupakan pembelian bahan baku. Menghapusnya akan otomatis menyesuaikan/mengurangi stok bahan terkait di Dapur Toko dari database Supabase.'
          }
          isDeleting={isDeletingSync}
        />
      )}

      {/* Delete Financial Database Confirmation Modal */}
      <DeleteDatabaseModal
        isOpen={isClearFinanceOpen}
        onClose={() => setIsClearFinanceOpen(false)}
        onConfirm={async () => {
          const res = await clearTransactionData();
          showToast(res.message);
        }}
        title="Hapus Seluruh Riwayat Pembukuan"
        itemCountText={`${transactions.length} Catatan Transaksi Kasir & Dapur`}
        description="Tindakan ini akan mengosongkan seluruh riwayat pemasukan penjualan dan pengeluaran belanja dapur dari database Supabase dan penyimpanan lokal."
        warningNote="Seluruh catatan kas dan mutasi keuangan akan dihapus permanen. Total kas dan nominal keuntungan akan direset menjadi Rp 0."
        confirmButtonText="Ya, Hapus Semua Transaksi dari Supabase"
      />
    </div>
    </AuthGuard>
  );
}
