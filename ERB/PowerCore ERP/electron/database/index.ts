import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'powercore-erp.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  db.exec(`
    -- Settings
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Warehouses (المخازن)
    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Product Categories
    CREATE TABLE IF NOT EXISTS product_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Products (المنتجات)
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT,
      type TEXT NOT NULL DEFAULT 'sale', -- sale | rental | both
      unit TEXT NOT NULL DEFAULT 'piece',
      sale_price REAL NOT NULL DEFAULT 0,
      cost_price REAL NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES product_categories(id)
    );

    -- Inventory (المخزون)
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      UNIQUE(product_id, warehouse_id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    -- Inventory Movements (حركة المخزون)
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      movement_type TEXT NOT NULL, -- in | out | transfer | return | rental_out | rental_return
      quantity REAL NOT NULL,
      reference_id TEXT,
      reference_type TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    -- Suppliers (الموردين)
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      tax_number TEXT,
      notes TEXT,
      balance REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Customers (العملاء)
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      tax_number TEXT,
      notes TEXT,
      balance REAL NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Purchase Orders (أوردرات الشراء)
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      order_date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      payment_type TEXT NOT NULL DEFAULT 'cash', -- cash | partial | credit
      status TEXT NOT NULL DEFAULT 'pending', -- pending | received | cancelled
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    -- Purchase Order Items
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      purchase_order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Sales Invoices (فواتير البيع)
    CREATE TABLE IF NOT EXISTS sales_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      invoice_date TEXT NOT NULL DEFAULT (date('now')),
      total_amount REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      net_amount REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      payment_type TEXT NOT NULL DEFAULT 'cash', -- cash | partial | credit
      status TEXT NOT NULL DEFAULT 'active', -- active | cancelled | returned
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    -- Sales Invoice Items
    CREATE TABLE IF NOT EXISTS sales_invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      total_price REAL NOT NULL,
      profit REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Payments (المدفوعات)
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- customer_payment | supplier_payment
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL, -- customer | supplier
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'cash', -- cash | bank | check
      reference_id TEXT,
      reference_type TEXT,
      payment_date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Returns (المرتجعات)
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- sales_return | purchase_return
      reference_id TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      warehouse_id TEXT NOT NULL,
      total_amount REAL NOT NULL DEFAULT 0,
      return_date TEXT NOT NULL DEFAULT (date('now')),
      reason TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Return Items
    CREATE TABLE IF NOT EXISTS return_items (
      id TEXT PRIMARY KEY,
      return_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (return_id) REFERENCES returns(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Generators (المولدات)
    CREATE TABLE IF NOT EXISTS generators (
      id TEXT PRIMARY KEY,
      serial_number TEXT UNIQUE NOT NULL,
      brand TEXT,
      model TEXT,
      capacity TEXT NOT NULL,
      fuel_type TEXT NOT NULL DEFAULT 'diesel',
      status TEXT NOT NULL DEFAULT 'available', -- available | rented | maintenance | inactive
      purchase_date TEXT,
      purchase_price REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Rental Contracts (عقود الإيجار)
    CREATE TABLE IF NOT EXISTS rental_contracts (
      id TEXT PRIMARY KEY,
      contract_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      generator_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      daily_rate REAL NOT NULL,
      total_days INTEGER NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL DEFAULT 0,
      deposit_amount REAL NOT NULL DEFAULT 0,
      advance_payment REAL NOT NULL DEFAULT 0,
      paid_amount REAL NOT NULL DEFAULT 0,
      remaining_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active', -- active | ended | cancelled
      delivery_address TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (generator_id) REFERENCES generators(id)
    );

    -- After Sales Service (خدمة ما بعد البيع)
    CREATE TABLE IF NOT EXISTS service_requests (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      product_id TEXT,
      generator_id TEXT,
      item_description TEXT,
      report_date TEXT NOT NULL DEFAULT (date('now')),
      problem_type TEXT NOT NULL,
      problem_description TEXT,
      technician TEXT,
      diagnosis TEXT,
      repair_cost REAL NOT NULL DEFAULT 0,
      parts_cost REAL NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending', -- pending | inspecting | repaired | delivered | cancelled
      expected_delivery TEXT,
      actual_delivery TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (generator_id) REFERENCES generators(id)
    );

    -- Notifications (الإشعارات)
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL, -- low_stock | rental_expiry | payment_overdue | service_update
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reference_id TEXT,
      reference_type TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Expenses (المصروفات)
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      expense_date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Insert default settings
  const defaultSettings = [
    ['system_name', 'PowerCore ERP'],
    ['company_name', 'PowerCore'],
    ['currency', 'EGP'],
    ['currency_symbol', 'ج.م'],
    ['tax_rate', '14'],
    ['low_stock_alert', '5'],
    ['rental_expiry_days', '7'],
  ];

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)
  `);

  for (const [key, value] of defaultSettings) {
    insertSetting.run(key, value);
  }

  // Insert default user
  db.prepare(`
    INSERT OR IGNORE INTO users (id, username, password, full_name, role) 
    VALUES ('user-1', 'admin', 'admin123', 'مدير النظام', 'admin')
  `).run();

  // Insert default warehouses
  const insertWarehouse = db.prepare(`
    INSERT OR IGNORE INTO warehouses (id, name, description) VALUES (?, ?, ?)
  `);
  insertWarehouse.run('wh-1', 'المخزن الرئيسي', 'المخزن الرئيسي للمنتجات');
  insertWarehouse.run('wh-2', 'مخزن العرض', 'مخزن المنتجات المعروضة');
  insertWarehouse.run('wh-3', 'مخزن الصيانة', 'مخزن قطع الغيار والصيانة');
}

export function generateNotifications() {
  const database = getDatabase();
  
  // Check low stock
  const lowStockProducts = database.prepare(`
    SELECT p.id, p.name, p.min_stock, COALESCE(SUM(i.quantity), 0) as total_qty
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    WHERE p.is_active = 1
    GROUP BY p.id
    HAVING total_qty <= p.min_stock AND p.min_stock > 0
  `).all() as any[];

  for (const product of lowStockProducts) {
    const existing = database.prepare(`
      SELECT id FROM notifications WHERE reference_id = ? AND type = 'low_stock' AND is_read = 0
    `).get(product.id);
    
    if (!existing) {
      database.prepare(`
        INSERT INTO notifications (id, type, title, message, reference_id, reference_type)
        VALUES (?, 'low_stock', ?, ?, ?, 'product')
      `).run(
        `notif-${Date.now()}-${Math.random()}`,
        `تحذير: مخزون منخفض`,
        `المنتج "${product.name}" وصل للحد الأدنى (${product.total_qty} متبقي)`,
        product.id
      );
    }
  }

  // Check rental contracts expiring soon
  const expiringRentals = database.prepare(`
    SELECT rc.id, rc.contract_number, c.name as customer_name, rc.end_date
    FROM rental_contracts rc
    JOIN customers c ON rc.customer_id = c.id
    WHERE rc.status = 'active'
    AND date(rc.end_date) <= date('now', '+7 days')
    AND date(rc.end_date) >= date('now')
  `).all() as any[];

  for (const rental of expiringRentals) {
    const existing = database.prepare(`
      SELECT id FROM notifications WHERE reference_id = ? AND type = 'rental_expiry' AND is_read = 0
    `).get(rental.id);
    
    if (!existing) {
      database.prepare(`
        INSERT INTO notifications (id, type, title, message, reference_id, reference_type)
        VALUES (?, 'rental_expiry', ?, ?, ?, 'rental')
      `).run(
        `notif-${Date.now()}-${Math.random()}`,
        `تنبيه: عقد إيجار قارب على الانتهاء`,
        `عقد إيجار رقم ${rental.contract_number} للعميل "${rental.customer_name}" ينتهي بتاريخ ${rental.end_date}`,
        rental.id
      );
    }
  }

  // Check overdue customers
  const overdueCustomers = database.prepare(`
    SELECT id, name, balance FROM customers WHERE balance > 0
  `).all() as any[];

  for (const customer of overdueCustomers) {
    const existing = database.prepare(`
      SELECT id FROM notifications WHERE reference_id = ? AND type = 'payment_overdue' AND is_read = 0
    `).get(customer.id);
    
    if (!existing) {
      database.prepare(`
        INSERT INTO notifications (id, type, title, message, reference_id, reference_type)
        VALUES (?, 'payment_overdue', ?, ?, ?, 'customer')
      `).run(
        `notif-${Date.now()}-${Math.random()}`,
        `تنبيه: عميل متأخر في السداد`,
        `العميل "${customer.name}" عليه مديونية بقيمة ${customer.balance.toFixed(2)} ج.م`,
        customer.id
      );
    }
  }
}
