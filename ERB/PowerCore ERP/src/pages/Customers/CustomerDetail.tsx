import { useParams, useNavigate } from 'react-router-dom';
import { useRef, useState, useMemo } from 'react';
import { ArrowRight, Printer, Phone, Mail, MapPin, DollarSign, FileText, Eye, Pencil, Trash2, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Modal, Input, Textarea, ActionsCell, ConfirmDialog, useConfirmDelete, Select } from '../../components/UI';
import { openOdooStylePrint, openQuotationInvoicePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, saleInvoices, payments, rentalContracts, products, generators, warehouses, addCustomerPayment, updatePayment, deleteSaleInvoice, deleteRentalContract, deletePayment, settings } = useStore();
  const [showPayment, setShowPayment] = useState(false);
  const [viewRow, setViewRow] = useState<{ id: string; type: 'invoice' | 'payment' | 'rental' } | null>(null);
  const [editPayment, setEditPayment] = useState<{ id: string; amount: string; date: string } | null>(null);
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const printRef = useRef<HTMLDivElement>(null);

  const customer = customers.find(c => c.id === id);
  if (!customer) return <div className="text-center py-20 text-slate-500">العميل غير موجود</div>;

  const isDark = settings.theme === 'dark';
  const currency = settings.currency;
  const paymentMethodMeta = (m?: PaymentMethod) => {
    switch (m) {
      case 'bank_transfer':
        return { label: 'تحويل مصرفي', icon: <ArrowLeftRight size={12} /> };
      case 'card':
        return { label: 'بطاقة', icon: <CreditCard size={12} /> };
      case 'cash':
      default:
        return { label: 'نقدي', icon: <Wallet size={12} /> };
    }
  };

  const customerInvoices = saleInvoices.filter(si => si.customerId === id && si.status === 'active');
  const customerPayments = payments.filter(p => p.type === 'customer_payment' && p.entityId === id);
  const customerRentals = rentalContracts.filter(rc => rc.customerId === id);

  const totalSales = customerInvoices.reduce((s, si) => s + si.totalAmount, 0);
  const totalPaid = customerPayments.reduce((s, p) => s + p.amount, 0);

  const accountStatement = useMemo(() => {
    const rows: { id: string; date: string; description: string; debit: number; credit: number; type: 'invoice' | 'payment' | 'rental' }[] = [];

    customerInvoices.forEach(si => {
      const itemNames = si.items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod ? `${prod.name} (${item.quantity})` : 'منتج';
      }).join('، ');
      rows.push({ id: si.id, date: si.date, description: `فاتورة بيع: ${itemNames}`, debit: si.totalAmount, credit: 0, type: 'invoice' });
    });

    customerPayments.forEach(p => {
      const meta = paymentMethodMeta(p.method as PaymentMethod | undefined);
      rows.push({
        id: p.id,
        date: p.date,
        description: `تسديد دفعة (${meta.label})`,
        debit: 0,
        credit: p.amount,
        type: 'payment',
      });
    });

    customerRentals.forEach(rc => {
      rows.push({ id: rc.id, date: rc.startDate, description: `عقد إيجار مولد (${rc.totalDays} يوم)`, debit: rc.totalAmount, credit: 0, type: 'rental' });
    });

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return rows;
  }, [customerInvoices, customerPayments, customerRentals, products]);

  const lastMovementDate = accountStatement.length ? accountStatement[accountStatement.length - 1].date : null;

  const handlePayment = () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    addCustomerPayment(id!, amount, undefined, payMethod);
    setPayAmount('');
    setPayNotes('');
    setPayMethod('cash');
    setShowPayment(false);
  };

  const handlePaymentEditSave = () => {
    if (!editPayment) return;
    const amount = parseFloat(editPayment.amount);
    if (!amount || amount <= 0) return;
    updatePayment(editPayment.id, { amount, date: editPayment.date });
    setEditPayment(null);
  };

  const handlePrint = () => {
    let runningBalance = 0;
    const tableRows = accountStatement
      .map((row, i) => {
        runningBalance += row.debit - row.credit;
        return `<tr>
  <td style="text-align:center">${i + 1}</td>
  <td>${formatDateDMY(row.date)}</td>
  <td>${row.description}</td>
  <td style="color:#dc2626;font-weight:600">${row.debit > 0 ? row.debit.toLocaleString('en-US') : ''}</td>
  <td style="color:#16a34a;font-weight:600">${row.credit > 0 ? row.credit.toLocaleString('en-US') : ''}</td>
  <td style="font-weight:700;color:${runningBalance > 0 ? '#dc2626' : '#16a34a'}">${Math.abs(runningBalance).toLocaleString('en-US')}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#</th>
      <th>التاريخ</th>
      <th>البيان</th>
      <th>مدين (${currency})</th>
      <th>دائن (${currency})</th>
      <th>الرصيد (${currency})</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
  </tbody>
</table>`;

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: customer.name,
      pageSubtitle: 'كشف حساب عميل',
      infoBlocks: [
        { label: 'العميل', value: customer.name },
        { label: 'الهاتف', value: customer.phone || '—' },
        { label: 'العنوان', value: customer.address || '—' },
        {
          label: 'الرصيد الحالي',
          value: `${Math.abs(customer.balance).toLocaleString('en-US')} ${currency}${
            customer.balance !== 0 ? (customer.balance > 0 ? ' (مدين)' : ' (علينا)') : ''
          }`,
        },
      ],
      tableHtml,
      summaryBlocks: [
        {
          label: 'إجمالي المبيعات',
          value: `${totalSales.toLocaleString('en-US')} ${currency}`,
          color: 'red',
        },
        {
          label: 'إجمالي المدفوع',
          value: `${totalPaid.toLocaleString('en-US')} ${currency}`,
          color: 'emerald',
        },
        {
          label: 'الرصيد الحالي',
          value: `${Math.abs(customer.balance).toLocaleString('en-US')} ${currency}${
            customer.balance !== 0 ? (customer.balance > 0 ? ' (مدين)' : ' (علينا)') : ' (صافي)'
          }`,
          color: customer.balance > 0 ? 'red' : customer.balance < 0 ? 'emerald' : 'gray',
        },
      ],
      statsText: `عدد المعاملات: ${accountStatement.length}`,
    });
  };

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black">{customer.name}</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>كشف حساب العميل</p>
        </div>
        <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrint}>طباعة PDF</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <Card
          title="بيانات العميل"
          className="lg:col-span-3 lg:order-1 [&>div:first-child]:px-3 [&>div:first-child]:py-2 [&>div:first-child_h3]:text-xs [&>div:last-child]:p-3"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px]"><Phone size={12} className="text-brand-primary" /> {customer.phone}</div>
            {customer.email && <div className="flex items-center gap-2 text-[11px]"><Mail size={12} className="text-brand-primary" /> {customer.email}</div>}
            {customer.address && <div className="flex items-center gap-2 text-[11px]"><MapPin size={12} className="text-brand-primary" /> {customer.address}</div>}
            <div className={`mt-2 p-2 rounded-md border ${isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الرصيد المستحق</p>
              <p className={`text-base font-black mt-0.5 ${customer.balance > 0 ? 'text-red-500' : customer.balance < 0 ? 'text-emerald-500' : ''}`}>
                {Math.abs(customer.balance).toLocaleString('en-US')} {currency}
                {customer.balance !== 0 && (
                  <span className={`mr-1.5 text-base font-semibold ${customer.balance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>({customer.balance > 0 ? 'مدين' : 'علينا'})</span>
                )}
              </p>
              {customer.balance === 0 && (
                <Badge variant="neutral" size="sm" className="tracking-wide">
                  صافي
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              icon={<DollarSign size={12} />}
              onClick={() => setShowPayment(true)}
              className="flex-1 py-1 text-[11px]"
            >
              تسجيل دفعة
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<FileText size={12} />}
              onClick={() => navigate(`/sales?customerId=${customer.id}`)}
              className="flex-1 py-1 text-[11px]"
            >
              إضافة أوردر
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-9 lg:order-2 space-y-3">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'عدد الفواتير', value: customerInvoices.length },
              { label: 'عدد الدفعات', value: customerPayments.length },
              { label: 'عقود الإيجار', value: customerRentals.length },
              {
                label: 'آخر معاملة',
                value: lastMovementDate
                  ? formatDateDMY(lastMovementDate)
                  : '—',
              },
            ].map(s => (
              <div
                key={s.label}
                className={`rounded-md p-2 border ${
                  isDark
                    ? 'bg-brand-surface border-white/[0.08]'
                    : 'bg-white border-gray-200 border-r-2 border-r-brand-primary'
                }`}
              >
                <p className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</p>
                <p className={`text-sm font-black mt-0.5 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'إجمالي المبيعات', value: totalSales, color: 'text-brand-teal', suffix: '', suffixCls: '' },
              { label: 'إجمالي المدفوع', value: totalPaid, color: 'text-emerald-500', suffix: '', suffixCls: '' },
              { label: 'الذمة المستحقة', value: customer.balance, color: customer.balance > 0 ? 'text-red-500' : customer.balance < 0 ? 'text-emerald-500' : '', suffix: customer.balance !== 0 ? (customer.balance > 0 ? ' (مدين)' : ' (علينا)') : '', suffixCls: customer.balance > 0 ? 'text-red-500' : 'text-emerald-600' },
            ].map(item => (
              <div
                key={item.label}
                className={`rounded-md p-2 border min-h-[72px] ${
                  isDark ? 'bg-brand-surface border-white/[0.08]' : 'bg-white border-gray-200 border-r-2 border-r-brand-primary'
                }`}
              >
                <div className="h-full flex flex-col justify-between">
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                  <p className={`text-sm font-black ${item.color}`}>{Math.abs(item.value).toLocaleString('en-US')} {currency}{item.suffix && <span className={`text-base font-semibold ${item.suffixCls || ''}`}>{item.suffix}</span>}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card title="كشف الحساب" actions={<Badge variant="info">{accountStatement.length} معاملات</Badge>}>
        <div className="overflow-x-auto w-full">
          <table className="min-w-max w-full text-sm table-auto">
            <thead>
              <tr
                className={`border-b-2 ${
                  isDark
                    ? 'border-white/20 divide-x divide-white/10'
                    : 'border-gray-300 divide-x divide-gray-200'
                }`}
              >
                {['#', 'التاريخ', 'البيان', `مدين (${currency})`, `دائن (${currency})`, `الرصيد (${currency})`, 'الإجراءات'].map(h => (
                  <th
                    key={h}
                    className="text-right px-4 py-3 font-semibold text-xs bg-brand-primary text-white"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accountStatement.length === 0 ? (
                <tr><td colSpan={7} className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد معاملات</td></tr>
              ) : (
                accountStatement.map((row, i) => {
                  runningBalance += row.debit - row.credit;
                  return (
                    <tr
                      key={row.id}
                      className={`border-b-2 ${
                        isDark
                          ? 'border-white/15 divide-x divide-white/10'
                          : 'border-gray-200 divide-x divide-gray-200'
                      } ${row.type === 'payment' ? (isDark ? 'bg-emerald-500/3' : 'bg-emerald-50/50') : ''}`}
                    >
                      <td className="px-4 py-3 text-center font-medium">{i + 1}</td>
                      <td className="px-4 py-3">{formatDateDMY(row.date)}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="flex items-start gap-2">
                          <FileText
                            size={16}
                            className={`${row.type === 'payment' ? 'text-emerald-500' : 'text-brand-primary'} shrink-0`}
                          />
                          <span className="font-medium truncate">{row.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-red-500">{row.debit > 0 ? row.debit.toLocaleString('en-US') : ''}</td>
                      <td className="px-4 py-3 font-bold text-emerald-500">{row.credit > 0 ? row.credit.toLocaleString('en-US') : ''}</td>
                      <td className={`px-4 py-3 font-black ${runningBalance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {Math.abs(runningBalance).toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-3">
                        <ActionsCell
                          actions={[
                            { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); setViewRow({ id: row.id, type: row.type }); }, variant: 'view' },
                            ...(row.type === 'invoice' ? [{ icon: Pencil, label: 'تعديل', onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/sales?editId=${row.id}`); }, variant: 'edit' as const }] : []),
                            ...(row.type === 'rental' ? [{ icon: Pencil, label: 'تعديل', onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/rentals?editContractId=${row.id}`); }, variant: 'edit' as const }] : []),
                            ...(row.type === 'payment' ? [{ icon: Pencil, label: 'تعديل', onClick: (e: React.MouseEvent) => { e.stopPropagation(); const p = payments.find(x => x.id === row.id); if (p) setEditPayment({ id: p.id, amount: String(p.amount), date: p.date.slice(0, 10) }); }, variant: 'edit' as const }] : []),
                            { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف المعاملة', message: 'سيتم حذف هذه المعاملة نهائياً. هل أنت متأكد؟', itemName: row.description, onConfirm: () => { if (row.type === 'invoice') deleteSaleInvoice(row.id); else if (row.type === 'payment') deletePayment(row.id); else deleteRentalContract(row.id); } }); }, variant: 'delete' },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {viewRow && (() => {
        if (viewRow.type === 'invoice') {
          const si = saleInvoices.find(s => s.id === viewRow.id);
          if (!si) return null;
          const cust = customers.find(c => c.id === si.customerId);
          const wh = warehouses.find(w => w.id === si.warehouseId);
          return (
            <Modal isOpen onClose={() => setViewRow(null)} title="تفاصيل الفاتورة" size="lg">
              <div className="space-y-4 text-sm">
                <div className="flex gap-2 mb-4 pb-3 border-b border-slate-600/30">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Printer size={14} />}
                    onClick={() => {
                      const orderRows = si.items.map((item) => {
                        const prod = products.find(p => p.id === item.productId);
                        return {
                          productName: prod?.name || '—',
                          quantity: item.quantity,
                          unitPrice: item.unitPrice.toLocaleString('en-US'),
                          taxes: '0.00',
                          amount: item.totalPrice.toLocaleString('en-US'),
                        };
                      });
                      const remaining = si.totalAmount - si.paidAmount;
                      const paymentStatusLabel =
                        si.paymentType === 'immediate' ? 'فوري' : 'آجل';
                      const paymentMethodLabel =
                        si.paymentMethod === 'bank_transfer'
                          ? 'تحويل مصرفي'
                          : si.paymentMethod === 'card'
                          ? 'بطاقة'
                          : si.paymentMethod === 'cash'
                          ? 'نقدي'
                          : undefined;

                      openQuotationInvoicePrint({
                        documentTitle: 'فاتورة بيع',
                        documentNumber: '',
                        quotationDate: new Date(si.date).toLocaleDateString('en-US'),
                        customerName: cust?.name || '—',
                        customerAddress: cust?.address,
                        customerPhone: cust?.phone,
                        currency,
                        rows: orderRows,
                        untaxedAmount: si.totalAmount.toLocaleString('en-US'),
                        discountAmount: si.discount
                          ? si.discount.toLocaleString('en-US')
                          : undefined,
                        taxPercent: '0',
                        total: si.totalAmount.toLocaleString('en-US'),
                        companyName: settings.systemName,
                        paidAmount: si.paidAmount.toLocaleString('en-US'),
                        remainingAmount: remaining.toLocaleString('en-US'),
                        salespersonName: si.salesperson,
                        salespersonPhone: si.salespersonPhone,
                        warehouseName: wh?.name,
                        paymentMethodLabel,
                        paymentStatusLabel,
                        fileName: `فاتورة-بيع-${cust?.name || si.id}-${si.date.split('T')[0]}`,
                      });
                    }}
                  >
                    طباعة
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">العميل</p>
                    <p className="font-semibold">{cust?.name || '—'}</p>
                    <p className="text-xs text-slate-500">{cust?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">التاريخ</p>
                    <p>{formatDateDMY(si.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">المخزن</p>
                    <p className="font-semibold">{wh?.name || '—'}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-600/30 pt-3">
                  <p className="text-xs mb-2 text-slate-400">الأصناف</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {si.items.map((item, idx) => {
                      const prod = products.find(p => p.id === item.productId);
                      return (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-sm">{prod?.name || '—'}</p>
                            <p className="text-[11px] text-gray-500">
                              كمية: {item.quantity} • سعر: {item.unitPrice.toLocaleString('en-US')} {currency}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-brand-primary">
                            {item.totalPrice.toLocaleString('en-US')} {currency}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                    <p className="text-xs text-gray-500">إجمالي الفاتورة</p>
                    <p className="text-sm font-black text-brand-primary">
                      {si.totalAmount.toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-gray-500">المدفوع</p>
                    <p className="text-sm font-black text-emerald-600">
                      {si.paidAmount.toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-gray-500">المتبقي</p>
                    <p className="text-sm font-black text-red-600">
                      {(si.totalAmount - si.paidAmount).toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                </div>
              </div>
            </Modal>
          );
        }
        if (viewRow.type === 'payment') {
          const p = payments.find(x => x.id === viewRow.id && x.type === 'customer_payment');
          if (!p) return null;
          return (
            <Modal isOpen onClose={() => setViewRow(null)} title="تفاصيل الدفعة" size="sm">
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-400">التاريخ:</span> {formatDateDMY(p.date)}</div>
                <div><span className="text-slate-400">المبلغ:</span> <span className="font-bold text-green-400">{p.amount.toLocaleString('en-US')} {currency}</span></div>
              </div>
            </Modal>
          );
        }
        if (viewRow.type === 'rental') {
          const rc = rentalContracts.find(r => r.id === viewRow.id);
          const gen = rc ? generators.find(g => g.id === rc.generatorId) : null;
          if (!rc) return null;
          return (
            <Modal isOpen onClose={() => setViewRow(null)} title="تفاصيل عقد الإيجار" size="md">
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-400">المولد:</span> {gen?.serialNumber} - {gen?.capacity}</div>
                <div><span className="text-slate-400">من:</span> {formatDateDMY(rc.startDate)} <span className="text-slate-400">إلى:</span> {formatDateDMY(rc.endDate)}</div>
                <div><span className="text-slate-400">عدد الأيام:</span> {rc.totalDays}</div>
                <div><span className="text-slate-400">الإجمالي:</span> <span className="font-bold">{rc.totalAmount.toLocaleString('en-US')} {currency}</span></div>
                <div><span className="text-slate-400">الحالة:</span> {rc.status === 'active' ? 'نشط' : rc.status === 'ended' ? 'منتهي' : 'ملغي'}</div>
              </div>
            </Modal>
          );
        }
        return null;
      })()}

      <ConfirmDialog {...dialogProps} />
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="تسجيل دفعة من العميل">
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الرصيد المستحق</p>
            <p className="text-xl font-bold text-red-500">{Math.abs(customer.balance).toLocaleString('en-US')} {currency}{customer.balance !== 0 ? (customer.balance > 0 ? ' (مدين)' : ' (علينا)') : ''}</p>
          </div>
          <Input label="المبلغ" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
          <Select
            label="طريقة الدفع"
            value={payMethod}
            onChange={e => setPayMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'cash', label: 'نقدي' },
              { value: 'bank_transfer', label: 'تحويل مصرفي' },
              { value: 'card', label: 'بطاقة' },
            ]}
            placeholder="اختر طريقة الدفع"
          />
          <Textarea label="ملاحظات" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
          <div className="flex gap-3">
            <Button onClick={handlePayment} className="flex-1">تأكيد الاستلام</Button>
            <Button variant="ghost" onClick={() => setShowPayment(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editPayment} onClose={() => setEditPayment(null)} title="تعديل الدفعة">
        {editPayment && (
          <div className="space-y-4">
            <Input label="المبلغ" type="number" value={editPayment.amount} onChange={e => setEditPayment(p => p ? { ...p, amount: e.target.value } : null)} placeholder="0.00" />
            <Input label="التاريخ" type="date" value={editPayment.date} onChange={e => setEditPayment(p => p ? { ...p, date: e.target.value } : null)} />
            <div className="flex gap-3">
              <Button onClick={handlePaymentEditSave} className="flex-1">حفظ</Button>
              <Button variant="ghost" onClick={() => setEditPayment(null)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


