'use client';

import React, { useState } from 'react';
import { Tags, Plus, Edit2, Trash2, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import {
  CategoryIcon,
  MATERIAL_CATEGORY_ICONS,
  PRODUCT_CATEGORY_ICONS,
  CATEGORY_COLOR_PRESETS
} from '@/components/common/CategoryIcon';
import { Category, UnitGroup } from '@/types';
import { getCategoryUnitGroup, cleanCategoryDescription, getCategoryCriticalUnit, UNIT_GROUP_CONFIG } from '@/lib/utils';
import { Scale, Droplets, Package, AlertCircle } from 'lucide-react';

interface CategoryManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'material' | 'product';
}

export function CategoryManageModal({
  isOpen,
  onClose,
  initialType = 'material',
}: CategoryManageModalProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const [activeTab, setActiveTab] = useState<'material' | 'product'>(initialType);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'material' | 'product'>(initialType);
  const [unitGroup, setUnitGroup] = useState<UnitGroup>('weight');
  const [minStock, setMinStock] = useState<number | string>(2);
  const [showBatasTooltip, setShowBatasTooltip] = useState(false);
  const [iconName, setIconName] = useState('Wheat');
  const [selectedColorPreset, setSelectedColorPreset] = useState(CATEGORY_COLOR_PRESETS[0]);
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategories = categories.filter((c) => c.type === activeTab);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab);
    setUnitGroup('weight');
    setMinStock(activeTab === 'material' ? 2 : 5);
    setIconName(activeTab === 'material' ? 'Wheat' : 'Croissant');
    setSelectedColorPreset(CATEGORY_COLOR_PRESETS[0]);
    setDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setUnitGroup(getCategoryUnitGroup(cat));
    setMinStock(cat.minStock ?? (cat.type === 'material' ? 2 : 5));
    setIconName(cat.iconName);
    const foundPreset = CATEGORY_COLOR_PRESETS.find((p) => p.bg === cat.bgColor) || CATEGORY_COLOR_PRESETS[0];
    setSelectedColorPreset(foundPreset);
    setDescription(cleanCategoryDescription(cat.description) || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numMin = Number(minStock) || (type === 'material' ? 2 : 5);
    const cleanDesc = cleanCategoryDescription(description);
    const finalDesc = `${cleanDesc} [min:${numMin}]${type === 'material' ? ` [unit:${unitGroup}]` : ''}`.trim();

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        unitGroup: type === 'material' ? unitGroup : undefined,
        minStock: numMin,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: finalDesc,
      });
      setFeedback('Kategori berhasil diperbarui!');
    } else {
      addCategory({
        name: name.trim(),
        type,
        unitGroup: type === 'material' ? unitGroup : undefined,
        minStock: numMin,
        iconName,
        bgColor: selectedColorPreset.bg,
        textColor: selectedColorPreset.text,
        description: finalDesc,
      });
      setFeedback('Kategori baru berhasil ditambahkan!');
    }

    setIsFormOpen(false);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`Yakin ingin menghapus kategori "${cat.name}"?`)) {
      const res = deleteCategory(cat.id);
      if (!res.success) {
        alert(res.message);
      } else {
        setFeedback('Kategori berhasil dihapus.');
        setTimeout(() => setFeedback(null), 2500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-[#F8BBD0] rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#F8BBD0] flex items-center justify-between bg-gradient-to-r from-[#FFF5F7] to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFEBEF] text-[#C2185B] flex items-center justify-center border border-[#F8BBD0]">
              <Tags className="w-4 h-4 text-[#C2185B]" />
            </div>
            <div>
              <h3 className="font-black text-[#311B1E] text-sm sm:text-base">
                Kelola Kategori Interaktif
              </h3>
              <p className="text-[10px] sm:text-xs text-[#8D5B68]">
                Atur ikon dompet digital dan warna pastel kategori toko
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFEBEF] hover:bg-[#F8BBD0]/50 text-[#8D5B68] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab & New Category Button */}
        <div className="p-3 sm:p-4 bg-[#FFEBEF]/20 border-b border-[#F8BBD0] flex items-center justify-between gap-2">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#F8BBD0] text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('material');
                setIsFormOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                activeTab === 'material' ? 'bg-[#C2185B] text-white shadow-xs' : 'text-[#8D5B68]'
              }`}
            >
              Bahan Baku Dapur
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('product');
                setIsFormOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] ${
                activeTab === 'product' ? 'bg-[#C2185B] text-white shadow-xs' : 'text-[#8D5B68]'
              }`}
            >
              Produk Jadi
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white text-xs font-black flex items-center gap-1 shadow-xs hover:brightness-105 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Kategori Baru</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 bg-[#FFEBEF]/20">
          {/* Form Mode (Add or Edit) */}
          {isFormOpen ? (
            <form onSubmit={handleSave} className="p-3.5 sm:p-4 bg-white rounded-2xl border-1.5 border-[#F8BBD0] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F8BBD0]">
                <span className="text-xs font-black text-[#311B1E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2185B]" />
                  {editingCategory ? 'Ubah Kategori' : 'Buat Kategori Baru'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-[11px] text-[#8D5B68] hover:text-[#311B1E] font-bold"
                >
                  Batal
                </button>
              </div>

              {/* Tipe Kategori */}
              <div>
                <label className="block text-[11px] font-bold text-[#311B1E] mb-1">Tipe Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('material');
                      if (!MATERIAL_CATEGORY_ICONS.some((i) => i.name.toLowerCase() === iconName.toLowerCase())) {
                        setIconName('Wheat');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      type === 'material'
                        ? 'bg-[#FFEBEF] border-[#C2185B] text-[#C2185B] shadow-2xs font-black'
                        : 'bg-white border-[#F8BBD0] text-[#8D5B68]'
                    }`}
                  >
                    Bahan Baku Dapur
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('product');
                      if (!PRODUCT_CATEGORY_ICONS.some((i) => i.name.toLowerCase() === iconName.toLowerCase())) {
                        setIconName('Croissant');
                      }
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      type === 'product'
                        ? 'bg-[#FFEBEF] border-[#C2185B] text-[#C2185B] shadow-2xs font-black'
                        : 'bg-white border-[#F8BBD0] text-[#8D5B68]'
                    }`}
                  >
                    Produk Jadi
                  </button>
                </div>
              </div>

              {/* Jenis Satuan Kategori (Khusus Bahan Baku) */}
              {type === 'material' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#311B1E] mb-1">
                    Jenis Satuan Kategori <span className="text-[#C2185B] font-normal">(basis satuan persediaan)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setUnitGroup('weight')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'weight'
                          ? 'bg-[#FFEBEF] border-[#C2185B] ring-1 ring-[#C2185B] text-[#311B1E]'
                          : 'bg-white border-[#F8BBD0] text-[#8D5B68] hover:bg-[#FFEBEF]/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Scale className="w-3.5 h-3.5 text-[#C2185B]" />
                        <span>Berat</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D5B68] mt-1 font-medium leading-tight">
                        Default basis: gram / kg
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnitGroup('volume')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'volume'
                          ? 'bg-[#FFEBEF] border-[#C2185B] ring-1 ring-[#C2185B] text-[#311B1E]'
                          : 'bg-white border-[#F8BBD0] text-[#8D5B68] hover:bg-[#FFEBEF]/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Droplets className="w-3.5 h-3.5 text-blue-600" />
                        <span>Volume</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D6E63] mt-1 font-medium leading-tight">
                        Default basis: Liter / ml
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUnitGroup('count')}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        unitGroup === 'count'
                          ? 'bg-[#FFEBEF] border-[#C2185B] ring-1 ring-[#C2185B] text-[#311B1E]'
                          : 'bg-white border-[#F8BBD0] text-[#8D5B68] hover:bg-[#FFEBEF]/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-black text-xs">
                        <Package className="w-3.5 h-3.5 text-amber-700" />
                        <span>Unit / Hitung</span>
                      </div>
                      <span className="text-[9.5px] text-[#8D5B68] mt-1 font-medium leading-tight">
                        Default basis: pcs / kaleng / botol / kotak
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#311B1E] mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'material' ? 'Contoh: Tepung & Gandum' : 'Contoh: Roti Manis & Sobek'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-3 py-1.5 text-xs text-[#311B1E] font-bold focus:outline-none"
                />
              </div>

              {/* Icon Selector (Khusus Bahan Baku atau Khusus Produk) */}
              <div>
                <label className="block text-[11px] font-bold text-[#311B1E] mb-1">
                  Pilih Ikon Visual {type === 'material' ? '(Bahan Baku)' : '(Produk Jadi)'}
                </label>
                <div className="grid grid-cols-7 gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white rounded-xl border border-[#F8BBD0]">
                  {(type === 'material' ? MATERIAL_CATEGORY_ICONS : PRODUCT_CATEGORY_ICONS).map((iconItem) => {
                    const isSelected = iconName.toLowerCase() === iconItem.name.toLowerCase();
                    const IconComp = iconItem.icon;
                    return (
                      <button
                        key={iconItem.name}
                        type="button"
                        onClick={() => setIconName(iconItem.name)}
                        className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#C2185B] text-white shadow-xs scale-105'
                            : 'bg-white text-[#8D5B68] hover:bg-[#FFEBEF] border border-[#F8BBD0]'
                        }`}
                        title={iconItem.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Preset Selector (E-Wallet Style Pastel Circles without confusing text) */}
              <div>
                <label className="block text-[11px] font-bold text-[#311B1E] mb-1.5">
                  Warna Latar Pastel (Gaya Dompet Digital)
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-white rounded-xl border border-[#F8BBD0]">
                  {CATEGORY_COLOR_PRESETS.map((p) => {
                    const isSelected = selectedColorPreset.id === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedColorPreset(p)}
                        className={`h-8 rounded-xl flex items-center justify-center transition-all ${p.bg} ${
                          isSelected
                            ? 'ring-2 ring-offset-1 ring-[#C2185B] scale-105 shadow-xs border border-white'
                            : 'border border-black/5 hover:scale-105'
                        }`}
                        title={p.id}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#311B1E] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Batas Kritis Stok Minimum */}
              <div className="p-3 rounded-xl bg-[#FFEBEF]/40 border border-[#F8BBD0] space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-black text-[#311B1E]">
                      Batas Kritis (Stok Minimum)
                    </label>
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setShowBatasTooltip(!showBatasTooltip)}
                        onMouseEnter={() => setShowBatasTooltip(true)}
                        onMouseLeave={() => setShowBatasTooltip(false)}
                        className="w-4 h-4 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 flex items-center justify-center font-black text-[10px] shadow-2xs transition-colors"
                        title="Info Batas Kritis"
                      >
                        !
                      </button>
                      {showBatasTooltip && (
                        <div className="absolute left-6 -top-2 z-50 w-64 p-2.5 rounded-xl bg-[#311B1E] text-white text-[10.5px] font-medium leading-relaxed shadow-xl border border-[#F8BBD0] animate-in fade-in duration-150">
                          Batas stok minimum persediaan. Jika sisa persediaan mencapai atau di bawah angka ini, sistem otomatis memasukkannya ke dalam kategori Kritis (sekarat) untuk memicu notifikasi restok atau produksi ulang.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#8D5B68]">
                    Satuan: <strong className="text-[#C2185B] uppercase">{type === 'product' ? 'pcs' : unitGroup === 'volume' ? 'liter' : unitGroup === 'count' ? 'pcs' : 'kg'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="Contoh: 5"
                    className="flex-1 bg-white border border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-3 py-1.5 text-xs text-[#311B1E] font-black focus:outline-none"
                  />
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#F8BBD0] text-xs font-bold text-[#8D5B68] min-w-14 text-center">
                    {type === 'product' ? 'pcs' : unitGroup === 'volume' ? 'liter' : unitGroup === 'count' ? 'pcs' : 'kg'}
                  </span>
                </div>
                <p className="text-[9.5px] text-[#8D5B68]">
                  * Seluruh bahan & produk di bawah kategori ini akan otomatis mengacu pada batas kritis ini.
                </p>
              </div>

              {/* Keterangan Kategori */}
              <div>
                <label className="block text-[11px] font-bold text-[#311B1E] mb-1">
                  Keterangan Kategori (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Menu etalase reguler toko / bahan dasar"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-[#F8BBD0] focus:border-[#C2185B] rounded-xl px-3 py-1.5 text-xs text-[#311B1E] font-medium focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 text-[#8D5B68] text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#D81B60] text-white text-xs font-black shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          ) : (
            /* Category List View */
            <div className="space-y-2">
              {currentCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8D5B68]">
                  Belum ada kategori untuk tipe ini. Klik &quot;+ Kategori&quot; untuk menambahkan.
                </div>
              ) : (
                currentCategories.map((cat) => {
                  const uGroup = getCategoryUnitGroup(cat);
                  const uConfig = UNIT_GROUP_CONFIG[uGroup];
                  return (
                    <div
                      key={cat.id}
                      className="p-2.5 sm:p-3 rounded-xl bg-white border border-[#F8BBD0] flex items-center justify-between gap-2.5 hover:border-[#C2185B] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cat.bgColor} ${cat.textColor} shrink-0 border border-black/5`}>
                          <CategoryIcon name={cat.iconName} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-black text-xs text-[#311B1E] truncate">{cat.name}</p>
                            {cat.type === 'material' && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-[#FFEBEF] text-[#C2185B] border border-[#F8BBD0] shrink-0">
                                {uGroup === 'weight' ? '⚖️ Berat' : uGroup === 'volume' ? '🥛 Volume' : '📦 Unit'}
                              </span>
                            )}
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                              Kritis: ≤ {cat.minStock ?? (cat.type === 'material' ? 2 : 5)} {getCategoryCriticalUnit(cat)}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8D5B68] truncate">
                            {cleanCategoryDescription(cat.description) || uConfig.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-[#FFEBEF] text-[#8D5B68] hover:text-[#C2185B]"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-[#8D5B68] hover:text-rose-600"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
