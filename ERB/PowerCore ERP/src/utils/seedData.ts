import { v4 as uuidv4 } from 'uuid';

function d(daysAgo: number) {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
}

export function generateSeedData() {
  // ── IDs ──
  const wh1 = uuidv4(), wh2 = uuidv4(), wh3 = uuidv4();
  const sup = Array.from({ length: 10 }, () => uuidv4());
  const cust = Array.from({ length: 15 }, () => uuidv4());
  const prod = Array.from({ length: 20 }, () => uuidv4());
  const emp = Array.from({ length: 8 }, () => uuidv4());
  const gen = Array.from({ length: 8 }, () => uuidv4());

  // ── Warehouses ──
  const warehouses = [
    { id: wh1, name: 'مخزن المولدات الرئيسي', location: 'طريق المطار - طرابلس', description: 'مخزن المولدات الكهربائية الجاهزة للبيع والإيجار', createdAt: d(120) },
    { id: wh2, name: 'مخزن قطع الغيار', location: 'المنطقة الصناعية - مصراتة', description: 'قطع غيار المولدات - فلاتر، زيوت، كابلات', createdAt: d(120) },
    { id: wh3, name: 'ورشة الصيانة', location: 'بنغازي - المنطقة الصناعية', description: 'مخزن أدوات الصيانة والمولدات قيد الإصلاح', createdAt: d(120) },
  ];

  // ── Suppliers ──
  const suppliers = [
    { id: sup[0], name: 'شركة كاتربيلر ليبيا', phone: '0912345678', address: 'طرابلس - المنطقة الصناعية', balance: 45000, createdAt: d(110) },
    { id: sup[1], name: 'وكالة كمنز للمولدات', phone: '0923456789', address: 'مصراتة', balance: 0, createdAt: d(105) },
    { id: sup[2], name: 'مؤسسة بيركنز لقطع الغيار', phone: '0934567890', address: 'بنغازي', balance: 12000, createdAt: d(100) },
    { id: sup[3], name: 'شركة فلاتر المولدات', phone: '0945678901', address: 'الخمس', balance: 0, createdAt: d(95) },
    { id: sup[4], name: 'مصنع خزانات الديزل', phone: '0956789012', address: 'طرابلس', balance: 8500, createdAt: d(90) },
    { id: sup[5], name: 'مؤسسة الكابلات الكهربائية', phone: '0967890123', address: 'زليتن', balance: 0, createdAt: d(88) },
    { id: sup[6], name: 'شركة زيوت المحركات', phone: '0978901234', address: 'مصراتة', balance: 5500, createdAt: d(85) },
    { id: sup[7], name: 'وكالة لستر للمولدات', phone: '0989012345', address: 'طرابلس', balance: 0, createdAt: d(80) },
    { id: sup[8], name: 'مؤسسة أطقم الصيانة', phone: '0990123456', address: 'بنغازي', balance: 3200, createdAt: d(75) },
    { id: sup[9], name: 'شركة لوحات التحكم', phone: '0901234567', address: 'البيضاء', balance: 6800, createdAt: d(70) },
    // بيانات حديثة لعام 2026 لاختبار فلاتر التاريخ
    { id: uuidv4(), name: 'شركة حلول الطاقة الحديثة', phone: '0917000001', address: 'طرابلس - طريق المطار', balance: 0, createdAt: '2026-01-10T09:00:00.000Z' },
    { id: uuidv4(), name: 'مؤسسة المعدات الصناعية 2026', phone: '0927000002', address: 'مصراتة - المنطقة الصناعية', balance: 35000, createdAt: '2026-02-05T10:30:00.000Z' },
    { id: uuidv4(), name: 'وكالة المولدات المتقدمة', phone: '0937000003', address: 'بنغازي - رأس عبيدة', balance: 12000, createdAt: '2026-03-01T14:15:00.000Z' },
  ];

  // ── Customers ──
  const customers = [
    { id: cust[0],  name: 'شركة البناء الحديث',         phone: '0911111111', address: 'طرابلس - الهضبة',     balance: 0,     createdAt: d(100) },
    { id: cust[1],  name: 'مستشفى الشفاء',             phone: '0922222222', address: 'بنغازي',              balance: 0,     createdAt: d(98) },
    { id: cust[2],  name: 'مؤسسة المشاريع الكبرى',      phone: '0933333333', address: 'مصراتة',              balance: 28500,  createdAt: d(95) },
    { id: cust[3],  name: 'مصنع الإسمنت الليبي',      phone: '0944444444', address: 'الخمس',               balance: 0,     createdAt: d(92) },
    { id: cust[4],  name: 'شركة الأحداث والفعاليات',  phone: '0955555555', address: 'طرابلس',              balance: 0,     createdAt: d(90) },
    { id: cust[5],  name: 'مزرعة الواحة',              phone: '0966666666', address: 'الجفارة',              balance: 4500,   createdAt: d(88) },
    { id: cust[6],  name: 'فندق المدينة',              phone: '0977777777', address: 'طرابلس - الفويهات',   balance: 15000,  createdAt: d(85) },
    { id: cust[7],  name: 'شركة الاتصالات الوطنية',   phone: '0988888888', address: 'بنغازي',              balance: 0,     createdAt: d(82) },
    { id: cust[8],  name: 'مؤسسة النفط والغاز',        phone: '0999999999', address: 'راس لانوف',            balance: 0,     createdAt: d(80) },
    { id: cust[9],  name: 'مستشفى طرابلس المركزي',     phone: '0900000001', address: 'طرابلس',              balance: 0,     createdAt: d(78) },
    { id: cust[10], name: 'شركة المقاولات المتحدة',    phone: '0900000002', address: 'مصراتة',              balance: 22000,  createdAt: d(75) },
    { id: cust[11], name: 'مصنع الأغذية',             phone: '0900000003', address: 'زليتن',               balance: 8500,   createdAt: d(72) },
    { id: cust[12], name: 'جامعة طرابلس',             phone: '0900000004', address: 'طرابلس - تاجوراء',    balance: 0,     createdAt: d(70) },
    { id: cust[13], name: 'مركز التسوق الكبير',       phone: '0900000005', address: 'بنغازي',              balance: 12000,  createdAt: d(68) },
    { id: cust[14], name: 'مؤسسة الري الزراعي',       phone: '0900000006', address: 'الجفارة',              balance: 0,     createdAt: d(65) },
    // عملاء جدد بتاريخ 2026 لاختبارات التقارير
    { id: uuidv4(), name: 'شركة مشاريع المستقبل 2026', phone: '0918000004', address: 'طرابلس - النوفليين',  balance: 18000, createdAt: '2026-01-15T08:45:00.000Z' },
    { id: uuidv4(), name: 'مجمع العيادات الحديثة',     phone: '0928000005', address: 'بنغازي - الكيش',      balance: 0,     createdAt: '2026-02-20T11:20:00.000Z' },
    { id: uuidv4(), name: 'شركة الخدمات الهندسية 2026', phone: '0938000006', address: 'مصراتة - وسط المدينة', balance: 32500, createdAt: '2026-03-02T16:10:00.000Z' },
  ];

  // ── Products (مولدات، قطع غيار، إكسسوارات) ──
  const products = [
    { id: prod[0],  code: 'GEN-50',   name: 'مولد كاتربيلر 50 KVA ديزل',     type: 'both' as const, salePrice: 85000,  costPrice: 65000,  rentalPricePerDay: 800,  minStock: 2,  warehouseId: wh1, quantity: 5,  createdAt: d(100) },
    { id: prod[1],  code: 'GEN-100',  name: 'مولد كمنز 100 KVA',             type: 'both' as const, salePrice: 120000, costPrice: 92000,  rentalPricePerDay: 1200, minStock: 2,  warehouseId: wh1, quantity: 4,  createdAt: d(100) },
    { id: prod[2],  code: 'GEN-150',  name: 'مولد بيركنز 150 KVA',           type: 'both' as const, salePrice: 180000, costPrice: 140000, rentalPricePerDay: 1500, minStock: 1,  warehouseId: wh1, quantity: 3,  createdAt: d(98) },
    { id: prod[3],  code: 'GEN-200',  name: 'مولد كاتربيلر 200 KVA',        type: 'both' as const, salePrice: 250000, costPrice: 195000, rentalPricePerDay: 2000, minStock: 1,  warehouseId: wh1, quantity: 2,  createdAt: d(95) },
    { id: prod[4],  code: 'GEN-20',   name: 'مولد منزلي 20 KVA',            type: 'sale' as const,  salePrice: 35000,  costPrice: 26000,  rentalPricePerDay: 0,   minStock: 3,  warehouseId: wh1, quantity: 8,  createdAt: d(95) },
    { id: prod[5],  code: 'FLT-OIL',  name: 'فلتر زيت مولد',                type: 'sale' as const,  salePrice: 85,    costPrice: 45,    rentalPricePerDay: 0,   minStock: 50, warehouseId: wh2, quantity: 120, createdAt: d(95) },
    { id: prod[6],  code: 'FLT-FUEL', name: 'فلتر وقود ديزل',               type: 'sale' as const,  salePrice: 120,   costPrice: 65,    rentalPricePerDay: 0,   minStock: 30, warehouseId: wh2, quantity: 80,  createdAt: d(90) },
    { id: prod[7],  code: 'OIL-15W',  name: 'زيت محرك 15W40 - جالون',       type: 'sale' as const,  salePrice: 180,   costPrice: 95,    rentalPricePerDay: 0,   minStock: 40, warehouseId: wh2, quantity: 150, createdAt: d(90) },
    { id: prod[8],  code: 'CBL-25',   name: 'كابل توصيل 25 متر 3 فاز',      type: 'sale' as const,  salePrice: 450,   costPrice: 280,   rentalPricePerDay: 0,   minStock: 20, warehouseId: wh2, quantity: 45,  createdAt: d(88) },
    { id: prod[9],  code: 'TNK-500',  name: 'خزان وقود 500 لتر',             type: 'sale' as const,  salePrice: 1200,  costPrice: 750,   rentalPricePerDay: 0,   minStock: 5,  warehouseId: wh2, quantity: 12,  createdAt: d(88) },
    { id: prod[10], code: 'GEN-75',   name: 'مولد لستر 75 KVA',             type: 'both' as const, salePrice: 95000,  costPrice: 72000,  rentalPricePerDay: 950,  minStock: 2,  warehouseId: wh1, quantity: 4,  createdAt: d(85) },
    { id: prod[11], code: 'BAT-200',  name: 'بطارية تشغيل 200 أمبير',       type: 'sale' as const,  salePrice: 650,   costPrice: 420,   rentalPricePerDay: 0,   minStock: 10, warehouseId: wh2, quantity: 25,  createdAt: d(85) },
    { id: prod[12], code: 'SPK-PLUG', name: 'شمعات توهج',                  type: 'sale' as const,  salePrice: 95,    costPrice: 55,    rentalPricePerDay: 0,   minStock: 30, warehouseId: wh2, quantity: 60,  createdAt: d(82) },
    { id: prod[13], code: 'BELT-ALT', name: 'سير الدينامو',                 type: 'sale' as const,  salePrice: 180,   costPrice: 95,    rentalPricePerDay: 0,   minStock: 15, warehouseId: wh2, quantity: 35,  createdAt: d(82) },
    { id: prod[14], code: 'CTRL-PNL', name: 'لوحة تحكم ATS',                type: 'sale' as const,  salePrice: 3500,  costPrice: 2200,  rentalPricePerDay: 0,   minStock: 3,  warehouseId: wh2, quantity: 8,   createdAt: d(80) },
    { id: prod[15], code: 'SIL-50',   name: 'كواتم صوت 50 KVA',             type: 'sale' as const,  salePrice: 4500,  costPrice: 2800,  rentalPricePerDay: 0,   minStock: 2,  warehouseId: wh2, quantity: 5,   createdAt: d(78) },
    { id: prod[16], code: 'GEN-30',   name: 'مولد محمول 30 KVA',            type: 'both' as const, salePrice: 55000,  costPrice: 42000,  rentalPricePerDay: 500,  minStock: 2,  warehouseId: wh1, quantity: 6,   createdAt: d(78) },
    { id: prod[17], code: 'OIL-5W',   name: 'زيت شتوي 5W40 - جالون',        type: 'sale' as const,  salePrice: 220,   costPrice: 130,   rentalPricePerDay: 0,   minStock: 25, warehouseId: wh2, quantity: 70,  createdAt: d(75) },
    { id: prod[18], code: 'GEN-300',  name: 'مولد كمنز 300 KVA صناعي',      type: 'both' as const, salePrice: 380000, costPrice: 295000, rentalPricePerDay: 3500, minStock: 1,  warehouseId: wh1, quantity: 2,   createdAt: d(75) },
    { id: prod[19], code: 'MT-KIT',   name: 'طقم صيانة سنوية للمولد',       type: 'sale' as const,  salePrice: 850,   costPrice: 480,   rentalPricePerDay: 0,   minStock: 10, warehouseId: wh2, quantity: 22,  createdAt: d(72) },
  ];

  // ── Purchase Orders ──
  const po: any[] = [];
  const addPO = (
    sid: string,
    wid: string,
    items: { pid: string; qty: number; up: number }[],
    payType: 'full' | 'partial' | 'deferred',
    paid: number,
    ago: number,
    buyerName?: string,
    buyerPhone?: string,
    discount?: number,
  ) => {
    const id = uuidv4();
    const mapped = items.map(i => ({ productId: i.pid, quantity: i.qty, unitPrice: i.up, totalPrice: i.qty * i.up }));
    const subtotal = mapped.reduce((s, i) => s + i.totalPrice, 0);
    const disc = discount ?? 0;
    const total = subtotal - disc;
    po.push({
      id,
      supplierId: sid,
      warehouseId: wid,
      items: mapped,
      totalAmount: total,
      paidAmount: paid,
      paymentType: payType,
      status: 'received',
      notes: '',
      date: d(ago),
      buyerName,
      buyerPhone,
      discount: disc,
    });
    return { id, total, paid };
  };

  addPO(sup[0], wh1, [{ pid: prod[0], qty: 3, up: 65000 }, { pid: prod[3], qty: 1, up: 195000 }], 'partial', 150000, 95, 'أحمد الفيتوري', '0912345678');
  addPO(sup[1], wh1, [{ pid: prod[1], qty: 2, up: 92000 }, { pid: prod[18], qty: 1, up: 295000 }], 'partial', 200000, 90, 'أحمد الفيتوري');
  addPO(sup[2], wh1, [{ pid: prod[2], qty: 2, up: 140000 }], 'full', 280000, 85, 'خالد البشير');
  addPO(sup[2], wh2, [{ pid: prod[5], qty: 80, up: 45 }, { pid: prod[6], qty: 50, up: 65 }], 'full', 6850, 82, 'خالد البشير');
  addPO(sup[6], wh2, [{ pid: prod[7], qty: 100, up: 95 }, { pid: prod[17], qty: 50, up: 130 }], 'partial', 14500, 78, 'فاطمة المنصوري');
  addPO(sup[5], wh2, [{ pid: prod[8], qty: 30, up: 280 }, { pid: prod[14], qty: 5, up: 2200 }], 'full', 19400, 75, 'فاطمة المنصوري');
  addPO(sup[4], wh2, [{ pid: prod[9], qty: 10, up: 750 }], 'full', 7500, 72, 'خالد البشير');
  addPO(sup[7], wh1, [{ pid: prod[10], qty: 3, up: 72000 }, { pid: prod[16], qty: 4, up: 42000 }], 'partial', 180000, 70, 'أحمد الفيتوري');
  addPO(sup[3], wh2, [{ pid: prod[12], qty: 40, up: 55 }, { pid: prod[13], qty: 25, up: 95 }], 'full', 4475, 68, 'عمر الشريف');
  addPO(sup[9], wh2, [{ pid: prod[14], qty: 6, up: 2200 }], 'partial', 8000, 65, 'عمر الشريف');
  addPO(sup[0], wh1, [{ pid: prod[4], qty: 5, up: 26000 }], 'full', 130000, 60, 'أحمد الفيتوري');
  addPO(sup[0], wh1, [{ pid: prod[0], qty: 5, up: 65000 }], 'full', 325000, 52, 'أحمد الفيتوري');
  addPO(sup[3], wh2, [{ pid: prod[5], qty: 90, up: 45 }, { pid: prod[6], qty: 50, up: 65 }], 'full', 9100, 50, 'خالد البشير');
  addPO(sup[8], wh2, [{ pid: prod[19], qty: 15, up: 480 }], 'full', 7200, 55, 'خالد البشير');
  // أوامر شراء حديثة لهذا الشهر لاختبار إحصائيات المشتريات الشهرية
  addPO(sup[1], wh2, [{ pid: prod[5], qty: 40, up: 45 }, { pid: prod[6], qty: 30, up: 65 }], 'full', 0, 3, 'خالد البشير');

  // ── Sale Invoices ──
  const si: any[] = [];
  const addSI = (
    cid: string,
    wid: string,
    items: { pid: string; qty: number; sp: number; cp: number }[],
    payType: 'immediate' | 'deferred',
    paid: number,
    disc: number,
    ago: number,
    salesperson?: string,
  ) => {
    const id = uuidv4();
    const mapped = items.map(i => ({ productId: i.pid, quantity: i.qty, unitPrice: i.sp, costPrice: i.cp, totalPrice: i.qty * i.sp }));
    const subtotal = mapped.reduce((s, i) => s + i.totalPrice, 0);
    const total = subtotal - disc;
    const profit = items.reduce((s, i) => s + (i.sp - i.cp) * i.qty, 0) - disc;
    const actualPaid = payType === 'immediate' ? total : paid;
    si.push({
      id,
      customerId: cid,
      warehouseId: wid,
      items: mapped,
      totalAmount: total,
      paidAmount: actualPaid,
      discount: disc,
      paymentType: payType,
      profit,
      status: 'active',
      notes: '',
      date: d(ago),
      salesperson,
    });
    return id;
  };

  addSI(cust[0],  wh1, [{ pid: prod[0], qty: 1, sp: 85000, cp: 65000 }], 'immediate', 0, 0, 50, 'أحمد الفيتوري');
  addSI(cust[1],  wh1, [{ pid: prod[1], qty: 1, sp: 120000, cp: 92000 }], 'deferred', 60000, 0, 48, 'عمر الشريف');
  addSI(cust[2],  wh1, [{ pid: prod[2], qty: 1, sp: 180000, cp: 140000 }], 'deferred', 100000, 0, 45, 'عمر الشريف');
  addSI(cust[3],  wh1, [{ pid: prod[4], qty: 2, sp: 35000, cp: 26000 }], 'immediate', 0, 0, 42, 'أحمد الفيتوري');
  addSI(cust[4],  wh1, [{ pid: prod[16], qty: 2, sp: 55000, cp: 42000 }], 'immediate', 0, 0, 40, 'أحمد الفيتوري');
  addSI(cust[5],  wh2, [{ pid: prod[5], qty: 20, sp: 85, cp: 45 }, { pid: prod[6], qty: 15, sp: 120, cp: 65 }], 'deferred', 2000, 0, 38, 'عمر الشريف');
  addSI(cust[6],  wh1, [{ pid: prod[10], qty: 1, sp: 95000, cp: 72000 }], 'deferred', 50000, 0, 35, 'أحمد الفيتوري');
  addSI(cust[7],  wh2, [{ pid: prod[8], qty: 10, sp: 450, cp: 280 }, { pid: prod[14], qty: 2, sp: 3500, cp: 2200 }], 'immediate', 0, 0, 32, 'عمر الشريف');
  addSI(cust[8],  wh1, [{ pid: prod[18], qty: 1, sp: 380000, cp: 295000 }], 'deferred', 150000, 0, 30, 'أحمد الفيتوري');
  addSI(cust[9],  wh2, [{ pid: prod[7], qty: 30, sp: 180, cp: 95 }, { pid: prod[19], qty: 5, sp: 850, cp: 480 }], 'immediate', 0, 0, 28, 'عمر الشريف');
  addSI(cust[10], wh1, [{ pid: prod[0], qty: 2, sp: 85000, cp: 65000 }], 'deferred', 100000, 0, 25, 'أحمد الفيتوري');
  addSI(cust[11], wh2, [{ pid: prod[5], qty: 30, sp: 85, cp: 45 }, { pid: prod[6], qty: 20, sp: 120, cp: 65 }], 'deferred', 4000, 0, 22, 'عمر الشريف');
  addSI(cust[12], wh1, [{ pid: prod[16], qty: 1, sp: 55000, cp: 42000 }], 'immediate', 0, 500, 18, 'أحمد الفيتوري');
  addSI(cust[13], wh1, [{ pid: prod[10], qty: 1, sp: 95000, cp: 72000 }], 'deferred', 40000, 0, 15, 'عمر الشريف');
  addSI(cust[14], wh2, [{ pid: prod[9], qty: 3, sp: 1200, cp: 750 }, { pid: prod[11], qty: 4, sp: 650, cp: 420 }], 'immediate', 0, 0, 10, 'أحمد الفيتوري');
  // فواتير مبيعات مضافة لهذا الشهر لاختبار إحصائيات المبيعات الشهرية
  addSI(cust[10], wh1, [{ pid: prod[1], qty: 1, sp: 120000, cp: 92000 }], 'immediate', 0, 0, 1, 'أحمد الفيتوري');
  addSI(cust[6],  wh2, [{ pid: prod[7], qty: 10, sp: 180, cp: 95 }], 'immediate', 0, 0, 2, 'عمر الشريف');

  // ── Stock Movements ──
  const stockMovements: any[] = [];
  po.forEach(p => {
    p.items.forEach((item: any) => {
      stockMovements.push({ id: uuidv4(), productId: item.productId, warehouseId: p.warehouseId, type: 'in', quantity: item.quantity, referenceId: p.id, referenceType: 'purchase', date: p.date });
    });
  });
  si.forEach(s => {
    s.items.forEach((item: any) => {
      stockMovements.push({ id: uuidv4(), productId: item.productId, warehouseId: s.warehouseId, type: 'out', quantity: item.quantity, referenceId: s.id, referenceType: 'sale', date: s.date });
    });
  });

  // ── Payments ──
  const payments: any[] = [];
  po.forEach(p => {
    if (p.paidAmount > 0) payments.push({ id: uuidv4(), type: 'supplier_payment', entityId: p.supplierId, amount: p.paidAmount, referenceId: p.id, date: p.date });
  });
  si.forEach(s => {
    if (s.paidAmount > 0) payments.push({ id: uuidv4(), type: 'customer_payment', entityId: s.customerId, amount: s.paidAmount, referenceId: s.id, date: s.date });
  });

  // ── Employees ──
  const employees = [
    { id: emp[0], name: 'أحمد الفيتوري',       phone: '0911111111', email: 'ahmed@powergen.ly',   position: 'مدير المبيعات',      department: 'المبيعات',    salary: 1200, loanBalance: 0, startDate: d(365), status: 'active' as const, address: 'طرابلس', nationalId: '19800101234567', notes: '', createdAt: d(365) },
    { id: emp[1], name: 'فاطمة المنصوري',     phone: '0922222222', email: 'fatima@powergen.ly',  position: 'محاسبة',             department: 'المحاسبة',   salary: 900,  loanBalance: 0, startDate: d(300), status: 'active' as const, address: 'بنغازي', nationalId: '19900202234567', notes: '', createdAt: d(300) },
    { id: emp[2], name: 'محمد الصالح',        phone: '0933333333', email: 'mohammed@powergen.ly', position: 'فني صيانة مولدات',  department: 'الصيانة',    salary: 950,  loanBalance: 0, startDate: d(280), status: 'active' as const, address: 'مصراتة', nationalId: '19850303234567', notes: '', createdAt: d(280) },
    { id: emp[3], name: 'خالد البشير',        phone: '0944444444', email: 'khaled@powergen.ly',  position: 'مدير المخازن',       department: 'المخازن',   salary: 850,  loanBalance: 0, startDate: d(350), status: 'active' as const, address: 'طرابلس', nationalId: '19820404234567', notes: '', createdAt: d(350) },
    { id: emp[4], name: 'سارة العبيدي',       phone: '0955555555', email: 'sara@powergen.ly',    position: 'خدمة عملاء',         department: 'خدمة العملاء', salary: 650,  loanBalance: 0, startDate: d(200), status: 'active' as const, address: 'بنغازي', nationalId: '19950505234567', notes: '', createdAt: d(200) },
    { id: emp[5], name: 'عمر الشريف',         phone: '0966666666', email: 'omar@powergen.ly',    position: 'مندوب مبيعات',       department: 'المبيعات',   salary: 750,  loanBalance: 0, startDate: d(180), status: 'active' as const, address: 'مصراتة', nationalId: '19920606234567', notes: '', createdAt: d(180) },
    { id: emp[6], name: 'هاني المبروك',       phone: '0977777777', email: 'hani@powergen.ly',    position: 'فني كهرباء',         department: 'الصيانة',    salary: 850,  loanBalance: 0, startDate: d(150), status: 'active' as const, address: 'طرابلس', nationalId: '19880707234567', notes: '', createdAt: d(150) },
    { id: emp[7], name: 'دينا القذافي',       phone: '0988888888', email: 'dina@powergen.ly',    position: 'سكرتارية',           department: 'الإدارة',    salary: 550,  loanBalance: 0, startDate: d(250), status: 'active' as const, address: 'طرابلس', nationalId: '19950808234567', notes: '', createdAt: d(250) },
  ];

  // ── Salary Payments ──
  const salaryPayments: any[] = [];
  // تضمين شهر حالي (2026-03) لظهور رواتب هذا الشهر في لوحة التحكم
  const months = ['2025-12', '2026-01', '2026-02', '2026-03'];
  const employeeLoans: any[] = [];
  employees.forEach(e => {
    months.forEach((month, mi) => {
      const bonuses = mi === 1 ? Math.round(e.salary * 0.1) : 0;
      const deductions = mi === 2 && e.id === emp[5] ? 100 : 0;
      salaryPayments.push({
        id: uuidv4(), employeeId: e.id, amount: e.salary, month,
        bonuses, deductions, netSalary: e.salary + bonuses - deductions,
        paidAt: d(90 - mi * 30), notes: bonuses > 0 ? 'مكافأة نهاية العام' : '',
      });
    });
  });

  // create some loan movements for two employees
  employeeLoans.push(
    {
      id: uuidv4(),
      employeeId: emp[5],
      amount: 500,
      type: 'advance',
      date: d(40),
      notes: 'سلفة طارئة',
    },
    {
      id: uuidv4(),
      employeeId: emp[5],
      amount: -200,
      type: 'repayment',
      date: d(20),
      notes: 'استقطاع من الراتب',
    },
    {
      id: uuidv4(),
      employeeId: emp[2],
      amount: 300,
      type: 'advance',
      date: d(25),
      notes: 'سلفة أدوات',
    },
  );

  // ── Generators ──
  const generators = [
    { id: gen[0], serialNumber: 'GEN-2024-001', capacity: '50 KVA',  brand: 'Caterpillar', model: 'C50',   status: 'available' as const,   notes: 'حالة ممتازة - جاهز للإيجار',     createdAt: d(200) },
    { id: gen[1], serialNumber: 'GEN-2024-002', capacity: '100 KVA', brand: 'Cummins',     model: 'C100',  status: 'rented' as const,      notes: 'مؤجر لشركة مقاولات',           createdAt: d(190) },
    { id: gen[2], serialNumber: 'GEN-2024-003', capacity: '150 KVA', brand: 'Perkins',     model: 'P150',  status: 'available' as const,   notes: 'تم الصيانة الدورية',           createdAt: d(180) },
    { id: gen[3], serialNumber: 'GEN-2024-004', capacity: '75 KVA',  brand: 'Caterpillar', model: 'C75',   status: 'maintenance' as const, notes: 'في الصيانة - تغيير زيت وفلاتر', createdAt: d(170) },
    { id: gen[4], serialNumber: 'GEN-2024-005', capacity: '200 KVA', brand: 'Cummins',     model: 'C200',  status: 'rented' as const,      notes: 'مؤجر لمصنع إسمنت',             createdAt: d(160) },
    { id: gen[5], serialNumber: 'GEN-2024-006', capacity: '30 KVA',  brand: 'Lister',      model: 'L30',   status: 'available' as const,   notes: 'مولد محمول - للمناسبات',        createdAt: d(155) },
    { id: gen[6], serialNumber: 'GEN-2024-007', capacity: '20 KVA',  brand: 'Lister',      model: 'L20',   status: 'available' as const,   notes: 'مناسب للمنازل والمحلات',       createdAt: d(150) },
    { id: gen[7], serialNumber: 'GEN-2024-008', capacity: '300 KVA', brand: 'Cummins',     model: 'C300',  status: 'rented' as const,      notes: 'مؤجر لشركة اتصالات',           createdAt: d(145) },
  ];

  // ── Rental Contracts ──
  const rentalContracts = [
    { id: uuidv4(), customerId: cust[10], generatorId: gen[1], startDate: d(20), endDate: d(-10), dailyRate: 1200, deposit: 10000, advancePayment: 15000, totalDays: 30, totalAmount: 36000, paidAmount: 25000, status: 'active' as const, notes: 'عقد شهري - مشروع بناء', createdAt: d(20) },
    { id: uuidv4(), customerId: cust[2],  generatorId: gen[4], startDate: d(15), endDate: d(-30), dailyRate: 2000, deposit: 20000, advancePayment: 30000, totalDays: 45, totalAmount: 90000, paidAmount: 50000, status: 'active' as const, notes: 'مشروع إنشاءات كبرى', createdAt: d(15) },
    { id: uuidv4(), customerId: cust[6],  generatorId: gen[2], startDate: d(60), endDate: d(40), dailyRate: 1500, deposit: 15000, advancePayment: 15000, totalDays: 20, totalAmount: 30000, paidAmount: 30000, status: 'ended' as const, notes: 'تم التسليم بحالة جيدة', createdAt: d(60) },
    { id: uuidv4(), customerId: cust[5],  generatorId: gen[0], startDate: d(50), endDate: d(35), dailyRate: 800, deposit: 5000, advancePayment: 5000, totalDays: 15, totalAmount: 12000, paidAmount: 12000, status: 'ended' as const, notes: 'إيجار موسم الحصاد', createdAt: d(50) },
    { id: uuidv4(), customerId: cust[4],  generatorId: gen[5], startDate: d(10), endDate: d(-5), dailyRate: 500, deposit: 3000, advancePayment: 3000, totalDays: 15, totalAmount: 7500, paidAmount: 7500, status: 'active' as const, notes: 'فعالية مؤقتة', createdAt: d(10) },
    // عقود إيجار مضافة لهذا الشهر لاختبار إحصائيات الإيجار الشهرية
    { id: uuidv4(), customerId: cust[0],  generatorId: gen[0], startDate: d(2), endDate: d(-28), dailyRate: 1000, deposit: 8000, advancePayment: 10000, totalDays: 30, totalAmount: 30000, paidAmount: 15000, status: 'active' as const, notes: 'عقد جديد لهذا الشهر - موقع بناء', createdAt: d(2) },
  ];

  // ── After-Sales Requests ──
  const afterSalesRequests = [
    { id: uuidv4(), customerId: cust[0],  productId: prod[0], reportDate: d(15), problemType: 'تسرب زيت',           description: 'المولد يسرّب زيت من قاعدة المحرك',     maintenanceCost: 350, status: 'repaired' as const,   assignedTo: emp[2], notes: 'تم تغيير جلدة القاعدة', createdAt: d(15) },
    { id: uuidv4(), customerId: cust[1],  productId: prod[1], reportDate: d(10), problemType: 'عدم التشغيل',       description: 'المولد لا يعمل - لا يستجيب للمفتاح',   maintenanceCost: 200, status: 'delivered' as const,  assignedTo: emp[2], notes: 'تم استبدال البطارية',   createdAt: d(10) },
    { id: uuidv4(), customerId: cust[6],  productId: prod[12], reportDate: d(5),  problemType: 'صعوبة التشغيل',      description: 'المولد يحتاج محاولات عديدة للتشغيل',  maintenanceCost: 150, status: 'inspection' as const, assignedTo: emp[6], notes: 'قيد الفحص - شمعات التوهج', createdAt: d(5) },
    { id: uuidv4(), customerId: cust[10], generatorId: gen[1], reportDate: d(3),  problemType: 'صوت غير طبيعي',     description: 'المولد يصدر صوت طرق عند التشغيل',   maintenanceCost: 800, status: 'inspection' as const, assignedTo: emp[2], notes: 'يحتاج فحص ميكانيكي - محتمل مشكلة في المحرك', createdAt: d(3) },
    { id: uuidv4(), customerId: cust[3],  productId: prod[2], reportDate: d(2),  problemType: 'انقطاع التيار',      description: 'المولد يتوقف فجأة أثناء التشغيل',     maintenanceCost: 0,   status: 'inspection' as const, assignedTo: emp[6], notes: 'فحص لوحة التحكم', createdAt: d(2) },
  ];

  // ── Notifications ──
  // ── Expenses ──
  const expenses = [
    {
      id: uuidv4(),
      description: 'وقود سيارات التوصيل',
      amount: 750,
      date: d(3),
      notes: 'تموين أسبوعي',
    },
    {
      id: uuidv4(),
      description: 'أكل وشرب فريق التركيب في موقع العميل',
      amount: 420,
      date: d(2),
      notes: 'مشروع شركة البناء الحديث',
    },
    {
      id: uuidv4(),
      description: 'إيجار ونش لرفع مولد 300 KVA',
      amount: 1800,
      date: d(7),
      notes: 'تركيب في مصنع الإسمنت',
    },
    {
      id: uuidv4(),
      description: 'مصروفات نظافة وصيانة للمخزن الرئيسي',
      amount: 350,
      date: d(12),
      notes: '',
    },
  ];
  const notifications = [
    { id: uuidv4(), type: 'low_stock' as const,       title: 'تنبيه: مخزون منخفض', message: 'المنتج "فلتر زيت مولد" وصل للحد الأدنى (50 قطعة)',           isRead: false, createdAt: d(2) },
    { id: uuidv4(), type: 'rental_expiring' as const,  title: 'عقد إيجار ينتهي قريباً', message: 'عقد إيجار "شركة المقاولات المتحدة" ينتهي خلال أيام',     isRead: false, createdAt: d(1) },
    { id: uuidv4(), type: 'payment_overdue' as const,  title: 'رصيد متأخر',         message: 'العميل "مؤسسة المشاريع الكبرى" لديه رصيد مستحق 28,500 دينار', isRead: true,  createdAt: d(5) },
    { id: uuidv4(), type: 'payment_overdue' as const,  title: 'رصيد متأخر',         message: 'العميل "فندق المدينة" لديه رصيد مستحق 15,000 دينار',         isRead: false, createdAt: d(3) },
    { id: uuidv4(), type: 'info' as const,             title: 'تحديث النظام',        message: 'تم تحديث النظام إلى الإصدار 1.0.0 بنجاح',                   isRead: true,  createdAt: d(30) },
    { id: uuidv4(), type: 'maintenance' as const,      title: 'طلب صيانة مولد',      message: 'تم تسجيل طلب صيانة من "مصنع الإسمنت الليبي"',              isRead: false, createdAt: d(5) },
  ];

  return {
    warehouses,
    suppliers,
    customers,
    products,
    purchaseOrders: po,
    saleInvoices: si,
    stockMovements,
    payments,
    employees,
    salaryPayments,
    employeeLoans,
    generators,
    rentalContracts,
    afterSalesRequests,
    notifications,
    expenses,
    returns: [] as any[],
    users: [] as any[],
  };
}
