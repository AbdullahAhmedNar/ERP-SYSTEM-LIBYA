import { useState } from 'react';
import { Plus, Wrench, Search, CheckCircle, Truck, DollarSign, Eye, Pencil, Trash2, Printer } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, Select, Textarea, KpiCard, ActionsCell, ConfirmDialog, useConfirmDelete } from '../../components/UI';
import { openQuotationInvoicePrint } from '../../utils/printHelpers';

export default function AfterSalesPage() {
  const { afterSalesRequests, customers, products, generators, employees, addAfterSalesRequest, updateAfterSalesRequest, deleteAfterSalesRequest, settings } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const [form, setForm] = useState({
    customerId: '',
    productId: '',
    generatorId: '',
    reportDate: new Date().toISOString().split('T')[0],
    problemType: '',
    description: '',
    maintenanceCost: '',
    assignedTo: '',
    assignedPhone: '',
    notes: '',
    status: 'inspection' as 'inspection' | 'repaired' | 'delivered',
  });
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;

  const handleSave = () => {
    if (!form.customerId || !form.problemType) return;
    const cost = parseFloat(form.maintenanceCost) || 0;
    if (editId) {
      updateAfterSalesRequest(editId, {
        customerId: form.customerId,
        productId: form.productId || undefined,
        generatorId: form.generatorId || undefined,
        reportDate: form.reportDate,
        problemType: form.problemType,
        description: form.description || undefined,
        maintenanceCost: cost,
        assignedTo: form.assignedTo || undefined,
        assignedPhone: form.assignedPhone || undefined,
        notes: form.notes || undefined,
        status: form.status,
      });
      setEditId(null);
    } else {
      addAfterSalesRequest({
        customerId: form.customerId,
        productId: form.productId || undefined,
        generatorId: form.generatorId || undefined,
        reportDate: form.reportDate,
        problemType: form.problemType,
        description: form.description || undefined,
        maintenanceCost: cost,
        assignedTo: form.assignedTo || undefined,
        assignedPhone: form.assignedPhone || undefined,
        notes: form.notes || undefined,
        status: 'inspection',
      });
    }
    setForm({
      customerId: '',
      productId: '',
      generatorId: '',
      reportDate: new Date().toISOString().split('T')[0],
      problemType: '',
      description: '',
      maintenanceCost: '',
      assignedTo: '',
      assignedPhone: '',
      notes: '',
      status: 'inspection',
    });
    setShowAdd(false);
  };

  const startEdit = (row: typeof afterSalesRequests[0]) => {
    setEditId(row.id);
    setForm({
      customerId: row.customerId,
      productId: row.productId || '',
      generatorId: row.generatorId || '',
      reportDate: row.reportDate.split('T')[0],
      problemType: row.problemType,
      description: row.description || '',
      maintenanceCost: String(row.maintenanceCost || ''),
      assignedTo: row.assignedTo || '',
      assignedPhone: row.assignedPhone || '',
      notes: row.notes || '',
      status: row.status,
    });
    setShowAdd(true);
  };

  const statusColors: Record<string, 'warning'|'success'|'info'> = { inspection: 'warning', repaired: 'success', delivered: 'info' };
  const statusLabels: Record<string, string> = { inspection: 'جاري الفحص', repaired: 'تم الإصلاح', delivered: 'تم التسليم' };

  const handlePrintRequest = (row: typeof afterSalesRequests[0]) => {
    const cust = customers.find(c => c.id === row.customerId);
    const engineerFromStore = employees.find(e => e.id === row.assignedTo);
    const engineerName = engineerFromStore ? engineerFromStore.name : (row.assignedTo || undefined);
    const engineerPhone = row.assignedPhone || engineerFromStore?.phone;
    const formattedDate = formatDateDMY(row.reportDate);
    const costNumber = row.maintenanceCost || 0;
    const costStr = costNumber.toFixed(2);

    openQuotationInvoicePrint({
      documentTitle: 'فاتورة صيانة',
      documentNumber: '',
      quotationDate: formattedDate,
      customerName: cust?.name || 'عميل غير محدد',
      customerAddress: cust?.address || '',
      customerPhone: cust?.phone || '',
      customerEmail: cust?.email || '',
      currency,
      rows: [
        {
          productName: row.problemType || 'خدمة صيانة',
          quantity: 1,
          unitPrice: costStr,
          taxes: '0',
          amount: costStr,
        },
      ],
      untaxedAmount: costStr,
      taxPercent: '0',
      total: costStr,
      companyName: settings.systemName,
      companySubtitle: 'خدمة ما بعد البيع',
      salespersonName: engineerName,
      salespersonPhone: engineerPhone,
      paymentStatusLabel: statusLabels[row.status],
      footerPhone: settings.phone || '',
      footerEmail: settings.email || '',
      paidAmount: undefined,
      remainingAmount: undefined,
      mode: 'maintenance',
      maintenanceDescription: row.description,
      maintenanceNotes: row.notes,
    });
  };

  const columns = [
    { key: 'id', label: '#', render: (_row: typeof afterSalesRequests[0], index: number) => <span className="text-xs text-slate-400">{index + 1}</span> },
    { key: 'customer', label: 'العميل', render: (row: typeof afterSalesRequests[0]) => <span className="font-medium">{customers.find(c => c.id === row.customerId)?.name || '—'}</span> },
    { key: 'reportDate', label: 'تاريخ البلاغ', render: (row: typeof afterSalesRequests[0]) => formatDateDMY(row.reportDate) },
    { key: 'problemType', label: 'نوع المشكلة' },
    { key: 'maintenanceCost', label: 'التكلفة', render: (row: typeof afterSalesRequests[0]) => <span className="font-bold text-brand-primary">{row.maintenanceCost.toLocaleString('en-US')} {currency}</span> },
    { key: 'status', label: 'الحالة', render: (row: typeof afterSalesRequests[0]) => <Badge variant={statusColors[row.status]}>{statusLabels[row.status]}</Badge> },
    { key: 'actions', label: 'الإجراءات', render: (row: typeof afterSalesRequests[0]) => (
      <ActionsCell
        actions={[
          { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); setViewId(row.id); }, variant: 'view' },
          { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); startEdit(row); }, variant: 'edit' },
          { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmDelete({ title: 'حذف طلب الصيانة', message: 'سيتم حذف هذا الطلب نهائياً. هل أنت متأكد؟', itemName: customers.find(c => c.id === row.customerId)?.name || row.id, onConfirm: () => deleteAfterSalesRequest(row.id) }); }, variant: 'delete' },
        ]}
      />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">خدمة ما بعد البيع</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{afterSalesRequests.length} طلب صيانة</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>طلب صيانة جديد</Button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="جاري الفحص" value={afterSalesRequests.filter(r => r.status === 'inspection').length} icon={<Search size={20} />} color="amber" />
        <KpiCard title="تم الإصلاح" value={afterSalesRequests.filter(r => r.status === 'repaired').length} icon={<CheckCircle size={20} />} color="green" />
        <KpiCard title="تم التسليم" value={afterSalesRequests.filter(r => r.status === 'delivered').length} icon={<Truck size={20} />} color="blue" />
        <KpiCard title={`إجمالي التكاليف (${currency})`} value={afterSalesRequests.reduce((s, r) => s + r.maintenanceCost, 0).toLocaleString('en-US')} icon={<DollarSign size={20} />} color="purple" />
      </div>
      <Card title="طلبات الصيانة">
        <Table columns={columns} data={afterSalesRequests} emptyMessage="لا توجد طلبات صيانة" />
      </Card>
      <ConfirmDialog {...dialogProps} />
      {viewId && (() => {
        const row = afterSalesRequests.find(r => r.id === viewId);
        if (!row) return null;
        const cust = customers.find(c => c.id === row.customerId);
        const prod = row.productId ? products.find(p => p.id === row.productId) : null;
        const gen = row.generatorId ? generators.find(g => g.id === row.generatorId) : null;
        return (
          <Modal isOpen onClose={() => setViewId(null)} title="تفاصيل طلب الصيانة" size="lg">
            <div className="space-y-6">
              {/* Document header */}
              <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>طلب صيانة</p>
                </div>
                <Badge variant={statusColors[row.status]}>{statusLabels[row.status]}</Badge>
              </div>

              {/* Two-column info blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className={`rounded-xl p-4 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>معلومات الطلب</h4>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>تاريخ البلاغ</dt>
                      <dd className="font-semibold">{formatDateDMY(row.reportDate)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>نوع المشكلة</dt>
                      <dd className="font-semibold">{row.problemType}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>تكلفة الصيانة</dt>
                      <dd className="font-black text-brand-primary">{row.maintenanceCost.toLocaleString('en-US')} {currency}</dd>
                    </div>
                    {(row.assignedTo || row.assignedPhone) && (() => {
                      const eng = employees.find(e => e.id === row.assignedTo);
                      const name = eng ? eng.name : row.assignedTo;
                      const phone = row.assignedPhone || eng?.phone;
                      return (
                        <>
                          {name && (
                            <div className="flex justify-between gap-4">
                              <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>مسؤول الصيانة</dt>
                              <dd className="font-medium">{name}</dd>
                            </div>
                          )}
                          {phone && (
                            <div className="flex justify_between gap-4">
                              <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>هاتف المسؤول</dt>
                              <dd className="font-medium">{phone}</dd>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </dl>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل والجهاز</h4>
                  <dl className="space-y-2.5 text-sm">
                    <div>
                      <dt className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل</dt>
                      <dd className="font-bold mt-0.5">{cust?.name ?? '—'}</dd>
                    </div>
                    {prod && (
                      <div>
                        <dt className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المنتج</dt>
                        <dd className="font-medium mt-0.5">{prod.name}</dd>
                      </div>
                    )}
                    {gen && (
                      <div>
                        <dt className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المولد</dt>
                        <dd className="font-medium mt-0.5">{gen.serialNumber} — {gen.capacity}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {/* Order detail: description & notes */}
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>تفاصيل الطلب</h4>
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/[0.06]' : 'border-gray-200'}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={isDark ? 'bg-white/[0.06]' : 'bg-gray-100'}>
                        <th className={`text-right px-4 py-3 font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>البيان</th>
                        <th className={`text-right px-4 py-3 font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>المحتوى</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={isDark ? 'border-t border-white/[0.06]' : 'border-t border-gray-100'}>
                        <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الوصف</td>
                        <td className="px-4 py-3 font-medium">{row.description || '—'}</td>
                      </tr>
                      {row.notes && (
                        <tr className={isDark ? 'border-t border-white/[0.06]' : 'border-t border-gray-100'}>
                          <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ملاحظات</td>
                          <td className="px-4 py-3 font-medium">{row.notes}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals / actions */}
              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>إجمالي تكلفة الصيانة</p>
                  <p className="text-xl font-black text-brand-primary mt-0.5">{row.maintenanceCost.toLocaleString('en-US')} {currency}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Printer size={14} />}
                    onClick={() => handlePrintRequest(row)}
                  >
                    طباعة الفاتورة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Pencil size={14} />}
                    onClick={() => { setViewId(null); startEdit(row); setShowAdd(true); }}
                  >
                    تعديل الطلب
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditId(null); }} title={editId ? 'تعديل طلب الصيانة' : 'طلب صيانة جديد'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="العميل *" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}
              options={customers.map(c => ({ value: c.id, label: c.name }))} placeholder="اختر العميل" searchable />
            <Input label="تاريخ البلاغ" type="date" value={form.reportDate} onChange={e => setForm({ ...form, reportDate: e.target.value })} />
            <Select label="المنتج" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
              options={products.map(p => ({ value: p.id, label: p.name }))} placeholder="اختر منتج (اختياري)" searchable />
            <Select label="المولد" value={form.generatorId} onChange={e => setForm({ ...form, generatorId: e.target.value })}
              options={generators.map(g => ({ value: g.id, label: `${g.serialNumber} - ${g.capacity}` }))} placeholder="اختر مولد (اختياري)" searchable />
            <Input label="نوع المشكلة *" value={form.problemType} onChange={e => setForm({ ...form, problemType: e.target.value })} />
            <Input label="تكلفة الصيانة" type="number" value={form.maintenanceCost} onChange={e => setForm({ ...form, maintenanceCost: e.target.value })} />
            <Input label="المسؤول عن الإصلاح" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} />
            <Input label="هاتف مسؤول الإصلاح" value={form.assignedPhone} onChange={e => setForm({ ...form, assignedPhone: e.target.value })} />
            {editId && (
              <Select
                label="الحالة"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as 'inspection' | 'repaired' | 'delivered' })}
                options={[
                  { value: 'inspection', label: 'جاري الفحص' },
                  { value: 'repaired', label: 'تم الإصلاح' },
                  { value: 'delivered', label: 'تم التسليم' },
                ]}
                placeholder="تحديث الحالة"
              />
            )}
          </div>
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Textarea label="ملاحظات" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">حفظ الطلب</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


