import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Printer, Trash2, DollarSign, AlertCircle, BarChart2, Pencil, Eye, TrendingUp, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, Select, Textarea, KpiCard, SearchBox, ConfirmDialog, useConfirmDelete } from '../../components/UI';
import { v4 as uuidv4 } from 'uuid';
import { openOdooStylePrint, openQuotationInvoicePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

type SaleItem = { id: string; productId: string; quantity: number; unitPrice: number; costPrice: number; totalPrice: number };

export default function SalesPage() {
  const { saleInvoices, customers, warehouses, products, addSaleInvoice, addCustomer, updateSaleInvoice, deleteSaleInvoice, updateCustomer, settings } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [quickCustomerForm, setQuickCustomerForm] = useState({ name: '', phone: '', address: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: '',
    warehouseId: '',
    paidAmount: '',
    paymentMethod: 'cash' as PaymentMethod,
    discount: '',
    salesperson: '',
    salespersonPhone: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<SaleItem[]>([{ id: uuidv4(), productId: '', quantity: 1, unitPrice: 0, costPrice: 0, totalPrice: 0 }]);
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;
  const printRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const paymentMethodMeta = (m?: PaymentMethod) => {
    switch (m) {
      case 'bank_transfer':
        return { label: 'تحويل مصرفي', variant: 'warning' as const, icon: <ArrowLeftRight size={12} /> };
      case 'card':
        return { label: 'بطاقة', variant: 'info' as const, icon: <CreditCard size={12} /> };
      case 'cash':
      default:
        return { label: 'نقدي', variant: 'success' as const, icon: <Wallet size={12} /> };
    }
  };

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const discount = parseFloat(form.discount) || 0;
  const totalAmount = subtotal - discount;
  const totalProfit = items.reduce((s, i) => s + (i.unitPrice - i.costPrice) * i.quantity, 0) - discount;
  const previewPaidAmount = parseFloat(form.paidAmount) || 0;
  const previewRemaining = totalAmount - previewPaidAmount;
  const previewStatusLabel =
    Math.abs(previewRemaining) < 0.0001
      ? 'صافي'
      : previewRemaining > 0
      ? `متبقي ${previewRemaining.toLocaleString('en-US')} ${currency}`
      : `زائد ${Math.abs(previewRemaining).toLocaleString('en-US')} ${currency}`;

  const addItem = () => setItems([...items, { id: uuidv4(), productId: '', quantity: 1, unitPrice: 0, costPrice: 0, totalPrice: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: string, val: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = (field === 'quantity' ? Number(val) : updated.quantity) * (field === 'unitPrice' ? Number(val) : updated.unitPrice);
      }
      return updated;
    }));
  };

  const buildInvoicePayload = () => {
    const paidAmount = parseFloat(form.paidAmount) || 0;
    const paymentType: 'immediate' | 'deferred' =
      paidAmount >= totalAmount ? 'immediate' : 'deferred';
    return {
      customerId: form.customerId,
      warehouseId: form.warehouseId,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        costPrice: i.costPrice,
        totalPrice: i.totalPrice,
      })),
      totalAmount,
      paidAmount,
      paymentMethod: paidAmount > 0 ? form.paymentMethod : undefined,
      discount,
      paymentType,
      profit: totalProfit,
      status: 'active' as const,
      notes: form.notes,
      date: new Date(form.date).toISOString(),
      salesperson: form.salesperson || undefined,
      salespersonPhone: form.salespersonPhone || undefined,
    };
  };

  const resetFormState = () => {
    setItems([
      {
        id: uuidv4(),
        productId: '',
        quantity: 1,
        unitPrice: 0,
        costPrice: 0,
        totalPrice: 0,
      },
    ]);
    setForm({
      customerId: '',
      warehouseId: '',
      paidAmount: '',
      paymentMethod: 'cash' as PaymentMethod,
      discount: '',
      salesperson: '',
      salespersonPhone: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setCustomerPhone('');
    setEditId(null);
  };

  const handleSave = () => {
    if (!form.customerId || !form.warehouseId || items.some(i => !i.productId)) return;
    const payload = buildInvoicePayload();
    if (editId) {
      updateSaleInvoice(editId, payload);
    } else {
      addSaleInvoice(payload);
    }
    setShowAdd(false);
    resetFormState();
  };

  const filtered = saleInvoices.filter(si => {
    if (si.status !== 'active') return false;
    const cust = customers.find(c => c.id === si.customerId);
    return cust?.name.toLowerCase().includes(search.toLowerCase()) || si.id.includes(search);
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editIdParam = params.get('editId');
    const cid = params.get('customerId');
    if (editIdParam) {
      const si = saleInvoices.find(s => s.id === editIdParam);
      if (si) {
        setEditId(si.id);
        setForm({
          customerId: si.customerId,
          warehouseId: si.warehouseId,
          paidAmount: String(si.paidAmount || ''),
          paymentMethod: (si.paymentMethod || 'cash') as PaymentMethod,
          discount: String(si.discount || ''),
          salesperson: si.salesperson || '',
          salespersonPhone: si.salespersonPhone || '',
          date: si.date.split('T')[0],
          notes: si.notes || '',
        });
        const cust = customers.find(c => c.id === si.customerId);
        setCustomerPhone(cust?.phone || '');
        setItems(si.items.map(it => ({ id: uuidv4(), productId: it.productId, quantity: it.quantity, unitPrice: it.unitPrice, costPrice: it.costPrice, totalPrice: it.totalPrice })));
        setShowAdd(true);
      }
      navigate('/sales', { replace: true });
    } else if (cid) {
      setForm(prev => ({ ...prev, customerId: cid }));
      setShowAdd(true);
    }
  }, [location.search]);

  const detailInvoice = detailId ? saleInvoices.find(si => si.id === detailId) || null : null;

  const availableProducts = products.filter(
    p =>
      p.type !== 'rental' &&
      (!form.warehouseId || p.warehouseId === form.warehouseId)
  );

  const buildQuotationInvoicePayload = () => {
    const cust = customers.find(c => c.id === form.customerId);
    const warehouse = warehouses.find(w => w.id === form.warehouseId);
    const paidAmountNum = parseFloat(form.paidAmount) || 0;
    const paymentTypeLabel = paidAmountNum >= totalAmount ? 'فوري' : 'آجل';
    const paymentMethodLabel =
      paidAmountNum > 0 ? paymentMethodMeta(form.paymentMethod).label : undefined;
    const orderRows = items
      .filter(i => i.productId)
      .map((item) => {
        const prod = products.find(p => p.id === item.productId);
        return {
          productName: prod?.name || '—',
          quantity: item.quantity,
          unitPrice: item.unitPrice.toLocaleString('en-US'),
          taxes: '0.00',
          amount: item.totalPrice.toLocaleString('en-US'),
        };
      });
    return {
      documentTitle: 'فاتورة بيع',
      documentNumber: '',
      quotationDate: new Date(form.date).toLocaleDateString('en-US'),
      customerName: cust?.name || '—',
      customerAddress: cust?.address || undefined,
      customerPhone: cust?.phone || undefined,
      currency,
      rows: orderRows,
      untaxedAmount: subtotal.toLocaleString('en-US'),
      discountAmount: discount ? discount.toLocaleString('en-US') : undefined,
      taxPercent: '0',
      total: totalAmount.toLocaleString('en-US'),
      companyName: settings.systemName,
      fileName: `فاتورة-بيع-${cust?.name || 'عميل'}-${form.date}`,
      paidAmount: paidAmountNum ? paidAmountNum.toLocaleString('en-US') : undefined,
      remainingAmount: (totalAmount - paidAmountNum).toLocaleString('en-US'),
      salespersonName: form.salesperson || undefined,
      salespersonPhone: form.salespersonPhone || undefined,
      warehouseName: warehouse?.name,
      paymentMethodLabel,
      paymentStatusLabel: paymentTypeLabel,
    };
  };

  const handlePrintInvoice = () => {
    if (!form.customerId || !form.warehouseId || items.every(i => !i.productId)) return;
    openQuotationInvoicePrint(buildQuotationInvoicePayload());
  };

  const handlePrint = () => {
    const active = saleInvoices.filter(si => si.status === 'active');
    const rows = filtered.map((row, index) => {
      const cust = customers.find(c => c.id === row.customerId);
      const remaining = row.totalAmount - row.paidAmount;
      const statusLabel =
        Math.abs(remaining) < 0.0001
          ? 'صافي'
          : remaining > 0
          ? 'لنا'
          : 'علينا';
      return `<tr>
  <td style="text-align:center">${index + 1}</td>
  <td>${cust?.name || '—'}</td>
  <td>${formatDateDMY(row.date)}</td>
  <td style="font-weight:600">${row.totalAmount.toLocaleString('en-US')} ${currency}</td>
  <td style="color:#16a34a;font-weight:600">${row.paidAmount.toLocaleString('en-US')} ${currency}</td>
  <td style="color:${row.profit >= 0 ? '#d97706' : '#dc2626'};font-weight:600">${row.profit.toLocaleString('en-US')} ${currency}</td>
  <td>${statusLabel}</td>
</tr>`;
    }).join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#</th>
      <th>العميل</th>
      <th>التاريخ</th>
      <th>الإجمالي</th>
      <th>المدفوع</th>
      <th>الربح</th>
      <th>الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    const totalActive = active.reduce((s, si) => s + si.totalAmount, 0);
    const totalPaid = active.reduce((s, si) => s + si.paidAmount, 0);
    const totalRemain = active.reduce((s, si) => s + (si.totalAmount - si.paidAmount), 0);
    const totalProfit = active.reduce((s, si) => s + si.profit, 0);

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير فواتير المبيعات',
      pageSubtitle: `إجمالي الفواتير النشطة: ${active.length}`,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي المبيعات (${currency})`,
          value: totalActive.toLocaleString('en-US'),
        },
        {
          label: `إجمالي المحصل (${currency})`,
          value: totalPaid.toLocaleString('en-US'),
        },
        {
          label: `إجمالي المتبقي (${currency})`,
          value: totalRemain.toLocaleString('en-US'),
        },
        {
          label: 'إجمالي عدد الأوردرات',
          value: String(active.length),
        },
      ],
      statsText: `عدد الفواتير في التقرير: ${filtered.length}`,
    });
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">المبيعات</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{saleInvoices.filter(si => si.status === 'active').length} فاتورة</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrint}>طباعة</Button>
          <Button icon={<Plus size={16} />} onClick={() => { resetFormState(); setShowAdd(true); }}>فاتورة بيع جديدة</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title={`إجمالي المبيعات (${currency})`}
          value={saleInvoices
            .filter(si => si.status === 'active')
            .reduce((s, si) => s + si.totalAmount, 0)
            .toLocaleString('en-US')}
          icon={<TrendingUp size={20} />}
          color="teal"
        />
        <KpiCard
          title={`إجمالي المحصل (${currency})`}
          value={saleInvoices
            .filter(si => si.status === 'active')
            .reduce((s, si) => s + si.paidAmount, 0)
            .toLocaleString('en-US')}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <KpiCard
          title={`إجمالي المتأخر (${currency})`}
          value={saleInvoices
            .filter(si => si.status === 'active')
            .reduce((s, si) => s + (si.totalAmount - si.paidAmount), 0)
            .toLocaleString('en-US')}
          icon={<AlertCircle size={20} />}
          color="red"
        />
        <KpiCard
          title="إجمالي عدد الأوردرات"
          value={saleInvoices.filter(si => si.status === 'active').length}
          icon={<BarChart2 size={20} />}
          color="amber"
        />
      </div>

      <Card>
        <SearchBox value={search} onChange={setSearch} placeholder="بحث بالعميل..." />

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
                {['#', 'العميل', 'التاريخ', 'الإجمالي', 'المدفوع', 'طريقة الدفع', 'الربح', 'الحالة', 'إجراءات'].map(h => (
                  <th
                    key={h}
                    className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider bg-brand-primary text-white"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد فواتير</td></tr>
              ) : (
                filtered.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-b-2 table-row-hover transition-colors ${
                        isDark
                          ? 'border-white/15 divide-x divide-white/10'
                          : 'border-gray-200 divide-x divide-gray-200'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3 font-medium">{customers.find(c => c.id === row.customerId)?.name || '—'}</td>
                      <td className="px-4 py-3">{formatDateDMY(row.date)}</td>
                      <td className="px-4 py-3 font-bold">
                        {row.totalAmount.toLocaleString('en-US')} {currency}
                      </td>
                      <td className="px-4 py-3 text-green-400">
                        {row.paidAmount.toLocaleString('en-US')} {currency}
                      </td>
                      <td className="px-4 py-3">
                        {row.paidAmount > 0 ? (() => {
                          const meta = paymentMethodMeta(row.paymentMethod as PaymentMethod | undefined);
                          return (
                            <Badge variant={meta.variant}>
                              <span className="inline-flex items-center gap-1">
                                {meta.icon}
                                <span>{meta.label}</span>
                              </span>
                            </Badge>
                          );
                        })() : (
                          <span className={isDark ? 'text-slate-500' : 'text-gray-400'}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={row.profit >= 0 ? 'text-yellow-400' : 'text-red-400'}>
                          {row.profit.toLocaleString('en-US')} {currency}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const remaining = row.totalAmount - row.paidAmount;
                          if (Math.abs(remaining) < 0.0001) {
                            return <Badge variant="neutral">صافي</Badge>;
                          }
                          if (remaining > 0) {
                            return <Badge variant="success">لنا</Badge>;
                          }
                          return <Badge variant="danger">علينا</Badge>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setDetailId(row.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                            title="تفاصيل الفاتورة"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditId(row.id);
                              setForm({
                                customerId: row.customerId,
                                warehouseId: row.warehouseId,
                                paidAmount: String(row.paidAmount || ''),
                                paymentMethod: (row.paymentMethod || 'cash') as PaymentMethod,
                                discount: String(row.discount || ''),
                                salesperson: row.salesperson || '',
                                date: row.date.split('T')[0],
                                notes: row.notes || '',
                              });
                              setItems(
                                row.items.map(it => ({
                                  id: uuidv4(),
                                  productId: it.productId,
                                  quantity: it.quantity,
                                  unitPrice: it.unitPrice,
                                  costPrice: it.costPrice,
                                  totalPrice: it.totalPrice,
                                }))
                              );
                              setShowAdd(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                            title="تعديل الفاتورة"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => confirmDelete({
                              title: 'حذف الفاتورة',
                              message: 'سيتم حذف الفاتورة وجميع تأثيرها على المخزون والرصيد. هل أنت متأكد؟',
                              itemName: customers.find(c => c.id === row.customerId)?.name || 'فاتورة',
                              onConfirm: () => deleteSaleInvoice(row.id),
                            })}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                            title="حذف الفاتورة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="إنشاء فاتورة بيع" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="العميل *"
                  value={form.customerId}
                  onChange={e => {
                    const id = e.target.value;
                    setForm({ ...form, customerId: id });
                    const cust = customers.find(c => c.id === id);
                    setCustomerPhone(cust?.phone || '');
                  }}
                  options={customers.map(c => ({ value: c.id, label: c.name }))}
                  placeholder="اختر العميل"
                  searchable
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => {
                setQuickCustomerForm({ name: '', phone: '', address: '' });
                setShowAddCustomer(true);
              }}
              >
                عميل جديد
              </Button>
            </div>
            <Input
              label="هاتف العميل"
              value={customerPhone}
              onChange={e => {
                const val = e.target.value;
                setCustomerPhone(val);
                if (form.customerId) {
                  updateCustomer(form.customerId, { phone: val });
                }
              }}
              placeholder="رقم الهاتف"
            />
            <Select
              label="المخزن *"
              value={form.warehouseId}
              onChange={e => {
                setForm({ ...form, warehouseId: e.target.value });
                setItems([{ id: uuidv4(), productId: '', quantity: 1, unitPrice: 0, costPrice: 0, totalPrice: 0 }]);
              }}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              placeholder="اختر المخزن"
              searchable
            />
            <Input
              label="اسم البائع"
              value={form.salesperson}
              onChange={e => setForm({ ...form, salesperson: e.target.value })}
            />
            <Input
              label="هاتف مسؤول البيع"
              value={form.salespersonPhone}
              onChange={e => setForm({ ...form, salespersonPhone: e.target.value })}
            />
            <Input
              label={`المبلغ المدفوع (${currency})`}
              type="number"
              value={form.paidAmount}
              onChange={e => setForm({ ...form, paidAmount: e.target.value })}
            />
            <Select
              label="طريقة الدفع"
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
              options={[
                { value: 'cash', label: 'نقدي' },
                { value: 'bank_transfer', label: 'تحويل مصرفي' },
                { value: 'card', label: 'بطاقة' },
              ]}
              placeholder="اختر طريقة الدفع"
            />
            <Input
              label="التاريخ"
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">الأصناف</h4>
              <Button size="sm" variant="outline" icon={<Plus size={12} />} onClick={addItem}>إضافة صنف</Button>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 rounded-lg ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                  <div className="col-span-5">
                    <Select
                      value={item.productId}
                      searchable
                      disabled={!form.warehouseId}
                      onChange={e => {
                      const prod = products.find(p => p.id === e.target.value);
                      const updated = items.map(i => i.id === item.id ? {
                        ...i, productId: e.target.value,
                        unitPrice: prod?.salePrice || 0,
                        costPrice: prod?.costPrice || 0,
                        totalPrice: i.quantity * (prod?.salePrice || 0),
                      } : i);
                      setItems(updated);
                    }}
                      options={availableProducts.map(p => ({
                        value: p.id,
                        label: `${p.name} (${p.quantity})`,
                      }))}
                      placeholder={form.warehouseId ? 'اختر منتج' : 'اختر المخزن أولاً'}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2 flex items-center">
                      <span className="text-sm font-bold text-brand-primary">
                        {item.totalPrice.toLocaleString('en-US')}
                      </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded text-red-400 hover:bg-red-500/10"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Input label="خصم" type="number" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />

          <div className={`p-4 rounded-xl ${isDark ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-purple-50 border border-purple-100'}`}>
            <div className="flex justify-between text-sm mb-2">
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>المجموع الفرعي:</span>
              <span>{subtotal.toLocaleString('en-US')} {currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>الخصم:</span>
                <span className="text-red-400">
                  {discount.toLocaleString('en-US')} {currency}
                </span>
              </div>
            )}
            <div className="flex justify-between font-black text-lg border-t border-brand-primary/30 pt-2 mt-2">
              <span>الإجمالي:</span>
              <span className="text-brand-primary">
                {totalAmount.toLocaleString('en-US')} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>المدفوع:</span>
              <span className="font-semibold">
                {previewPaidAmount.toLocaleString('en-US')} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>الحالة:</span>
              <span className="font-semibold">
                {previewStatusLabel}
              </span>
            </div>
            {/* تم إخفاء عرض الربح المتوقع من واجهة إنشاء الفاتورة بناءً على طلب المستخدم */}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} className="flex-1 min-w-[120px]">حفظ الفاتورة</Button>
            <Button variant="outline" icon={<Printer size={14} />} onClick={handlePrintInvoice} className="min-w-[100px]" title="طباعة الفاتورة">طباعة</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1 min-w-[80px]">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddCustomer} onClose={() => setShowAddCustomer(false)} title="إضافة عميل جديد">
        <div className="space-y-4">
          <Input label="اسم العميل *" value={quickCustomerForm.name} onChange={e => setQuickCustomerForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم العميل" />
          <Input label="رقم الهاتف" value={quickCustomerForm.phone} onChange={e => setQuickCustomerForm(f => ({ ...f, phone: e.target.value }))} placeholder="اختياري" />
          <Input label="العنوان" value={quickCustomerForm.address} onChange={e => setQuickCustomerForm(f => ({ ...f, address: e.target.value }))} placeholder="اختياري" />
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                if (!quickCustomerForm.name.trim()) return;
                const newId = addCustomer(quickCustomerForm);
                setForm(prev => ({ ...prev, customerId: newId }));
                setCustomerPhone(quickCustomerForm.phone || '');
                setQuickCustomerForm({ name: '', phone: '', address: '' });
                setShowAddCustomer(false);
              }}
            >
              إضافة واختيار
            </Button>
            <Button variant="ghost" onClick={() => { setShowAddCustomer(false); setQuickCustomerForm({ name: '', phone: '', address: '' }); }} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} />

      {detailInvoice && (
        <Modal
          isOpen={!!detailInvoice}
          onClose={() => setDetailId(null)}
          title="تفاصيل فاتورة بيع"
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex gap-2 mb-4 pb-3 border-b border-slate-600/30">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                onClick={() => {
                  const cust = customers.find(c => c.id === detailInvoice.customerId);
                  const warehouse = warehouses.find(w => w.id === detailInvoice.warehouseId);
                  const orderRows = detailInvoice.items.map((item) => {
                    const prod = products.find(p => p.id === item.productId);
                    return {
                      productName: prod?.name || '—',
                      quantity: item.quantity,
                      unitPrice: item.unitPrice.toLocaleString('en-US'),
                      taxes: '0.00',
                      amount: item.totalPrice.toLocaleString('en-US'),
                    };
                  });
                  const remaining = detailInvoice.totalAmount - detailInvoice.paidAmount;
                  const paymentStatusLabel =
                    detailInvoice.paymentType === 'immediate' ? 'فوري' : 'آجل';
                  const paymentMethodLabel =
                    detailInvoice.paymentMethod === 'bank_transfer'
                      ? 'تحويل مصرفي'
                      : detailInvoice.paymentMethod === 'card'
                      ? 'بطاقة'
                      : detailInvoice.paymentMethod === 'cash'
                      ? 'نقدي'
                      : undefined;
                  openQuotationInvoicePrint({
                    documentTitle: 'فاتورة بيع',
                    documentNumber: '',
                    quotationDate: new Date(detailInvoice.date).toLocaleDateString('en-US'),
                    customerName: cust?.name || '—',
                    customerAddress: cust?.address,
                    customerPhone: cust?.phone,
                    currency,
                    rows: orderRows,
                    untaxedAmount: detailInvoice.totalAmount.toLocaleString('en-US'),
                    discountAmount: detailInvoice.discount
                      ? detailInvoice.discount.toLocaleString('en-US')
                      : undefined,
                    taxPercent: '0',
                    total: detailInvoice.totalAmount.toLocaleString('en-US'),
                    companyName: settings.systemName,
                    paidAmount: detailInvoice.paidAmount.toLocaleString('en-US'),
                    remainingAmount: remaining.toLocaleString('en-US'),
                    salespersonName: detailInvoice.salesperson,
                    salespersonPhone: detailInvoice.salespersonPhone,
                    warehouseName: warehouse?.name,
                    paymentMethodLabel,
                    paymentStatusLabel,
                    fileName: `فاتورة-بيع-${cust?.name || detailInvoice.id}-${detailInvoice.date.split('T')[0]}`,
                  });
                }}
              >
                طباعة
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل</p>
                <p className="font-semibold">
                  {customers.find(c => c.id === detailInvoice.customerId)?.name || '—'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المخزن</p>
                <p className="font-semibold">
                  {warehouses.find(w => w.id === detailInvoice.warehouseId)?.name || '—'}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>التاريخ</p>
                <p>{new Date(detailInvoice.date).toLocaleDateString('en-US')}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>نوع البيع</p>
                <Badge variant={detailInvoice.paymentType === 'immediate' ? 'success' : 'warning'}>
                  {detailInvoice.paymentType === 'immediate' ? 'فوري' : 'آجل'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي الفاتورة</p>
                <p className="text-lg font-black text-brand-primary">
                  {detailInvoice.totalAmount.toLocaleString('en-US')} {currency}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المدفوع</p>
                <p className="text-lg font-black text-emerald-500">
                  {detailInvoice.paidAmount.toLocaleString('en-US')} {currency}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-600/30 pt-3">
              <p className="text-xs mb-2 text-slate-400">الأصناف</p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {detailInvoice.items.map((item, idx) => {
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

            {detailInvoice.notes && (
              <div className="mt-2">
                <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ملاحظات</p>
                <p className={`text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{detailInvoice.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}


