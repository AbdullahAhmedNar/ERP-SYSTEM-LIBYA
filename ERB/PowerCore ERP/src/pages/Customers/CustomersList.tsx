import { useState } from 'react';
import { Plus, Eye, Trash2, Pencil, Users, DollarSign, Building2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, KpiCard, SearchBox, ConfirmDialog, useConfirmDelete, ActionsCell } from '../../components/UI';

export default function CustomersList() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, saleInvoices, settings, getDashboardStats } = useStore();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();
  const isDark = settings.theme === 'dark';
  const { confirmDelete, dialogProps } = useConfirmDelete();

  const filtered = customers.filter(c => {
    const matchesText =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const created = new Date(c.createdAt);
    const fromOk = !fromDate || created >= new Date(fromDate);
    const toOk = !toDate || created <= new Date(toDate + 'T23:59:59');

    return matchesText && fromOk && toOk;
  });
  const indexedCustomers = filtered.map((c, idx) => ({ ...c, __index: idx + 1 }));

  const handleSave = () => {
    if (!form.name) return;
    if (editId) {
      updateCustomer(editId, { name: form.name, phone: form.phone, address: form.address });
      setEditId(null);
    } else {
      addCustomer(form);
    }
    setForm({ name: '', phone: '', address: '' });
    setShowAdd(false);
  };

  const startEdit = (c: typeof customers[0]) => {
    setForm({ name: c.name, phone: c.phone, address: c.address || '' });
    setEditId(c.id);
    setShowAdd(true);
  };

  const getOrderCount = (cid: string) => saleInvoices.filter(si => si.customerId === cid).length;

  const columns = [
    { key: 'index', label: '#', render: (row: any) => <span className="text-xs text-slate-400">{row.__index}</span> },
    { key: 'name', label: 'العميل', render: (row: typeof customers[0] & { __index?: number }) => (
      <div>
        <div className="font-medium text-sm">{row.name}</div>
        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{row.phone}</div>
      </div>
    )},
    {
      key: 'createdAt',
      label: 'تاريخ التسجيل',
      render: (row: typeof customers[0]) => (
        <span className="text-xs text-slate-500">
          {formatDateDMY(row.createdAt)}
        </span>
      ),
    },
    { key: 'orders', label: 'الأوردرات', render: (row: typeof customers[0]) => (
      <Badge variant="info">{getOrderCount(row.id)}</Badge>
    )},
    {
      key: 'balance',
      label: 'الرصيد',
      render: (row: typeof customers[0]) => {
        const bal = row.balance;
        const absVal = Math.abs(bal);
        const label = bal > 0 ? 'مدين' : bal < 0 ? 'علينا' : 'صافي';
        const color =
          bal > 0 ? 'text-red-400' : bal < 0 ? 'text-green-400' : 'text-slate-400';
        const labelColor =
          bal > 0 ? 'text-red-500' : bal < 0 ? 'text-emerald-600' : 'text-slate-500';
        return (
          <span className={`font-bold text-sm ${color}`}>
            {absVal.toLocaleString('en-US')} {settings.currency}
            <span className={`mr-1.5 text-sm font-semibold ${labelColor}`}>({label})</span>
          </span>
        );
      },
    },
    { key: 'actions', label: 'الإجراءات', render: (row: typeof customers[0]) => (
      <ActionsCell
        actions={[
          { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); navigate(`/customers/${row.id}`); }, variant: 'view' },
          { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); startEdit(row); }, variant: 'edit' },
          { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف العميل', message: 'سيتم حذف هذا العميل وجميع بياناته نهائياً. هل أنت متأكد؟', itemName: row.name, onConfirm: () => deleteCustomer(row.id) }); }, variant: 'delete' },
        ]}
      />
    )},
  ];

  const totalReceivables = customers.filter(c => c.balance > 0).reduce((s, c) => s + c.balance, 0);
  const stats = getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">إدارة العملاء</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{customers.length} عميل مسجل</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setEditId(null); setForm({ name: '', phone: '', address: '' }); setShowAdd(true); }}>إضافة عميل</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr,1fr] gap-4">
        <Card className="lg:col-span-1" title="العملاء (ذمم)" compact>
          <div className="grid grid-cols-2 gap-2">
            <div className="py-0">
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المستحق ({settings.currency})</p>
              <p className="text-base font-bold text-red-400 leading-tight">
                {totalReceivables.toLocaleString('en-US')} {settings.currency}
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عدد عملاء بذمم مستحقة: {stats.customersWithReceivablesCount}</p>
            </div>
            <div className="py-0">
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي المبالغ للعملاء علينا</p>
              <p className="text-base font-bold text-emerald-400 leading-tight">
                {stats.totalCreditToCustomers.toLocaleString('en-US')} {settings.currency}
              </p>
              <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>عددهم: {stats.customersWithCreditCount}</p>
            </div>
          </div>
        </Card>
        <KpiCard title="إجمالي العملاء" value={customers.length} icon={<Building2 size={20} />} color="blue" />
        <KpiCard
          title={`إجمالي المبيعات (${settings.currency})`}
          value={saleInvoices.reduce((s, si) => s + si.totalAmount, 0).toLocaleString('en-US')}
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
            data={indexedCustomers}
            emptyMessage="لا يوجد عملاء"
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
          />
        </div>
      </Card>

      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditId(null); }} title={editId ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}>
        <div className="space-y-4">
          <Input label="اسم العميل *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="اختياري" />
          <Input label="العنوان" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">{editId ? 'تحديث' : 'حفظ'}</Button>
            <Button variant="ghost" onClick={() => { setShowAdd(false); setEditId(null); }} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}


