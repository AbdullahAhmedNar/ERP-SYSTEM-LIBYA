import { useState } from 'react';
import { Plus, Package, AlertTriangle, ArrowLeftRight, Pencil, Trash2, DollarSign, Printer } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button, Card, Badge, Table, Modal, Input, Select, SearchBox, KpiCard, ConfirmDialog, useConfirmDelete, ActionsCell } from '../../components/UI';
import { openOdooStylePrint } from '../../utils/printHelpers';

export default function Products() {
  const { products, warehouses, addProduct, updateProduct, deleteProduct, transferStock, settings } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [transferForm, setTransferForm] = useState({ productId: '', fromWarehouse: '', toWarehouse: '', qty: '' });
  const [form, setForm] = useState({ code: '', name: '', type: 'sale' as 'sale'|'rental'|'both', salePrice: '', costPrice: '', rentalPricePerDay: '', minStock: '', warehouseId: '', quantity: '' });
  const isDark = settings.theme === 'dark';
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const currency = settings.currency;

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.includes(search));

  const handlePrintProducts = () => {
    if (filtered.length === 0) return;
    const rowsHtml = filtered.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${p.code}</td>
        <td>${p.name}</td>
        <td>${warehouses.find(w => w.id === p.warehouseId)?.name || '—'}</td>
        <td>${p.quantity.toLocaleString('en-US')}</td>
        <td>${p.costPrice.toLocaleString('en-US')}</td>
        <td>${(p.quantity * p.costPrice).toLocaleString('en-US')}</td>
      </tr>
    `).join('');

    const tableHtml = `<table class="odoo-report-table">
      <thead>
        <tr>
          <th>#</th>
          <th>الكود</th>
          <th>المنتج</th>
          <th>المخزن</th>
          <th>الكمية</th>
          <th>سعر التكلفة (${currency})</th>
          <th>إجمالي التكلفة (${currency})</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>`;

    const totalQty = filtered.reduce((s, p) => s + p.quantity, 0);
    const totalCostValue = filtered.reduce((s, p) => s + p.quantity * p.costPrice, 0);

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير المنتجات',
      pageSubtitle: undefined,
      tableHtml,
      summaryBlocks: [
        { label: 'عدد المنتجات في التقرير', value: filtered.length.toLocaleString('en-US') },
        { label: 'إجمالي الكمية', value: totalQty.toLocaleString('en-US') },
        { label: `إجمالي القيمة بالتكلفة (${currency})`, value: totalCostValue.toLocaleString('en-US') },
      ],
    });
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.warehouseId) return;
    const data = {
      code: form.code, name: form.name, type: form.type,
      salePrice: parseFloat(form.salePrice) || 0,
      costPrice: parseFloat(form.costPrice) || 0,
      rentalPricePerDay: parseFloat(form.rentalPricePerDay) || 0,
      minStock: parseInt(form.minStock) || 0,
      warehouseId: form.warehouseId,
      quantity: parseInt(form.quantity) || 0,
    };
    if (editId) { updateProduct(editId, data); setEditId(null); }
    else addProduct(data);
    setForm({ code: '', name: '', type: 'sale', salePrice: '', costPrice: '', rentalPricePerDay: '', minStock: '', warehouseId: '', quantity: '' });
    setShowAdd(false);
  };

  const startEdit = (p: typeof products[0]) => {
    setForm({
      code: p.code, name: p.name, type: p.type,
      salePrice: String(p.salePrice), costPrice: String(p.costPrice),
      rentalPricePerDay: String(p.rentalPricePerDay || ''),
      minStock: String(p.minStock), warehouseId: p.warehouseId,
      quantity: String(p.quantity),
    });
    setEditId(p.id);
    setShowAdd(true);
  };

  const handleTransfer = () => {
    const qty = parseInt(transferForm.qty);
    if (!transferForm.productId || !transferForm.fromWarehouse || !transferForm.toWarehouse || !qty) return;
    transferStock(transferForm.productId, transferForm.fromWarehouse, transferForm.toWarehouse, qty);
    setShowTransfer(false);
    setTransferForm({ productId: '', fromWarehouse: '', toWarehouse: '', qty: '' });
  };

  const whName = (wid: string) => warehouses.find(w => w.id === wid)?.name || '—';

  const columns = [
    {
      key: 'index',
      label: '#',
      width: '70px',
      headerClassName: `${isDark ? 'border-r border-white/20' : 'border-r border-gray-300'} text-center`,
      cellClassName: `${isDark ? 'border-r border-white/20' : 'border-r border-gray-300'} text-center`,
      render: (_row: typeof products[0], index: number) => (
        <span className="text-xs text-slate-400">{index + 1}</span>
      ),
    },
    {
      key: 'name',
      label: 'المنتج',
      render: (row: typeof products[0]) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-brand-primary flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">{row.name}</div>
            <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{whName(row.warehouseId)}</div>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'النوع', render: (row: typeof products[0]) => (
      <Badge variant={row.type === 'sale' ? 'info' : row.type === 'rental' ? 'warning' : 'success'}>
        {row.type === 'sale' ? 'بيع' : row.type === 'rental' ? 'تأجير' : 'بيع وتأجير'}
      </Badge>
    )},
    { key: 'quantity', label: 'الكمية', render: (row: typeof products[0]) => (
      <div className="flex items-center gap-2">
        <span className={`font-bold ${row.quantity <= row.minStock ? 'text-red-400' : 'text-green-400'}`}>{row.quantity}</span>
        {row.quantity <= row.minStock && row.minStock > 0 && <AlertTriangle size={12} className="text-yellow-400" />}
      </div>
    )},
    { key: 'salePrice', label: 'سعر البيع', render: (row: typeof products[0]) => <span className="font-semibold">{row.salePrice.toLocaleString('en-US')} {currency}</span> },
    { key: 'costPrice', label: 'سعر التكلفة', render: (row: typeof products[0]) => <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{row.costPrice.toLocaleString('en-US')} {currency}</span> },
    { key: 'actions', label: 'الإجراءات', render: (row: typeof products[0]) => (
      <ActionsCell
        actions={[
          { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); startEdit(row); }, variant: 'edit' },
          { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف المنتج', message: 'سيتم حذف هذا المنتج من النظام نهائياً. هل أنت متأكد؟', itemName: row.name, onConfirm: () => deleteProduct(row.id) }); }, variant: 'delete' },
        ]}
      />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">المنتجات</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{products.length} منتج مسجل</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isDark ? 'primary' : 'outline'}
            size="xs"
            icon={<Printer size={12} />}
            onClick={handlePrintProducts}
          >
            طباعة
          </Button>
          <Button variant="outline" icon={<ArrowLeftRight size={14} />} onClick={() => setShowTransfer(true)}>تحويل مخزن</Button>
          <Button icon={<Plus size={16} />} onClick={() => { setShowAdd(true); setEditId(null); setForm({ code: '', name: '', type: 'sale', salePrice: '', costPrice: '', rentalPricePerDay: '', minStock: '', warehouseId: '', quantity: '' }); }}>إضافة منتج</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KpiCard title="إجمالي المنتجات" value={products.length} icon={<Package size={20} />} color="teal" />
        <KpiCard title="منتجات منخفضة المخزون" value={products.filter(p => p.quantity <= p.minStock && p.minStock > 0).length} icon={<AlertTriangle size={20} />} color="amber" />
        <KpiCard title={`قيمة المخزون (${currency})`} value={products.reduce((s, p) => s + p.quantity * p.costPrice, 0).toLocaleString('en-US')} icon={<DollarSign size={20} />} color="purple" />
      </div>

      <Card>
        <SearchBox value={search} onChange={setSearch} placeholder="بحث بالاسم..." />
        <Table columns={columns} data={filtered} emptyMessage="لا توجد منتجات" />
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editId ? 'تعديل منتج' : 'إضافة منتج جديد'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="كود المنتج *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          <Input label="اسم المنتج *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select
            label="النوع"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value as 'sale'|'rental'|'both' })}
            options={[{ value: 'sale', label: 'للبيع' }, { value: 'rental', label: 'للتأجير' }, { value: 'both', label: 'بيع وتأجير' }]}
            searchable
          />
          <Select
            label="المخزن *"
            value={form.warehouseId}
            onChange={e => setForm({ ...form, warehouseId: e.target.value })}
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            placeholder="اختر المخزن"
            searchable
          />
          <Input label="سعر البيع" type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
          <Input label="سعر التكلفة" type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} />
          {(form.type === 'rental' || form.type === 'both') && (
            <Input label="سعر الإيجار/يوم" type="number" value={form.rentalPricePerDay} onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })} />
          )}
          <Input label="الحد الأدنى للمخزن" type="number" value={form.minStock} onChange={e => setForm({ ...form, minStock: e.target.value })} />
          <Input label="الكمية الحالية" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">حفظ</Button>
          <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">إلغاء</Button>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal isOpen={showTransfer} onClose={() => setShowTransfer(false)} title="تحويل بين المخازن">
        <div className="space-y-4">
          <Select
            label="المنتج"
            value={transferForm.productId}
            onChange={e => setTransferForm({ ...transferForm, productId: e.target.value })}
            options={products.map(p => ({ value: p.id, label: `${p.name} (${p.quantity})` }))}
            placeholder="اختر منتج"
            searchable
          />
          <Select
            label="من مخزن"
            value={transferForm.fromWarehouse}
            onChange={e => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
            placeholder="اختر المخزن"
            searchable
          />
          <Select
            label="إلى مخزن"
            value={transferForm.toWarehouse}
            onChange={e => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
            options={warehouses.filter(w => w.id !== transferForm.fromWarehouse).map(w => ({ value: w.id, label: w.name }))}
            placeholder="اختر المخزن"
            searchable
          />
          <Input label="الكمية" type="number" value={transferForm.qty} onChange={e => setTransferForm({ ...transferForm, qty: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleTransfer} className="flex-1">تحويل</Button>
            <Button variant="ghost" onClick={() => setShowTransfer(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}


