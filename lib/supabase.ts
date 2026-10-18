import { createClient } from '@supabase/supabase-js';
import { Category, RawMaterial, FinishedProduct, Transaction, ActivityNotification } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aivmrlglexmzbryjvaui.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Hieo3NpRo1vEHsQkNB9OwQ_d2nE1nGO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database record interfaces (snake_case from Supabase DB)
export interface DbCategory {
  id: string;
  name: string;
  type: 'material' | 'product';
  icon_name?: string;
  iconName?: string;
  bg_color?: string;
  bgColor?: string;
  text_color?: string;
  textColor?: string;
  description?: string;
  unit_group?: 'weight' | 'volume' | 'count';
  unitGroup?: 'weight' | 'volume' | 'count';
  created_at?: string;
}

export interface DbRawMaterial {
  id: string;
  name: string;
  category_id?: string;
  categoryId?: string;
  category: string;
  stock: number;
  unit: 'kg' | 'gr' | 'butir' | 'liter' | 'ml' | 'pack' | 'pcs';
  min_stock?: number;
  minStock?: number;
  cost_per_unit?: number;
  costPerUnit?: number;
  updated_at?: string;
  updatedAt?: string;
  created_at?: string;
}

export interface DbFinishedProduct {
  id: string;
  name: string;
  category_id?: string;
  categoryId?: string;
  category: string;
  stock: number;
  unit: 'pcs' | 'box' | 'loyang';
  selling_price?: number;
  sellingPrice?: number;
  cost_price?: number;
  costPrice?: number;
  min_stock?: number;
  minStock?: number;
  batch_yield?: number;
  batchYield?: number;
  recipe: Array<{ materialId: string; amount: number; unit: string }>;
  image_url?: string;
  imageUrl?: string;
  created_at?: string;
}

export interface DbTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  payment_method?: 'Tunai' | 'QRIS / Transfer';
  paymentMethod?: 'Tunai' | 'QRIS / Transfer';
  quantity?: string;
  created_at?: string;
}

export interface DbNotification {
  id: string;
  type: 'low_stock' | 'production' | 'sale' | 'expense';
  title: string;
  message: string;
  time: string;
  severity: 'warning' | 'success' | 'info';
  created_at?: string;
}

export interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: string;
  created_at?: string;
}

// -------------------------------------------------------------
// Mapping Helpers (DB snake_case <-> App camelCase)
// -------------------------------------------------------------

export function mapCategoryFromDb(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    iconName: row.icon_name || row.iconName || 'Wheat',
    bgColor: row.bg_color || row.bgColor || 'bg-amber-100',
    textColor: row.text_color || row.textColor || 'text-amber-700',
    description: row.description || '',
    unitGroup: row.unit_group || row.unitGroup || undefined,
  };
}

export function mapCategoryToDb(cat: Partial<Category>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (cat.id !== undefined) result.id = cat.id;
  if (cat.name !== undefined) result.name = cat.name;
  if (cat.type !== undefined) result.type = cat.type;
  if (cat.iconName !== undefined) result.icon_name = cat.iconName;
  if (cat.bgColor !== undefined) result.bg_color = cat.bgColor;
  if (cat.textColor !== undefined) result.text_color = cat.textColor;
  if (cat.description !== undefined) result.description = cat.description;
  if (cat.unitGroup !== undefined) result.unit_group = cat.unitGroup;
  return result;
}

export function mapRawMaterialFromDb(row: DbRawMaterial): RawMaterial {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id || row.categoryId || '',
    category: row.category,
    stock: Number(row.stock) || 0,
    unit: row.unit,
    minStock: Number(row.min_stock ?? row.minStock) || 0,
    costPerUnit: Number(row.cost_per_unit ?? row.costPerUnit) || 0,
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString().split('T')[0],
  };
}

