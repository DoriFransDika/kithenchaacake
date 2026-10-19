-- =========================================================================
-- DATABASE SCHEMA: KITCHEN CHAACAKE MANAGEMENT SYSTEM
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. TABEL KATEGORI (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('material', 'product')),
    unit_group TEXT DEFAULT 'weight',
    icon_name TEXT NOT NULL DEFAULT 'Wheat',
    bg_color TEXT NOT NULL DEFAULT 'bg-amber-100',
    text_color TEXT NOT NULL DEFAULT 'text-amber-700',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL BAHAN BAKU (raw_materials)
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg',
    min_stock NUMERIC NOT NULL DEFAULT 0,
    cost_per_unit NUMERIC NOT NULL DEFAULT 0,
    updated_at TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL PRODUK JADI (finished_products)
CREATE TABLE IF NOT EXISTS public.finished_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    stock NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'pcs',
    selling_price NUMERIC NOT NULL DEFAULT 0,
    cost_price NUMERIC NOT NULL DEFAULT 0,
    min_stock NUMERIC NOT NULL DEFAULT 0,
    batch_yield NUMERIC NOT NULL DEFAULT 1,
    recipe JSONB NOT NULL DEFAULT '[]'::jsonb,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL TRANSAKSI KEUANGAN (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    quantity TEXT,
    description TEXT,
    payment_method TEXT NOT NULL DEFAULT 'Tunai',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrasi skema incremental jika tabel sudah ada sebelumnya
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS unit_group TEXT DEFAULT 'weight';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS quantity TEXT;

-- 5. TABEL NOTIFIKASI AKTIVITAS (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL PENGGUNA (users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'Mamak Chef & Owner',
    role TEXT NOT NULL DEFAULT 'Owner Utama',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memberikan izin SELECT, INSERT, UPDATE, DELETE kepada anon/public
-- =========================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Public full access users" ON public.users;
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- Categories policies
DROP POLICY IF EXISTS "Public full access categories" ON public.categories;
CREATE POLICY "Public full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Raw materials policies
DROP POLICY IF EXISTS "Public full access raw_materials" ON public.raw_materials;
CREATE POLICY "Public full access raw_materials" ON public.raw_materials FOR ALL USING (true) WITH CHECK (true);

-- Finished products policies
DROP POLICY IF EXISTS "Public full access finished_products" ON public.finished_products;
CREATE POLICY "Public full access finished_products" ON public.finished_products FOR ALL USING (true) WITH CHECK (true);

-- Transactions policies
DROP POLICY IF EXISTS "Public full access transactions" ON public.transactions;
CREATE POLICY "Public full access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Public full access notifications" ON public.notifications;
CREATE POLICY "Public full access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- DATA AWAL / SEED DATA
-- =========================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, type, icon_name, bg_color, text_color, description)
VALUES
    ('cat-mat-1', 'Tepung & Gandum', 'material', 'Wheat', 'bg-amber-100', 'text-amber-700', 'Bahan dasar utama adonan roti (Cakra, Segitiga, Gandum)'),
    ('cat-mat-2', 'Mentega, Butter & Susu', 'material', 'Milk', 'bg-rose-100', 'text-rose-600', 'Lemak nabati, butter Anchor, margarin dan susu bubuk'),
    ('cat-mat-3', 'Gula & Pemanis Alami', 'material', 'Sparkles', 'bg-orange-100', 'text-orange-600', 'Gula pasir kristal, gula halus donat, dan madu'),
    ('cat-mat-4', 'Telur Ayam Segar', 'material', 'Egg', 'bg-amber-100', 'text-amber-700', 'Telur ayam negeri pilihan untuk kelembutan adonan'),
    ('cat-mat-5', 'Topping Cokelat & Keju', 'material', 'Cookie', 'bg-stone-200', 'text-[#4A3B32]', 'Meises holland, selai cokelat lumer, dan keju cheddar kraft'),
    ('cat-mat-6', 'Ragi & Pengembang', 'material', 'Flame', 'bg-purple-100', 'text-purple-600', 'Ragi instan saf-instant gold dan bread improver'),
    ('cat-mat-7', 'Kemasan & Dus Roti', 'material', 'Package', 'bg-orange-100', 'text-orange-600', 'Plastik sablon OPP roti dan box karton snack'),
    ('cat-prod-1', 'Roti Manis Satuan', 'product', 'Croissant', 'bg-rose-100', 'text-rose-600', 'Roti isi cokelat lumer, keju, srikaya & abon'),
    ('cat-prod-2', 'Roti Sisir Klasik', 'product', 'Cookie', 'bg-amber-100', 'text-amber-700', 'Roti sisir jadul oles mentega gula wangi'),
    ('cat-prod-3', 'Roti Sobek Keluarga', 'product', 'Boxes', 'bg-orange-100', 'text-orange-600', 'Roti sobek porsi besar dengan aneka rasa topping'),
    ('cat-prod-4', 'Roti Tawar Sehat', 'product', 'Wheat', 'bg-stone-200', 'text-[#4A3B32]', 'Roti tawar gandum tinggi serat dan tawar kupas'),
    ('cat-prod-5', 'Donat Kampung & Pastry', 'product', 'Cake', 'bg-rose-100', 'text-rose-600', 'Donat kentang empuk tabur gula salju')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    icon_name = EXCLUDED.icon_name,
    bg_color = EXCLUDED.bg_color,
    text_color = EXCLUDED.text_color,
    description = EXCLUDED.description;

-- Seed Raw Materials
INSERT INTO public.raw_materials (id, name, category_id, category, stock, unit, min_stock, cost_per_unit, updated_at)
VALUES
    ('mat-1', 'Tepung Cakra Kembar (High Protein)', 'cat-mat-1', 'Tepung & Gandum', 14, 'kg', 10, 14500, '2026-10-04'),
    ('mat-2', 'Tepung Segitiga Biru', 'cat-mat-1', 'Tepung & Gandum', 5, 'kg', 8, 12500, '2026-10-03'),
    ('mat-3', 'Gula Pasir Kristal Putih', 'cat-mat-3', 'Gula & Pemanis Alami', 9, 'kg', 6, 17500, '2026-10-04'),
    ('mat-4', 'Mentega Anchor / Wijsman Blend', 'cat-mat-2', 'Mentega, Butter & Susu', 3.2, 'kg', 3.0, 135000, '2026-10-02'),
    ('mat-5', 'Margarin Serbaguna Blue Band', 'cat-mat-2', 'Mentega, Butter & Susu', 6, 'kg', 5, 42000, '2026-10-03'),
    ('mat-6', 'Ragi Instan Saf-Instant Gold', 'cat-mat-6', 'Ragi & Pengembang', 0.6, 'kg', 1.0, 98000, '2026-10-01'),
    ('mat-7', 'Telur Ayam Negeri Segar', 'cat-mat-4', 'Telur Ayam Segar', 35, 'butir', 50, 2000, '2026-10-04'),
    ('mat-8', 'Susu Bubuk Full Cream NZ', 'cat-mat-2', 'Mentega, Butter & Susu', 4.5, 'kg', 3.0, 78000, '2026-10-02'),
    ('mat-9', 'Cokelat Meises Belanda Premium', 'cat-mat-5', 'Topping Cokelat & Keju', 5.5, 'kg', 4.0, 52000, '2026-10-04'),
    ('mat-10', 'Keju Cheddar Olahan Blok', 'cat-mat-5', 'Topping Cokelat & Keju', 8, 'pack', 5, 23500, '2026-10-03')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    category = EXCLUDED.category,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    min_stock = EXCLUDED.min_stock,
    cost_per_unit = EXCLUDED.cost_per_unit,
    updated_at = EXCLUDED.updated_at;

-- Seed Finished Products
INSERT INTO public.finished_products (id, name, category_id, category, stock, unit, selling_price, cost_price, min_stock, batch_yield, recipe)
VALUES
    ('prod-1', 'Roti Manis Cokelat Lumer', 'cat-prod-1', 'Roti Manis Satuan', 28, 'pcs', 8500, 3800, 15, 25,
     '[{"materialId": "mat-1", "amount": 1.0, "unit": "kg"}, {"materialId": "mat-3", "amount": 0.2, "unit": "kg"}, {"materialId": "mat-5", "amount": 0.15, "unit": "kg"}, {"materialId": "mat-6", "amount": 0.015, "unit": "kg"}, {"materialId": "mat-7", "amount": 2, "unit": "butir"}, {"materialId": "mat-9", "amount": 0.35, "unit": "kg"}]'::jsonb),
    ('prod-2', 'Roti Sisir Mentega Spesial', 'cat-prod-2', 'Roti Sisir Klasik', 18, 'pcs', 11000, 4700, 12, 20,
     '[{"materialId": "mat-1", "amount": 0.8, "unit": "kg"}, {"materialId": "mat-3", "amount": 0.15, "unit": "kg"}, {"materialId": "mat-4", "amount": 0.12, "unit": "kg"}, {"materialId": "mat-5", "amount": 0.08, "unit": "kg"}, {"materialId": "mat-6", "amount": 0.012, "unit": "kg"}, {"materialId": "mat-7", "amount": 2, "unit": "butir"}]'::jsonb),
    ('prod-3', 'Roti Sobek Keju Susu Mamak', 'cat-prod-3', 'Roti Sobek Keluarga', 6, 'box', 28000, 12500, 10, 8,
     '[{"materialId": "mat-1", "amount": 1.2, "unit": "kg"}, {"materialId": "mat-3", "amount": 0.22, "unit": "kg"}, {"materialId": "mat-4", "amount": 0.18, "unit": "kg"}, {"materialId": "mat-6", "amount": 0.018, "unit": "kg"}, {"materialId": "mat-7", "amount": 3, "unit": "butir"}, {"materialId": "mat-8", "amount": 0.1, "unit": "kg"}, {"materialId": "mat-10", "amount": 2, "unit": "pack"}]'::jsonb),
    ('prod-4', 'Roti Tawar Gandum Serat Tinggi', 'cat-prod-4', 'Roti Tawar Sehat', 14, 'loyang', 24000, 10200, 8, 6,
     '[{"materialId": "mat-1", "amount": 1.0, "unit": "kg"}, {"materialId": "mat-2", "amount": 0.5, "unit": "kg"}, {"materialId": "mat-3", "amount": 0.08, "unit": "kg"}, {"materialId": "mat-5", "amount": 0.1, "unit": "kg"}, {"materialId": "mat-6", "amount": 0.015, "unit": "kg"}]'::jsonb),
    ('prod-5', 'Donat Kampung Gula Salju', 'cat-prod-5', 'Donat Kampung & Pastry', 36, 'pcs', 5000, 2100, 20, 30,
     '[{"materialId": "mat-2", "amount": 1.0, "unit": "kg"}, {"materialId": "mat-3", "amount": 0.15, "unit": "kg"}, {"materialId": "mat-5", "amount": 0.12, "unit": "kg"}, {"materialId": "mat-6", "amount": 0.015, "unit": "kg"}, {"materialId": "mat-7", "amount": 2, "unit": "butir"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category_id = EXCLUDED.category_id,
    category = EXCLUDED.category,
    stock = EXCLUDED.stock,
    unit = EXCLUDED.unit,
    selling_price = EXCLUDED.selling_price,
    cost_price = EXCLUDED.cost_price,
    min_stock = EXCLUDED.min_stock,
    batch_yield = EXCLUDED.batch_yield,
    recipe = EXCLUDED.recipe;

-- Seed Transactions
INSERT INTO public.transactions (id, date, type, category, amount, description, payment_method)
VALUES
    ('trx-1', '2026-10-04', 'income', 'Penjualan Toko', 1485000, 'Penjualan Roti Pagi & Sore Kasir Utama', 'QRIS / Transfer'),
    ('trx-2', '2026-10-04', 'income', 'Pesanan Katering', 1250000, 'Pesanan 50 Snack Box Pengajian Ibu-ibu RT 04', 'QRIS / Transfer'),
    ('trx-3', '2026-10-03', 'expense', 'Belanja Bahan Baku', 680000, 'Beli Tepung Cakra 1 Karung & Margarin Toko Surya', 'Tunai'),
    ('trx-4', '2026-10-03', 'income', 'Penjualan Toko', 1120000, 'Penjualan Reguler Toko Offline', 'Tunai'),
    ('trx-5', '2026-10-02', 'expense', 'Operasional & Gas', 220000, 'Refill 5 Tabung Gas LPG 3kg untuk Oven Deck', 'Tunai'),
    ('trx-6', '2026-10-02', 'income', 'Pesanan Katering', 850000, 'Pesanan Roti Sobek Kantor Kelurahan', 'QRIS / Transfer'),
    ('trx-7', '2026-10-01', 'expense', 'Kemasan', 350000, 'Restock Plastik OPP Roti Manis & Box Roti Sobek Sablon', 'Tunai')
ON CONFLICT (id) DO UPDATE SET
    date = EXCLUDED.date,
    type = EXCLUDED.type,
    category = EXCLUDED.category,
    amount = EXCLUDED.amount,
    description = EXCLUDED.description,
    payment_method = EXCLUDED.payment_method;

-- Seed Notifications
INSERT INTO public.notifications (id, type, title, message, time, severity)
VALUES
    ('notif-1', 'low_stock', 'Stok Ragi Menipis!', 'Ragi Instan Saf-Instant tersisa 0.6 kg (Batas min: 1.0 kg). Segera restock untuk jadwal adonan besok.', '15 menit yang lalu', 'warning'),
    ('notif-2', 'low_stock', 'Telur Ayam Hampir Habis', 'Tersisa 35 butir (Batas min: 50 butir). Cukup untuk ~2 batch resep roti.', '1 jam yang lalu', 'warning'),
    ('notif-3', 'low_stock', 'Roti Sobek Keju Tinggal 6 Box', 'Stok etalase tersisa 6 box (Batas min: 10 box). Segera jadwalkan baking sore.', '2 jam yang lalu', 'warning'),
    ('notif-4', 'production', 'Baking Selesai: 25 Roti Manis', 'Batch #28 berhasil matang sempurna. Bahan baku otomatis terpotong.', '3 jam yang lalu', 'success'),
    ('notif-5', 'sale', 'Penerimaan QRIS Sukses', 'Pemasukan QRIS Rp 1.250.000 untuk 50 Snack Box pengajian.', '5 jam yang lalu', 'info')
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    time = EXCLUDED.time,
    severity = EXCLUDED.severity;

-- =========================================================================
-- MANAJEMEN PENGGUNA & KEAMANAN AKUN (PRODUCTION)
-- =========================================================================
-- Akun pengguna dan kredensial login dikelola langsung di tabel public.users /
-- Supabase Auth Dashboard secara terenkripsi dan aman.
-- Kredensial (email & kata sandi) TIDAK disimpan dalam file skrip source code
-- demi menjaga kerahasiaan dan keamanan data produksi.
-- =========================================================================

-- =========================================================================
-- INDEXES & PERFORMANCE
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_raw_materials_category_id ON public.raw_materials(category_id);
CREATE INDEX IF NOT EXISTS idx_finished_products_category_id ON public.finished_products(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =========================================================================
-- SUPABASE REALTIME REPLICATION SETUP
-- Aktifkan broadcast perubahan realtime ke aplikasi frontend
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_materials;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.finished_products;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

