'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Sparkles,
  Plus,
  AlertTriangle,
  Search,
  CheckCircle2,
  Tags,
  Minus,
  Trash2,
  X,
  Check,
  Eye,
  Filter,
  PackageX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';
import { ItemModal } from '@/components/stok/ItemModal';
import { ReduceStockModal } from '@/components/stok/ReduceStockModal';
import { CategoryDetailModal } from '@/components/stok/CategoryDetailModal';
import { MaterialList } from '@/components/stok/MaterialList';
import {
  ReadyProductList,
  ReadyStatusFilter,
  matchesReadyStatus,
  getReadyProductStatus,
} from '@/components/stok/ReadyProductList';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { CategoryManageModal } from '@/components/kategori/CategoryManageModal';
import { DeleteDatabaseModal } from '@/components/common/DeleteDatabaseModal';
import { ConfirmSyncDeleteModal } from '@/components/common/ConfirmSyncDeleteModal';
import { getCategoryDisplayUnit } from '@/lib/utils';
import { RawMaterial, FinishedProduct, Category } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function StockPage() {
  const {
    rawMaterials,
    finishedProducts,
    categories,
    deleteMaterialWithSync,
    deleteProduct,
    clearStockData,
  } = useStore();

  // Tab: 'materials' (Bahan Baku Dapur) vs 'products' (Stok Produk Ready)
  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('materials');

  // Filter Kategori (Dropdown)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'safe'>('all');
  const [readyStatusFilter, setReadyStatusFilter] = useState<ReadyStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isCatManageOpen, setIsCatManageOpen] = useState(false);
  const [isClearStockOpen, setIsClearStockOpen] = useState(false);
  const [isReduceOpen, setIsReduceOpen] = useState(false);
  const [reduceCategoryTarget, setReduceCategoryTarget] = useState<{
    id?: string;
    name?: string;
    materialId?: string;
    materialName?: string;
  } | null>(null);
  const [itemToEdit, setItemToEdit] = useState<RawMaterial | FinishedProduct | null>(null);
  const [materialToDeleteSync, setMaterialToDeleteSync] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingSync, setIsDeletingSync] = useState(false);

  // Modal Lihat Detail Kategori
  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    category: Category | null;
    items: (RawMaterial | FinishedProduct)[];
    type: 'material' | 'product';
  }>({
    isOpen: false,
    category: null,
    items: [],
    type: 'material',
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Kategori aktif sesuai tab
  const currentCategories = categories.filter((c) =>
    activeTab === 'materials' ? c.type === 'material' : c.type === 'product'
  );

  // 1. Daftar Bahan Baku Dapur: Tampil langsung per merek/varian dengan label kategori di atasnya
  const filteredMaterialsList = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawMaterials
      .filter((m) => {
        const matchesCat =
          selectedCategoryId === 'all' ||
          m.categoryId === selectedCategoryId ||
          m.category.toLowerCase().trim() ===
            categories.find((c) => c.id === selectedCategoryId)?.name.toLowerCase().trim();

        const matchesSearch =
          !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);

        const isLow = m.stock <= m.minStock;
        const matchesStatus =
          stockStatusFilter === 'all'
            ? true
            : stockStatusFilter === 'low'
            ? isLow
            : !isLow;

        return matchesCat && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Habis/kritis paling atas, lalu alfabetis
        const aLow = a.stock <= a.minStock ? 0 : 1;
        const bLow = b.stock <= b.minStock ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.name.localeCompare(b.name);
      });
  }, [rawMaterials, selectedCategoryId, categories, searchQuery, stockStatusFilter]);

  const materialCounts = React.useMemo(() => {
    const inCat = rawMaterials.filter(
      (m) =>
        selectedCategoryId === 'all' ||
        m.categoryId === selectedCategoryId ||
        m.category.toLowerCase().trim() ===
          categories.find((c) => c.id === selectedCategoryId)?.name.toLowerCase().trim()
    );
    return {
      all: inCat.length,
      low: inCat.filter((m) => m.stock <= m.minStock).length,
      safe: inCat.filter((m) => m.stock > m.minStock).length,
    };
  }, [rawMaterials, selectedCategoryId, categories]);

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  // 3. Daftar Produk Ready (langsung tampil per produk, difilter kategori + status + pencarian)
  const readyProductsList = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return finishedProducts
      .filter((p) => {
        const matchesCat = selectedCategoryId === 'all' || p.categoryId === selectedCategoryId;
        const matchesSearch =
          !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
        return matchesCat && matchesSearch && matchesReadyStatus(p, readyStatusFilter);
      })
      .sort((a, b) => {
        // Habis paling atas, lalu hampir habis, lalu tersedia
        const rank = { out: 0, low: 1, safe: 2 } as const;
        const diff = rank[getReadyProductStatus(a)] - rank[getReadyProductStatus(b)];
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      });
  }, [finishedProducts, selectedCategoryId, searchQuery, readyStatusFilter]);

  const readyCounts = React.useMemo(() => {
    const inCat = finishedProducts.filter(
      (p) => selectedCategoryId === 'all' || p.categoryId === selectedCategoryId
    );
    return {
      all: inCat.length,
      available: inCat.filter((p) => matchesReadyStatus(p, 'available')).length,
      low: inCat.filter((p) => matchesReadyStatus(p, 'low')).length,
      out: inCat.filter((p) => matchesReadyStatus(p, 'out')).length,
    };
  }, [finishedProducts, selectedCategoryId]);

  const handleOpenEditProduct = (p: FinishedProduct) => {
    setItemToEdit(p);
    setIsItemModalOpen(true);
  };

  const handleDeleteProduct = (p: FinishedProduct) => {
    if (confirm(`Hapus produk "${p.name}" (${p.stock} pcs) dari Manajemen Stok?`)) {
      deleteProduct(p.id);
      showToast(`Produk ${p.name} dihapus.`);
    }
  };

  const handleOpenReduceUniversal = () => {
    setReduceCategoryTarget(null);
    setIsReduceOpen(true);
  };

  const handleOpenReduceCategory = (categoryId: string, categoryName: string) => {
    setReduceCategoryTarget({ id: categoryId, name: categoryName });
    setIsReduceOpen(true);
  };

  const handleOpenDetailModal = (cat: Category, items: (RawMaterial | FinishedProduct)[]) => {
    setDetailModalState({
      isOpen: true,
      category: cat,
      items,
      type: activeTab === 'materials' ? 'material' : 'product',
    });
  };

  const handleConfirmDeleteMaterialSync = async () => {
    if (!materialToDeleteSync) return;
    setIsDeletingSync(true);
    try {
      const res = await deleteMaterialWithSync(materialToDeleteSync.id, true);
      showToast(res.message);
      setMaterialToDeleteSync(null);
    } catch {
      showToast('Gagal menghapus bahan.');
    } finally {
      setIsDeletingSync(false);
    }
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
          {/* Top Title & Tab Switcher */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-md border-1.5 sm:border-2 border-[#F8BBD0] shadow-sm sm:shadow-lg shadow-[#C2185B]/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0]">
                    {activeTab === 'materials' ? (
                      <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
                    ) : (
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#C2185B]" />
                    )}
                  </span>
                  <h2 className="text-base sm:text-2xl font-black text-[#311B1E] tracking-tight">
                    {activeTab === 'materials' ? 'Manajemen Bahan Baku Dapur' : 'Manajemen Stok Produk Ready'}
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-[#8D5B68] mt-1 font-medium">
                  {activeTab === 'materials'
                    ? 'Pencatatan persediaan bahan baku dapur per kategori otomatis menyesuaikan satuan.'
                    : 'Input stok produk ready (pcs). Stok berkurang otomatis saat transaksi penjualan di Keuangan Toko.'}
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="justify-center px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] hover:brightness-105 text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-[#C2185B]/25 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                  <span className="truncate">
                    {activeTab === 'materials' ? 'Tambah Bahan' : 'Input Produk Ready'}
                  </span>
                </button>

                {activeTab === 'materials' && (
                  <button
                    type="button"
                    onClick={handleOpenReduceUniversal}
                    className="justify-center px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                    title="Kurangi stok bahan dapur secara universal"
                  >
                    <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                    <span className="truncate">Kurangi Stok</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCatManageOpen(true)}
                  className="justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#FFEBEF] hover:bg-[#F8BBD0]/50 border border-[#F8BBD0] text-[#311B1E] text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                  title="Kelola & Atur Kategori"
                >
                  <Tags className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2185B]" />
                  <span className="truncate">Kategori</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsClearStockOpen(true)}
                  className="col-span-2 sm:col-span-1 justify-center px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-[#8D5B68] hover:text-rose-700 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                  title="Hapus Database Stok"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate">Hapus Stok</span>
                </button>
              </div>
            </div>

            {/* Segmented Tab Switcher: Bahan Baku vs Stok Produk Ready */}
            <div className="flex items-center p-1 bg-[#FFEBEF]/40 rounded-2xl border border-[#F8BBD0] text-xs font-black max-w-md">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('materials');
                  setSelectedCategoryId('all');
                }}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'materials'
                    ? 'bg-[#C2185B] text-white shadow-sm'
                    : 'text-[#8D5B68] hover:text-[#311B1E]'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Bahan Baku Dapur</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('products');
                  setSelectedCategoryId('all');
                }}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'products'
                    ? 'bg-[#C2185B] text-white shadow-sm'
                    : 'text-[#8D5B68] hover:text-[#311B1E]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Stok Produk Ready</span>
              </button>
            </div>
          </div>

          {/* Filters Bar: Dropdown Kategori & Status & Search */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-[#F8BBD0] shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* DROPDOWN FILTER KATEGORI (Rapi, Responsif & Hemat Ruang) */}
              <div className="sm:col-span-5 flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#FFEBEF]/40 border border-[#F8BBD0] text-[#8D5B68] shrink-0">
                  <Filter className="w-4 h-4 text-[#C2185B]" />
                </span>
                <div className="flex-1">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-3 py-2 text-xs font-black text-[#311B1E] focus:outline-none transition-all shadow-2xs"
                  >
                    <option value="all">
                      Semua Kategori {activeTab === 'materials' ? 'Bahan Baku' : 'Produk'} ({currentCategories.length})
                    </option>
                    {currentCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter: Bahan (Semua/Kritis/Aman) atau Produk Ready (Semua/Tersedia/Hampir Habis/Habis) */}
              {activeTab === 'products' ? (
              <div className="sm:col-span-3 grid grid-cols-4 bg-[#FFEBEF]/40 rounded-xl border border-[#F8BBD0] p-1 text-[10px] gap-0.5">
                {([
                  { id: 'all', label: 'Semua', active: 'bg-[#C2185B] text-white', idle: 'text-[#8D5B68] hover:text-[#311B1E]' },
                  { id: 'available', label: 'Tersedia', active: 'bg-emerald-600 text-white', idle: 'text-emerald-700 hover:bg-emerald-50' },
                  { id: 'low', label: 'Menipis', active: 'bg-amber-500 text-white', idle: 'text-amber-700 hover:bg-amber-50' },
                  { id: 'out', label: 'Habis', active: 'bg-rose-600 text-white', idle: 'text-rose-700 hover:bg-rose-50' },
                ] as const).map((f) => (
                  <button
                    key={f.id}
                    id={`ready-filter-${f.id}`}
                    type="button"
                    onClick={() => setReadyStatusFilter(f.id)}
                    title={f.id === 'low' ? 'Hampir Habis (≤ stok minimum)' : undefined}
                    className={`py-1 rounded-lg font-black transition-all flex flex-col items-center leading-tight ${
                      readyStatusFilter === f.id ? `${f.active} shadow-2xs` : f.idle
                    }`}
                  >
                    <span className="flex items-center gap-0.5">
                      {f.id === 'out' && <PackageX className="w-3 h-3" />}
                      {f.label}
                    </span>
                    <span className="opacity-80">{readyCounts[f.id]}</span>
                  </button>
                ))}
              </div>
              ) : (
              <div className="sm:col-span-3 grid grid-cols-3 bg-[#FFEBEF]/40 rounded-xl border border-[#F8BBD0] p-1 text-[10px] gap-0.5">
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('all')}
                  className={`py-1 rounded-lg font-black transition-all flex flex-col items-center leading-tight ${
                    stockStatusFilter === 'all'
                      ? 'bg-[#C2185B] text-white shadow-2xs'
                      : 'text-[#8D5B68] hover:text-[#311B1E]'
                  }`}
                >
                  <span>Semua</span>
                  <span className="opacity-80">{materialCounts.all}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('low')}
                  className={`py-1 rounded-lg font-black transition-all flex flex-col items-center leading-tight ${
                    stockStatusFilter === 'low'
                      ? 'bg-[#D81B60] text-white shadow-2xs'
                      : 'text-[#D81B60] hover:bg-rose-50'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Kritis</span>
                  </span>
                  <span className="opacity-80">{materialCounts.low}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('safe')}
                  className={`py-1 rounded-lg font-black transition-all flex flex-col items-center leading-tight ${
                    stockStatusFilter === 'safe'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span className="flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Aman</span>
                  </span>
                  <span className="opacity-80">{materialCounts.safe}</span>
                </button>
              </div>
              )}

              {/* Search Bar */}
              <div className="sm:col-span-4 relative">
                <Search className="w-4 h-4 text-[#8D5B68] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama barang / varian..."
                  className="w-full bg-[#FFEBEF]/40 border-2 border-[#F8BBD0] focus:border-[#C2185B] rounded-xl pl-9 pr-8 py-1.5 text-xs text-[#311B1E] font-bold placeholder-[#8D5B68] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D5B68] hover:text-[#311B1E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* KONTEN STOK:
              1. Jika activeTab === 'products': Tampilkan ReadyProductList (Produk Ready siap saji)
              2. Jika activeTab === 'materials': Tampilkan MaterialList (Semua jenis bahan baku tampil per nama merek dengan label kategori di atasnya) */}
          {activeTab === 'products' ? (
            /* VIEW PRODUK READY: Kartu daftar produk langsung tampil */
            <ReadyProductList
              products={readyProductsList}
              categories={categories}
              onEdit={handleOpenEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleOpenAdd}
            />
          ) : (
            /* VIEW BAHAN BAKU DAPUR: Kartu daftar bahan baku langsung tampil per merek dengan label kategori di atasnya */
            <MaterialList
              materials={filteredMaterialsList}
              categories={categories}
              onEdit={(m) => {
                setItemToEdit(m);
                setIsItemModalOpen(true);
              }}
              onDelete={(m) => {
                setMaterialToDeleteSync({ id: m.id, name: m.name });
              }}
              onReduce={(m) => {
                setReduceCategoryTarget({
                  id: m.categoryId,
                  name: m.category,
                  materialId: m.id,
                  materialName: m.name,
                });
                setIsReduceOpen(true);
              }}
              onAdd={handleOpenAdd}
            />
          )}
        </main>
      </div>

      <BottomNav />
      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        mode={activeTab === 'materials' ? 'material' : 'product'}
        itemToEdit={itemToEdit}
        onSuccess={showToast}
      />
      <ReduceStockModal
        isOpen={isReduceOpen}
        onClose={() => {
          setIsReduceOpen(false);
          setReduceCategoryTarget(null);
        }}
        initialCategoryId={reduceCategoryTarget?.id}
        initialCategoryName={reduceCategoryTarget?.name}
        initialMaterialId={reduceCategoryTarget?.materialId}
        initialMaterialName={reduceCategoryTarget?.materialName}
      />
      <CategoryManageModal
        isOpen={isCatManageOpen}
        onClose={() => setIsCatManageOpen(false)}
        initialType={activeTab === 'materials' ? 'material' : 'product'}
      />
      <CategoryDetailModal
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState((prev) => ({ ...prev, isOpen: false }))}
        category={detailModalState.category}
        items={detailModalState.items}
        type={detailModalState.type}
      />
      <DeleteDatabaseModal
        isOpen={isClearStockOpen}
        onClose={() => setIsClearStockOpen(false)}
        onConfirm={async () => {
          const res = await clearStockData(activeTab === 'materials' ? 'materials' : 'products');
          showToast(res.message);
        }}
        title={`Hapus Database Stok ${activeTab === 'materials' ? 'Bahan Baku' : 'Produk Ready'}`}
        itemCountText={
          activeTab === 'materials'
            ? `${rawMaterials.length} Bahan Baku`
            : `${finishedProducts.length} Produk Ready`
        }
        description="Tindakan ini akan mengosongkan seluruh data persediaan dari database Supabase dan penyimpanan lokal."
        warningNote="Semua stok akan dikosongkan permanen. Anda dapat menambahkan item baru sewaktu-waktu."
        confirmButtonText="Ya, Hapus Semua Stok dari Supabase"
      />
      {materialToDeleteSync && (
        <ConfirmSyncDeleteModal
          isOpen={Boolean(materialToDeleteSync)}
          onClose={() => setMaterialToDeleteSync(null)}
          onConfirm={handleConfirmDeleteMaterialSync}
          title="Hapus Bahan & Sinkronkan Keuangan"
          itemName={materialToDeleteSync.name}
          sourceModule="Stok"
          impactDescription="Menghapus bahan baku ini akan otomatis menghapus seluruh catatan belanja/pengeluaran kulakannya di Buku Kas Keuangan Toko dari database Supabase."
          isDeleting={isDeletingSync}
        />
      )}
    </div>
    </AuthGuard>
  );
}