export function mapRawMaterialToDb(mat: Partial<RawMaterial>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (mat.id !== undefined) result.id = mat.id;
  if (mat.name !== undefined) result.name = mat.name;
  if (mat.categoryId !== undefined) result.category_id = mat.categoryId;
  if (mat.category !== undefined) result.category = mat.category;
  if (mat.stock !== undefined) result.stock = mat.stock;
  if (mat.unit !== undefined) result.unit = mat.unit;
  if (mat.minStock !== undefined) result.min_stock = mat.minStock;
  if (mat.costPerUnit !== undefined) result.cost_per_unit = mat.costPerUnit;
  if (mat.updatedAt !== undefined) result.updated_at = mat.updatedAt;
  return result;
}

export function mapFinishedProductFromDb(row: DbFinishedProduct): FinishedProduct {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id || row.categoryId || '',
    category: row.category,
    stock: Number(row.stock) || 0,
    unit: row.unit,
    sellingPrice: Number(row.selling_price ?? row.sellingPrice) || 0,
    costPrice: Number(row.cost_price ?? row.costPrice) || 0,
    minStock: Number(row.min_stock ?? row.minStock) || 0,
    batchYield: Number(row.batch_yield ?? row.batchYield) || 1,
    recipe: Array.isArray(row.recipe) ? row.recipe : [],
    imageUrl: row.image_url || row.imageUrl,
  };
}

export function mapFinishedProductToDb(prod: Partial<FinishedProduct>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (prod.id !== undefined) result.id = prod.id;
  if (prod.name !== undefined) result.name = prod.name;
  if (prod.categoryId !== undefined) result.category_id = prod.categoryId;
  if (prod.category !== undefined) result.category = prod.category;
  if (prod.stock !== undefined) result.stock = prod.stock;
  if (prod.unit !== undefined) result.unit = prod.unit;
  if (prod.sellingPrice !== undefined) result.selling_price = prod.sellingPrice;
  if (prod.costPrice !== undefined) result.cost_price = prod.costPrice;
  if (prod.minStock !== undefined) result.min_stock = prod.minStock;
  if (prod.batchYield !== undefined) result.batch_yield = prod.batchYield;
  if (prod.recipe !== undefined) result.recipe = prod.recipe;
  if (prod.imageUrl !== undefined) result.image_url = prod.imageUrl;
  return result;
}

export function mapTransactionFromDb(row: DbTransaction): Transaction {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    category: row.category,
    amount: Number(row.amount) || 0,
    description: row.description || '',
    paymentMethod: (row.payment_method || row.paymentMethod || 'Tunai') as 'Tunai' | 'QRIS / Transfer',
    quantity: row.quantity || undefined,
  };
}

export function mapTransactionToDb(trx: Partial<Transaction>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (trx.id !== undefined) result.id = trx.id;
  if (trx.date !== undefined) result.date = trx.date;
  if (trx.type !== undefined) result.type = trx.type;
  if (trx.category !== undefined) result.category = trx.category;
  if (trx.amount !== undefined) result.amount = trx.amount;
  if (trx.description !== undefined) result.description = trx.description;
  if (trx.paymentMethod !== undefined) result.payment_method = trx.paymentMethod;
  if (trx.quantity !== undefined) result.quantity = trx.quantity;
  return result;
}

export function mapNotificationFromDb(row: DbNotification): ActivityNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    time: row.time,
    severity: row.severity,
  };
}

export function mapNotificationToDb(notif: Partial<ActivityNotification>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (notif.id !== undefined) result.id = notif.id;
  if (notif.type !== undefined) result.type = notif.type;
  if (notif.title !== undefined) result.title = notif.title;
  if (notif.message !== undefined) result.message = notif.message;
  if (notif.time !== undefined) result.time = notif.time;
  if (notif.severity !== undefined) result.severity = notif.severity;
  return result;
}

// -------------------------------------------------------------
// Supabase Data Access Service
// -------------------------------------------------------------

