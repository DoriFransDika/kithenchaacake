'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Category,
  RawMaterial,
  FinishedProduct,
  Transaction,
  ActivityNotification,
  BusinessSummary
} from '@/types';
import { supabase, supabaseService } from './supabase';
import { extractTrxMaterialRef, extractTrxProductRef, buildTrxProductRef, formatRupiah } from './utils';
import {
  INITIAL_CATEGORIES,
  INITIAL_RAW_MATERIALS,
  INITIAL_FINISHED_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS
} from './mock-data';

export interface ReadyProductInput {
  categoryId: string;
  name: string;
  stock: number;
  minStock: number;
}

export interface ProductSaleInput {
  productId?: string;
  qty: number;
  amount: number;
  category: string;
  description: string;
  paymentMethod: 'Tunai' | 'QRIS / Transfer';
  quantityLabel?: string;
}

interface UserSession {
  email: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}

export type SupabaseStatus = 'loading' | 'connected' | 'disconnected' | 'needs_setup';

interface StoreContextType {
  user: UserSession;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoaded: boolean;
  categories: Category[];
  rawMaterials: RawMaterial[];
  finishedProducts: FinishedProduct[];
  transactions: Transaction[];
  notifications: ActivityNotification[];
  summary: BusinessSummary;
  // Supabase Status & Sync
  supabaseStatus: SupabaseStatus;
  isSupabaseLoading: boolean;
  syncWithSupabase: () => Promise<void>;
  seedSupabaseDatabase: () => Promise<{ success: boolean; message: string }>;
  // Category CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message: string };
  // Business logic actions
  produceProduct: (productId: string, batches: number) => { success: boolean; message: string };
  addRawMaterialStock: (materialId: string, amount: number, totalCost: number) => void;
  recordSale: (productId: string, qty: number, paymentMethod: 'Tunai' | 'QRIS / Transfer', customPrice?: number) => { success: boolean; message: string };
  // Item CRUD & Quick Actions
  addNewMaterial: (material: Omit<RawMaterial, 'id' | 'updatedAt'>, totalPurchaseCost?: number) => void;
  reduceCategoryStock: (categoryId: string, amountKg: number, reason: string) => { success: boolean; message: string };
  updateMaterial: (id: string, updated: Partial<RawMaterial>) => void;
  deleteMaterial: (id: string) => void;
  deleteMaterialWithSync: (materialId: string, syncFinance?: boolean) => Promise<{ success: boolean; message: string; affectedTrxCount: number }>;
  quickAdjustMaterialStock: (id: string, delta: number) => void;
  addNewProduct: (product: Omit<FinishedProduct, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<FinishedProduct>) => void;
  deleteProduct: (id: string) => void;
  quickAdjustProductStock: (id: string, delta: number) => void;
  // Produk Ready (Stok Produk Jadi) & Penjualan Terintegrasi
  addReadyProductStock: (input: ReadyProductInput) => { success: boolean; message: string };
  recordProductSale: (input: ProductSaleInput) => { success: boolean; message: string };
  addTransaction: (trx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactionWithSync: (id: string, syncStock?: boolean) => Promise<{ success: boolean; message: string; affectedMaterialName?: string; affectedProductName?: string }>;
  markNotificationRead: (id: string) => void;
  resetAllData: () => void;
  // Database / Bulk Data Deletion
  clearStockData: (type?: 'materials' | 'products' | 'all') => Promise<{ success: boolean; message: string }>;
  clearTransactionData: () => Promise<{ success: boolean; message: string }>;
  clearEntireDatabase: () => Promise<{ success: boolean; message: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'dapurmamak_user',
  CATEGORIES: 'dapurmamak_categories',
  MATERIALS: 'dapurmamak_materials',
  PRODUCTS: 'dapurmamak_products',
  TRANSACTIONS: 'dapurmamak_transactions',
  NOTIFICATIONS: 'dapurmamak_notifications',
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>({
    email: '',
    name: '',
    role: '',
    isAuthenticated: false,
  });

  // State is purely initialized from Supabase (starts empty, zero dummy data)
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>('loading');
  const [isSupabaseLoading, setIsSupabaseLoading] = useState(false);

  // Sync data directly from Supabase
  const syncWithSupabase = useCallback(async () => {
    setIsSupabaseLoading(true);
    try {
      const [cats, mats, prods, trx, notifs] = await Promise.all([
        supabaseService.getCategories(),
        supabaseService.getRawMaterials(),
        supabaseService.getFinishedProducts(),
        supabaseService.getTransactions(),
        supabaseService.getNotifications(),
      ]);

      if (cats === null) {
        setSupabaseStatus('needs_setup');
      } else {
        setSupabaseStatus('connected');
        setCategories(cats);
        if (mats !== null) setRawMaterials(mats);
        if (prods !== null) setFinishedProducts(prods);
        if (trx !== null) setTransactions(trx);
        if (notifs !== null) setNotifications(notifs);
      }
    } catch (err) {
      console.warn('[Store] Supabase fetch error:', err);
      setSupabaseStatus('disconnected');
    } finally {
      setIsSupabaseLoading(false);
    }
  }, []);

  // One-click seeding of data to Supabase
  const seedSupabaseDatabase = async () => {
    setIsSupabaseLoading(true);
    try {
      const catsToSeed = categories.length > 0 ? categories : INITIAL_CATEGORIES;
      const matsToSeed = rawMaterials.length > 0 ? rawMaterials : INITIAL_RAW_MATERIALS;
      const prodsToSeed = finishedProducts.length > 0 ? finishedProducts : INITIAL_FINISHED_PRODUCTS;
      const trxToSeed = transactions.length > 0 ? transactions : INITIAL_TRANSACTIONS;
      const notifsToSeed = notifications.length > 0 ? notifications : INITIAL_NOTIFICATIONS;

      const res = await supabaseService.seedInitialData(
        catsToSeed,
        matsToSeed,
        prodsToSeed,
        trxToSeed,
        notifsToSeed
      );
      if (res.success) {
        setSupabaseStatus('connected');
        await syncWithSupabase();
      }
      return res;
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  // 1. Initial Load: Read localStorage first for immediate render, then pull from Supabase
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCats) setCategories(JSON.parse(storedCats));

      const storedMats = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (storedMats) setRawMaterials(JSON.parse(storedMats));

      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (storedProds) setFinishedProducts(JSON.parse(storedProds));

      const storedTrx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTrx) setTransactions(JSON.parse(storedTrx));

      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));
    } catch (e) {
      console.error('Error reading localStorage', e);
    } finally {
      setIsLoaded(true);
    }

    // Connect to Supabase
    syncWithSupabase();

    // Setup Supabase Realtime listeners for true multi-device sync
    const channel = supabase
      .channel('realtime-dapurmamak-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        supabaseService.getCategories().then((c) => c !== null && setCategories(c));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raw_materials' }, () => {
        supabaseService.getRawMaterials().then((m) => m !== null && setRawMaterials(m));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finished_products' }, () => {
        supabaseService.getFinishedProducts().then((p) => p !== null && setFinishedProducts(p));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        supabaseService.getTransactions().then((t) => t !== null && setTransactions(t));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        supabaseService.getNotifications().then((n) => n !== null && setNotifications(n));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // 2. Save changes to localStorage as local cache
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(rawMaterials));
    } catch (e) { console.error(e); }
  }, [rawMaterials, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(finishedProducts));
    } catch (e) { console.error(e); }
  }, [finishedProducts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) { console.error(e); }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) { console.error(e); }
  }, [notifications, isLoaded]);

  // Auth methods (Purely dynamic via Supabase Auth and database users table)
  const login = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) return false;

    // 1. Authenticate with Supabase Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!authError && authData.user) {
        const session: UserSession = {
          email: authData.user.email || cleanEmail,
          name: (authData.user.user_metadata?.name as string) || 'Icha - Owner Kitchen Chaacake',
          role: (authData.user.user_metadata?.role as string) || 'Owner Utama',
          isAuthenticated: true,
        };
        setUser(session);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
        return true;
      }
    } catch (authErr) {
      console.warn('Supabase auth sign in error:', authErr);
    }

    // 2. Check dynamic users table in Supabase
    try {
      const dbCheck = await supabaseService.verifyUser(cleanEmail, cleanPass);
      if (dbCheck.success && dbCheck.user) {
        const session: UserSession = {
          email: dbCheck.user.email,
          name: dbCheck.user.name,
          role: dbCheck.user.role,
          isAuthenticated: true,
        };
        setUser(session);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(session));
        return true;
      }
    } catch (e) {
      console.warn('Database user verification error:', e);
    }

    return false;
  };

  const logout = () => {
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
    const session: UserSession = {
      email: '',
      name: '',
      role: '',
      isAuthenticated: false,
    };
    setUser(session);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  // Re-sync all live data from Supabase
  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MATERIALS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    syncWithSupabase();
  };

  // Bulk Database Deletion Methods
  const clearStockData = async (type: 'materials' | 'products' | 'all' = 'all') => {
    setIsSupabaseLoading(true);
    try {
      if (type === 'materials' || type === 'all') {
        setRawMaterials([]);
        localStorage.removeItem(STORAGE_KEYS.MATERIALS);
        await supabaseService.clearAllRawMaterials();
      }
      if (type === 'products' || type === 'all') {
        setFinishedProducts([]);
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        await supabaseService.clearAllFinishedProducts();
      }
      return { success: true, message: 'Data stok berhasil dikosongkan dari sistem dan database Supabase!' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menghapus stok';
      return { success: false, message: msg };
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  const clearTransactionData = async () => {
    setIsSupabaseLoading(true);
    try {
      setTransactions([]);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      await supabaseService.clearAllTransactions();
      return { success: true, message: 'Seluruh riwayat transaksi keuangan berhasil dihapus dari database Supabase!' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal menghapus transaksi';
      return { success: false, message: msg };
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  const clearEntireDatabase = async () => {
    setIsSupabaseLoading(true);
    try {
      setCategories([]);
      setRawMaterials([]);
      setFinishedProducts([]);
      setTransactions([]);
      setNotifications([]);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.MATERIALS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      await supabaseService.clearEntireDatabase();
      return { success: true, message: 'Seluruh database Supabase berhasil dikosongkan!' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal mengosongkan database';
      return { success: false, message: msg };
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  // CATEGORY CRUD
  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    supabaseService.insertCategory(newCat).catch(console.error);
    return newCat;
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newCat = { ...c, ...updated };
          if (updated.name && updated.name !== c.name) {
            setRawMaterials((mats) =>
              mats.map((m) => (m.categoryId === id ? { ...m, category: updated.name! } : m))
            );
            setFinishedProducts((prods) =>
              prods.map((p) => (p.categoryId === id ? { ...p, category: updated.name! } : p))
            );
          }
          return newCat;
        }
        return c;
      })
    );
    supabaseService.updateCategory(id, updated).catch(console.error);
  };

  const deleteCategory = (id: string): { success: boolean; message: string } => {
    const usedInMat = rawMaterials.some((m) => m.categoryId === id);
    const usedInProd = finishedProducts.some((p) => p.categoryId === id);
    if (usedInMat || usedInProd) {
      return {
        success: false,
        message: 'Kategori ini masih digunakan oleh bahan baku atau produk jadi. Pindahkan item terlebih dahulu!',
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    supabaseService.deleteCategory(id).catch(console.error);
    return { success: true, message: 'Kategori berhasil dihapus!' };
  };

  // Logika Produksi Roti
  const produceProduct = (productId: string, batches: number): { success: boolean; message: string } => {
    if (batches <= 0) {
      return { success: false, message: 'Jumlah batch harus lebih dari 0!' };
    }

    const product = finishedProducts.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Produk roti tidak ditemukan!' };
    }

    for (const item of product.recipe) {
      const mat = rawMaterials.find((m) => m.id === item.materialId);
      const needed = item.amount * batches;
      if (!mat) {
        return { success: false, message: `Bahan baku id ${item.materialId} tidak ditemukan di sistem!` };
      }
      if (mat.stock < needed) {
        return {
          success: false,
          message: `Stok ${mat.name} tidak cukup! Butuh ${needed} ${item.unit}, tersisa ${mat.stock} ${mat.unit}.`,
        };
      }
    }

    // Update materials locally & Supabase
    const updatedMaterials = rawMaterials.map((mat) => {
      const recipeItem = product.recipe.find((r) => r.materialId === mat.id);
      if (recipeItem) {
        const consumed = recipeItem.amount * batches;
        const newStock = Math.max(0, Number((mat.stock - consumed).toFixed(2)));
        const updated = {
          ...mat,
          stock: newStock,
          updatedAt: new Date().toISOString().split('T')[0],
        };
        supabaseService.updateRawMaterial(mat.id, { stock: newStock, updatedAt: updated.updatedAt }).catch(console.error);
        return updated;
      }
      return mat;
    });

    const addedOutput = batches * product.batchYield;
    const newProductStock = product.stock + addedOutput;

    const updatedProducts = finishedProducts.map((p) => {
      if (p.id === productId) {
        return { ...p, stock: newProductStock };
      }
      return p;
    });

    setRawMaterials(updatedMaterials);
    setFinishedProducts(updatedProducts);

    supabaseService.updateFinishedProduct(productId, { stock: newProductStock }).catch(console.error);

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'production',
      title: `Baking Selesai: +${addedOutput} ${product.unit} ${product.name}`,
      message: `Berhasil memproduksi ${batches} batch (${addedOutput} ${product.unit}). Bahan dapur telah dipotong otomatis.`,
      time: 'Baru saja',
      severity: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    supabaseService.insertNotification(newNotif).catch(console.error);

    return {
      success: true,
      message: `Sukses! Berhasil memanggang ${addedOutput} ${product.unit} ${product.name}. Etalase bertambah!`,
    };
  };

  const addRawMaterialStock = (materialId: string, amount: number, totalCost: number) => {
    const mat = rawMaterials.find((m) => m.id === materialId);
    if (!mat) return;

    const newStock = Number((mat.stock + amount).toFixed(2));
    const newCostPerUnit = amount > 0 && totalCost > 0 ? Math.round(totalCost / amount) : mat.costPerUnit;
    const today = new Date().toISOString().split('T')[0];

    setRawMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, stock: newStock, costPerUnit: newCostPerUnit, updatedAt: today } : m))
    );
    supabaseService.updateRawMaterial(materialId, { stock: newStock, costPerUnit: newCostPerUnit, updatedAt: today }).catch(console.error);

    if (totalCost > 0) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        date: today,
        type: 'expense',
        category: 'Belanja Bahan Baku',
        amount: totalCost,
        description: `Belanja Restock ${mat.name} (+${amount} ${mat.unit}) [ref:${materialId}]`,
        paymentMethod: 'Tunai',
      };
      setTransactions((prev) => [newTrx, ...prev]);
      supabaseService.insertTransaction(newTrx).catch(console.error);
    }

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'expense',
      title: `Restock Bahan: ${mat.name}`,
      message: `Stok bertambah +${amount} ${mat.unit}. Total belanja ${formatRupiah(totalCost)}.`,
      time: 'Baru saja',
      severity: 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    supabaseService.insertNotification(newNotif).catch(console.error);
  };

  const recordSale = (
    productId: string,
    qty: number,
    paymentMethod: 'Tunai' | 'QRIS / Transfer',
    customPrice?: number
  ): { success: boolean; message: string } => {
    const prod = finishedProducts.find((p) => p.id === productId);
    if (!prod) return { success: false, message: 'Produk tidak ditemukan!' };
    if (prod.stock < qty) {
      return { success: false, message: `Stok etalase tidak cukup! Hanya tersedia ${prod.stock} ${prod.unit}.` };
    }

    const price = customPrice || prod.sellingPrice;
    const totalRevenue = price * qty;
    const newStock = prod.stock - qty;

    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    supabaseService.updateFinishedProduct(productId, { stock: newStock }).catch(console.error);

    const today = new Date().toISOString().split('T')[0];
    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      date: today,
      type: 'income',
      category: 'Penjualan Toko',
      amount: totalRevenue,
      description: `Penjualan ${qty} ${prod.unit} ${prod.name} ${buildTrxProductRef(productId, qty)}`,
      paymentMethod,
      quantity: `+${qty} ${prod.unit}`,
    };
    setTransactions((prev) => [newTrx, ...prev]);
    supabaseService.insertTransaction(newTrx).catch(console.error);

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'sale',
      title: `Penjualan Kasir: ${formatRupiah(totalRevenue)}`,
      message: `${qty}x ${prod.name} terjual via ${paymentMethod}.`,
      time: 'Baru saja',
      severity: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    supabaseService.insertNotification(newNotif).catch(console.error);

    return {
      success: true,
      message: `Penjualan ${qty} ${prod.unit} berhasil dicatat! Pemasukan +${formatRupiah(totalRevenue)}.`,
    };
  };

  const addNewMaterial = (mat: Omit<RawMaterial, 'id' | 'updatedAt'>, totalPurchaseCost?: number) => {
    const today = new Date().toISOString().split('T')[0];

    const cleanName = mat.name.trim();

    // Cek apakah sudah ada bahan baku dengan NAMA MEREK yang sama persis dalam kategori ini
    const existing = rawMaterials.find(
      (m) =>
        ((mat.categoryId && m.categoryId === mat.categoryId) ||
          m.category.toLowerCase().trim() === mat.category.toLowerCase().trim()) &&
        m.name.toLowerCase().trim() === cleanName.toLowerCase()
    );

    let targetMaterialId = '';

    if (existing) {
      targetMaterialId = existing.id;
      // Akumulasikan stok jika nama merek bahan baku yang sama persis sudah ada
      const updatedStock = Number((Number(existing.stock) + Number(mat.stock)).toFixed(3));
      const updated = {
        ...existing,
        stock: updatedStock,
        updatedAt: today,
      };

      setRawMaterials((prev) =>
        prev.map((m) => (m.id === existing.id ? updated : m))
      );
      supabaseService.updateRawMaterial(existing.id, {
        stock: updatedStock,
        updatedAt: today,
      }).catch(console.error);
    } else {
      // Buat entri baru untuk merek/jenis bahan baku baru (TIDAK DITIMPA)
      targetMaterialId = `mat-${Date.now()}`;
      const newEntry: RawMaterial = {
        ...mat,
        name: cleanName || mat.category,
        id: targetMaterialId,
        updatedAt: today,
      };
      setRawMaterials((prev) => [newEntry, ...prev]);
      supabaseService.insertRawMaterial(newEntry).catch(console.error);
    }

    // Catat transaksi pengeluaran keuangan otomatis
    const finalCost =
      totalPurchaseCost !== undefined && totalPurchaseCost > 0
        ? totalPurchaseCost
        : (mat.costPerUnit || 0) * (mat.stock || 0);

    if (finalCost > 0) {
      const newTrx: Transaction = {
        id: `trx-${Date.now()}`,
        date: today,
        type: 'expense',
        category: 'Belanja Bahan Baku',
        amount: finalCost,
        description: `Belanja Bahan: ${mat.category}${mat.name ? ` (${mat.name})` : ''} (+${mat.stock} ${mat.unit}) [ref:${targetMaterialId}]`,
        paymentMethod: 'Tunai',
        quantity: `+${mat.stock} ${mat.unit}`,
      };
      setTransactions((prev) => [newTrx, ...prev]);
      supabaseService.insertTransaction(newTrx).catch(console.error);
    }
  };

  const reduceCategoryStock = (
    categoryId: string,
    amountKg: number,
    reason: string
  ): { success: boolean; message: string } => {
    const target = rawMaterials.find(
      (m) => m.categoryId === categoryId || m.category.toLowerCase().trim() === categoryId.toLowerCase().trim()
    );

    if (!target) {
      return { success: false, message: 'Kategori bahan baku tidak ditemukan!' };
    }

    if (target.stock <= 0) {
      return { success: false, message: `Stok ${target.category} sudah habis (0 ${target.unit}).` };
    }

    const today = new Date().toISOString().split('T')[0];
    const newStock = Math.max(0, Number((target.stock - amountKg).toFixed(3)));

    setRawMaterials((prev) =>
      prev.map((m) => (m.id === target.id ? { ...m, stock: newStock, updatedAt: today } : m))
    );
    supabaseService.updateRawMaterial(target.id, { stock: newStock, updatedAt: today }).catch(console.error);

    const displayName = target.name && target.name !== target.category ? `${target.name} (${target.category})` : target.category;

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'expense',
      title: `Pengurangan Stok: ${target.name || target.category}`,
      message: `Dipangkas -${amountKg} ${target.unit}. Sisa: ${newStock} ${target.unit}. Alasan: ${reason || 'Dipakai Dapur'}.`,
      time: 'Baru saja',
      severity: newStock <= target.minStock ? 'warning' : 'info',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    supabaseService.insertNotification(newNotif).catch(console.error);

    return {
      success: true,
      message: `Stok ${displayName} berhasil dikurangi ${amountKg} ${target.unit}. Tersisa ${newStock} ${target.unit}.`,
    };
  };

  const updateMaterial = (id: string, updated: Partial<RawMaterial>) => {
    const updatedWithDate = {
      ...updated,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setRawMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedWithDate } : m))
    );
    supabaseService.updateRawMaterial(id, updatedWithDate).catch(console.error);
  };

  const deleteMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
    supabaseService.deleteRawMaterial(id).catch(console.error);
  };

  const deleteMaterialWithSync = async (
    materialId: string,
    syncFinance: boolean = true
  ): Promise<{ success: boolean; message: string; affectedTrxCount: number }> => {
    const mat = rawMaterials.find((m) => m.id === materialId);
    if (!mat) return { success: false, message: 'Bahan baku tidak ditemukan!', affectedTrxCount: 0 };

    setRawMaterials((prev) => prev.filter((m) => m.id !== materialId));
    await supabaseService.deleteRawMaterial(materialId).catch(console.error);

    let affectedTrxCount = 0;
    if (syncFinance) {
      const relatedTrxs = transactions.filter((t) => {
        if (t.type !== 'expense') return false;
        const refId = extractTrxMaterialRef(t.description);
        if (refId && refId === materialId) return true;
        return (
          t.category === 'Belanja Bahan Baku' &&
          (t.description.toLowerCase().includes(mat.category.toLowerCase()) ||
            (mat.name && t.description.toLowerCase().includes(mat.name.toLowerCase())))
        );
      });

      affectedTrxCount = relatedTrxs.length;
      if (relatedTrxs.length > 0) {
        const relatedIds = new Set(relatedTrxs.map((t) => t.id));
        setTransactions((prev) => prev.filter((t) => !relatedIds.has(t.id)));
        await Promise.all(relatedTrxs.map((t) => supabaseService.deleteTransaction(t.id))).catch(console.error);
      }
    }

    return {
      success: true,
      message:
        affectedTrxCount > 0
          ? `Bahan ${mat.category} dihapus & ${affectedTrxCount} catatan belanja terkait telah dibersihkan dari buku kas.`
          : `Bahan ${mat.category} berhasil dihapus.`,
      affectedTrxCount,
    };
  };

  const quickAdjustMaterialStock = (id: string, delta: number) => {
    const today = new Date().toISOString().split('T')[0];
    let newStockVal = 0;
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          newStockVal = Math.max(0, Number((m.stock + delta).toFixed(2)));
          return {
            ...m,
            stock: newStockVal,
            updatedAt: today,
          };
        }
        return m;
      })
    );
    supabaseService.updateRawMaterial(id, { stock: newStockVal, updatedAt: today }).catch(console.error);
  };

  const addNewProduct = (prod: Omit<FinishedProduct, 'id'>) => {
    const newEntry: FinishedProduct = {
      ...prod,
      id: `prod-${Date.now()}`,
    };
    setFinishedProducts((prev) => [newEntry, ...prev]);
    supabaseService.insertFinishedProduct(newEntry).catch(console.error);
  };

  const updateProduct = (id: string, updated: Partial<FinishedProduct>) => {
    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    supabaseService.updateFinishedProduct(id, updated).catch(console.error);
  };

  const deleteProduct = (id: string) => {
    setFinishedProducts((prev) => prev.filter((p) => p.id !== id));
    supabaseService.deleteFinishedProduct(id).catch(console.error);
  };

  const quickAdjustProductStock = (id: string, delta: number) => {
    const target = finishedProducts.find((p) => p.id === id);
    if (!target) return;
    const newStockVal = Math.max(0, target.stock + delta);
    setFinishedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStockVal } : p))
    );
    supabaseService.updateFinishedProduct(id, { stock: newStockVal }).catch(console.error);
  };

  // Input Stok Produk Ready: satuan dikunci "pcs", batas warning dikunci 5 pcs. Jika nama + kategori sama sudah ada, stok diakumulasikan.
  const addReadyProductStock = (input: ReadyProductInput): { success: boolean; message: string } => {
    const name = input.name.trim();
    const qty = Math.floor(Number(input.stock));
    const minStock = 5; // Batas warning dikunci di angka 5 pcs
    const cat = categories.find((c) => c.id === input.categoryId && c.type === 'product');

    if (!cat) return { success: false, message: 'Pilih kategori produk terlebih dahulu!' };
    if (!name) return { success: false, message: 'Nama produk wajib diisi!' };
    if (!Number.isFinite(qty) || qty <= 0) return { success: false, message: 'Jumlah stok harus berupa angka bulat lebih dari 0!' };

    const existing = finishedProducts.find(
      (p) => p.categoryId === cat.id && p.name.toLowerCase().trim() === name.toLowerCase()
    );

    let resultStock = qty;
    if (existing) {
      resultStock = existing.stock + qty;
      const patch: Partial<FinishedProduct> = { stock: resultStock, minStock, unit: 'pcs' };
      setFinishedProducts((prev) => prev.map((p) => (p.id === existing.id ? { ...p, ...patch } : p)));
      supabaseService.updateFinishedProduct(existing.id, patch).catch(console.error);
    } else {
      const newEntry: FinishedProduct = {
        id: `prod-${Date.now()}`,
        name,
        categoryId: cat.id,
        category: cat.name,
        stock: qty,
        unit: 'pcs',
        sellingPrice: 0,
        costPrice: 0,
        minStock,
        batchYield: 1,
        recipe: [],
      };
      setFinishedProducts((prev) => [newEntry, ...prev]);
      supabaseService.insertFinishedProduct(newEntry).catch(console.error);
    }

    const newNotif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      type: 'production',
      title: `Stok Ready: +${qty} pcs ${name}`,
      message: `${cat.name} • Total stok sekarang ${resultStock} pcs.`,
      time: 'Baru saja',
      severity: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    supabaseService.insertNotification(newNotif).catch(console.error);

    return {
      success: true,
      message: existing
        ? `Stok ${name} ditambah +${qty} pcs (total ${resultStock} pcs).`
        : `Produk ${name} ditambahkan dengan stok ${qty} pcs.`,
    };
  };

  // Transaksi penjualan dari Keuangan Toko: validasi stok lalu kurangi stok produk di Manajemen Stok.
  const recordProductSale = (input: ProductSaleInput): { success: boolean; message: string } => {
    const amount = Number(input.amount);
    const description = input.description.trim();
    if (!amount || amount <= 0) return { success: false, message: 'Nominal penjualan harus lebih dari 0!' };
    if (!description) return { success: false, message: 'Keterangan transaksi wajib diisi!' };

    const today = new Date().toISOString().split('T')[0];
    let finalDescription = description;
    let quantityLabel = input.quantityLabel?.trim() || undefined;
    let successMsg = `Transaksi penjualan ${formatRupiah(amount)} berhasil dicatat!`;

    if (input.productId) {
      const prod = finishedProducts.find((p) => p.id === input.productId);
      const qty = Math.floor(Number(input.qty));
      if (!prod) return { success: false, message: 'Produk tidak ditemukan di Manajemen Stok!' };
      if (!Number.isFinite(qty) || qty <= 0) return { success: false, message: 'Jumlah produk terjual harus angka bulat lebih dari 0!' };
      if (prod.stock <= 0) return { success: false, message: `Stok ${prod.name} sudah habis (0 ${prod.unit}).` };
      if (qty > prod.stock) {
        return { success: false, message: `Stok ${prod.name} tidak cukup! Tersedia ${prod.stock} ${prod.unit}, diminta ${qty}.` };
      }

      const newStock = prod.stock - qty;
      setFinishedProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, stock: newStock } : p)));
      supabaseService.updateFinishedProduct(prod.id, { stock: newStock }).catch(console.error);

      finalDescription = `${description} ${buildTrxProductRef(prod.id, qty)}`;
      quantityLabel = `${qty} ${prod.unit}`;
      successMsg = `Penjualan ${prod.name} ${formatRupiah(amount)} dicatat & stok berkurang ${qty} ${prod.unit} (sisa ${newStock}).`;

      if (newStock <= prod.minStock) {
        const warnNotif: ActivityNotification = {
          id: `notif-${Date.now()}-stk`,
          type: 'low_stock',
          title: newStock === 0 ? `Stok Habis: ${prod.name}` : `Stok Menipis: ${prod.name}`,
          message: `Sisa ${newStock} ${prod.unit} setelah penjualan. Segera isi ulang.`,
          time: 'Baru saja',
          severity: 'warning',
        };
        setNotifications((prev) => [warnNotif, ...prev]);
        supabaseService.insertNotification(warnNotif).catch(console.error);
      }
    }

    const newTrx: Transaction = {
      id: `trx-${Date.now()}`,
      date: today,
      type: 'income',
      category: input.category || 'Penjualan Toko',
      amount,
      description: finalDescription,
      paymentMethod: input.paymentMethod,
      quantity: quantityLabel,
    };
    setTransactions((prev) => [newTrx, ...prev]);
    supabaseService.insertTransaction(newTrx).catch(console.error);

    return { success: true, message: successMsg };
  };

  const addTransaction = (trx: Omit<Transaction, 'id'>) => {
    const newEntry: Transaction = {
      ...trx,
      id: `trx-${Date.now()}`,
    };
    setTransactions((prev) => [newEntry, ...prev]);
    supabaseService.insertTransaction(newEntry).catch(console.error);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    supabaseService.deleteTransaction(id).catch(console.error);
  };

  const deleteTransactionWithSync = async (
    id: string,
    syncStock: boolean = true
  ): Promise<{ success: boolean; message: string; affectedMaterialName?: string; affectedProductName?: string }> => {
    const targetTrx = transactions.find((t) => t.id === id);
    if (!targetTrx) return { success: false, message: 'Transaksi tidak ditemukan!' };

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await supabaseService.deleteTransaction(id).catch(console.error);

    let affectedMaterialName: string | undefined;

    if (syncStock && targetTrx.type === 'expense') {
      const refId = extractTrxMaterialRef(targetTrx.description);
      const matchedMaterial = refId
        ? rawMaterials.find((m) => m.id === refId)
        : rawMaterials.find(
            (m) =>
              targetTrx.description.toLowerCase().includes(m.category.toLowerCase()) ||
              (m.name && targetTrx.description.toLowerCase().includes(m.name.toLowerCase()))
          );

      if (matchedMaterial) {
        affectedMaterialName = matchedMaterial.category || matchedMaterial.name;
        const qtyMatch = targetTrx.description.match(/\+(\d+(?:\.\d+)?)\s*(?:kg|gr|butir|liter|ml|pack|pcs)/i);
        const addedQty = qtyMatch ? parseFloat(qtyMatch[1]) : 0;

        if (addedQty > 0 && matchedMaterial.stock > addedQty) {
          const newStock = Number((matchedMaterial.stock - addedQty).toFixed(3));
          setRawMaterials((prev) =>
            prev.map((m) => (m.id === matchedMaterial.id ? { ...m, stock: newStock } : m))
          );
          await supabaseService.updateRawMaterial(matchedMaterial.id, { stock: newStock }).catch(console.error);
        } else {
          const newStock = Math.max(0, Number((matchedMaterial.stock - (addedQty || matchedMaterial.stock)).toFixed(3)));
          setRawMaterials((prev) =>
            prev.map((m) => (m.id === matchedMaterial.id ? { ...m, stock: newStock } : m))
          );
          await supabaseService.updateRawMaterial(matchedMaterial.id, { stock: newStock }).catch(console.error);
        }
      }
    }

    let affectedProductName: string | undefined;
    if (syncStock && targetTrx.type === 'income') {
      const prodRef = extractTrxProductRef(targetTrx.description);
      const prod = prodRef ? finishedProducts.find((p) => p.id === prodRef.productId) : undefined;
      if (prodRef && prod) {
        const restored = prod.stock + prodRef.qty;
        affectedProductName = prod.name;
        setFinishedProducts((prev) => prev.map((p) => (p.id === prod.id ? { ...p, stock: restored } : p)));
        await supabaseService.updateFinishedProduct(prod.id, { stock: restored }).catch(console.error);
      }
    }

    return {
      success: true,
      message: affectedMaterialName
        ? `Transaksi belanja dihapus & stok ${affectedMaterialName} telah disinkronkan otomatis.`
        : affectedProductName
        ? `Transaksi penjualan dihapus & stok ${affectedProductName} dikembalikan ke Manajemen Stok.`
        : 'Transaksi berhasil dihapus.',
      affectedMaterialName,
      affectedProductName,
    };
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    supabaseService.deleteNotification(id).catch(console.error);
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const readyProductsCount = finishedProducts.reduce((sum, p) => sum + p.stock, 0);

  const lowStockMaterials = rawMaterials.filter((m) => m.stock <= m.minStock).length;
  const lowStockProducts = finishedProducts.filter((p) => p.stock <= p.minStock).length;
  const lowStockItemsCount = lowStockMaterials + lowStockProducts;

  const summary: BusinessSummary = {
    totalIncome,
    totalExpense,
    netProfit,
    readyProductsCount,
    lowStockItemsCount,
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        isLoaded,
        categories,
        rawMaterials,
        finishedProducts,
        transactions,
        notifications,
        summary,
        supabaseStatus,
        isSupabaseLoading,
        syncWithSupabase,
        seedSupabaseDatabase,
        addCategory,
        updateCategory,
        deleteCategory,
        produceProduct,
        addRawMaterialStock,
        recordSale,
        addNewMaterial,
        reduceCategoryStock,
        updateMaterial,
        deleteMaterial,
        deleteMaterialWithSync,
        quickAdjustMaterialStock,
        addNewProduct,
        updateProduct,
        deleteProduct,
        quickAdjustProductStock,
        addReadyProductStock,
        recordProductSale,
        addTransaction,
        deleteTransaction,
        deleteTransactionWithSync,
        markNotificationRead,
        resetAllData,
        clearStockData,
        clearTransactionData,
        clearEntireDatabase,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
