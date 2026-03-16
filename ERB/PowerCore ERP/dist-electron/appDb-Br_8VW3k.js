"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Database = require("better-sqlite3");
const path = require("path");
const electron = require("electron");
const SCHEMA = `
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
let db = null;
function getAppDatabase() {
  if (!db) {
    const dbPath = path.join(electron.app.getPath("userData"), "powercore-erp.db");
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.exec(SCHEMA);
    ensureDefaults();
  }
  return db;
}
function getDatabasePath() {
  return path.join(electron.app.getPath("userData"), "powercore-erp.db");
}
function checkpointBeforeBackup() {
  if (db) {
    try {
      db.pragma("wal_checkpoint(TRUNCATE)");
    } catch (_) {
    }
  }
}
function closeDatabase() {
  if (db) {
    try {
      db.close();
    } catch (_) {
    }
    db = null;
  }
}
function ensureDefaults() {
  const s = db.prepare("SELECT id FROM settings WHERE id = 1").get();
  if (!s) {
    db.prepare(`
      INSERT INTO settings (id, system_name, username, password, currency, theme, language)
      VALUES (1, 'PowerCore ERP', 'admin', '123456', 'دينار', 'light', 'ar')
    `).run();
  }
  const wh = db.prepare("SELECT COUNT(*) as c FROM warehouses").get();
  if (wh.c === 0) {
    const insert = db.prepare(`
      INSERT INTO warehouses (id, name, location, description, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    insert.run("wh-1", "المخزن الرئيسي", "", "المخزن الرئيسي");
    insert.run("wh-2", "مخزن العرض", "", "مخزن العرض");
    insert.run("wh-3", "مخزن الصيانة", "", "مخزن الصيانة");
  }
}
function loadState() {
  try {
    const database = getAppDatabase();
    const tables = database.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    if (tables.length === 0) {
      console.error("loadState: لا توجد جداول في قاعدة البيانات");
      return null;
    }
    let settingsRow = null;
    try {
      settingsRow = database.prepare("SELECT * FROM settings LIMIT 1").get();
    } catch (e) {
      console.warn("loadState: فشل قراءة الإعدادات", e);
    }
    const settings = settingsRow ? {
      systemName: settingsRow.system_name || "PowerCore ERP",
      username: settingsRow.username || "admin",
      password: settingsRow.password || "",
      logo: settingsRow.logo,
      currency: settingsRow.currency || "دينار",
      theme: settingsRow.theme || "light",
      language: settingsRow.language || "ar"
    } : {
      systemName: "PowerCore ERP",
      username: "admin",
      password: "",
      currency: "دينار",
      theme: "light",
      language: "ar"
    };
    let isLoggedIn = false;
    try {
      const sessionRow = database.prepare("SELECT value FROM app_session WHERE key = 'isLoggedIn'").get();
      isLoggedIn = sessionRow ? sessionRow.value === "1" : false;
    } catch (e) {
      console.warn("loadState: فشل قراءة جلسة تسجيل الدخول", e);
    }
    const map = (rows) => (rows || []).map((row) => row ? { ...row } : null).filter(Boolean);
    const safe = (fn, defaultValue = []) => {
      try {
        return fn();
      } catch (e) {
        console.warn("loadState: خطأ في قراءة البيانات", e);
        return defaultValue;
      }
    };
    const suppliers = map(safe(() => database.prepare("SELECT * FROM suppliers").all()));
    const customers = map(safe(() => database.prepare("SELECT * FROM customers").all()));
    const users = map(safe(() => database.prepare("SELECT * FROM users").all()));
    const warehouses = map(safe(() => database.prepare("SELECT * FROM warehouses").all()));
    const productsRaw = safe(() => database.prepare("SELECT * FROM products").all());
    const products = productsRaw.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type,
      salePrice: p.sale_price,
      costPrice: p.cost_price,
      rentalPricePerDay: p.rental_price_per_day,
      minStock: p.min_stock,
      warehouseId: p.warehouse_id,
      quantity: p.quantity,
      createdAt: p.created_at
    }));
    const stockMovementsRaw = safe(() => database.prepare("SELECT * FROM stock_movements").all());
    const stockMovements = stockMovementsRaw.map((m) => ({
      id: m.id,
      productId: m.product_id,
      warehouseId: m.warehouse_id,
      type: m.type,
      quantity: m.quantity,
      referenceId: m.reference_id,
      referenceType: m.reference_type,
      notes: m.notes,
      date: m.date
    }));
    const purchaseOrdersRaw = safe(() => database.prepare("SELECT * FROM purchase_orders").all());
    const purchaseOrders = purchaseOrdersRaw.map((po) => ({
      id: po.id,
      supplierId: po.supplier_id,
      warehouseId: po.warehouse_id,
      items: JSON.parse(po.items_json || "[]"),
      totalAmount: po.total_amount,
      paidAmount: po.paid_amount,
      paymentType: po.payment_type,
      status: po.status,
      notes: po.notes,
      date: po.date
    }));
    const saleInvoicesRaw = safe(() => database.prepare("SELECT * FROM sale_invoices").all());
    const saleInvoices = saleInvoicesRaw.map((si) => ({
      id: si.id,
      customerId: si.customer_id,
      warehouseId: si.warehouse_id,
      items: JSON.parse(si.items_json || "[]"),
      totalAmount: si.total_amount,
      paidAmount: si.paid_amount,
      discount: si.discount,
      paymentType: si.payment_type,
      profit: si.profit,
      status: si.status,
      notes: si.notes,
      date: si.date
    }));
    const generatorsRaw = safe(() => database.prepare("SELECT * FROM generators").all());
    const generators = generatorsRaw.map((g) => ({
      id: g.id,
      serialNumber: g.serial_number,
      capacity: g.capacity,
      brand: g.brand,
      model: g.model,
      status: g.status,
      notes: g.notes,
      createdAt: g.created_at
    }));
    const rentalContractsRaw = safe(() => database.prepare("SELECT * FROM rental_contracts").all());
    const rentalContracts = rentalContractsRaw.map((rc) => ({
      id: rc.id,
      customerId: rc.customer_id,
      generatorId: rc.generator_id,
      startDate: rc.start_date,
      endDate: rc.end_date,
      dailyRate: rc.daily_rate,
      deposit: rc.deposit,
      advancePayment: rc.advance_payment,
      totalDays: rc.total_days,
      totalAmount: rc.total_amount,
      paidAmount: rc.paid_amount,
      status: rc.status,
      notes: rc.notes,
      createdAt: rc.created_at
    }));
    const afterSalesRaw = safe(() => database.prepare("SELECT * FROM after_sales_requests").all());
    const afterSalesRequests = afterSalesRaw.map((a) => ({
      id: a.id,
      customerId: a.customer_id,
      productId: a.product_id,
      generatorId: a.generator_id,
      reportDate: a.report_date,
      problemType: a.problem_type,
      description: a.description,
      maintenanceCost: a.maintenance_cost,
      status: a.status,
      assignedTo: a.assigned_to,
      notes: a.notes,
      createdAt: a.created_at
    }));
    const employeesRaw = safe(() => database.prepare("SELECT * FROM employees").all());
    const employees = employeesRaw.map((e) => ({
      id: e.id,
      name: e.name,
      phone: e.phone,
      email: e.email,
      position: e.position,
      department: e.department,
      salary: e.salary,
      startDate: e.start_date,
      status: e.status,
      address: e.address,
      nationalId: e.national_id,
      notes: e.notes,
      createdAt: e.created_at
    }));
    const salaryPaymentsRaw = safe(() => database.prepare("SELECT * FROM salary_payments").all());
    const salaryPayments = salaryPaymentsRaw.map((sp) => ({
      id: sp.id,
      employeeId: sp.employee_id,
      amount: sp.amount,
      month: sp.month,
      bonuses: sp.bonuses,
      deductions: sp.deductions,
      netSalary: sp.net_salary,
      paidAt: sp.paid_at,
      notes: sp.notes
    }));
    const paymentsRaw = safe(() => database.prepare("SELECT * FROM payments").all());
    const payments = paymentsRaw.map((p) => ({
      id: p.id,
      type: p.type,
      entityId: p.entity_id,
      amount: p.amount,
      referenceId: p.reference_id,
      notes: p.notes,
      date: p.date
    }));
    const returnsRaw = safe(() => database.prepare("SELECT * FROM returns").all());
    const returns = returnsRaw.map((r) => ({
      id: r.id,
      type: r.type,
      entityId: r.entity_id,
      supplierId: r.supplier_id,
      customerId: r.customer_id,
      items: JSON.parse(r.items_json || "[]"),
      totalAmount: r.total_amount,
      reason: r.reason,
      date: r.date
    }));
    const notificationsRaw = safe(() => database.prepare("SELECT * FROM notifications").all());
    const notifications = notificationsRaw.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: !!n.is_read,
      link: n.link,
      createdAt: n.created_at
    }));
    const suppliersNorm = suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      phone: s.phone || "",
      email: s.email,
      address: s.address,
      balance: s.balance ?? 0,
      createdAt: s.created_at
    }));
    const customersNorm = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || "",
      email: c.email,
      address: c.address,
      balance: c.balance ?? 0,
      createdAt: c.created_at
    }));
    return {
      suppliers: suppliersNorm,
      customers: customersNorm,
      users: users.map((u) => ({ id: u.id, username: u.username, password: u.password })),
      warehouses: warehouses.map((w) => ({
        id: w.id,
        name: w.name,
        location: w.location,
        description: w.description,
        createdAt: w.created_at
      })),
      products,
      stockMovements,
      purchaseOrders,
      saleInvoices,
      generators,
      rentalContracts,
      afterSalesRequests,
      employees,
      salaryPayments,
      payments,
      returns,
      notifications,
      settings: settings || {
        systemName: "PowerCore ERP",
        username: "admin",
        password: "123456",
        currency: "دينار",
        theme: "light",
        language: "ar"
      },
      isLoggedIn
    };
  } catch (err) {
    console.error("loadState error:", err);
    return null;
  }
}
function saveState(state) {
  const database = getAppDatabase();
  const tx = database.transaction(() => {
    var _a, _b, _c, _d, _e, _f, _g;
    database.prepare("DELETE FROM suppliers").run();
    database.prepare("DELETE FROM customers").run();
    database.prepare("DELETE FROM users").run();
    database.prepare("DELETE FROM warehouses").run();
    database.prepare("DELETE FROM products").run();
    database.prepare("DELETE FROM stock_movements").run();
    database.prepare("DELETE FROM purchase_orders").run();
    database.prepare("DELETE FROM sale_invoices").run();
    database.prepare("DELETE FROM generators").run();
    database.prepare("DELETE FROM rental_contracts").run();
    database.prepare("DELETE FROM after_sales_requests").run();
    database.prepare("DELETE FROM employees").run();
    database.prepare("DELETE FROM salary_payments").run();
    database.prepare("DELETE FROM payments").run();
    database.prepare("DELETE FROM returns").run();
    database.prepare("DELETE FROM notifications").run();
    const insSup = database.prepare(
      "INSERT INTO suppliers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const s of state.suppliers || []) {
      insSup.run(s.id, s.name, s.phone || "", s.email || null, s.address || null, s.balance ?? 0, s.createdAt);
    }
    const insCust = database.prepare(
      "INSERT INTO customers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const c of state.customers || []) {
      insCust.run(c.id, c.name, c.phone || "", c.email || null, c.address || null, c.balance ?? 0, c.createdAt);
    }
    const insUser = database.prepare("INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, datetime('now'))");
    for (const u of state.users || []) {
      insUser.run(u.id, u.username, u.password);
    }
    const insWh = database.prepare(
      "INSERT INTO warehouses (id, name, location, description, created_at) VALUES (?, ?, ?, ?, ?)"
    );
    for (const w of state.warehouses || []) {
      insWh.run(w.id, w.name, w.location || null, w.description || null, w.createdAt);
    }
    const insProd = database.prepare(
      "INSERT INTO products (id, code, name, type, sale_price, cost_price, rental_price_per_day, min_stock, warehouse_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of state.products || []) {
      insProd.run(
        p.id,
        p.code,
        p.name,
        p.type || "sale",
        p.salePrice ?? 0,
        p.costPrice ?? 0,
        p.rentalPricePerDay ?? null,
        p.minStock ?? 0,
        p.warehouseId,
        p.quantity ?? 0,
        p.createdAt
      );
    }
    const insMov = database.prepare(
      "INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, reference_id, reference_type, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const m of state.stockMovements || []) {
      insMov.run(m.id, m.productId, m.warehouseId, m.type, m.quantity, m.referenceId || null, m.referenceType || null, m.notes || null, m.date);
    }
    const insPO = database.prepare(
      "INSERT INTO purchase_orders (id, supplier_id, warehouse_id, total_amount, paid_amount, payment_type, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const po of state.purchaseOrders || []) {
      insPO.run(
        po.id,
        po.supplierId,
        po.warehouseId,
        po.totalAmount ?? 0,
        po.paidAmount ?? 0,
        po.paymentType || "full",
        po.status || "pending",
        po.notes || null,
        po.date,
        JSON.stringify(po.items || [])
      );
    }
    const insSI = database.prepare(
      "INSERT INTO sale_invoices (id, customer_id, warehouse_id, total_amount, paid_amount, discount, payment_type, profit, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const si of state.saleInvoices || []) {
      insSI.run(
        si.id,
        si.customerId,
        si.warehouseId,
        si.totalAmount ?? 0,
        si.paidAmount ?? 0,
        si.discount ?? 0,
        si.paymentType || "immediate",
        si.profit ?? 0,
        si.status || "active",
        si.notes || null,
        si.date,
        JSON.stringify(si.items || [])
      );
    }
    const insGen = database.prepare(
      "INSERT INTO generators (id, serial_number, capacity, brand, model, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const g of state.generators || []) {
      insGen.run(g.id, g.serialNumber, g.capacity, g.brand || null, g.model || null, g.status || "available", g.notes || null, g.createdAt);
    }
    const insRC = database.prepare(
      "INSERT INTO rental_contracts (id, customer_id, generator_id, start_date, end_date, daily_rate, deposit, advance_payment, total_days, total_amount, paid_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const rc of state.rentalContracts || []) {
      insRC.run(
        rc.id,
        rc.customerId,
        rc.generatorId,
        rc.startDate,
        rc.endDate,
        rc.dailyRate ?? 0,
        rc.deposit ?? 0,
        rc.advancePayment ?? 0,
        rc.totalDays ?? 0,
        rc.totalAmount ?? 0,
        rc.paidAmount ?? 0,
        rc.status || "active",
        rc.notes || null,
        rc.createdAt
      );
    }
    const insAS = database.prepare(
      "INSERT INTO after_sales_requests (id, customer_id, product_id, generator_id, report_date, problem_type, description, maintenance_cost, status, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const a of state.afterSalesRequests || []) {
      insAS.run(
        a.id,
        a.customerId,
        a.productId || null,
        a.generatorId || null,
        a.reportDate,
        a.problemType,
        a.description,
        a.maintenanceCost ?? 0,
        a.status || "inspection",
        a.assignedTo || null,
        a.notes || null,
        a.createdAt
      );
    }
    const insEmp = database.prepare(
      "INSERT INTO employees (id, name, phone, email, position, department, salary, start_date, status, address, national_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const e of state.employees || []) {
      insEmp.run(
        e.id,
        e.name,
        e.phone || "",
        e.email || null,
        e.position,
        e.department,
        e.salary ?? 0,
        e.startDate,
        e.status || "active",
        e.address || null,
        e.nationalId || null,
        e.notes || null,
        e.createdAt
      );
    }
    const insSP = database.prepare(
      "INSERT INTO salary_payments (id, employee_id, amount, month, bonuses, deductions, net_salary, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const sp of state.salaryPayments || []) {
      insSP.run(sp.id, sp.employeeId, sp.amount, sp.month, sp.bonuses ?? 0, sp.deductions ?? 0, sp.netSalary, sp.paidAt, sp.notes || null);
    }
    const insPay = database.prepare(
      "INSERT INTO payments (id, type, entity_id, amount, reference_id, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const p of state.payments || []) {
      insPay.run(p.id, p.type, p.entityId, p.amount, p.referenceId || null, p.notes || null, p.date);
    }
    const insRet = database.prepare(
      "INSERT INTO returns (id, type, entity_id, supplier_id, customer_id, total_amount, reason, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    for (const r of state.returns || []) {
      insRet.run(
        r.id,
        r.type,
        r.entityId,
        r.supplierId || null,
        r.customerId || null,
        r.totalAmount ?? 0,
        r.reason,
        r.date,
        JSON.stringify(r.items || [])
      );
    }
    const insNot = database.prepare(
      "INSERT INTO notifications (id, type, title, message, is_read, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const n of state.notifications || []) {
      insNot.run(n.id, n.type, n.title, n.message, n.isRead ? 1 : 0, n.link || null, n.createdAt);
    }
    database.prepare(`
      INSERT OR REPLACE INTO settings (id, system_name, username, password, logo, currency, theme, language, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      ((_a = state.settings) == null ? void 0 : _a.systemName) || "PowerCore ERP",
      ((_b = state.settings) == null ? void 0 : _b.username) || "admin",
      ((_c = state.settings) == null ? void 0 : _c.password) || "123456",
      ((_d = state.settings) == null ? void 0 : _d.logo) || null,
      ((_e = state.settings) == null ? void 0 : _e.currency) || "دينار",
      ((_f = state.settings) == null ? void 0 : _f.theme) || "light",
      ((_g = state.settings) == null ? void 0 : _g.language) || "ar"
    );
    database.prepare(`
      INSERT OR REPLACE INTO app_session (key, value, updated_at) VALUES ('isLoggedIn', ?, datetime('now'))
    `).run(state.isLoggedIn ? "1" : "0");
  });
  tx();
}
exports.checkpointBeforeBackup = checkpointBeforeBackup;
exports.closeDatabase = closeDatabase;
exports.getAppDatabase = getAppDatabase;
exports.getDatabasePath = getDatabasePath;
exports.loadState = loadState;
exports.saveState = saveState;
