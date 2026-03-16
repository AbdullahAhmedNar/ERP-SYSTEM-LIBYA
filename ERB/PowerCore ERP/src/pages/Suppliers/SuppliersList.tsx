import { useState } from 'react';
import { Plus, Phone, Eye, Trash2, Pencil, TrendingDown, TrendingUp, Users, DollarSign, AlertCircle, ShoppingCart, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, KpiCard, SearchBox, ConfirmDialog, useConfirmDelete, ActionsCell } from '../../components/UI';

export default function SuppliersList() {
  const { suppliers, purchaseOrders, payments, returns, addSupplier, updateSupplier, deleteSupplier, settings, getDashboardStats } = useStore();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();
  const isDark = settings.theme === 'dark';
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const stats = getDashboardStats();

  const getSupplierBalance = (supplierId: string) => {
    const orders = purchaseOrders.filter(po => po.supplierId === supplierId);
    const supplierPays = payments.filter(p => p.type === 'supplier_payment' && p.entityId === supplierId);
    const supplierRets = returns.filter(r => r.type === 'purchase_return' && r.supplierId === supplierId);
    const total = orders.reduce((s, o) => s + o.totalAmount, 0);
    const paid = supplierPays.reduce((s, p) => s + p.amount, 0);
    const ret = supplierRets.reduce((s, r) => s + r.totalAmount, 0);
    return total - paid - ret;
  };

  const filtered = suppliers.filter(s => {
    const matchesText =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);

    const created = new Date(s.createdAt);
    const fromOk = !fromDate || created >= new Date(fromDate);
    const toOk = !toDate || created <= new Date(toDate + 'T23:59:59');

    return matchesText && fromOk && toOk;
  });
  const indexedSuppliers = filtered.map((s, idx) => ({ ...s, __index: idx + 1, __balance: getSupplierBalance(s.id) }));

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      updateSupplier(editId, { name: form.name, phone: form.phone, address: form.address });
      setEditId(null);
    } else {
      addSupplier(form);
    }
    setForm({ name: '', phone: '', address: '' });
    setShowAdd(false);
  };

  const startEdit = (s: typeof suppliers[0]) => {
    setForm({ name: s.name, phone: s.phone, address: s.address || '' });
    setEditId(s.id);
    setShowAdd(true);
  };

  const columns = [
    { key: 'index', label: '#', render: (row: any) => <span className="text-xs text-slate-400">{row.__index}</span> },
    { key: 'name', label: 'اسم المورد', render: (row: typeof suppliers[0] & { __index?: number }) => (
      <span className="font-medium">{row.name}</span>
    )},
    { key: 'phone', label: 'الهاتف', render: (row: typeof suppliers[0]) => (
      <div className="flex items-center gap-1 text-sm"><Phone size={12} className="text-slate-400" /> {row.phone}</div>
    )},
    {
      key: 'createdAt',
      label: 'تاريخ التسجيل',
      render: (row: typeof suppliers[0]) => (
        <span className="text-xs text-slate-500">
          {formatDateDMY(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'الرصيد',
      render: (row: typeof suppliers[0] & { __balance?: number }) => {
        const bal = row.__balance ?? row.balance;
        const absVal = Math.abs(bal);
        const label = bal > 0 ? 'علينا' : bal < 0 ? 'لنا' : 'صافي';
        const icon =
          bal > 0 ? (
            <TrendingUp size={14} className="text-red-400" />
          ) : bal < 0 ? (
            <TrendingDown size={14} className="text-green-400" />
          ) : null;
        const color =
          bal > 0 ? 'text-red-400' : bal < 0 ? 'text-green-400' : 'text-slate-400';
        const labelColor =
          bal > 0 ? 'text-red-500' : bal < 0 ? 'text-emerald-600' : 'text-slate-500';
        return (
          <div className="flex items-center gap-1">
            {icon}
            <span className={`font-bold text-sm ${color}`}>
              {absVal.toLocaleString('en-US')} {settings.currency}
              <span className={`mr-1.5 text-sm font-semibold ${labelColor}`}>({label})</span>
            </span>
          </div>
        );
      },
    },
    { key: 'actions', label: 'الإجراءات', render: (row: typeof suppliers[0]) => (
      <ActionsCell
        actions={[
          { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); navigate(`/suppliers/${row.id}`); }, variant: 'view' },
          { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); startEdit(row); }, variant: 'edit' },
          { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف المورد', message: 'سيتم حذف هذا المورد وجميع بياناته نهائياً. هل أنت متأكد؟', itemName: row.name, onConfirm: () => deleteSupplier(row.id) }); }, variant: 'delete' },
        ]}
      />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">إدارة الموردين</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{suppliers.length} مورد مسجل</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setEditId(null); setForm({ name: '', phone: '', address: '' }); setShowAdd(true); }}>إضافة مورد</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1fr] gap-4">
        <Card className="lg:col-span-1" title="الموردون (ذمم)" compact>
          <div className="grid grid-cols-2 gap-2">
            <div className="py-0">
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المستحق ({settings.currency})</p>
              <p className="text-base font-bold text-red-400 leading-tight">
                {stats.totalPayables.toLocaleString('en-US')} {settings.currency}
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عدد موردون بذمم مستحقة: {stats.suppliersWithPayablesCount}</p>
            </div>
            <div className="py-0">
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المبالغ لنا عند الموردين</p>
              <p className="text-base font-bold text-emerald-400 leading-tight">
                {stats.totalCreditFromSuppliers.toLocaleString('en-US')} {settings.currency}
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عددهم: {stats.suppliersWithCreditCount}</p>
            </div>
          </div>
        </Card>
        <KpiCard title="إجمالي الموردين" value={suppliers.length} icon={<Building2 size={20} />} color="purple" />
        <KpiCard
          title={`إجمالي المشتريات (${settings.currency})`}
          value={purchaseOrders.reduce((s, po) => s + po.totalAmount, 0).toLocaleString('en-US')}
          icon={<ShoppingCart size={20} />}
          color="teal"
        />
      </div>

      <Card>
        <div className="space-y-3">
          <SearchBox value={search} onChange={setSearch} placeholder="بحث بالاسم أو الهاتف..." />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Input
              label="من تاريخ إنشاء"
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
            <Input
              label="إلى تاريخ إنشاء"
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
          <Table
            columns={columns}
            data={indexedSuppliers}
            emptyMessage="لا يوجد موردون"
            onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
          />
        </div>
      </Card>

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditId(null); }} title={editId ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}>
        <div className="space-y-4">
          <Input label="اسم المورد *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="أدخل اسم المورد" />
          <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="اختياري" />
          <Input label="العنوان" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="العنوان" />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">{editId ? 'تحديث' : 'حفظ'}</Button>
            <Button variant="ghost" onClick={() => { setShowAdd(false); setEditId(null); }} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}


