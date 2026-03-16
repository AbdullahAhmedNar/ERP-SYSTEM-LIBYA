import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Printer, ShoppingCart, Trash2, DollarSign, TrendingDown, AlertCircle, Eye, Pencil, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Modal, Input, Select, KpiCard, SearchBox, ActionsCell, ConfirmDialog, useConfirmDelete } from '../../components/UI';
import { v4 as uuidv4 } from 'uuid';
import { openOdooStylePrint, openQuotationInvoicePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

type PurchaseItem = { id: string; productId: string; quantity: number; unitPrice: number; totalPrice: number };

export default function PurchasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { purchaseOrders, suppliers, warehouses, products, addPurchaseOrder, addSupplier, updatePurchaseOrder, deletePurchaseOrder, updateSupplier, settings } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [quickSupplierForm, setQuickSupplierForm] = useState({ name: '', phone: '', address: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState({
    supplierId: '',
    warehouseId: '',
    paidAmount: '',
    paymentMethod: 'cash' as PaymentMethod,
    buyerName: '',
    buyerPhone: '',
    discount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [supplierPhone, setSupplierPhone] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([{ id: uuidv4(), productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;
  const printRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const supplierId = searchParams.get('supplierId');
    const editIdParam = searchParams.get('editId');
    if (editIdParam) {
      const po = purchaseOrders.find(p => p.id === editIdParam);
      if (po) {
        setEditId(po.id);
        setForm({
          supplierId: po.supplierId,
          warehouseId: po.warehouseId,
          paidAmount: String(po.paidAmount || ''),
          paymentMethod: (po.paymentMethod || 'cash') as PaymentMethod,
          buyerName: po.buyerName || '',
          buyerPhone: po.buyerPhone || '',
          discount: po.discount ? String(po.discount) : '',
          date: po.date.split('T')[0],
          notes: po.notes || '',
        });
        const sup = suppliers.find(s => s.id === po.supplierId);
        setSupplierPhone(sup?.phone || '');
        setItems(po.items.map((it, i) => ({ id: uuidv4(), productId: it.productId, quantity: it.quantity, unitPrice: it.unitPrice, totalPrice: it.totalPrice })));
        setShowAdd(true);
      }
      setSearchParams({}, { replace: true });
    } else if (supplierId && suppliers.some(s => s.id === supplierId)) {
      setShowAdd(true);
      setForm(f => ({ ...f, supplierId }));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, suppliers, purchaseOrders, setSearchParams]);

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const discount = parseFloat(form.discount) || 0;
  const totalAmount = subtotal - discount;
  const previewPaidAmount = parseFloat(form.paidAmount) || 0;
  const previewRemaining = totalAmount - previewPaidAmount;
  const previewStatusLabel =
    Math.abs(previewRemaining) < 0.0001
      ? 'صافي'
      : previewRemaining > 0
      ? `متبقي ${previewRemaining.toLocaleString('en-US')} ${currency}`
      : `زائد ${Math.abs(previewRemaining).toLocaleString('en-US')} ${currency}`;

  const addItem = () => setItems([...items, { id: uuidv4(), productId: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.totalPrice = (field === 'quantity' ? Number(value) : updated.quantity) * (field === 'unitPrice' ? Number(value) : updated.unitPrice);
      }
      return updated;
    }));
  };

  const handleSave = () => {
    if (!form.supplierId || !form.warehouseId || items.some(i => !i.productId)) return;
    const paidAmount = parseFloat(form.paidAmount) || 0;
    const paymentType: 'full' | 'partial' | 'deferred' =
      paidAmount >= totalAmount ? 'full' : paidAmount > 0 ? 'partial' : 'deferred';
    const payload = {
      supplierId: form.supplierId,
      warehouseId: form.warehouseId,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      totalAmount,
      paidAmount,
      paymentMethod: paidAmount > 0 ? form.paymentMethod : undefined,
      paymentType,
      status: 'received' as const,
      notes: form.notes,
      date: new Date(form.date).toISOString(),
      buyerName: form.buyerName || undefined,
      buyerPhone: form.buyerPhone || undefined,
      discount,
    };
    if (editId) {
      updatePurchaseOrder(editId, payload);
      setEditId(null);
    } else {
      addPurchaseOrder(payload);
    }
    setShowAdd(false);
    setItems([
      {
        id: uuidv4(),
        productId: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      },
    ]);
    setForm({
      supplierId: '',
      warehouseId: '',
      paidAmount: '',
      paymentMethod: 'cash' as PaymentMethod,
      buyerName: '',
      buyerPhone: '',
      discount: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSupplierPhone('');
  };

  const startEdit = (row: typeof purchaseOrders[0]) => {
    setEditId(row.id);
    setForm({
      supplierId: row.supplierId,
      warehouseId: row.warehouseId,
      paidAmount: String(row.paidAmount || ''),
      paymentMethod: (row.paymentMethod || 'cash') as PaymentMethod,
      buyerName: row.buyerName || '',
      date: row.date.split('T')[0],
      notes: row.notes || '',
    });
    setItems(row.items.map((it, i) => ({
      id: uuidv4(),
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
    })));
    setShowAdd(true);
  };

  const filtered = purchaseOrders.filter(po => {
    const sup = suppliers.find(s => s.id === po.supplierId);
    return sup?.name.toLowerCase().includes(search.toLowerCase()) || po.id.includes(search);
  });
  const indexedPurchaseOrders = filtered.map((po, idx) => ({ ...po, __index: idx + 1 }));

  const detailOrder = detailId ? purchaseOrders.find(po => po.id === detailId) || null : null;

  const poColumns = [
    { key: 'id', label: '#', render: (row: typeof purchaseOrders[0] & { __index?: number }) => <span className="text-xs text-slate-400">{row.__index}</span> },
    { key: 'supplier', label: 'المورد', render: (row: typeof purchaseOrders[0]) => (
      <div className="font-medium">{suppliers.find(s => s.id === row.supplierId)?.name || '—'}</div>
    )},
    { key: 'date', label: 'التاريخ', render: (row: typeof purchaseOrders[0]) => formatDateDMY(row.date) },
    { key: 'warehouse', label: 'المخزن', render: (row: typeof purchaseOrders[0]) => (
      <Badge variant="neutral">{warehouses.find(w => w.id === row.warehouseId)?.name || '—'}</Badge>
    )},
    { key: 'totalAmount', label: 'الإجمالي', render: (row: typeof purchaseOrders[0]) => <span className="font-bold">{row.totalAmount.toLocaleString('en-US')} {currency}</span> },
    { key: 'paidAmount', label: 'المدفوع', render: (row: typeof purchaseOrders[0]) => <span className="text-green-400">{row.paidAmount.toLocaleString('en-US')} {currency}</span> },
    {
      key: 'status',
      label: 'الحالة',
      render: (row: typeof purchaseOrders[0]) => {
        const remaining = row.totalAmount - row.paidAmount;
        if (Math.abs(remaining) < 0.0001) {
          return <Badge variant="neutral">صافي</Badge>;
        }
        if (remaining > 0) {
          // متبقي علينا للمورد
          return <Badge variant="danger">علينا</Badge>;
        }
        // احتمال دفع زائد
        return <Badge variant="success">لنا</Badge>;
      },
    },
    { key: 'expand', label: '', render: (row: typeof purchaseOrders[0]) => (
      <button onClick={e => { e.stopPropagation(); setExpandedId(expandedId === row.id ? null : row.id); }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
        {expandedId === row.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    )},
  ];

  const handlePrintInvoice = () => {
    const sup = suppliers.find(s => s.id === form.supplierId);
    const wh = warehouses.find(w => w.id === form.warehouseId);
    const paidAmt = parseFloat(form.paidAmount) || 0;
    const remaining = totalAmount - paidAmt;
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
    const warehouseLine = wh?.name ? `المخزن: ${wh.name}` : '';
    const paymentMethodLabel =
      paidAmt > 0 ? paymentMethodMeta(form.paymentMethod).label : undefined;
    const paymentStatusLabel =
      paidAmt >= totalAmount ? 'فوري' : paidAmt > 0 ? 'جزئي' : 'آجل';
    openQuotationInvoicePrint({
      documentTitle: 'فاتورة شراء',
      documentNumber: `#${editId?.slice(0, 8) || Date.now().toString(36).toUpperCase()}`,
      quotationDate: new Date(form.date).toLocaleDateString('en-US'),
      addressSectionTitle: 'المورد ومعلومات التوصيل',
      saleInfoSectionTitle: 'معلومات الشراء',
      customerName: sup?.name || '—',
      // عنوان المورد فقط بدون ذكر المخزن في نفس السطر
      customerAddress: sup?.address || undefined,
      customerPhone: sup?.phone || undefined,
      currency,
      rows: orderRows,
      untaxedAmount: subtotal.toLocaleString('en-US'),
      discountAmount: discount ? discount.toLocaleString('en-US') : undefined,
      taxPercent: '0',
      total: totalAmount.toLocaleString('en-US'),
      paidAmount: paidAmt.toLocaleString('en-US'),
      remainingAmount: remaining.toLocaleString('en-US'),
      companyName: settings.systemName,
      salespersonName: form.buyerName || undefined,
      salespersonPhone: form.buyerPhone || undefined,
      warehouseName: wh?.name,
      paymentMethodLabel,
      paymentStatusLabel,
      fileName: `فاتورة-شراء-${sup?.name || 'مورد'}-${form.date}`,
    });
  };

  const handlePrint = () => {
    const rows = indexedPurchaseOrders
      .map(row => {
        const sup = suppliers.find(s => s.id === row.supplierId);
        const wh = warehouses.find(w => w.id === row.warehouseId);
      const remaining = row.totalAmount - row.paidAmount;
      const statusLabel =
        Math.abs(remaining) < 0.0001
          ? 'صافي'
          : remaining > 0
          ? 'علينا'
          : 'لنا';
      return `<tr>
  <td style="text-align:center">${row.__index}</td>
  <td>${sup?.name || '—'}</td>
  <td>${formatDateDMY(row.date)}</td>
  <td>${wh?.name || '—'}</td>
  <td style="font-weight:600">${row.totalAmount.toLocaleString('en-US')} ${currency}</td>
  <td style="color:#16a34a;font-weight:600">${row.paidAmount.toLocaleString('en-US')} ${currency}</td>
  <td>${statusLabel}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#</th>
      <th>المورد</th>
      <th>التاريخ</th>
      <th>المخزن</th>
      <th>الإجمالي</th>
      <th>المدفوع</th>
      <th>الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    const totalAmountAll = purchaseOrders.reduce((s, po) => s + po.totalAmount, 0);
    const totalPaidAll = purchaseOrders.reduce((s, po) => s + po.paidAmount, 0);
    const totalRemainAll = purchaseOrders.reduce((s, po) => s + (po.totalAmount - po.paidAmount), 0);

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير أوردرات الشراء',
      pageSubtitle: `إجمالي الأوردرات: ${purchaseOrders.length}`,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي المشتريات (${currency})`,
          value: totalAmountAll.toLocaleString('en-US'),
          color: 'purple',
        },
        {
          label: `إجمالي المدفوع (${currency})`,
          value: totalPaidAll.toLocaleString('en-US'),
          color: 'emerald',
        },
        {
          label: `إجمالي المتبقي (${currency})`,
          value: totalRemainAll.toLocaleString('en-US'),
          color: 'red',
        },
        {
          label: 'إجمالي عدد أوردرات الشراء',
          value: String(indexedPurchaseOrders.length),
          color: 'purple',
        },
      ],
    });
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">المشتريات</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{purchaseOrders.length} أوردر شراء</p>
        </div>
        <div className="flex gap-2">
          <Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrint}>طباعة</Button>
          <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>أوردر شراء جديد</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard title={`إجمالي المشتريات (${currency})`} value={purchaseOrders.reduce((s, po) => s + po.totalAmount, 0).toLocaleString('en-US')} icon={<ShoppingCart size={20} />} color="purple" />
        <KpiCard title={`إجمالي المدفوع (${currency})`} value={purchaseOrders.reduce((s, po) => s + po.paidAmount, 0).toLocaleString('en-US')} icon={<DollarSign size={20} />} color="green" />
        <KpiCard title={`إجمالي المتبقي (${currency})`} value={purchaseOrders.reduce((s, po) => s + (po.totalAmount - po.paidAmount), 0).toLocaleString('en-US')} icon={<AlertCircle size={20} />} color="red" />
        <KpiCard title="إجمالي عدد أوردرات الشراء" value={purchaseOrders.length} icon={<ShoppingCart size={20} />} color="purple" />
      </div>

      <Card>
        <SearchBox value={search} onChange={setSearch} placeholder="بحث بالمورد..." />

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
                {['#', 'المورد', 'التاريخ', 'المخزن', 'الإجمالي', 'المدفوع', 'طريقة الدفع', 'الحالة', 'الإجراءات'].map(h => (
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
                <tr><td colSpan={9} className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد أوردرات شراء</td></tr>
              ) : (
                indexedPurchaseOrders.map(row => (
                  <>
                    <tr
                      key={row.id}
                      className={`border-b-2 table-row-hover transition-colors ${
                        isDark
                          ? 'border-white/15 divide-x divide-white/10'
                          : 'border-gray-200 divide-x divide-gray-200'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-400">{row.__index}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{suppliers.find(s => s.id === row.supplierId)?.name || '—'}</td>
                      <td className="px-4 py-3">{formatDateDMY(row.date)}</td>
                      <td className="px-4 py-3"><Badge variant="neutral">{warehouses.find(w => w.id === row.warehouseId)?.name || '—'}</Badge></td>
                      <td className="px-4 py-3 font-bold">{row.totalAmount.toLocaleString('en-US')} {currency}</td>
                      <td className="px-4 py-3 text-green-400">{row.paidAmount.toLocaleString('en-US')} {currency}</td>
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
                        {(() => {
                          const remaining = row.totalAmount - row.paidAmount;
                          if (Math.abs(remaining) < 0.0001) {
                            return <Badge variant="neutral">صافي</Badge>;
                          }
                          if (remaining > 0) {
                            return <Badge variant="danger">علينا</Badge>;
                          }
                          return <Badge variant="success">لنا</Badge>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <ActionsCell
                          actions={[
                            {
                              icon: Eye,
                              label: 'تفاصيل',
                              onClick: (e) => {
                                e.stopPropagation();
                                setDetailId(row.id);
                              },
                              variant: 'view',
                            },
                            { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); startEdit(row); }, variant: 'edit' },
                            { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف أوردر الشراء', message: 'سيتم حذف هذا الأوردر وإعادة الكميات للمخزن. هل أنت متأكد؟', itemName: suppliers.find(s => s.id === row.supplierId)?.name || row.id, onConfirm: () => deletePurchaseOrder(row.id) }); }, variant: 'delete' },
                          ]}
                        />
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {detailOrder && (
        <Modal
          isOpen={!!detailOrder}
          onClose={() => setDetailId(null)}
          title="تفاصيل أوردر الشراء"
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="flex gap-2 mb-4 pb-3 border-b border-slate-600/30">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                onClick={() => {
                  const sup = suppliers.find(s => s.id === detailOrder.supplierId);
                  const wh = warehouses.find(w => w.id === detailOrder.warehouseId);
                  const orderRows = detailOrder.items.map((item) => {
                    const prod = products.find(p => p.id === item.productId);
                    return {
                      productName: prod?.name || '—',
                      quantity: item.quantity,
                      unitPrice: item.unitPrice.toLocaleString('en-US'),
                      taxes: '0.00',
                      amount: item.totalPrice.toLocaleString('en-US'),
                    };
                  });
                  const paidAmt = detailOrder.paidAmount || 0;
                  const remaining = detailOrder.totalAmount - paidAmt;
                  const paymentMethodLabel =
                    paidAmt > 0
                      ? (detailOrder.paymentMethod === 'bank_transfer'
                          ? 'تحويل مصرفي'
                          : detailOrder.paymentMethod === 'card'
                          ? 'بطاقة'
                          : detailOrder.paymentMethod === 'cash'
                          ? 'نقدي'
                          : undefined)
                      : undefined;
                  const paymentStatusLabel =
                    paidAmt >= detailOrder.totalAmount ? 'فوري' : paidAmt > 0 ? 'جزئي' : 'آجل';

                  openQuotationInvoicePrint({
                    documentTitle: 'فاتورة شراء',
                    documentNumber: `#${detailOrder.id.slice(0, 8)}`,
                    quotationDate: new Date(detailOrder.date).toLocaleDateString('en-US'),
                    customerName: sup?.name || '—',
                    customerAddress: sup?.address || undefined,
                    customerPhone: sup?.phone || undefined,
                    currency,
                    rows: orderRows,
                    untaxedAmount: detailOrder.totalAmount.toLocaleString('en-US'),
                    discountAmount: detailOrder.discount
                      ? detailOrder.discount.toLocaleString('en-US')
                      : undefined,
                    taxPercent: '0',
                    total: detailOrder.totalAmount.toLocaleString('en-US'),
                    paidAmount: paidAmt.toLocaleString('en-US'),
                    remainingAmount: remaining.toLocaleString('en-US'),
                    companyName: settings.systemName,
                    salespersonName: detailOrder.buyerName || undefined,
                    salespersonPhone: detailOrder.buyerPhone || undefined,
                    warehouseName: wh?.name,
                    paymentMethodLabel,
                    paymentStatusLabel,
                    fileName: `فاتورة-شراء-${sup?.name || detailOrder.id}-${detailOrder.date.split('T')[0]}`,
                  });
                }}
              >
                طباعة
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">المورد</p>
                <p className="font-semibold">
                  {suppliers.find(s => s.id === detailOrder.supplierId)?.name || '—'}
                </p>
                <p className="text-xs text-slate-500">
                  {suppliers.find(s => s.id === detailOrder.supplierId)?.phone || '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">التاريخ</p>
                <p>{formatDateDMY(detailOrder.date)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">المخزن</p>
                <p className="font-semibold">
                  {warehouses.find(w => w.id === detailOrder.warehouseId)?.name || '—'}
                </p>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-600/30 pt-3">
              <p className="text-xs mb-2 text-slate-400">الأصناف</p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {detailOrder.items.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-sm">{prod?.name || '—'}</p>
                        <p className="text-[11px] text-gray-500">
                          كمية: {item.quantity} • سعر: {item.unitPrice.toLocaleString('en-US')}{' '}
                          {currency}
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
                  {detailOrder.totalAmount.toLocaleString('en-US')} {currency}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-xs text-gray-500">المدفوع</p>
                <p className="text-sm font-black text-emerald-600">
                  {detailOrder.paidAmount.toLocaleString('en-US')} {currency}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <p className="text-xs text-gray-500">المتبقي</p>
                <p className="text-sm font-black text-red-600">
                  {(detailOrder.totalAmount - detailOrder.paidAmount).toLocaleString('en-US')}{' '}
                  {currency}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog {...dialogProps} />
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditId(null); }} title={editId ? 'تعديل أوردر الشراء' : 'إنشاء أوردر شراء جديد'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="المورد *"
                  value={form.supplierId}
                  onChange={e => {
                    const id = e.target.value;
                    setForm({ ...form, supplierId: id });
                    const sup = suppliers.find(s => s.id === id);
                    setSupplierPhone(sup?.phone || '');
                  }}
                  options={suppliers.map(s => ({ value: s.id, label: s.name }))}
                  placeholder="اختر المورد"
                  searchable
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Plus size={12} />}
                onClick={() => {
                  setQuickSupplierForm({ name: '', phone: '', address: '' });
                  setShowAddSupplier(true);
                }}
              >
                مورد جديد
              </Button>
            </div>
            <Input
              label="هاتف المورد"
              value={supplierPhone}
              onChange={e => {
                const val = e.target.value;
                setSupplierPhone(val);
                if (form.supplierId) {
                  updateSupplier(form.supplierId, { phone: val });
                }
              }}
              placeholder="رقم الهاتف"
            />
            <Select
              label="المخزن *"
              value={form.warehouseId}
              onChange={e => setForm({ ...form, warehouseId: e.target.value })}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              placeholder="اختر المخزن"
              searchable
            />
            <Input
              label="اسم مسؤول الشراء"
              value={form.buyerName}
              onChange={e => setForm({ ...form, buyerName: e.target.value })}
            />
            <Input
              label="هاتف مسؤول الشراء"
              value={form.buyerPhone}
              onChange={e => setForm({ ...form, buyerPhone: e.target.value })}
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
              label="الخصم"
              type="number"
              value={form.discount}
              onChange={e => setForm({ ...form, discount: e.target.value })}
            />
            <Input
              label="التاريخ"
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>
          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">الأصناف</h4>
              <Button size="sm" variant="outline" icon={<Plus size={12} />} onClick={addItem}>إضافة صنف</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 rounded-lg ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                  <div className="col-span-5">
                    <Select
                      value={item.productId}
                      searchable
                      onChange={e => {
                        const prod = products.find(p => p.id === e.target.value);
                        updateItem(item.id, 'productId', e.target.value);
                        if (prod) {
                          const updated = items.map(i => i.id === item.id ? { ...i, productId: e.target.value, unitPrice: prod.costPrice, totalPrice: i.quantity * prod.costPrice } : i);
                          setItems(updated);
                        }
                      }}
                      options={products.map(p => ({ value: p.id, label: p.name }))}
                      placeholder="اختر منتج"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.quantity} placeholder="الكمية" onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={item.unitPrice} placeholder="السعر" onChange={e => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-bold text-brand-primary">{item.totalPrice.toLocaleString('en-US')}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded text-red-400 hover:bg-red-500/10"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl space-y-1 ${isDark ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-purple-50 border border-purple-100'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>المجموع قبل الخصم:</span>
              <span>{subtotal.toLocaleString('en-US')} {currency}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>الخصم:</span>
                <span className="text-red-400">{discount.toLocaleString('en-US')} {currency}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-black text-lg border-t border-brand-primary/30 pt-2 mt-1">
              <span>الإجمالي:</span>
              <span className="text-brand-primary">
                {totalAmount.toLocaleString('en-US')} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>المدفوع:</span>
              <span className="font-semibold">
                {previewPaidAmount.toLocaleString('en-US')} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>الحالة:</span>
              <span className="font-semibold">
                {previewStatusLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSave} className="flex-1 min-w-[120px]">حفظ الأوردر</Button>
            <Button icon={<Printer size={16} />} variant="outline" onClick={handlePrintInvoice} className="min-w-[100px]">طباعة</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1 min-w-[80px]">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAddSupplier} onClose={() => setShowAddSupplier(false)} title="إضافة مورد جديد">
        <div className="space-y-4">
          <Input label="اسم المورد *" value={quickSupplierForm.name} onChange={e => setQuickSupplierForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم المورد" />
          <Input label="رقم الهاتف" value={quickSupplierForm.phone} onChange={e => setQuickSupplierForm(f => ({ ...f, phone: e.target.value }))} placeholder="اختياري" />
          <Input label="العنوان" value={quickSupplierForm.address} onChange={e => setQuickSupplierForm(f => ({ ...f, address: e.target.value }))} placeholder="اختياري" />
          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                if (!quickSupplierForm.name.trim()) return;
                const newId = addSupplier(quickSupplierForm);
                setForm(prev => ({ ...prev, supplierId: newId }));
                setSupplierPhone(quickSupplierForm.phone || '');
                setQuickSupplierForm({ name: '', phone: '', address: '' });
                setShowAddSupplier(false);
              }}
            >
              إضافة واختيار
            </Button>
            <Button variant="ghost" onClick={() => { setShowAddSupplier(false); setQuickSupplierForm({ name: '', phone: '', address: '' }); }} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


