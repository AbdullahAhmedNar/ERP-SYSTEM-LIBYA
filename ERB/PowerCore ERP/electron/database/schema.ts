/**
 * PowerCore ERP - SQLite Schema
 * قاعدة بيانات منظمة ومنسقة للنظام بالكامل
 * النسخة الاحتياطية = نسخ ملف powercore-erp.db
 */

export const SCHEMA = `
-- ═══════════════════════════════════════════════════════════════
-- PowerCore ERP - Database Schema v1.0
-- ═══════════════════════════════════════════════════════════════

-- الإعدادات
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  system_name TEXT NOT NULL DEFAULT 'PowerCore ERP',
  username TEXT NOT NULL DEFAULT 'admin',
  password TEXT NOT NULL DEFAULT '123456',
  logo TEXT,
  currency TEXT NOT NULL DEFAULT 'دينار',
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'ar',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المستخدمون
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- الموردون
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- العملاء
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  address TEXT,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المخازن
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- المنتجات
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'sale',
  sale_price REAL NOT NULL DEFAULT 0,
  cost_price REAL NOT NULL DEFAULT 0,
  rental_price_per_day REAL,
  min_stock INTEGER NOT NULL DEFAULT 0,
  warehouse_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- حركات المخزون
CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  notes TEXT,
  date TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- أوامر الشراء
CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- فواتير المبيعات
CREATE TABLE IF NOT EXISTS sale_invoices (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  discount REAL NOT NULL DEFAULT 0,
  payment_type TEXT NOT NULL DEFAULT 'immediate',
  profit REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- المولدات
CREATE TABLE IF NOT EXISTS generators (
  id TEXT PRIMARY KEY,
  serial_number TEXT NOT NULL,
  capacity TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- عقود الإيجار
CREATE TABLE IF NOT EXISTS rental_contracts (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  generator_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  daily_rate REAL NOT NULL,
  deposit REAL NOT NULL DEFAULT 0,
  advance_payment REAL NOT NULL DEFAULT 0,
  total_days INTEGER NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- طلبات خدمة ما بعد البيع
CREATE TABLE IF NOT EXISTS after_sales_requests (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT,
  generator_id TEXT,
  report_date TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  description TEXT NOT NULL,
  maintenance_cost REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'inspection',
  assigned_to TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (generator_id) REFERENCES generators(id)
);

-- الموظفون
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  address TEXT,
  national_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- سلف الموظفين
CREATE TABLE IF NOT EXISTS employee_loans (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- صرفيات الرواتب
CREATE TABLE IF NOT EXISTS salary_payments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  amount REAL NOT NULL,
  month TEXT NOT NULL,
  bonuses REAL NOT NULL DEFAULT 0,
  deductions REAL NOT NULL DEFAULT 0,
  net_salary REAL NOT NULL,
  paid_at TEXT NOT NULL,
  notes TEXT,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- المدفوعات
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  amount REAL NOT NULL,
  reference_id TEXT,
  notes TEXT,
  date TEXT NOT NULL
);

-- المرتجعات
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  supplier_id TEXT,
  customer_id TEXT,
  total_amount REAL NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  date TEXT NOT NULL,
  items_json TEXT NOT NULL DEFAULT '[]'
);

-- الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- حالة تسجيل الدخول (للمزامنة)
CREATE TABLE IF NOT EXISTS app_session (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(date);
CREATE INDEX IF NOT EXISTS idx_sale_invoices_date ON sale_invoices(date);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(date);
`;
