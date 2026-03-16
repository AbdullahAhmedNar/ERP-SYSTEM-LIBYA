import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useMemo } from 'react';
import { ArrowRight, Printer, Phone, Mail, MapPin, DollarSign, FileText, ShoppingCart, Eye, Pencil, Trash2, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Modal, Input, Textarea, ActionsCell, ConfirmDialog, useConfirmDelete, Select } from '../../components/UI';
import { openOdooStylePrint, openQuotationInvoicePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, purchaseOrders, payments, returns, products, warehouses, addSupplierPayment, updatePayment, deletePurchaseOrder, deletePayment, deleteReturn, settings } = useStore();
  const [showPayment, setShowPayment] = useState(false);
  const [viewRow, setViewRow] = useState<{ id: string; type: 'order' | 'payment' | 'return' } | null>(null);
  const [editPayment, setEditPayment] = useState<{ id: string; amount: string; date: string } | null>(null);
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');

  const supplier = suppliers.find(s => s.id === id);
  if (!supplier) return <div className="text-center py-20 text-slate-500">المورد غير موجود</div>;

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

  const supplierOrders = purchaseOrders.filter(po => po.supplierId === id);
  const supplierPayments = payments.filter(p => p.type === 'supplier_payment' && p.entityId === id);
  const supplierReturns = returns.filter(r => r.type === 'purchase_return' && r.supplierId === id);

  const totalPurchases = supplierOrders.reduce((s, po) => s + po.totalAmount, 0);
  const totalPaid = supplierPayments.reduce((s, p) => s + p.amount, 0);
  const totalReturns = supplierReturns.reduce((s, r) => s + r.totalAmount, 0);
  const currentBalance = totalPurchases - totalPaid - totalReturns;

  const accountStatement = useMemo(() => {
    const rows: { id: string; date: string; description: string; debit: number; credit: number; type: 'order' | 'payment' | 'return' }[] = [];

    supplierOrders.forEach(po => {
      const itemNames = po.items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return prod ? `${prod.name} (${item.quantity})` : 'منتج';
      }).join('، ');
      rows.push({ id: po.id, date: po.date, description: `أوردر شراء: ${itemNames}`, debit: po.totalAmount, credit: 0, type: 'order' });
    });

    supplierPayments.forEach(p => {
      const meta = paymentMethodMeta(p.method as PaymentMethod | undefined);
      rows.push({
        id: p.id,
        date: p.date,
        description: `تسديد دفعة للمورد (${meta.label})`,
        debit: 0,
        credit: p.amount,
        type: 'payment',
      });
    });

    supplierReturns.forEach(r => {
      rows.push({ id: r.id, date: r.date, description: 'مرتجع شراء', debit: 0, credit: r.totalAmount, type: 'return' });
    });

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return rows;
  }, [supplierOrders, supplierPayments, supplierReturns, products]);

  const handlePayment = () => {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    addSupplierPayment(id!, amount, undefined, payMethod);
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
      pageTitle: supplier.name,
      pageSubtitle: 'كشف حساب مورد',
      infoBlocks: [
        { label: 'المورد', value: supplier.name },
        { label: 'الهاتف', value: supplier.phone || '—' },
        { label: 'العنوان', value: supplier.address || '—' },
        {
          label: 'الرصيد الحالي',
          value: `${Math.abs(currentBalance).toLocaleString('en-US')} ${currency}${currentBalance !== 0 ? (currentBalance > 0 ? ' (علينا)' : ' (لنا)') : ''}`,
        },
      ],
      tableHtml,
      summaryBlocks: [
        {
          label: 'إجمالي المشتريات',
          value: `${totalPurchases.toLocaleString('en-US')} ${currency}`,
          color: 'red',
        },
        {
          label: 'إجمالي المدفوع',
          value: `${totalPaid.toLocaleString('en-US')} ${currency}`,
          color: 'emerald',
        },
        {
          label: 'الرصيد الحالي',
          value: `${Math.abs(currentBalance).toLocaleString('en-US')} ${currency}${currentBalance !== 0 ? (currentBalance > 0 ? ' (علينا)' : ' (لنا)') : ''}`,
          color: currentBalance > 0 ? 'red' : currentBalance < 0 ? 'emerald' : 'gray',
        },
      ],
      statsText: `عدد المعاملات: ${accountStatement.length}`,
    });
  };

  let runningBalance = 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/suppliers')} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black">{supplier.name}</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>كشف حساب المورد</p>
        </div>
        <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrint}>طباعة PDF</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <Card
          title="بيانات المورد"
          className="[&>div:first-child]:px-4 [&>div:first-child]:py-3 [&>div:last-child]:p-4"
        >
          <div className="space-y-2">
            <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
              <Phone size={13} className="text-brand-primary" /> {supplier.phone}
            </div>
            {supplier.email && <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
              <Mail size={14} className="text-brand-primary" /> {supplier.email}
            </div>}
            {supplier.address && <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
              <MapPin size={14} className="text-brand-primary" /> {supplier.address}
            </div>}
            <div className={`mt-3 p-2 rounded-md border ${isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-gray-200'}`}>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الرصيد الحالي</p>
              <p className={`text-lg font-black mt-0.5 ${currentBalance > 0 ? 'text-red-500' : currentBalance < 0 ? 'text-emerald-500' : ''}`}>
                {Math.abs(currentBalance).toLocaleString('en-US')} {currency}
                {currentBalance !== 0 && (
                  <span className={`mr-1.5 text-base font-semibold ${currentBalance > 0 ? 'text-red-500' : 'text-emerald-600'}`}>({currentBalance > 0 ? 'علينا' : 'لنا'})</span>
                )}
              </p>
              {currentBalance === 0 && <Badge variant="neutral" size="sm" className="tracking-wide">صفر</Badge>}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" icon={<DollarSign size={14} />} onClick={() => setShowPayment(true)} className="flex-1">تسديد دفعة</Button>
            <Button variant="outline" size="sm" icon={<ShoppingCart size={14} />} onClick={() => {
              const basePath = (window.location.pathname || '/').replace(/\/suppliers\/?.*$/, '') || '';
              window.open(`${window.location.origin}${basePath}/purchases?supplierId=${id}`, '_blank');
            }} className="flex-1">أوردر شراء</Button>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 content-start self-start lg:grid-cols-[repeat(3,auto)] lg:justify-start">
            {[
            { label: 'إجمالي المشتريات', value: totalPurchases, color: 'text-brand-teal', suffix: '', suffixCls: '' },
            { label: 'إجمالي المدفوع', value: totalPaid, color: 'text-emerald-500', suffix: '', suffixCls: '' },
            { label: 'المتبقي', value: currentBalance, color: currentBalance > 0 ? 'text-red-500' : currentBalance < 0 ? 'text-emerald-500' : '', suffix: currentBalance !== 0 ? (currentBalance > 0 ? ' (علينا)' : ' (لنا)') : '', suffixCls: currentBalance > 0 ? 'text-red-500' : 'text-emerald-600' },
          ].map(item => (
            <div
              key={item.label}
              className={`rounded-md p-2 border lg:w-[220px] lg:h-[78px] ${isDark ? 'bg-brand-surface border-white/[0.08]' : 'bg-white border-gray-200 border-r-2 border-r-brand-primary'}`}
            >
              <div className="h-full flex flex-col justify-between">
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{item.label}</p>
                <p className={`text-sm font-black ${item.color}`}>{Math.abs(item.value).toLocaleString('en-US')} {currency}{item.suffix && <span className={`text-base font-semibold ${item.suffixCls || ''}`}>{item.suffix}</span>}</p>
              </div>
            </div>
          ))}
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
                            ...(row.type === 'order' ? [{ icon: Pencil, label: 'تعديل', onClick: (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/purchases?editId=${row.id}`); }, variant: 'edit' as const }] : []),
                            ...(row.type === 'payment' ? [{ icon: Pencil, label: 'تعديل', onClick: (e: React.MouseEvent) => { e.stopPropagation(); const p = payments.find(x => x.id === row.id); if (p) setEditPayment({ id: p.id, amount: String(p.amount), date: p.date.slice(0, 10) }); }, variant: 'edit' as const }] : []),
                            { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف المعاملة', message: 'سيتم حذف هذه المعاملة نهائياً. هل أنت متأكد؟', itemName: row.description, onConfirm: () => { if (row.type === 'order') deletePurchaseOrder(row.id); else if (row.type === 'payment') deletePayment(row.id); else deleteReturn(row.id); } }); }, variant: 'delete' },
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
        if (viewRow.type === 'order') {
          const po = purchaseOrders.find(p => p.id === viewRow.id);
          if (!po) return null;
          const wh = warehouses.find(w => w.id === po.warehouseId);
          return (
            <Modal isOpen onClose={() => setViewRow(null)} title="تفاصيل أوردر الشراء" size="lg">
              <div className="space-y-4 text-sm">
                <div className="flex gap-2 mb-4 pb-3 border-b border-slate-600/30">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Printer size={14} />}
                    onClick={() => {
                      const orderRows = po.items.map((item) => {
                        const prod = products.find(p => p.id === item.productId);
                        return {
                          productName: prod?.name || '—',
                          quantity: item.quantity,
                          unitPrice: item.unitPrice.toLocaleString('en-US'),
                          taxes: '0.00',
                          amount: item.totalPrice.toLocaleString('en-US'),
                        };
                      });
                      const paidAmt = po.paidAmount || 0;
                      const remaining = po.totalAmount - paidAmt;
                      const paymentMethodLabel =
                        paidAmt > 0
                          ? (po.paymentMethod === 'bank_transfer'
                              ? 'تحويل مصرفي'
                              : po.paymentMethod === 'card'
                              ? 'بطاقة'
                              : po.paymentMethod === 'cash'
                              ? 'نقدي'
                              : undefined)
                          : undefined;
                      const paymentStatusLabel =
                        paidAmt >= po.totalAmount ? 'فوري' : paidAmt > 0 ? 'جزئي' : 'آجل';

                      openQuotationInvoicePrint({
                        documentTitle: 'فاتورة شراء',
                        documentNumber: `#${po.id.slice(0, 8)}`,
                        quotationDate: new Date(po.date).toLocaleDateString('en-US'),
                        customerName: supplier.name,
                        customerAddress: supplier.address || undefined,
                        customerPhone: supplier.phone || undefined,
                        currency,
                        rows: orderRows,
                        untaxedAmount: po.totalAmount.toLocaleString('en-US'),
                        discountAmount: po.discount
                          ? po.discount.toLocaleString('en-US')
                          : undefined,
                        taxPercent: '0',
                        total: po.totalAmount.toLocaleString('en-US'),
                        paidAmount: paidAmt.toLocaleString('en-US'),
                        remainingAmount: remaining.toLocaleString('en-US'),
                        companyName: settings.systemName,
                        salespersonName: po.buyerName || undefined,
                        salespersonPhone: po.buyerPhone || undefined,
                        warehouseName: wh?.name,
                        paymentMethodLabel,
                        paymentStatusLabel,
                        fileName: `فاتورة-شراء-${supplier.name || po.id}-${po.date.split('T')[0]}`,
                      });
                    }}
                  >
                    طباعة
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">المورد</p>
                    <p className="font-semibold">{supplier.name}</p>
                    <p className="text-xs text-slate-500">{supplier.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">التاريخ</p>
                    <p>{formatDateDMY(po.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">المخزن</p>
                    <p className="font-semibold">{wh?.name || '—'}</p>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-600/30 pt-3">
                  <p className="text-xs mb-2 text-slate-400">الأصناف</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {po.items.map((item, idx) => {
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
                    <p className="text-xs text-gray-500">إجمالي الأوردر</p>
                    <p className="text-sm font-black text-brand-primary">
                      {po.totalAmount.toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-xs text-gray-500">المدفوع</p>
                    <p className="text-sm font-black text-emerald-600">
                      {po.paidAmount.toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-gray-500">المتبقي</p>
                    <p className="text-sm font-black text-red-600">
                      {(po.totalAmount - po.paidAmount).toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                </div>
              </div>
            </Modal>
          );
        }
        if (viewRow.type === 'payment') {
          const p = payments.find(x => x.id === viewRow.id && x.type === 'supplier_payment');
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
        if (viewRow.type === 'return') {
          const r = returns.find(x => x.id === viewRow.id && x.type === 'purchase_return');
          if (!r) return null;
          return (
            <Modal isOpen onClose={() => setViewRow(null)} title="تفاصيل المرتجع" size="md">
              <div className="space-y-3 text-sm">
                <div><span className="text-slate-400">التاريخ:</span> {formatDateDMY(r.date)}</div>
                <div><span className="text-slate-400">المبلغ:</span> <span className="font-bold">{r.totalAmount.toLocaleString('en-US')} {currency}</span></div>
                <div><span className="text-slate-400">السبب:</span> {r.reason}</div>
              </div>
            </Modal>
          );
        }
        return null;
      })()}

      <ConfirmDialog {...dialogProps} />
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="تسجيل دفعة للمورد">
        <div className="space-y-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الرصيد الحالي</p>
            <p className="text-xl font-bold text-red-500">{Math.abs(currentBalance).toLocaleString('en-US')} {currency}{currentBalance !== 0 ? (currentBalance > 0 ? ' (علينا)' : ' (لنا)') : ''}</p>
          </div>
          <Input label="المبلغ" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" />
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
            <Button onClick={handlePayment} className="flex-1">تأكيد الدفع</Button>
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


