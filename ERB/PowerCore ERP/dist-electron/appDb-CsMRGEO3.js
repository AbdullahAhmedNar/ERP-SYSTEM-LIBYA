"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const k=require("better-sqlite3"),g=require("path"),f=require("electron"),B=`
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
`;let n=null;function S(){if(!n){const a=g.join(f.app.getPath("userData"),"powercore-erp.db");n=new k(a),n.pragma("journal_mode = WAL"),n.pragma("foreign_keys = ON"),n.exec(B),j()}return n}function q(){return g.join(f.app.getPath("userData"),"powercore-erp.db")}function G(){if(n)try{n.pragma("wal_checkpoint(TRUNCATE)")}catch{}}function V(){if(n){try{n.close()}catch{}n=null}}function j(){if(n.prepare("SELECT id FROM settings WHERE id = 1").get()||n.prepare(`
      INSERT INTO settings (id, system_name, username, password, currency, theme, language)
      VALUES (1, 'PowerCore ERP', 'admin', '123456', 'دينار', 'light', 'ar')
    `).run(),n.prepare("SELECT COUNT(*) as c FROM warehouses").get().c===0){const o=n.prepare(`
      INSERT INTO warehouses (id, name, location, description, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);o.run("wh-1","المخزن الرئيسي","","المخزن الرئيسي"),o.run("wh-2","مخزن العرض","","مخزن العرض"),o.run("wh-3","مخزن الصيانة","","مخزن الصيانة")}}function x(){try{const a=S();if(a.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all().length===0)return console.error("loadState: لا توجد جداول في قاعدة البيانات"),null;let o=null;try{o=a.prepare("SELECT * FROM settings LIMIT 1").get()}catch(e){console.warn("loadState: فشل قراءة الإعدادات",e)}const c=o?{systemName:o.system_name||"PowerCore ERP",username:o.username||"admin",password:o.password||"",logo:o.logo,currency:o.currency||"دينار",theme:o.theme||"light",language:o.language||"ar"}:{systemName:"PowerCore ERP",username:"admin",password:"",currency:"دينار",theme:"light",language:"ar"};let E=!1;try{const e=a.prepare("SELECT value FROM app_session WHERE key = 'isLoggedIn'").get();E=e?e.value==="1":!1}catch(e){console.warn("loadState: فشل قراءة جلسة تسجيل الدخول",e)}const T=e=>(e||[]).map(u=>u?{...u}:null).filter(Boolean),r=(e,u=[])=>{try{return e()}catch(K){return console.warn("loadState: خطأ في قراءة البيانات",K),u}},L=T(r(()=>a.prepare("SELECT * FROM suppliers").all())),l=T(r(()=>a.prepare("SELECT * FROM customers").all())),N=T(r(()=>a.prepare("SELECT * FROM users").all())),m=T(r(()=>a.prepare("SELECT * FROM warehouses").all())),_=r(()=>a.prepare("SELECT * FROM products").all()).map(e=>({id:e.id,code:e.code,name:e.name,type:e.type,salePrice:e.sale_price,costPrice:e.cost_price,rentalPricePerDay:e.rental_price_per_day,minStock:e.min_stock,warehouseId:e.warehouse_id,quantity:e.quantity,createdAt:e.created_at})),R=r(()=>a.prepare("SELECT * FROM stock_movements").all()).map(e=>({id:e.id,productId:e.product_id,warehouseId:e.warehouse_id,type:e.type,quantity:e.quantity,referenceId:e.reference_id,referenceType:e.reference_type,notes:e.notes,date:e.date})),O=r(()=>a.prepare("SELECT * FROM purchase_orders").all()).map(e=>({id:e.id,supplierId:e.supplier_id,warehouseId:e.warehouse_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,paidAmount:e.paid_amount,paymentType:e.payment_type,status:e.status,notes:e.notes,date:e.date})),A=r(()=>a.prepare("SELECT * FROM sale_invoices").all()).map(e=>({id:e.id,customerId:e.customer_id,warehouseId:e.warehouse_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,paidAmount:e.paid_amount,discount:e.discount,paymentType:e.payment_type,profit:e.profit,status:e.status,notes:e.notes,date:e.date})),d=r(()=>a.prepare("SELECT * FROM generators").all()).map(e=>({id:e.id,serialNumber:e.serial_number,capacity:e.capacity,brand:e.brand,model:e.model,status:e.status,notes:e.notes,createdAt:e.created_at})),i=r(()=>a.prepare("SELECT * FROM rental_contracts").all()).map(e=>({id:e.id,customerId:e.customer_id,generatorId:e.generator_id,startDate:e.start_date,endDate:e.end_date,dailyRate:e.daily_rate,deposit:e.deposit,advancePayment:e.advance_payment,totalDays:e.total_days,totalAmount:e.total_amount,paidAmount:e.paid_amount,status:e.status,notes:e.notes,createdAt:e.created_at})),p=r(()=>a.prepare("SELECT * FROM after_sales_requests").all()).map(e=>({id:e.id,customerId:e.customer_id,productId:e.product_id,generatorId:e.generator_id,reportDate:e.report_date,problemType:e.problem_type,description:e.description,maintenanceCost:e.maintenance_cost,status:e.status,assignedTo:e.assigned_to,notes:e.notes,createdAt:e.created_at})),t=r(()=>a.prepare("SELECT * FROM employees").all()).map(e=>({id:e.id,name:e.name,phone:e.phone,email:e.email,position:e.position,department:e.department,salary:e.salary,startDate:e.start_date,status:e.status,address:e.address,nationalId:e.national_id,notes:e.notes,createdAt:e.created_at})),C=r(()=>a.prepare("SELECT * FROM salary_payments").all()).map(e=>({id:e.id,employeeId:e.employee_id,amount:e.amount,month:e.month,bonuses:e.bonuses,deductions:e.deductions,netSalary:e.net_salary,paidAt:e.paid_at,notes:e.notes})),M=r(()=>a.prepare("SELECT * FROM payments").all()).map(e=>({id:e.id,type:e.type,entityId:e.entity_id,amount:e.amount,referenceId:e.reference_id,notes:e.notes,date:e.date})),P=r(()=>a.prepare("SELECT * FROM returns").all()).map(e=>({id:e.id,type:e.type,entityId:e.entity_id,supplierId:e.supplier_id,customerId:e.customer_id,items:JSON.parse(e.items_json||"[]"),totalAmount:e.total_amount,reason:e.reason,date:e.date})),Y=r(()=>a.prepare("SELECT * FROM notifications").all()).map(e=>({id:e.id,type:e.type,title:e.title,message:e.message,isRead:!!e.is_read,link:e.link,createdAt:e.created_at})),b=L.map(e=>({id:e.id,name:e.name,phone:e.phone||"",email:e.email,address:e.address,balance:e.balance??0,createdAt:e.created_at})),v=l.map(e=>({id:e.id,name:e.name,phone:e.phone||"",email:e.email,address:e.address,balance:e.balance??0,createdAt:e.created_at}));return{suppliers:b,customers:v,users:N.map(e=>({id:e.id,username:e.username,password:e.password})),warehouses:m.map(e=>({id:e.id,name:e.name,location:e.location,description:e.description,createdAt:e.created_at})),products:_,stockMovements:R,purchaseOrders:O,saleInvoices:A,generators:d,rentalContracts:i,afterSalesRequests:p,employees:t,salaryPayments:C,payments:M,returns:P,notifications:Y,settings:c||{systemName:"PowerCore ERP",username:"admin",password:"123456",currency:"دينار",theme:"light",language:"ar"},isLoggedIn:E}}catch(a){return console.error("loadState error:",a),null}}function J(a){const s=S();s.pragma("foreign_keys = OFF");try{s.transaction(()=>{var I,d,U,i,y,p,X;s.prepare("DELETE FROM suppliers").run(),s.prepare("DELETE FROM customers").run(),s.prepare("DELETE FROM users").run(),s.prepare("DELETE FROM warehouses").run(),s.prepare("DELETE FROM products").run(),s.prepare("DELETE FROM stock_movements").run(),s.prepare("DELETE FROM purchase_orders").run(),s.prepare("DELETE FROM sale_invoices").run(),s.prepare("DELETE FROM generators").run(),s.prepare("DELETE FROM rental_contracts").run(),s.prepare("DELETE FROM after_sales_requests").run(),s.prepare("DELETE FROM employees").run(),s.prepare("DELETE FROM salary_payments").run(),s.prepare("DELETE FROM payments").run(),s.prepare("DELETE FROM returns").run(),s.prepare("DELETE FROM notifications").run();const c=s.prepare("INSERT INTO suppliers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of a.suppliers||[])c.run(t.id,t.name,t.phone||"",t.email||null,t.address||null,t.balance??0,t.createdAt);const E=s.prepare("INSERT INTO customers (id, name, phone, email, address, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of a.customers||[])E.run(t.id,t.name,t.phone||"",t.email||null,t.address||null,t.balance??0,t.createdAt);const T=s.prepare("INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, datetime('now'))");for(const t of a.users||[])T.run(t.id,t.username,t.password);const r=s.prepare("INSERT INTO warehouses (id, name, location, description, created_at) VALUES (?, ?, ?, ?, ?)");for(const t of a.warehouses||[])r.run(t.id,t.name,t.location||null,t.description||null,t.createdAt);const L=s.prepare("INSERT INTO products (id, code, name, type, sale_price, cost_price, rental_price_per_day, min_stock, warehouse_id, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.products||[])L.run(t.id,t.code,t.name,t.type||"sale",t.salePrice??0,t.costPrice??0,t.rentalPricePerDay??null,t.minStock??0,t.warehouseId,t.quantity??0,t.createdAt);const l=s.prepare("INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, reference_id, reference_type, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.stockMovements||[])l.run(t.id,t.productId,t.warehouseId,t.type,t.quantity,t.referenceId||null,t.referenceType||null,t.notes||null,t.date);const N=s.prepare("INSERT INTO purchase_orders (id, supplier_id, warehouse_id, total_amount, paid_amount, payment_type, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.purchaseOrders||[])N.run(t.id,t.supplierId,t.warehouseId,t.totalAmount??0,t.paidAmount??0,t.paymentType||"full",t.status||"pending",t.notes||null,t.date,JSON.stringify(t.items||[]));const m=s.prepare("INSERT INTO sale_invoices (id, customer_id, warehouse_id, total_amount, paid_amount, discount, payment_type, profit, status, notes, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.saleInvoices||[])m.run(t.id,t.customerId,t.warehouseId,t.totalAmount??0,t.paidAmount??0,t.discount??0,t.paymentType||"immediate",t.profit??0,t.status||"active",t.notes||null,t.date,JSON.stringify(t.items||[]));const F=s.prepare("INSERT INTO generators (id, serial_number, capacity, brand, model, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.generators||[])F.run(t.id,t.serialNumber,t.capacity,t.brand||null,t.model||null,t.status||"available",t.notes||null,t.createdAt);const _=s.prepare("INSERT INTO rental_contracts (id, customer_id, generator_id, start_date, end_date, daily_rate, deposit, advance_payment, total_days, total_amount, paid_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.rentalContracts||[])_.run(t.id,t.customerId,t.generatorId,t.startDate,t.endDate,t.dailyRate??0,t.deposit??0,t.advancePayment??0,t.totalDays??0,t.totalAmount??0,t.paidAmount??0,t.status||"active",t.notes||null,t.createdAt);const w=s.prepare("INSERT INTO after_sales_requests (id, customer_id, product_id, generator_id, report_date, problem_type, description, maintenance_cost, status, assigned_to, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.afterSalesRequests||[])w.run(t.id,t.customerId,t.productId||null,t.generatorId||null,t.reportDate,t.problemType,t.description,t.maintenanceCost??0,t.status||"inspection",t.assignedTo||null,t.notes||null,t.createdAt);const R=s.prepare("INSERT INTO employees (id, name, phone, email, position, department, salary, start_date, status, address, national_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.employees||[])R.run(t.id,t.name,t.phone||"",t.email||null,t.position,t.department,t.salary??0,t.startDate,t.status||"active",t.address||null,t.nationalId||null,t.notes||null,t.createdAt);const h=s.prepare("INSERT INTO salary_payments (id, employee_id, amount, month, bonuses, deductions, net_salary, paid_at, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.salaryPayments||[])h.run(t.id,t.employeeId,t.amount,t.month,t.bonuses??0,t.deductions??0,t.netSalary,t.paidAt,t.notes||null);const O=s.prepare("INSERT INTO payments (id, type, entity_id, amount, reference_id, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of a.payments||[])O.run(t.id,t.type,t.entityId,t.amount,t.referenceId||null,t.notes||null,t.date);const D=s.prepare("INSERT INTO returns (id, type, entity_id, supplier_id, customer_id, total_amount, reason, date, items_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");for(const t of a.returns||[])D.run(t.id,t.type,t.entityId,t.supplierId||null,t.customerId||null,t.totalAmount??0,t.reason,t.date,JSON.stringify(t.items||[]));const A=s.prepare("INSERT INTO notifications (id, type, title, message, is_read, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");for(const t of a.notifications||[])A.run(t.id,t.type,t.title,t.message,t.isRead?1:0,t.link||null,t.createdAt);s.prepare(`
      INSERT OR REPLACE INTO settings (id, system_name, username, password, logo, currency, theme, language, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(((I=a.settings)==null?void 0:I.systemName)||"PowerCore ERP",((d=a.settings)==null?void 0:d.username)||"admin",((U=a.settings)==null?void 0:U.password)||"123456",((i=a.settings)==null?void 0:i.logo)||null,((y=a.settings)==null?void 0:y.currency)||"دينار",((p=a.settings)==null?void 0:p.theme)||"light",((X=a.settings)==null?void 0:X.language)||"ar"),s.prepare(`
      INSERT OR REPLACE INTO app_session (key, value, updated_at) VALUES ('isLoggedIn', ?, datetime('now'))
    `).run(a.isLoggedIn?"1":"0")})()}finally{s.pragma("foreign_keys = ON")}}exports.checkpointBeforeBackup=G;exports.closeDatabase=V;exports.getAppDatabase=S;exports.getDatabasePath=q;exports.loadState=x;exports.saveState=J;
