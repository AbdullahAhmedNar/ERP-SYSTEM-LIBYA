/**
 * PowerCore ERP - App Database (Zustand Sync)
 * قاعدة بيانات التطبيق - مزامنة مع Zustand Store
 */

import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { SCHEMA } from './schema';

let db: Database.Database | null = null;

export function getAppDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'powercore-erp.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA);
    ensureDefaults();
  }
  return db;
}

export function getDatabasePath(): string {
  return path.join(app.getPath('userData'), 'powercore-erp.db');
}

/** دمج بيانات WAL في الملف الرئيسي قبل النسخ الاحتياطي */
export function checkpointBeforeBackup(): void {
  if (db) {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
    } catch (_) {}
  }
}

/** إغلاق الاتصال بقاعدة البيانات (قبل استبدال الملف عند الاستعادة) */
export function closeDatabase(): void {
  if (db) {
    try {
      db.close();
    } catch (_) {}
    db = null;
  }
}

function ensureDefaults() {
  const s = db!.prepare('SELECT id FROM settings WHERE id = 1').get();
  if (!s) {
    db!.prepare(`
      INSERT INTO settings (id, system_name, username, password, currency, theme, language)
      VALUES (1, 'PowerCore ERP', 'admin', '123456', 'دينار', 'light', 'ar')
    `).run();
  }

  const wh = db!.prepare('SELECT COUNT(*) as c FROM warehouses').get() as { c: number };
  if (wh.c === 0) {
    const insert = db!.prepare(`
      INSERT INTO warehouses (id, name, location, description, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    insert.run('wh-1', 'المخزن الرئيسي', '', 'المخزن الرئيسي');
    insert.run('wh-2', 'مخزن العرض', '', 'مخزن العرض');
    insert.run('wh-3', 'مخزن الصيانة', '', 'مخزن الصيانة');
  }
}

export interface PersistedState {
  suppliers: any[];
  customers: any[];
  users: any[];
  warehouses: any[];
  products: any[];
  stockMovements: any[];
  purchaseOrders: any[];
  saleInvoices: any[];
  generators: any[];
  rentalContracts: any[];
  afterSalesRequests: any[];
  employees: any[];
  salaryPayments: any[];
  payments: any[];
  returns: any[];
  notifications: any[];
  settings: any;
  isLoggedIn: boolean;
}

export function loadState(): PersistedState | null {
  try {
    const database = getAppDatabase();

    // التحقق من أن الجداول الأساسية موجودة
    const tables = database.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as any[];
    
    if (tables.length === 0) {
      console.error('loadState: لا توجد جداول في قاعدة البيانات');
      return null;
    }

    // محاولة قراءة الإعدادات
    let settingsRow: any = null;
    try {
      settingsRow = database.prepare('SELECT * FROM settings LIMIT 1').get() as any;
    } catch (e) {
      console.warn('loadState: فشل قراءة الإعدادات', e);
    }

    const settings = settingsRow ? {
      systemName: settingsRow.system_name || 'PowerCore ERP',
      username: settingsRow.username || 'admin',
      password: settingsRow.password || '',
      logo: settingsRow.logo,
      currency: settingsRow.currency || 'دينار',
      theme: settingsRow.theme || 'light',
      language: settingsRow.language || 'ar',
    } : {
      systemName: 'PowerCore ERP',
      username: 'admin',
      password: '',
      currency: 'دينار',
      theme: 'light',
      language: 'ar',
    };

    let isLoggedIn = false;
    try {
      const sessionRow = database.prepare("SELECT value FROM app_session WHERE key = 'isLoggedIn'").get() as { value: string } | undefined;
      isLoggedIn = sessionRow ? sessionRow.value === '1' : false;
    } catch (e) {
      console.warn('loadState: فشل قراءة جلسة تسجيل الدخول', e);
    }

    const map = (rows: any[]) => (rows || []).map(row => row ? { ...row } : null).filter(Boolean);

    // محاولة قراءة البيانات مع معالجة الأخطاء
    const safe = (fn: () => any[], defaultValue: any[] = []) => {
      try {
        return fn();
      } catch (e) {
        console.warn('loadState: خطأ في قراءة البيانات', e);
        return defaultValue;
      }
    };

    const suppliers = map(safe(() => database.prepare('SELECT * FROM suppliers').all() as any[]));
    const customers = map(safe(() => database.prepare('SELECT * FROM customers').all() as any[]));
    const users = map(safe(() => database.prepare('SELECT * FROM users').all() as any[]));
    const warehouses = map(safe(() => database.prepare('SELECT * FROM warehouses').all() as any[]));

    const productsRaw = safe(() => database.prepare('SELECT * FROM products').all() as any[]);
    const products = productsRaw.map(p => ({
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
      createdAt: p.created_at,
    }));

    const stockMovementsRaw = safe(() => database.prepare('SELECT * FROM stock_movements').all() as any[]);
    const stockMovements = stockMovementsRaw.map(m => ({
      id: m.id,
      productId: m.product_id,
      warehouseId: m.warehouse_id,
      type: m.type,
      quantity: m.quantity,
      referenceId: m.reference_id,
      referenceType: m.reference_type,
      notes: m.notes,
      date: m.date,
    }));

    const purchaseOrdersRaw = safe(() => database.prepare('SELECT * FROM purchase_orders').all() as any[]);
    const purchaseOrders = purchaseOrdersRaw.map(po => ({
      id: po.id,
      supplierId: po.supplier_id,
      warehouseId: po.warehouse_id,
      items: JSON.parse(po.items_json || '[]'),
      totalAmount: po.total_amount,
      paidAmount: po.paid_amount,
      paymentType: po.payment_type,
      status: po.status,
      notes: po.notes,
      date: po.date,
    }));

    const saleInvoicesRaw = safe(() => database.prepare('SELECT * FROM sale_invoices').all() as any[]);
    const saleInvoices = saleInvoicesRaw.map(si => ({
      id: si.id,
      customerId: si.customer_id,
      warehouseId: si.warehouse_id,
      items: JSON.parse(si.items_json || '[]'),
      totalAmount: si.total_amount,
      paidAmount: si.paid_amount,
      discount: si.discount,
      paymentType: si.payment_type,
      profit: si.profit,
      status: si.status,
      notes: si.notes,
      date: si.date,
    }));

    const generatorsRaw = safe(() => database.prepare('SELECT * FROM generators').all() as any[]);
    const generators = generatorsRaw.map(g => ({
      id: g.id,
      serialNumber: g.serial_number,
      capacity: g.capacity,
      brand: g.brand,
      model: g.model,
      status: g.status,
      notes: g.notes,
      createdAt: g.created_at,
    }));

    const rentalContractsRaw = safe(() => database.prepare('SELECT * FROM rental_contracts').all() as any[]);
    const rentalContracts = rentalContractsRaw.map(rc => ({
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
      createdAt: rc.created_at,
    }));

    const afterSalesRaw = safe(() => database.prepare('SELECT * FROM after_sales_requests').all() as any[]);
    const afterSalesRequests = afterSalesRaw.map(a => ({
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
      createdAt: a.created_at,
    }));

    const employeesRaw = safe(() => database.prepare('SELECT * FROM employees').all() as any[]);
    const employees = employeesRaw.map(e => ({
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
      createdAt: e.created_at,
    }));

    const salaryPaymentsRaw = safe(() => database.prepare('SELECT * FROM salary_payments').all() as any[]);
    const salaryPayments = salaryPaymentsRaw.map(sp => ({
      id: sp.id,
      employeeId: sp.employee_id,
      amount: sp.amount,
      month: sp.month,
      bonuses: sp.bonuses,
      deductions: sp.deductions,
      netSalary: sp.net_salary,
      paidAt: sp.paid_at,
      notes: sp.notes,
    }));

    const paymentsRaw = safe(() => database.prepare('SELECT * FROM payments').all() as any[]);
    const payments = paymentsRaw.map(p => ({
      id: p.id,
      type: p.type,
      entityId: p.entity_id,
      amount: p.amount,
      referenceId: p.reference_id,
      notes: p.notes,
      date: p.date,
    }));

    const returnsRaw = safe(() => database.prepare('SELECT * FROM returns').all() as any[]);
    const returns = returnsRaw.map(r => ({
      id: r.id,
      type: r.type,
      entityId: r.entity_id,
      supplierId: r.supplier_id,
      customerId: r.customer_id,
      items: JSON.parse(r.items_json || '[]'),
      totalAmount: r.total_amount,
      reason: r.reason,
      date: r.date,
    }));

    const notificationsRaw = safe(() => database.prepare('SELECT * FROM notifications').all() as any[]);
    const notifications = notificationsRaw.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: !!n.is_read,
      link: n.link,
      createdAt: n.created_at,
    }));

    const suppliersNorm = suppliers.map((s: any) => ({
      id: s.id,
      name: s.name,
      phone: s.phone || '',
      email: s.email,
      address: s.address,
      balance: s.balance ?? 0,
      createdAt: s.created_at,
    }));

    const customersNorm = customers.map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
      email: c.email,
      address: c.address,
      balance: c.balance ?? 0,
      createdAt: c.created_at,
    }));

    return {
      suppliers: suppliersNorm,
      customers: customersNorm,
      users: users.map((u: any) => ({ id: u.id, username: u.username, password: u.password })),
      warehouses: warehouses.map((w: any) => ({
        id: w.id,
        name: w.name,
        location: w.location,
        description: w.description,
        createdAt: w.created_at,
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
        systemName: 'PowerCore ERP',
        username: 'admin',
        password: '123456',
        currency: 'دينار',
        theme: 'light',
        language: 'ar',
      },
      isLoggedIn,
    };
  } catch (err) {
    console.error('loadState error:', err);
    return null;
  }
}

export function saveState(state: PersistedState): void {
  const database = getAppDatabase();

  // تعطيل قيود المفاتيح الخارجية قبل بدء المعاملة (في SQLite لا يُطبّق PRAGMA داخل معاملة نشطة)
  database.pragma('foreign_keys = OFF');
  try {
  const tx = database.transaction(() => {
    database.prepare('DELETE FROM suppliers').run();
    database.prepare('DELETE FROM customers').run();
    database.prepare('DELETE FROM users').run();
    database.prepare('DELETE FROM warehouses').run();
    database.prepare('DELETE FROM products').run();
    database.prepare('DELETE FROM stock_movements').run();
    database.prepare('DELETE FROM purchase_orders').run();
    database.prepare('DELETE FROM sale_invoices').run();
    database.prepare('DELETE FROM generators').run();
    database.prepare('DELETE FROM rental_contracts').run();
    database.prepare('DELETE FROM after_sales_requests').run();
    database.prepare('DELETE FROM employees').run();
    database.prepare('DELETE FROM salary_payments').run();
    database.prepare('DELETE FROM payments').run();
    database.prepare('DELETE FROM returns').run();
    database.prepare('DELETE FROM notifications').run();

    const insSup = database.prepare(
      'INSERT INTO suppliers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const s of state.suppliers || []) {
      insSup.run(s.id, s.name, s.phone || '', s.email || null, s.address || null, s.balance ?? 0, s.createdAt);
    }

    const insCust = database.prepare(
      'INSERT INTO customers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const c of state.customers || []) {
      insCust.run(c.id, c.name, c.phone || '', c.email || null, c.address || null, c.balance ?? 0, c.createdAt);
    }

    const insUser = database.prepare("INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, datetime('now'))");
    for (const u of state.users || []) {
      insUser.run(u.id, u.username, u.password);
    }

    const insWh = database.prepare(
      'INSERT INTO warehouses (id, name, location, description, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const w of state.warehouses || []) {
      insWh.run(w.id, w.name, w.location || null, w.description || null, w.createdAt);
    }

    const insProd = database.prepare(
      'INSERT INTO products (id, code, name, type, sale_price, cost_price, rental_price_per_day, min_stock, warehouse_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of state.products || []) {
      insProd.run(
        p.id, p.code, p.name, p.type || 'sale', p.salePrice ?? 0, p.costPrice ?? 0,
        p.rentalPricePerDay ?? null, p.minStock ?? 0, p.warehouseId, p.quantity ?? 0, p.createdAt
      );
    }

    const insMov = database.prepare(
      'INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, reference_id, reference_type, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const m of state.stockMovements || []) {
      insMov.run(m.id, m.productId, m.warehouseId, m.type, m.quantity, m.referenceId || null, m.referenceType || null, m.notes || null, m.date);
    }

    const insPO = database.prepare(
      'INSERT INTO purchase_orders (id, supplier_id, warehouse_id, total_amount, paid_amount, payment_type, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const po of state.purchaseOrders || []) {
      insPO.run(
        po.id, po.supplierId, po.warehouseId, po.totalAmount ?? 0, po.paidAmount ?? 0,
        po.paymentType || 'full', po.status || 'pending', po.notes || null, po.date,
        JSON.stringify(po.items || [])
      );
    }

    const insSI = database.prepare(
      'INSERT INTO sale_invoices (id, customer_id, warehouse_id, total_amount, paid_amount, discount, payment_type, profit, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const si of state.saleInvoices || []) {
      insSI.run(
        si.id, si.customerId, si.warehouseId, si.totalAmount ?? 0, si.paidAmount ?? 0,
        si.discount ?? 0, si.paymentType || 'immediate', si.profit ?? 0, si.status || 'active',
        si.notes || null, si.date, JSON.stringify(si.items || [])
      );
    }

    const insGen = database.prepare(
      'INSERT INTO generators (id, serial_number, capacity, brand, model, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const g of state.generators || []) {
      insGen.run(g.id, g.serialNumber, g.capacity, g.brand || null, g.model || null, g.status || 'available', g.notes || null, g.createdAt);
    }

    const insRC = database.prepare(
      'INSERT INTO rental_contracts (id, customer_id, generator_id, start_date, end_date, daily_rate, deposit, advance_payment, total_days, total_amount, paid_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const rc of state.rentalContracts || []) {
      insRC.run(
        rc.id, rc.customerId, rc.generatorId, rc.startDate, rc.endDate, rc.dailyRate ?? 0,
        rc.deposit ?? 0, rc.advancePayment ?? 0, rc.totalDays ?? 0, rc.totalAmount ?? 0, rc.paidAmount ?? 0,
        rc.status || 'active', rc.notes || null, rc.createdAt
      );
    }

    const insAS = database.prepare(
      'INSERT INTO after_sales_requests (id, customer_id, product_id, generator_id, report_date, problem_type, description, maintenance_cost, status, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const a of state.afterSalesRequests || []) {
      insAS.run(
        a.id, a.customerId, a.productId || null, a.generatorId || null, a.reportDate, a.problemType, a.description,
        a.maintenanceCost ?? 0, a.status || 'inspection', a.assignedTo || null, a.notes || null, a.createdAt
      );
    }

    const insEmp = database.prepare(
      'INSERT INTO employees (id, name, phone, email, position, department, salary, start_date, status, address, national_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const e of state.employees || []) {
      insEmp.run(
        e.id, e.name, e.phone || '', e.email || null, e.position, e.department, e.salary ?? 0,
        e.startDate, e.status || 'active', e.address || null, e.nationalId || null, e.notes || null, e.createdAt
      );
    }

    const insSP = database.prepare(
      'INSERT INTO salary_payments (id, employee_id, amount, month, bonuses, deductions, net_salary, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const sp of state.salaryPayments || []) {
      insSP.run(sp.id, sp.employeeId, sp.amount, sp.month, sp.bonuses ?? 0, sp.deductions ?? 0, sp.netSalary, sp.paidAt, sp.notes || null);
    }

    const insPay = database.prepare(
      'INSERT INTO payments (id, type, entity_id, amount, reference_id, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const p of state.payments || []) {
      insPay.run(p.id, p.type, p.entityId, p.amount, p.referenceId || null, p.notes || null, p.date);
    }

    const insRet = database.prepare(
      'INSERT INTO returns (id, type, entity_id, supplier_id, customer_id, total_amount, reason, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const r of state.returns || []) {
      insRet.run(
        r.id, r.type, r.entityId, r.supplierId || null, r.customerId || null,
        r.totalAmount ?? 0, r.reason, r.date, JSON.stringify(r.items || [])
      );
    }

    const insNot = database.prepare(
      'INSERT INTO notifications (id, type, title, message, is_read, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const n of state.notifications || []) {
      insNot.run(n.id, n.type, n.title, n.message, n.isRead ? 1 : 0, n.link || null, n.createdAt);
    }

    database.prepare(`
      INSERT OR REPLACE INTO settings (id, system_name, username, password, logo, currency, theme, language, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      state.settings?.systemName || 'PowerCore ERP',
      state.settings?.username || 'admin',
      state.settings?.password || '123456',
      state.settings?.logo || null,
      state.settings?.currency || 'دينار',
      state.settings?.theme || 'light',
      state.settings?.language || 'ar'
    );

    database.prepare(`
      INSERT OR REPLACE INTO app_session (key, value, updated_at) VALUES ('isLoggedIn', ?, datetime('now'))
    `).run(state.isLoggedIn ? '1' : '0');
  });

  tx();
  } finally {
    database.pragma('foreign_keys = ON');
  }
}
