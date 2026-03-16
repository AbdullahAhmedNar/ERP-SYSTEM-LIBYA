import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Building2, Zap, Calendar, Printer, Wallet, Wrench } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Card, Badge, Button } from '../../components/UI';
import { Select } from '../../components/UI';
import { openMultiSectionPrint } from '../../utils/printHelpers';

const getYear = (dateStr: string) => new Date(dateStr).getFullYear();

export default function ReportsPage() {
  const { saleInvoices, purchaseOrders, customers, suppliers, products, rentalContracts, employees, salaryPayments, expenses, afterSalesRequests, settings } = useStore();
  const [tab, setTab] = useState<'financial'|'customers'|'suppliers'|'inventory'|'rental'|'employees'>('financial');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    saleInvoices.forEach(si => years.add(getYear(si.date)));
    purchaseOrders.forEach(po => years.add(getYear(po.date)));
    rentalContracts.forEach(rc => years.add(getYear(rc.createdAt)));
    salaryPayments.forEach(sp => years.add(getYear(sp.paidAt)));
    const arr = [...years].sort((a, b) => b - a);
    return arr.length ? arr : [new Date().getFullYear()];
  }, [saleInvoices, purchaseOrders, rentalContracts, salaryPayments]);

  const yearFilter = (dateStr: string) => selectedYear === 'all' || getYear(dateStr) === selectedYear;

  const activeSales = saleInvoices.filter(si => si.status === 'active' && yearFilter(si.date));
  const filteredPurchases = purchaseOrders.filter(po => yearFilter(po.date));
  const filteredRentals = rentalContracts.filter(rc => yearFilter(rc.createdAt));
  const filteredSalaries = salaryPayments.filter(sp => yearFilter(sp.paidAt));
  const filteredExpenses = expenses.filter(e => yearFilter(e.date));
  const filteredAfterSales = afterSalesRequests.filter(r => yearFilter(r.reportDate));

  const totalSales = activeSales.reduce((s, si) => s + si.totalAmount, 0);
  const totalPurchases = filteredPurchases.reduce((s, po) => s + po.totalAmount, 0);
  const totalRental = filteredRentals.filter(rc => rc.status !== 'cancelled').reduce((s, rc) => s + rc.totalAmount, 0);
  const totalSalaries = filteredSalaries.reduce((s, sp) => s + sp.netSalary, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalMaintenance = filteredAfterSales.reduce((s, r) => s + r.maintenanceCost, 0);
  const totalProfit = activeSales.reduce((s, si) => s + si.profit, 0);
  const costOfGoodsSold = totalSales - totalProfit;
  // صافي الربح = (المبيعات + دخل الإيجار + دخل الصيانة) - تكلفة البضاعة المباعة - الرواتب - المصروفات
  const netProfit = (totalSales + totalRental + totalMaintenance) - costOfGoodsSold - totalSalaries - totalExpenses;
  const totalReceivables = customers.filter(c => c.balance > 0).reduce((s, c) => s + c.balance, 0);
  const totalPayables = suppliers.filter(s => s.balance > 0).reduce((s, sup) => s + sup.balance, 0);

  const topCustomers = customers.map(c => ({
    ...c,
    totalBought: activeSales.filter(si => si.customerId === c.id).reduce((s, si) => s + si.totalAmount, 0),
  })).sort((a, b) => b.totalBought - a.totalBought).slice(0, 10);

  const topSuppliers = suppliers.map(s => ({
    ...s,
    totalBought: filteredPurchases.filter(po => po.supplierId === s.id).reduce((sum, po) => sum + po.totalAmount, 0),
  })).sort((a, b) => b.totalBought - a.totalBought).slice(0, 10);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock && p.minStock > 0).sort((a, b) => a.quantity - b.quantity);
  const topProducts = products.map(p => ({
    ...p,
    soldQty: activeSales.flatMap(si => si.items).filter(item => item.productId === p.id).reduce((s, item) => s + item.quantity, 0),
    revenue: activeSales.flatMap(si => si.items).filter(item => item.productId === p.id).reduce((s, item) => s + item.totalPrice, 0),
  })).sort((a, b) => b.soldQty - a.soldQty).slice(0, 10);

  const tabs = [
    { key: 'financial', label: 'مالية', icon: DollarSign },
    { key: 'customers', label: 'العملاء', icon: Users },
    { key: 'suppliers', label: 'الموردون', icon: Building2 },
    { key: 'inventory', label: 'المخزون', icon: Package },
    { key: 'rental', label: 'الإيجار', icon: Zap },
    { key: 'employees', label: 'الموظفون', icon: Users },
  ] as const;

  const fmt = (n: number) => `${n.toLocaleString('en-US')} ${currency}`;

  const buildFullReportSections = () => {
    const financialRows = [
      ['إجمالي المبيعات', fmt(totalSales)],
      ['إجمالي المشتريات', fmt(totalPurchases)],
      ['دخل الإيجارات', fmt(totalRental)],
      ['دخل خدمة ما بعد البيع (الصيانة)', fmt(totalMaintenance)],
      ['تكلفة البضاعة المباعة', fmt(costOfGoodsSold)],
      ['إجمالي الرواتب', fmt(totalSalaries)],
      ['إجمالي المصروفات التشغيلية', fmt(totalExpenses)],
      ['صافي ' + (netProfit >= 0 ? 'الربح بعد المصروفات' : 'الخسارة بعد المصروفات'), fmt(Math.abs(netProfit))],
    ];
    const financialTable = `<table><thead><tr><th>البند</th><th>المبلغ</th></tr></thead><tbody>${financialRows.map(r => `<tr><td>${r[0]}</td><td style="font-weight:600">${r[1]}</td></tr>`).join('')}</tbody></table>`;

    const topCustRows = topCustomers.slice(0, 10).map((c, i) => `<tr><td>${i + 1}</td><td>${c.name}</td><td>${c.phone || '—'}</td><td style="font-weight:600">${fmt(c.totalBought)}</td></tr>`).join('');
    const customersTable = `<table><thead><tr><th>#</th><th>العميل</th><th>الهاتف</th><th>إجمالي المشتريات</th></tr></thead><tbody>${topCustRows || '<tr><td colSpan="4" style="text-align:center">لا توجد بيانات</td></tr>'}</tbody></table>`;

    const topSupRows = topSuppliers.slice(0, 10).map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.phone || '—'}</td><td style="font-weight:600">${fmt(s.totalBought)}</td></tr>`).join('');
    const suppliersTable = `<table><thead><tr><th>#</th><th>المورد</th><th>الهاتف</th><th>إجمالي المشتريات</th></tr></thead><tbody>${topSupRows || '<tr><td colSpan="4" style="text-align:center">لا توجد بيانات</td></tr>'}</tbody></table>`;

    const lowStockRows = lowStockProducts.slice(0, 10).map(p => `<tr><td>${p.name}</td><td>${p.code}</td><td style="color:#c62828;font-weight:600">${p.quantity}</td><td>${p.minStock}</td></tr>`).join('');
    const topProdRows = topProducts.filter(p => p.soldQty > 0).slice(0, 10).map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.code}</td><td>${p.soldQty}</td><td>${fmt(p.revenue)}</td></tr>`).join('');
    const inventoryTable = `<table><thead><tr><th>المنتج</th><th>الكود</th><th>الكمية</th><th>الحد الأدنى</th></tr></thead><tbody>${lowStockRows || '<tr><td colSpan="4" style="text-align:center">لا توجد تنبيهات</td></tr>'}</tbody></table>
      <h4 style="margin:16px 0 8px;font-size:12px;color:#875A7B">الأكثر مبيعاً</h4>
      <table><thead><tr><th>#</th><th>المنتج</th><th>الكود</th><th>الكمية المباعة</th><th>الإيراد</th></tr></thead><tbody>${topProdRows || '<tr><td colSpan="5" style="text-align:center">لا توجد مبيعات</td></tr>'}</tbody></table>`;

    const rentalRows = filteredRentals.filter(rc => rc.status === 'active').slice(0, 10).map(rc => {
      const cust = customers.find(c => c.id === rc.customerId);
      return `<tr><td>${cust?.name || '—'}</td><td>${formatDateDMY(rc.endDate)}</td><td>${fmt(rc.totalAmount)}</td></tr>`;
    }).join('');
    const rentalTable = `<table><thead><tr><th>العميل</th><th>تاريخ الانتهاء</th><th>المبلغ</th></tr></thead><tbody>${rentalRows || '<tr><td colSpan="3" style="text-align:center">لا توجد عقود</td></tr>'}</tbody></table>`;

    const deptRows = [...new Set(employees.map(e => e.department))].map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      return `<tr><td>${dept}</td><td>${deptEmps.length}</td><td>${deptEmps.reduce((s, e) => s + e.salary, 0).toLocaleString('en-US')} ${currency}/شهر</td></tr>`;
    }).join('');
    const employeesTable = `<table><thead><tr><th>القسم</th><th>عدد الموظفين</th><th>إجمالي الرواتب</th></tr></thead><tbody>${deptRows || '<tr><td colSpan="3" style="text-align:center">لا توجد بيانات</td></tr>'}</tbody></table>`;

    return [
      { title: 'الملخص المالي', tableHtml: financialTable, summaryBlocks: [{ label: 'الذمم المدينة', value: fmt(totalReceivables), color: 'red' }, { label: 'الذمم الدائنة', value: fmt(totalPayables), color: 'purple' }] },
      { title: 'أفضل العملاء', tableHtml: customersTable },
      { title: 'أكثر الموردين تعاملاً', tableHtml: suppliersTable },
      { title: 'المخزون والمنتجات', tableHtml: inventoryTable, summaryBlocks: [{ label: 'المنتجات تحت الحد الأدنى', value: String(lowStockProducts.length), color: 'amber' }] },
      { title: 'عقود الإيجار', tableHtml: rentalTable, summaryBlocks: [{ label: 'إجمالي دخل الإيجارات', value: fmt(totalRental), color: 'emerald' }] },
      { title: 'الموظفون', tableHtml: employeesTable, summaryBlocks: [{ label: 'إجمالي الموظفين', value: String(employees.length), color: 'purple' }, { label: 'إجمالي الرواتب المصروفة', value: fmt(filteredSalaries.reduce((s, sp) => s + sp.netSalary, 0)), color: 'red' }] },
    ];
  };

  const handlePrintAll = () => {
    openMultiSectionPrint({
      systemName: settings.systemName,
      pageTitle: 'التقارير والإحصائيات الشاملة',
      pageSubtitle: selectedYear === 'all' ? 'جميع السنوات' : `سنة ${selectedYear}`,
      sections: buildFullReportSections(),
      fileName: `تقارير-${selectedYear === 'all' ? 'الكل' : selectedYear}-${new Date().toISOString().split('T')[0]}`,
    });
  };

  const yearOptions = [
    { value: 'all', label: 'الكل (جميع السنوات)' },
    ...availableYears.map(y => ({ value: String(y), label: String(y) })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">التقارير والإحصائيات</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>تقارير شاملة عن أداء الأعمال</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
          <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrintAll}>طباعة</Button>
          <Calendar size={18} className={`flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
          <Select
            label="السنة"
            value={selectedYear === 'all' ? 'all' : String(selectedYear)}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            options={yearOptions}
            className={`flex-1 sm:w-44 min-w-0 ${isDark ? 'text-slate-200' : ''}`}
          />
          {selectedYear !== 'all' && (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              إحصائيات {selectedYear}
            </span>
          )}
        </div>
      </div>

      <div className={`flex gap-0.5 p-1 rounded-lg w-fit border ${isDark ? 'bg-brand-navy-light border-white/[0.08]' : 'bg-gray-100 border-gray-200'}`}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              tab === t.key
                ? 'bg-[#875A7B] text-white shadow-md ring-2 ring-[#6C4A6A] [&_svg]:text-white'
                : isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
            }`}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'إجمالي المبيعات', value: totalSales, color: 'text-brand-teal', icon: TrendingUp },
              { label: 'إجمالي المشتريات', value: totalPurchases, color: 'text-blue-500', icon: TrendingDown },
              { label: 'دخل الإيجارات', value: totalRental, color: 'text-amber-500', icon: Zap },
              { label: 'دخل خدمة ما بعد البيع (الصيانة)', value: totalMaintenance, color: 'text-emerald-600', icon: Wrench },
              { label: 'إجمالي المصروفات', value: totalExpenses, color: 'text-red-500', icon: Wallet },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-3 border-r-2 border-r-brand-primary ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                    <p className={`text-lg font-black mt-0.5 truncate ${item.color}`}>{item.value.toLocaleString('en-US')}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{currency}</p>
                  </div>
                  <item.icon size={16} className={`${item.color} flex-shrink-0`} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-lg p-3 border-r-2 border-r-red-500 ${isDark ? 'bg-red-500/5 border border-red-500/10' : 'bg-red-50 border border-red-100'}`}>
              <p className="text-[10px] font-semibold text-red-600">الذمم المدينة (مستحق من العملاء)</p>
              <p className="text-lg font-black text-red-600 mt-0.5">{fmt(totalReceivables)}</p>
            </div>
            <div className={`rounded-lg p-3 border-r-2 border-r-brand-primary ${isDark ? 'bg-brand-primary/5 border border-brand-primary/10' : 'bg-purple-50 border border-purple-200'}`}>
              <p className="text-[10px] font-semibold text-brand-primary">الذمم الدائنة (مستحق للموردين)</p>
              <p className="text-lg font-black text-brand-primary mt-0.5">{fmt(totalPayables)}</p>
            </div>
          </div>

          {/* ملخص مالي تفصيلي - تصميم Odoo */}
          <div>
            <h3 className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>ملخص مالي تفصيلي</h3>
            <div className={`overflow-hidden rounded-lg border ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#875A7B]">
                  <th className="text-right text-white py-3 px-4 font-semibold">البند</th>
                  <th className="text-left text-white py-3 px-4 font-semibold w-40">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'إجمالي المبيعات', value: fmt(totalSales), type: '+' },
                  { label: 'دخل الإيجارات', value: fmt(totalRental), type: '+' },
                  { label: 'دخل خدمة ما بعد البيع (الصيانة)', value: fmt(totalMaintenance), type: '+' },
                  { label: 'تكلفة البضاعة المباعة (بسعر المخزن)', value: fmt(costOfGoodsSold), type: '-' },
                  { label: 'إجمالي الرواتب', value: fmt(totalSalaries), type: '-' },
                  { label: 'إجمالي المصروفات ', value: fmt(totalExpenses), type: '-' },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? (isDark ? 'bg-white/[0.03]' : 'bg-white') : (isDark ? 'bg-white/[0.06]' : 'bg-[#faf7ff]')}>
                    <td className={`py-2.5 px-4 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{row.label}</td>
                    <td className={`py-2.5 px-4 font-bold ${row.type === '+' ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>{row.value}</td>
                  </tr>
                ))}
                <tr className={`border-t-2 ${isDark ? 'border-[#875A7B] bg-[#875A7B]/15' : 'border-[#875A7B] bg-[#f3edf8]'}`}>
                  <td className={`py-3 px-4 font-black ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>صافي {netProfit >= 0 ? 'الربح بعد المصروفات' : 'الخسارة بعد المصروفات'}</td>
                  <td className={`py-3 px-4 font-black ${netProfit >= 0 ? 'text-[#2e7d32]' : 'text-[#c62828]'}`}>{fmt(Math.abs(netProfit))}</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="space-y-6">
          <Card title="أفضل العملاء شراء">
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-brand-primary text-white' : isDark ? 'bg-white/10 text-slate-400' : 'bg-gray-200 text-gray-500'}`}>{i+1}</span>
                    <div>
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{c.phone}</div>
                    </div>
                  </div>
                  <span className="font-black text-brand-teal">{fmt(c.totalBought)}</span>
                </div>
              ))}
              {topCustomers.length === 0 && <p className="text-center py-8 text-slate-500">لا توجد بيانات</p>}
            </div>
          </Card>
          <Card title="أكثر العملاء مديونية">
            <div className="space-y-2">
              {customers.filter(c => c.balance > 0).sort((a,b) => b.balance - a.balance).slice(0,10).map((c, i) => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-black">{i+1}</span>
                    <span className="font-semibold text-sm">{c.name}</span>
                  </div>
                  <span className="font-black text-red-500">{fmt(c.balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'suppliers' && (
        <div className="space-y-6">
          <Card title="أكثر الموردين تعاملا">
            <div className="space-y-2">
              {topSuppliers.map((s, i) => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-blue-500 text-white' : isDark ? 'bg-white/10 text-slate-400' : 'bg-gray-200 text-gray-500'}`}>{i+1}</span>
                    <div>
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{s.phone}</div>
                    </div>
                  </div>
                  <span className="font-black text-blue-500">{fmt(s.totalBought)}</span>
                </div>
              ))}
              {topSuppliers.length === 0 && <p className="text-center py-8 text-slate-500">لا توجد بيانات</p>}
            </div>
          </Card>
          <Card title="الموردون ذوو الرصيد المستحق">
            <div className="space-y-2">
              {suppliers.filter(s => s.balance > 0).sort((a,b) => b.balance - a.balance).map(s => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-brand-primary/5' : 'bg-purple-50'}`}>
                  <span className="font-semibold text-sm">{s.name}</span>
                  <span className="font-black text-brand-primary">{fmt(s.balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="space-y-6">
          <Card title="تنبيهات نقص المخزون" actions={<Badge variant="warning">{lowStockProducts.length}</Badge>}>
            <div className="space-y-2">
              {lowStockProducts.length === 0 ? (
                <p className="text-center py-8 text-emerald-500 font-semibold">جميع المنتجات في مستوى جيد</p>
              ) : lowStockProducts.map(p => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                  <div><div className="font-semibold text-sm">{p.name}</div><div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>الكود: {p.code}</div></div>
                  <div className="text-right"><div className="text-amber-500 font-black">{p.quantity} قطعة</div><div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>الحد الأدنى: {p.minStock}</div></div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="المنتجات الأعلى مبيعا">
            <div className="space-y-2">
              {topProducts.filter(p => p.soldQty > 0).map((p, i) => (
                <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-brand-primary text-white' : isDark ? 'bg-white/10 text-slate-400' : 'bg-gray-200 text-gray-500'}`}>{i+1}</span>
                    <div><div className="font-semibold text-sm">{p.name}</div><div className="text-xs text-slate-500 font-mono">{p.code}</div></div>
                  </div>
                  <div className="text-right"><div className="font-black text-brand-primary">{p.soldQty} وحدة</div><div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>إيراد: {fmt(p.revenue)}</div></div>
                </div>
              ))}
              {topProducts.filter(p => p.soldQty > 0).length === 0 && <p className="text-center py-8 text-slate-500">لا توجد مبيعات بعد</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'rental' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'إجمالي عقود الإيجار', value: filteredRentals.length },
              { label: 'عقود نشطة', value: filteredRentals.filter(rc => rc.status === 'active').length },
              { label: 'إجمالي دخل الإيجارات', value: fmt(totalRental) },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-3 border-r-2 border-r-brand-primary ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                <p className="text-lg font-black text-brand-teal mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <Card title="عقود قاربت على الانتهاء">
            <div className="space-y-2">
              {filteredRentals.filter(rc => { const d = new Date(rc.endDate); return rc.status === 'active' && (d.getTime() - Date.now()) / (1000*60*60*24) <= 7; }).map(rc => {
                const cust = customers.find(c => c.id === rc.customerId);
                const daysLeft = Math.ceil((new Date(rc.endDate).getTime() - Date.now()) / (1000*60*60*24));
                return (
                  <div key={rc.id} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                    <div><div className="font-semibold text-sm">{cust?.name}</div><div className="text-xs text-slate-500">ينتهي: {formatDateDMY(rc.endDate)}</div></div>
                    <Badge variant={daysLeft <= 1 ? 'danger' : 'warning'}>{daysLeft <= 0 ? 'منتهي!' : `${daysLeft} أيام`}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'employees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'إجمالي الموظفين', value: employees.length },
              { label: 'موظفون نشطون', value: employees.filter(e => e.status === 'active').length },
              { label: 'إجمالي الرواتب المصروفة', value: fmt(filteredSalaries.reduce((s, sp) => s + sp.netSalary, 0)) },
            ].map(item => (
              <div key={item.label} className={`rounded-lg p-3 border-r-2 border-r-brand-primary ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                <p className="text-lg font-black text-brand-primary mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
          <Card title="توزيع الموظفين بالأقسام">
            <div className="space-y-2">
              {[...new Set(employees.map(e => e.department))].map(dept => {
                const deptEmps = employees.filter(e => e.department === dept);
                return (
                  <div key={dept} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                    <div><div className="font-semibold text-sm">{dept}</div><div className="text-xs text-slate-500">{deptEmps.length} موظف</div></div>
                    <span className="font-black text-brand-primary">{deptEmps.reduce((s, e) => s + e.salary, 0).toLocaleString('en-US')} {currency}/شهر</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