export const supabaseService = {
  // Check if tables are available
  async checkConnection(): Promise<{ isConnected: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('categories').select('id').limit(1);
      if (error) {
        return { isConnected: false, error: error.message };
      }
      return { isConnected: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown connection error';
      return { isConnected: false, error: msg };
    }
  },

  // Categories
  async getCategories(): Promise<Category[] | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch categories:', error.message);
      return null;
    }
    return (data as DbCategory[]).map(mapCategoryFromDb);
  },

  async insertCategory(cat: Category): Promise<boolean> {
    const payload = mapCategoryToDb(cat);
    let { error } = await supabase
      .from('categories')
      .insert(payload);
    if (error && error.message?.toLowerCase().includes('unit_group')) {
      const fallback = { ...payload };
      delete fallback.unit_group;
      const res = await supabase.from('categories').insert(fallback);
      error = res.error;
    }
    if (error) {
      console.error('[Supabase] Insert category error:', error);
      return false;
    }
    return true;
  },

  async updateCategory(id: string, updated: Partial<Category>): Promise<boolean> {
    const payload = mapCategoryToDb(updated);
    let { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id);
    if (error && error.message?.toLowerCase().includes('unit_group')) {
      const fallback = { ...payload };
      delete fallback.unit_group;
      const res = await supabase.from('categories').update(fallback).eq('id', id);
      error = res.error;
    }
    if (error) {
      console.error('[Supabase] Update category error:', error);
      return false;
    }
    return true;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Delete category error:', error);
      return false;
    }
    return true;
  },

  // Raw Materials
  async getRawMaterials(): Promise<RawMaterial[] | null> {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch raw_materials:', error.message);
      return null;
    }
    return (data as DbRawMaterial[]).map(mapRawMaterialFromDb);
  },

  async insertRawMaterial(mat: RawMaterial): Promise<boolean> {
    const { error } = await supabase
      .from('raw_materials')
      .insert(mapRawMaterialToDb(mat));
    if (error) {
      console.error('[Supabase] Insert raw_material error:', error);
      return false;
    }
    return true;
  },

  async updateRawMaterial(id: string, updated: Partial<RawMaterial>): Promise<boolean> {
    const { error } = await supabase
      .from('raw_materials')
      .update(mapRawMaterialToDb(updated))
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Update raw_material error:', error);
      return false;
    }
    return true;
  },

  async deleteRawMaterial(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Delete raw_material error:', error);
      return false;
    }
    return true;
  },

  // Finished Products
  async getFinishedProducts(): Promise<FinishedProduct[] | null> {
    const { data, error } = await supabase
      .from('finished_products')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('[Supabase] Failed to fetch finished_products:', error.message);
      return null;
    }
    return (data as DbFinishedProduct[]).map(mapFinishedProductFromDb);
  },

  async insertFinishedProduct(prod: FinishedProduct): Promise<boolean> {
    const { error } = await supabase
      .from('finished_products')
      .insert(mapFinishedProductToDb(prod));
    if (error) {
      console.error('[Supabase] Insert finished_product error:', error);
      return false;
    }
    return true;
  },

  async updateFinishedProduct(id: string, updated: Partial<FinishedProduct>): Promise<boolean> {
    const { error } = await supabase
      .from('finished_products')
      .update(mapFinishedProductToDb(updated))
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Update finished_product error:', error);
      return false;
    }
    return true;
  },

  async deleteFinishedProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('finished_products')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Delete finished_product error:', error);
      return false;
    }
    return true;
  },

  // Transactions
  async getTransactions(): Promise<Transaction[] | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.warn('[Supabase] Failed to fetch transactions:', error.message);
      return null;
    }
    return (data as DbTransaction[]).map(mapTransactionFromDb);
  },

  async insertTransaction(trx: Transaction): Promise<boolean> {
    const payload = mapTransactionToDb(trx);
    let { error } = await supabase
      .from('transactions')
      .insert(payload);
    if (error && error.message?.toLowerCase().includes('quantity')) {
      const fallback = { ...payload };
      delete fallback.quantity;
      const res = await supabase.from('transactions').insert(fallback);
      error = res.error;
    }
    if (error) {
      console.error('[Supabase] Insert transaction error:', error);
      return false;
    }
    return true;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Delete transaction error:', error);
      return false;
    }
    return true;
  },

  // Notifications
  async getNotifications(): Promise<ActivityNotification[] | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) {
      console.warn('[Supabase] Failed to fetch notifications:', error.message);
      return null;
    }
    return (data as DbNotification[]).map(mapNotificationFromDb);
  },

  async insertNotification(notif: ActivityNotification): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .insert(mapNotificationToDb(notif));
    if (error) {
      console.error('[Supabase] Insert notification error:', error);
      return false;
    }
    return true;
  },

  async deleteNotification(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[Supabase] Delete notification error:', error);
      return false;
    }
    return true;
  },

  // Bulk Deletion / Clear Database Methods
  async clearAllRawMaterials(): Promise<boolean> {
    const { error } = await supabase.from('raw_materials').delete().neq('id', '');
    if (error) {
      console.error('[Supabase] Clear raw_materials error:', error);
      return false;
    }
    return true;
  },

  async clearAllFinishedProducts(): Promise<boolean> {
    const { error } = await supabase.from('finished_products').delete().neq('id', '');
    if (error) {
      console.error('[Supabase] Clear finished_products error:', error);
      return false;
    }
    return true;
  },

  async clearAllStock(): Promise<boolean> {
    const [resP, resM] = await Promise.all([
      supabase.from('finished_products').delete().neq('id', ''),
      supabase.from('raw_materials').delete().neq('id', ''),
    ]);
    return !resP.error && !resM.error;
  },

  async clearAllTransactions(): Promise<boolean> {
    const { error } = await supabase.from('transactions').delete().neq('id', '');
    if (error) {
      console.error('[Supabase] Clear transactions error:', error);
      return false;
    }
    return true;
  },

  async clearEntireDatabase(): Promise<boolean> {
    try {
      await supabase.from('notifications').delete().neq('id', '');
      await supabase.from('transactions').delete().neq('id', '');
      await supabase.from('finished_products').delete().neq('id', '');
      await supabase.from('raw_materials').delete().neq('id', '');
      await supabase.from('categories').delete().neq('id', '');
      return true;
    } catch (e) {
      console.error('[Supabase] Clear entire database error:', e);
      return false;
    }
  },

  // Bulk Seed to Supabase
  async seedInitialData(
    categories: Category[],
    materials: RawMaterial[],
    products: FinishedProduct[],
    transactions: Transaction[],
    notifications: ActivityNotification[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (categories.length > 0) {
        await supabase.from('categories').upsert(categories.map(mapCategoryToDb));
      }
      if (materials.length > 0) {
        await supabase.from('raw_materials').upsert(materials.map(mapRawMaterialToDb));
      }
      if (products.length > 0) {
        await supabase.from('finished_products').upsert(products.map(mapFinishedProductToDb));
      }
      if (transactions.length > 0) {
        await supabase.from('transactions').upsert(transactions.map(mapTransactionToDb));
      }
      if (notifications.length > 0) {
        await supabase.from('notifications').upsert(notifications.map(mapNotificationToDb));
      }
      return { success: true, message: 'Berhasil mengunggah data awal ke Supabase!' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal upload data';
      return { success: false, message: msg };
    }
  },

  // Users & Auth Verification
  async verifyUser(email: string, pass: string): Promise<{ success: boolean; user?: { email: string; name: string; role: string } }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .limit(1)
        .maybeSingle();
      if (error || !data) return { success: false };
      if (data.password_hash === pass.trim()) {
        return {
          success: true,
          user: {
            email: data.email,
            name: data.name || 'Icha - Owner Kitchen Chaacake',
            role: data.role || 'Owner Utama',
          },
        };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  },
};

