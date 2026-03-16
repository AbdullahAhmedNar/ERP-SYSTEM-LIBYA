import { DollarSign, Package, TrendingUp, ShoppingCart, Users, Building2, Zap, AlertTriangle, Clock, CreditCard, Printer, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { StatCard, Card, Badge, Button } from '../../components/UI';
import { openOdooStylePrint } from '../../utils/printHelpers';
import { formatDateDMY } from '../../utils/date';

export default function Dashboard() {
  const { getDashboardStats, saleInvoices, purchaseOrders, rentalContracts, customers, products, salaryPayments, expenses, afterSalesRequests, settings } = useStore();
  const stats = getDashboardStats();
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;
  const fmt = (n: number) => `${n.toLocaleString('en-US')} ${currency}`;
  const todayLabel = formatDateDMY(new Date());

  const activeSales = saleInvoices.filter(si => si.status === 'active');
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const isInThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  };

  const thisMonthSales = activeSales
    .filter(si => isInThisMonth(si.date))
    .reduce((s, si) => s + si.totalAmount, 0);

  const thisMonthCOGS = activeSales
    .filter(si => isInThisMonth(si.date))
    .reduce(
      (sum, si) =>
        sum +
        si.items.reduce((inner, item) => inner + item.costPrice * item.quantity, 0),
      0
    );

  const thisMonthPurchases = purchaseOrders
    .filter(po => isInThisMonth(po.date))
    .reduce((s, po) => s + po.totalAmount, 0);

  const thisMonthRentalIncome = rentalContracts
    .filter(rc => rc.status !== 'cancelled' && isInThisMonth(rc.createdAt))
    .reduce((s, rc) => s + rc.totalAmount, 0);

  const thisMonthSalaries = salaryPayments
    .filter(sp => isInThisMonth(sp.paidAt))
    .reduce((s, sp) => s + sp.netSalary, 0);

  const thisMonthExpenses = expenses
    .filter(e => isInThisMonth(e.date))
    .reduce((s, e) => s + e.amount, 0);

  const thisMonthAfterSalesIncome = afterSalesRequests
    .filter(r => isInThisMonth(r.reportDate))
    .reduce((s, r) => s + (r.maintenanceCost || 0), 0);

  const thisMonthNetProfit =
    (thisMonthSales + thisMonthRentalIncome + thisMonthAfterSalesIncome) -
    thisMonthCOGS -
    thisMonthSalaries -
    thisMonthExpenses;

  const hasMonthlyActivity =
    thisMonthSales > 0 ||
    thisMonthPurchases > 0 ||
    thisMonthRentalIncome > 0 ||
    thisMonthSalaries > 0 ||
    thisMonthExpenses > 0 ||
    thisMonthAfterSalesIncome > 0;

  const recentSales = [...activeSales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const topProducts = products.map(p => ({
    ...p,
    soldQty: activeSales.flatMap(si => si.items).filter(item => item.productId === p.id).reduce((s, item) => s + item.quantity, 0),
  })).sort((a, b) => b.soldQty - a.soldQty).filter(p => p.soldQty > 0).slice(0, 5);

  const handlePrint = () => {
    const statsTableHtml = `<table>
  <thead><tr><th>المؤشر</th><th>القيمة</th></tr></thead>
  <tbody>
    <tr><td>إجمالي المبيعات</td><td>${fmt(stats.totalSales)}</td></tr>
    <tr><td>إجمالي المشتريات</td><td>${fmt(stats.totalPurchases)}</td></tr>
    <tr><td>إجمالي المصروفات التشغيلية</td><td>${fmt(stats.totalExpenses)}</td></tr>
    <tr><td>${stats.netProfit >= 0 ? 'صافي الربح بعد المصروفات' : 'صافي الخسارة بعد المصروفات'}</td><td>${fmt(Math.abs(stats.netProfit))}</td></tr>
    <tr><td>قيمة المخزون</td><td>${fmt(stats.inventoryValue)}</td></tr>
    <tr><td>مبيعات هذا الشهر</td><td>${fmt(thisMonthSales)}</td></tr>
    <tr><td>تكلفة البضاعة المباعة هذا الشهر (بسعر المخزن)</td><td>${fmt(thisMonthCOGS)}</td></tr>
    <tr><td>دخل الإيجارات هذا الشهر</td><td>${fmt(thisMonthRentalIncome)}</td></tr>
    <tr><td>رواتب هذا الشهر</td><td>${fmt(thisMonthSalaries)}</td></tr>
    <tr><td>مصروفات هذا الشهر</td><td>${fmt(thisMonthExpenses)}</td></tr>
    <tr><td>دخل خدمة ما بعد البيع هذا الشهر</td><td>${fmt(thisMonthAfterSalesIncome)}</td></tr>
    <tr><td>${thisMonthNetProfit >= 0 ? 'صافي ربح هذا الشهر' : 'صافي خسارة هذا الشهر'}</td><td>${fmt(Math.abs(thisMonthNetProfit))}</td></tr>
    <tr><td>عدد العملاء</td><td>${stats.customersCount}</td></tr>
    <tr><td>عدد الموردين</td><td>${stats.suppliersCount}</td></tr>
    <tr><td>عقود تأجير نشطة</td><td>${stats.activeRentals}</td></tr>
    <tr><td>الذمم المدينة</td><td>${fmt(stats.totalReceivables)}</td></tr>
  </tbody>
</table>`;

    const inventoryTableHtml = stats.lowStockProducts.length === 0
      ? '<p style="text-align:center;color:#888;padding:12px">المخزون في مستوى جيد</p>'
      : `<table><thead><tr><th>الصنف</th><th>الكمية المتاحة</th></tr></thead><tbody>${
          stats.lowStockProducts.slice(0, 10).map(p =>
            `<tr><td>${p.name}</td><td>${p.quantity} قطعة</td></tr>`
          ).join('')
        }</tbody></table>`;

    const expiringTableHtml = stats.expiringRentals.length === 0
      ? '<p style="text-align:center;color:#888;padding:12px">لا توجد عقود تنتهي قريبا</p>'
      : `<table><thead><tr><th>العقد</th><th>تاريخ الانتهاء</th></tr></thead><tbody>${
          stats.expiringRentals.slice(0, 10).map(rc =>
            `<tr><td>عقد #${rc.id.slice(0, 8)}</td><td>${formatDateDMY(rc.endDate)}</td></tr>`
          ).join('')
        }</tbody></table>`;

    const overdueTableHtml = stats.overdueCustomers.length === 0
      ? '<p style="text-align:center;color:#888;padding:12px">لا توجد ذمم متأخرة</p>'
      : `<table><thead><tr><th>العميل</th><th>المبلغ المستحق</th></tr></thead><tbody>${
          stats.overdueCustomers.slice(0, 10).map(c =>
            `<tr><td>${c.name}</td><td>${c.balance.toLocaleString('en-US')} ${currency}</td></tr>`
          ).join('')
        }</tbody></table>`;

    const recentInvoicesTableHtml = recentSales.length === 0
      ? '<p style="text-align:center;color:#888;padding:12px">لا توجد فواتير</p>'
      : `<table><thead><tr><th>العميل</th><th>التاريخ</th><th>المبلغ</th></tr></thead><tbody>${
          recentSales.map(si => {
            const cust = customers.find(c => c.id === si.customerId);
            return `<tr><td>${cust?.name || '—'}</td><td>${formatDateDMY(si.date)}</td><td>${si.totalAmount.toLocaleString('en-US')} ${currency}</td></tr>`;
          }).join('')
        }</tbody></table>`;

    const topProductsTableHtml = topProducts.length === 0
      ? '<p style="text-align:center;color:#888;padding:12px">لا توجد مبيعات</p>'
      : `<table><thead><tr><th>#</th><th>الصنف</th><th>الكمية المباعة</th><th>المتبقي</th></tr></thead><tbody>${
          topProducts.map((p, i) =>
            `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.soldQty} وحدة</td><td>${p.quantity}</td></tr>`
          ).join('')
        }</tbody></table>`;

    const combinedHtml = `
      <h3 class="odoo-section-title">الإحصائيات الرئيسية</h3>
      ${statsTableHtml}
      <h3 class="odoo-section-title">تنبيهات المخزون</h3>
      ${inventoryTableHtml}
      <h3 class="odoo-section-title">عقود تنتهي قريبا</h3>
      ${expiringTableHtml}
      <h3 class="odoo-section-title">عملاء متأخرون</h3>
      ${overdueTableHtml}
      <h3 class="odoo-section-title">آخر الفواتير</h3>
      ${recentInvoicesTableHtml}
      <h3 class="odoo-section-title">الأكثر مبيعا</h3>
      ${topProductsTableHtml}
    `;

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'ملخص الداشبورد',
      pageSubtitle: todayLabel,
      tableHtml: combinedHtml,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">الداشبورد</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {todayLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrint}>طباعة</Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="إجمالي المبيعات" value={fmt(stats.totalSales)} icon={<TrendingUp size={20} />} color="teal" />
        <StatCard title="إجمالي المشتريات" value={fmt(stats.totalPurchases)} icon={<ShoppingCart size={20} />} color="blue" />
        <StatCard
          title={stats.netProfit >= 0 ? 'صافي الربح من الإحصائيات' : 'صافي الخسارة من الإحصائيات'}
          value={fmt(Math.abs(stats.netProfit))}
          icon={<DollarSign size={20} />}
          color={stats.netProfit >= 0 ? 'green' : 'red'}
          subtitle={` (مبيعات + دخل من الايجار + دخل خدمة ما بعد البيع − تكلفة البضاعة المباعة (بسعر المخزن) − رواتب − مصروفات)`}
        />
        <StatCard title="قيمة المخزون" value={fmt(stats.inventoryValue)} icon={<Package size={20} />} color="purple" />
      </div>

      {/* إجماليات الموردين والعملاء */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الموردون */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className={`px-5 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'} flex items-center gap-2`}>
            <Building2 size={18} className="text-blue-400" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>الموردون</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المستحق ({currency})</p>
              <p className="text-xl font-black text-red-400 mt-0.5">{fmt(stats.totalPayables)}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عدد موردون بذمم مستحقة: {stats.suppliersWithPayablesCount}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المبالغ لنا عند الموردين</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{fmt(stats.totalCreditFromSuppliers)}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عددهم: {stats.suppliersWithCreditCount}</p>
            </div>
          </div>
        </div>
        {/* العملاء */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className={`px-5 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'} flex items-center gap-2`}>
            <Users size={18} className="text-brand-primary-light" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>العملاء</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المستحق ({currency})</p>
              <p className="text-xl font-black text-red-400 mt-0.5">{fmt(stats.totalReceivables)}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عدد عملاء بذمم مستحقة: {stats.customersWithReceivablesCount}</p>
            </div>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المبالغ للعملاء علينا</p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{fmt(stats.totalCreditToCustomers)}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عددهم: {stats.customersWithCreditCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* عقود ومصروفات */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="عقود نشطة" value={stats.activeRentals} icon={<Zap size={18} />} color="amber" subtitle="تأجير مولدات" />
        <StatCard title="إجمالي المصروفات" value={fmt(stats.totalExpenses)} icon={<Wallet size={18} />} color="red" subtitle="مصروفات تشغيلية عامة" />
      </div>

      {/* This Month Summary */}
      {hasMonthlyActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`rounded-xl p-5 ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpRight size={16} className="text-brand-teal" />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>مبيعات هذا الشهر</span>
            </div>
            <p className="text-2xl font-black text-brand-teal">{fmt(thisMonthSales)}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{activeSales.filter(si => { const d = new Date(si.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length} فاتورة</p>
          </div>
          <div className={`rounded-xl p-5 ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ArrowDownRight size={16} className="text-blue-500" />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>مشتريات هذا الشهر</span>
            </div>
            <p className="text-2xl font-black text-blue-500">{fmt(thisMonthPurchases)}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{purchaseOrders.filter(po => { const d = new Date(po.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; }).length} اوردر</p>
          </div>
          <div className={`rounded-xl p-5 ${isDark ? 'bg-brand-navy-light border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={16} className={thisMonthNetProfit >= 0 ? 'text-emerald-500' : 'text-red-500'} />
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {thisMonthNetProfit >= 0 ? 'صافي ربح الشهر (حسب الإحصائيات)' : 'صافي خسارة الشهر (حسب الإحصائيات)'}
              </span>
            </div>
            <p className={`text-2xl font-black ${thisMonthNetProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{fmt(Math.abs(thisMonthNetProfit))}</p>
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              (مبيعات الشهر + دخل إيجارات الشهر + دخل خدمة ما بعد البيع − تكلفة البضاعة المباعة (بسعر المخزن) − رواتب الشهر − مصروفات الشهر)
            </p>
          </div>
        </div>
      )}

      {/* Alerts & Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="تنبيهات المخزون" actions={<Badge variant="warning">{stats.lowStockProducts.length}</Badge>}>
          <div className="space-y-2">
            {stats.lowStockProducts.length === 0 ? (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>المخزون في مستوى جيد</p>
            ) : (
              stats.lowStockProducts.slice(0, 5).map(p => (
                <div key={p.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="text-xs font-medium">{p.name}</span>
                  </div>
                  <span className="text-xs text-amber-600 font-bold">{p.quantity} قطعة</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="عقود تنتهي قريبا" actions={<Badge variant="danger">{stats.expiringRentals.length}</Badge>}>
          <div className="space-y-2">
            {stats.expiringRentals.length === 0 ? (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد عقود تنتهي قريبا</p>
            ) : (
              stats.expiringRentals.slice(0, 5).map(rc => (
                <div key={rc.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-red-500" />
                    <span className="text-xs font-medium">عقد #{rc.id.slice(0, 8)}</span>
                  </div>
                  <span className="text-xs text-red-500 font-bold">{formatDateDMY(rc.endDate)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="عملاء متأخرون" actions={<Badge variant="danger">{stats.overdueCustomers.length}</Badge>}>
          <div className="space-y-2">
            {stats.overdueCustomers.length === 0 ? (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد ذمم متأخرة</p>
            ) : (
              stats.overdueCustomers.slice(0, 5).map(c => (
                <div key={c.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-red-500" />
                    <span className="text-xs font-medium">{c.name}</span>
                  </div>
                  <span className="text-xs text-red-500 font-bold">{c.balance.toLocaleString('en-US')} {currency}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="آخر الفواتير" actions={<Badge variant="info">{recentSales.length}</Badge>}>
          <div className="space-y-2">
            {recentSales.length === 0 ? (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد فواتير</p>
            ) : recentSales.map(si => {
              const cust = customers.find(c => c.id === si.customerId);
              return (
                <div key={si.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                  <div>
                    <div className="text-sm font-medium">{cust?.name || '---'}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{formatDateDMY(si.date)}</div>
                  </div>
                  <span className="font-bold text-sm text-brand-teal">{si.totalAmount.toLocaleString('en-US')} {currency}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="الأكثر مبيعا" actions={<Badge variant="info">{topProducts.length}</Badge>}>
          <div className="space-y-2">
            {topProducts.length === 0 ? (
              <p className={`text-sm py-4 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد مبيعات</p>
            ) : topProducts.map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-white/3' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-brand-primary text-white' : isDark ? 'bg-white/10 text-slate-400' : 'bg-gray-200 text-gray-500'}`}>{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{p.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm text-brand-primary">{p.soldQty} وحدة</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>متبقي: {p.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


