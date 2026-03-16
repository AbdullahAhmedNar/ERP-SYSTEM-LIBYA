import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Zap, CheckCircle, AlertTriangle, Printer, Wrench, DollarSign, Pencil, Trash2, Eye, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, Select, Textarea, KpiCard, SearchBox, ConfirmDialog, useConfirmDelete, ActionsCell } from '../../components/UI';
import { openOdooStylePrint, openQuotationInvoicePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

export default function RentalsPage() {
  const { generators, rentalContracts, customers, addGenerator, updateGenerator, deleteGenerator, addRentalContract, updateRentalContract, deleteRentalContract, settings } = useStore();
  const [showAddGen, setShowAddGen] = useState(false);
  const [showAddContract, setShowAddContract] = useState(false);
  const [editGen, setEditGen] = useState<typeof generators[0] | null>(null);
  const [viewGen, setViewGen] = useState<typeof generators[0] | null>(null);
  const [editContract, setEditContract] = useState<typeof rentalContracts[0] | null>(null);
  const [viewContract, setViewContract] = useState<typeof rentalContracts[0] | null>(null);
  const [genForm, setGenForm] = useState({ serialNumber: '', capacity: '', brand: '', model: '', notes: '' });
  const [contractForm, setContractForm] = useState({
    customerId: '',
    generatorId: '',
    startDate: '',
    endDate: '',
    dailyRate: '',
    deposit: '',
    advancePayment: '',
    paymentMethod: 'cash' as PaymentMethod,
    notes: '',
  });
  const [genSearch, setGenSearch] = useState('');
  const [genFilter, setGenFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all');
  const [contractSearch, setContractSearch] = useState('');
  const [contractFilter, setContractFilter] = useState<'all' | 'active' | 'ended'>('all');
  const [searchParams, setSearchParams] = useSearchParams();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const editIdParam = searchParams.get('editContractId');
    if (editIdParam) {
      const rc = rentalContracts.find(r => r.id === editIdParam);
      if (rc) setEditContract({ ...rc });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, rentalContracts, setSearchParams]);
  const currency = settings.currency;
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
  const { confirmDelete: confirmGenDelete, dialogProps: genDeleteProps } = useConfirmDelete();
  const { confirmDelete: confirmContractDelete, dialogProps: contractDeleteProps } = useConfirmDelete();

  const handleAddGen = () => {
    if (!genForm.serialNumber || !genForm.capacity) return;
    addGenerator({
      serialNumber: genForm.serialNumber,
      capacity: genForm.capacity,
      brand: genForm.brand,
      model: genForm.model,
      notes: genForm.notes,
      status: 'available',
    });
    setGenForm({ serialNumber: '', capacity: '', brand: '', model: '', notes: '' });
    setShowAddGen(false);
  };

  const handleSaveGen = () => {
    if (!editGen) return;
    if (!editGen.capacity) return;
    updateGenerator(editGen.id, { serialNumber: editGen.serialNumber, capacity: editGen.capacity, brand: editGen.brand, model: editGen.model, notes: editGen.notes, status: editGen.status });
    setEditGen(null);
  };

  const handleSaveContract = () => {
    if (!editContract) return;
    updateRentalContract(editContract.id, { status: editContract.status });
    setEditContract(null);
  };

  const calcDays = () => {
    if (!contractForm.startDate || !contractForm.endDate) return 0;
    return Math.ceil((new Date(contractForm.endDate).getTime() - new Date(contractForm.startDate).getTime()) / (1000 * 60 * 60 * 24));
  };
  const calcTotal = () => calcDays() * (parseFloat(contractForm.dailyRate) || 0) + (parseFloat(contractForm.deposit) || 0);

  const handleAddContract = () => {
    if (!contractForm.customerId || !contractForm.generatorId || !contractForm.startDate || !contractForm.endDate || !contractForm.dailyRate) return;
    const gen = generators.find(g => g.id === contractForm.generatorId);
    const isRented = gen && getGeneratorEffectiveStatus(gen) === 'rented';
    if (isRented) { alert('هذا المولد مؤجر بالفعل!'); return; }
    addRentalContract({
      customerId: contractForm.customerId,
      generatorId: contractForm.generatorId,
      startDate: contractForm.startDate,
      endDate: contractForm.endDate,
      dailyRate: parseFloat(contractForm.dailyRate) || 0,
      deposit: parseFloat(contractForm.deposit) || 0,
      advancePayment: parseFloat(contractForm.advancePayment) || 0,
      totalDays: calcDays(),
      totalAmount: calcTotal(),
      paidAmount: parseFloat(contractForm.advancePayment) || 0,
      paymentMethod: (parseFloat(contractForm.advancePayment) || 0) > 0 ? contractForm.paymentMethod : undefined,
      status: 'active',
      notes: contractForm.notes,
    });
    setContractForm({ customerId: '', generatorId: '', startDate: '', endDate: '', dailyRate: '', deposit: '', advancePayment: '', paymentMethod: 'cash' as PaymentMethod, notes: '' });
    setShowAddContract(false);
  };

  const getGeneratorEffectiveStatus = (g: typeof generators[0]) => {
    const hasActiveContract = rentalContracts.some(rc => rc.generatorId === g.id && rc.status === 'active');
    if (hasActiveContract) return 'rented' as const;
    return g.status;
  };

  const genColumns = [
    { key: 'id', label: '#', render: (_row: typeof generators[0], index: number) => <span className="text-xs text-slate-400">{index + 1}</span> },
    {
      key: 'serialNumber',
      label: 'المولد',
      render: (row: typeof generators[0]) => (
        <span className="font-mono text-xs text-brand-primary">
          {row.serialNumber || '—'}
        </span>
      ),
    },
    {
      key: 'capacity',
      label: 'القدرة',
      render: (row: typeof generators[0]) => (
        <span className="font-semibold">
          {row.capacity || '—'}
        </span>
      ),
    },
    {
      key: 'brand',
      label: 'الماركة',
      render: (row: typeof generators[0]) => (
        <span className="text-sm">
          {row.brand || '—'}
        </span>
      ),
    },
    { key: 'status', label: 'الحالة', render: (row: typeof generators[0]) => {
      const status = getGeneratorEffectiveStatus(row);
      return (
        <Badge variant={status === 'available' ? 'success' : status === 'rented' ? 'warning' : 'danger'}>
          <span className="inline-flex items-center gap-1">
            {status === 'available' && <CheckCircle size={12} />}
            {status === 'rented' && <Zap size={12} />}
            {status === 'maintenance' && <Wrench size={12} />}
            <span>{status === 'available' ? 'متاح' : status === 'rented' ? 'مؤجر' : 'صيانة'}</span>
          </span>
        </Badge>
      );
    }},
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (row: typeof generators[0]) => (
        <ActionsCell
          actions={[
            { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); setViewGen(row); }, variant: 'view' },
            { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); setEditGen({ ...row }); }, variant: 'edit' },
            { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmGenDelete({ title: 'حذف المولد', message: 'سيتم حذف هذا المولد من النظام. إذا كان مؤجراً سيتم تحريره. هل أنت متأكد؟', itemName: row.serialNumber, onConfirm: () => deleteGenerator(row.id) }); }, variant: 'delete' },
          ]}
        />
      ),
    },
  ];

  const contractColumns = [
    { key: 'id', label: '#', render: (_row: typeof rentalContracts[0], index: number) => <span className="text-xs text-slate-400">{index + 1}</span> },
    { key: 'customer', label: 'العميل', render: (row: typeof rentalContracts[0]) => <span className="font-medium">{customers.find(c => c.id === row.customerId)?.name || '—'}</span> },
    { key: 'generator', label: 'المولد', render: (row: typeof rentalContracts[0]) => {
      const gen = generators.find(g => g.id === row.generatorId);
      return <span className="font-mono text-xs text-brand-primary">{gen?.serialNumber} - {gen?.capacity}</span>;
    }},
    { key: 'startDate', label: 'من', render: (row: typeof rentalContracts[0]) => formatDateDMY(row.startDate) },
    { key: 'endDate', label: 'إلى', render: (row: typeof rentalContracts[0]) => {
      const isExpiring = new Date(row.endDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      return (
        <span className={`flex items-center gap-1 ${row.status === 'active' && isExpiring ? 'text-red-400 font-bold' : ''}`}>
          {row.status === 'active' && isExpiring && <AlertTriangle size={12} />}
          {formatDateDMY(row.endDate)}
        </span>
      );
    }},
    { key: 'totalDays', label: 'الأيام', render: (row: typeof rentalContracts[0]) => <span>{row.totalDays} يوم</span> },
    { key: 'totalAmount', label: 'الإجمالي', render: (row: typeof rentalContracts[0]) => <span className="font-bold">{row.totalAmount.toLocaleString('en-US')} {currency}</span> },
    {
      key: 'paymentMethod',
      label: 'طريقة الدفع',
      render: (row: typeof rentalContracts[0]) =>
        row.paidAmount > 0 ? (() => {
          const meta = paymentMethodMeta(row.paymentMethod as PaymentMethod | undefined);
          return (
            <Badge variant={meta.variant}>
              <span className="inline-flex items-center gap-1">
                {meta.icon}
                <span>{meta.label}</span>
              </span>
            </Badge>
          );
        })() : <span className="text-xs text-slate-400">—</span>,
    },
    { key: 'status', label: 'الحالة', render: (row: typeof rentalContracts[0]) => (
      <Badge variant={row.status === 'active' ? 'success' : row.status === 'ended' ? 'neutral' : 'danger'}>
        {row.status === 'active' ? 'نشط' : row.status === 'ended' ? 'منتهي' : 'ملغي'}
      </Badge>
    )},
    { key: 'actions', label: 'الإجراءات', render: (row: typeof rentalContracts[0]) => {
      const cust = customers.find(c => c.id === row.customerId);
      const gen = generators.find(g => g.id === row.generatorId);
      return (
        <ActionsCell
          actions={[
            { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); setViewContract(row); }, variant: 'view' },
            { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); setEditContract({ ...row }); }, variant: 'edit' },
            { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation(); confirmContractDelete({ title: 'حذف العقد', message: 'سيتم حذف هذا العقد من النظام. إذا كان نشطاً سيتم تحرير المولد. هل أنت متأكد؟', itemName: `${cust?.name || '—'} - ${gen?.serialNumber || '—'}`, onConfirm: () => deleteRentalContract(row.id) }); }, variant: 'delete' },
          ]}
        />
      );
    }},
  ];

  const filteredGenerators = generators.filter(g => {
    const term = genSearch.trim().toLowerCase();
    const composite = `${g.capacity || ''} ${g.brand || ''} ${g.model || ''}`.toLowerCase();
    const matchSearch =
      !term ||
      g.serialNumber.toLowerCase().includes(term) ||
      composite.includes(term) ||
      (g.notes || '').toLowerCase().includes(term);
    const effectiveStatus = getGeneratorEffectiveStatus(g);
    const matchFilter = genFilter === 'all' || effectiveStatus === genFilter;
    return matchSearch && matchFilter;
  });

  const filteredContracts = rentalContracts.filter(rc => {
    const cust = customers.find(c => c.id === rc.customerId);
    const gen = generators.find(g => g.id === rc.generatorId);
    const matchSearch = !contractSearch.trim() ||
      (cust?.name || '').toLowerCase().includes(contractSearch.toLowerCase()) ||
      (gen?.serialNumber || '').toLowerCase().includes(contractSearch.toLowerCase()) ||
      (gen?.capacity || '').toLowerCase().includes(contractSearch.toLowerCase());
    const matchFilter = contractFilter === 'all' || rc.status === contractFilter;
    return matchSearch && matchFilter;
  });

  const stats = {
    totalGenerators: generators.length,
    activeContracts: rentalContracts.filter(rc => rc.status === 'active').length,
    endedContracts: rentalContracts.filter(rc => rc.status === 'ended').length,
    activeIncome: rentalContracts.filter(rc => rc.status === 'active').reduce((s, rc) => s + rc.totalAmount, 0),
    totalContractsAmount: rentalContracts.reduce((s, rc) => s + rc.totalAmount, 0),
    totalPaid: rentalContracts.reduce((s, rc) => s + rc.paidAmount, 0),
    totalRemaining: rentalContracts.reduce((s, rc) => s + (rc.totalAmount - rc.paidAmount), 0),
  };

  const handlePrintContracts = () => {
    const rows = rentalContracts
      .map(rc => {
        const cust = customers.find(c => c.id === rc.customerId);
        const gen = generators.find(g => g.id === rc.generatorId);
        const meta = rc.paidAmount > 0 ? paymentMethodMeta(rc.paymentMethod as PaymentMethod | undefined) : null;
        return `<tr>
  <td>${rc.id.slice(0, 8)}</td>
  <td>${cust?.name || '—'}</td>
  <td>${gen ? `${gen.serialNumber} - ${gen.capacity}` : '—'}</td>
  <td>${formatDateDMY(rc.startDate)}</td>
  <td>${formatDateDMY(rc.endDate)}</td>
  <td>${rc.totalDays} يوم</td>
  <td style="font-weight:600">${rc.totalAmount.toLocaleString('en-US')} ${currency}</td>
  <td>${meta ? meta.label : '—'}</td>
  <td>${rc.status === 'active' ? 'نشط' : rc.status === 'ended' ? 'منتهي' : 'ملغي'}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#العقد</th>
      <th>العميل</th>
      <th>المولد</th>
      <th>من</th>
      <th>إلى</th>
      <th>الأيام</th>
      <th>الإجمالي</th>
      <th>طريقة الدفع</th>
      <th>الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    const activeContracts = rentalContracts.filter(rc => rc.status === 'active');
    const totalIncome = rentalContracts.reduce((s, rc) => s + rc.totalAmount, 0);

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير عقود الإيجار',
      pageSubtitle: `عقود نشطة: ${activeContracts.length} من ${rentalContracts.length}`,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي عقود الإيجار (${currency})`,
          value: totalIncome.toLocaleString('en-US'),
          color: 'purple',
        },
        {
          label: `إيرادات العقود النشطة (${currency})`,
          value: stats.activeIncome.toLocaleString('en-US'),
          color: 'emerald',
        },
      ],
      statsText: `عدد المولدات: ${generators.length}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">تأجير المولدات</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{generators.length} مولد - {rentalContracts.filter(rc => rc.status === 'active').length} عقد نشط</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Zap size={14} />} onClick={() => setShowAddGen(true)}>إضافة مولد</Button>
          <Button icon={<Plus size={16} />} onClick={() => setShowAddContract(true)}>عقد إيجار جديد</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="عدد المولدات" value={stats.totalGenerators} icon={<Zap size={20} />} color="teal" />
        <KpiCard title="عقود إيجار نشطة" value={stats.activeContracts} icon={<CheckCircle size={20} />} color="green" />
        <KpiCard title="عقود إيجار منتهية" value={stats.endedContracts} icon={<Wrench size={20} />} color="purple" />
        <KpiCard title={`إجمالي قيمة عقود الإيجار (${currency})`} value={stats.totalContractsAmount.toLocaleString('en-US')} icon={<DollarSign size={20} />} color="purple" />
        <KpiCard title={`إجمالي المدفوع (${currency})`} value={stats.totalPaid.toLocaleString('en-US')} icon={<Wallet size={20} />} color="emerald" />
        <KpiCard title={`إجمالي المتبقي (${currency})`} value={stats.totalRemaining.toLocaleString('en-US')} icon={<AlertTriangle size={20} />} color="red" />
      </div>

      <Card title="المولدات">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBox value={genSearch} onChange={setGenSearch} placeholder="بحث بالاسم/البيان، الماركة، القدرة..." />
          <Select
            value={genFilter}
            onChange={e => setGenFilter(e.target.value as typeof genFilter)}
            options={[
              { value: 'all', label: 'الكل' },
              { value: 'available', label: 'متاح' },
              { value: 'rented', label: 'مؤجر' },
              { value: 'maintenance', label: 'في الصيانة' },
            ]}
            className="w-full sm:w-40"
          />
        </div>
        <Table columns={genColumns} data={filteredGenerators} emptyMessage="لا توجد مولدات مسجلة" />
      </Card>

      <Card title="عقود الإيجار" actions={<Button variant={isDark ? 'primary' : 'outline'} size="sm" icon={<Printer size={14} />} onClick={handlePrintContracts}>طباعة</Button>}>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchBox value={contractSearch} onChange={setContractSearch} placeholder="بحث بالعميل أو المولد..." />
          <Select
            value={contractFilter}
            onChange={e => setContractFilter(e.target.value as typeof contractFilter)}
            options={[
              { value: 'all', label: 'الكل' },
              { value: 'active', label: 'نشط' },
              { value: 'ended', label: 'منتهي' },
            ]}
            className="w-full sm:w-40"
          />
        </div>
        <Table columns={contractColumns} data={filteredContracts} emptyMessage="لا توجد عقود إيجار" />
      </Card>

      {/* View Rental Contract Details Modal */}
      <Modal
        isOpen={!!viewContract}
        onClose={() => setViewContract(null)}
        title="تفاصيل عقد الإيجار"
        size="md"
      >
        {viewContract && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-2 mb-4 pb-3 border-b border-slate-600/30">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer size={14} />}
                onClick={() => {
                  const cust = customers.find(c => c.id === viewContract.customerId);
                  const gen = generators.find(g => g.id === viewContract.generatorId);
                  const days = viewContract.totalDays;
                  const periodText = `${formatDateDMY(viewContract.startDate)} → ${formatDateDMY(viewContract.endDate)} (${days} يوم)`;

                  openQuotationInvoicePrint({
                    documentTitle: 'تفاصيل عقد إيجار مولد',
                    documentNumber: '',
                    quotationDate: formatDateDMY(viewContract.startDate),
                    customerName: cust?.name || '—',
                    customerAddress: cust?.address || '',
                    customerPhone: cust?.phone || '',
                    customerEmail: '',
                    currency,
                    rows: [
                      {
                        productName: gen ? `${gen.capacity} ${gen.brand || ''}`.trim() : 'مولد',
                        quantity: days,
                        unitPrice: viewContract.dailyRate.toLocaleString('en-US'),
                        taxes: '0.00',
                        amount: viewContract.totalAmount.toLocaleString('en-US'),
                      },
                    ],
                    untaxedAmount: viewContract.totalAmount.toLocaleString('en-US'),
                    discountAmount: undefined,
                    taxPercent: '0',
                    total: viewContract.totalAmount.toLocaleString('en-US'),
                    paidAmount: viewContract.paidAmount.toLocaleString('en-US'),
                    remainingAmount: (viewContract.totalAmount - viewContract.paidAmount).toLocaleString('en-US'),
                    companyName: settings.systemName,
                    companySubtitle: '',
                    footerPhone: '',
                    footerEmail: '',
                    salespersonName: '',
                    salespersonPhone: '',
                    warehouseName: '',
                    paymentMethodLabel: viewContract.paidAmount > 0 && viewContract.paymentMethod
                      ? (viewContract.paymentMethod === 'cash'
                        ? 'نقدي'
                        : viewContract.paymentMethod === 'bank_transfer'
                        ? 'تحويل مصرفي'
                        : 'بطاقة')
                      : '—',
                    paymentStatusLabel: viewContract.status === 'active' ? 'نشط' : viewContract.status === 'ended' ? 'منتهي' : 'ملغي',
                    mode: 'rental',
                    rentalGeneratorName: gen ? `${gen.capacity} ${gen.brand || ''}`.trim() : 'مولد',
                    rentalPeriodText: periodText,
                  });
                }}
              >
                طباعة
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-brand-primary">العميل</p>
                <p className={`mt-0.5 text-sm sm:text-base font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                  {customers.find(c => c.id === viewContract.customerId)?.name || '—'}
                </p>
                <p className={`text-xs sm:text-[13px] mt-0.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  {customers.find(c => c.id === viewContract.customerId)?.phone || '—'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] uppercase tracking-wide text-brand-primary">الحالة</p>
                <p className="mt-1">
                  <Badge variant={viewContract.status === 'active' ? 'success' : viewContract.status === 'ended' ? 'neutral' : 'danger'}>
                    <span className="text-xs font-semibold">
                      {viewContract.status === 'active' ? 'نشط' : viewContract.status === 'ended' ? 'منتهي' : 'ملغي'}
                    </span>
                  </Badge>
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-brand-primary">المولد</p>
                <p className={`mt-0.5 text-sm sm:text-base font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
                  {(() => {
                    const gen = generators.find(g => g.id === viewContract.generatorId);
                    return gen ? `${gen.capacity}${gen.brand ? ` - ${gen.brand}` : ''}` : '—';
                  })()}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-brand-primary mb-1">الفترة</p>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold ${
                  isDark ? 'bg-brand-primary/15 text-slate-100 border border-brand-primary/30' : 'bg-purple-50 text-purple-800 border border-purple-200'
                }`}>
                  <span>
                    من {formatDateDMY(viewContract.startDate)} إلى {formatDateDMY(viewContract.endDate)}
                  </span>
                  <span className={isDark ? 'text-brand-primary-light' : 'text-purple-600'}>
                    ({viewContract.totalDays} يوم)
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-600/30 pt-3">
              <p className="text-xs mb-2 text-slate-400">المبالغ</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <p className="text-xs text-gray-500">إجمالي العقد</p>
                  <p className="text-sm font-black text-brand-primary">
                    {viewContract.totalAmount.toLocaleString('en-US')} {currency}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-gray-500">المدفوع مقدماً</p>
                  <p className="text-sm font-black text-emerald-600">
                    {viewContract.paidAmount.toLocaleString('en-US')} {currency}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <p className="text-xs text-gray-500">المتبقي</p>
                  <p className="text-sm font-black text-red-600">
                    {(viewContract.totalAmount - viewContract.paidAmount).toLocaleString('en-US')} {currency}
                  </p>
                </div>
              </div>
            </div>

            {viewContract.notes && (
              <div className="mt-4">
                <div className={`rounded-xl p-3.5 ${isDark ? 'bg-brand-surface2 border border-white/10' : 'bg-purple-50 border border-purple-100'}`}>
                  <p className={`text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-purple-800'}`}>
                    ملاحظات العقد
                  </p>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                    {viewContract.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Generator Modal */}
      <Modal isOpen={showAddGen} onClose={() => setShowAddGen(false)} title="إضافة مولد جديد">
        <div className="space-y-5">
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            أدخل بيانات المولد كما ستظهر في جدول المولدات (رقم، قدرة، ماركة، موديل).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="الرقم التسلسلي *"
              value={genForm.serialNumber}
              onChange={e => setGenForm({ ...genForm, serialNumber: e.target.value })}
              placeholder="مثال: GEN-001 أو 125KVA-01"
            />
            <Input
              label="القدرة *"
              value={genForm.capacity}
              onChange={e => setGenForm({ ...genForm, capacity: e.target.value })}
              placeholder="مثال: 250 KVA"
            />
            <Input
              label="الماركة"
              value={genForm.brand}
              onChange={e => setGenForm({ ...genForm, brand: e.target.value })}
              placeholder="مثال: Perkins"
            />
            <Input
              label="الموديل"
              value={genForm.model}
              onChange={e => setGenForm({ ...genForm, model: e.target.value })}
              placeholder="مثال: 1104D-E44TAG2"
            />
          </div>
          <Textarea
            label="ملاحظات"
            value={genForm.notes}
            onChange={e => setGenForm({ ...genForm, notes: e.target.value })}
            placeholder="أي تفاصيل إضافية عن المولد أو حالته..."
          />
          <div className="flex gap-3 pt-1">
            <Button onClick={handleAddGen} className="flex-1">
              حفظ
            </Button>
            <Button variant="ghost" onClick={() => setShowAddGen(false)} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Generator Details Modal */}
      <Modal isOpen={!!viewGen} onClose={() => setViewGen(null)} title="تفاصيل المولد" size="lg">
        {viewGen && (
          <div className="space-y-6">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-brand-surface2 border border-white/[0.08]' : 'bg-gray-50 border border-gray-200'}`}>
              <h4 className="font-bold text-sm mb-3 text-brand-primary">بيانات المولد</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الرقم التسلسلي:</span> <span className="font-mono font-semibold">{viewGen.serialNumber}</span></div>
                <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>القدرة:</span> <span className="font-bold">{viewGen.capacity}</span></div>
                <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الماركة:</span> {viewGen.brand || '—'}</div>
                <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الموديل:</span> {viewGen.model || '—'}</div>
                <div className="col-span-2"><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الحالة:</span>{' '}
                  <Badge variant={getGeneratorEffectiveStatus(viewGen) === 'available' ? 'success' : getGeneratorEffectiveStatus(viewGen) === 'rented' ? 'warning' : 'danger'}>
                    {getGeneratorEffectiveStatus(viewGen) === 'available' ? 'متاح' : getGeneratorEffectiveStatus(viewGen) === 'rented' ? 'مؤجر' : 'في الصيانة'}
                  </Badge>
                </div>
                {viewGen.notes && <div className="col-span-2"><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ملاحظات:</span> {viewGen.notes}</div>}
              </div>
            </div>

            {getGeneratorEffectiveStatus(viewGen) === 'rented' && (() => {
              const contract = rentalContracts.find(rc => rc.generatorId === viewGen.id && rc.status === 'active');
              if (!contract) return null;
              const cust = customers.find(c => c.id === contract.customerId);
              const remaining = contract.totalAmount - contract.paidAmount;
              return (
                <div className={`rounded-xl p-4 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                  <h4 className="font-bold text-sm mb-3 text-amber-600 dark:text-amber-400">تفاصيل عقد الإيجار النشط</h4>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل:</span> <span className="font-semibold">{cust?.name || '—'}</span></div>
                      <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الهاتف:</span> {cust?.phone || '—'}</div>
                      <div className="col-span-2"><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العنوان:</span> {cust?.address || '—'}</div>
                    </div>
                    <div className={`border-t pt-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="grid grid-cols-2 gap-2">
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>من:</span> {formatDateDMY(contract.startDate)}</div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إلى:</span> {formatDateDMY(contract.endDate)}</div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>عدد الأيام:</span> {contract.totalDays} يوم</div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>سعر اليوم:</span> {contract.dailyRate.toLocaleString('en-US')} {currency}</div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الإجمالي:</span> <span className="font-bold">{contract.totalAmount.toLocaleString('en-US')} {currency}</span></div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المدفوع:</span> <span className="text-green-500 font-semibold">{contract.paidAmount.toLocaleString('en-US')} {currency}</span></div>
                        <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المتبقي:</span> <span className="text-red-500 font-semibold">{remaining.toLocaleString('en-US')} {currency}</span></div>
                      </div>
                    </div>
                    {contract.notes && <div><span className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ملاحظات العقد:</span> {contract.notes}</div>}
                  </div>
                </div>
              );
            })()}
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setViewGen(null)}>إغلاق</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Generator Modal */}
      <Modal isOpen={!!editGen} onClose={() => setEditGen(null)} title="تعديل المولد">
        {editGen && (
          <div className="space-y-4">
            <Input label="الرقم التسلسلي *" value={editGen.serialNumber} onChange={e => setEditGen({ ...editGen, serialNumber: e.target.value })} />
            <Input label="القدرة *" value={editGen.capacity} onChange={e => setEditGen({ ...editGen, capacity: e.target.value })} placeholder="مثال: 250 KVA" />
            <Input label="الماركة" value={editGen.brand || ''} onChange={e => setEditGen({ ...editGen, brand: e.target.value })} />
            <Input label="الموديل" value={editGen.model || ''} onChange={e => setEditGen({ ...editGen, model: e.target.value })} />
            <Select
              label="الحالة"
              value={editGen.status}
              onChange={e => setEditGen({ ...editGen, status: e.target.value as 'available' | 'rented' | 'maintenance' })}
              options={[
                { value: 'available', label: 'متاح' },
                { value: 'rented', label: 'مؤجر' },
                { value: 'maintenance', label: 'في الصيانة' },
              ]}
            />
            {getGeneratorEffectiveStatus(editGen) === 'rented' && (
              <p className={`text-xs ${isDark ? 'text-amber-400/90' : 'text-amber-600'}`}>
                عند تغيير الحالة إلى «متاح» سيتم إنهاء عقد الإيجار النشط تلقائياً وتحديث كلا الجدولين.
              </p>
            )}
            <Textarea label="ملاحظات" value={editGen.notes || ''} onChange={e => setEditGen({ ...editGen, notes: e.target.value })} />
            <div className="flex gap-3">
              <Button onClick={handleSaveGen} className="flex-1">حفظ التعديلات</Button>
              <Button variant="ghost" onClick={() => setEditGen(null)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Contract Modal */}
      <Modal isOpen={!!editContract} onClose={() => setEditContract(null)} title="تعديل العقد">
        {editContract && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل</p>
              <p className="font-medium">{customers.find(c => c.id === editContract.customerId)?.name || '—'}</p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المولد</p>
              <p className="font-mono text-sm text-brand-primary">{generators.find(g => g.id === editContract.generatorId)?.serialNumber} - {generators.find(g => g.id === editContract.generatorId)?.capacity}</p>
            </div>
            <Select
              label="الحالة"
              value={editContract.status}
              onChange={e => setEditContract({ ...editContract, status: e.target.value as 'active' | 'ended' | 'cancelled' })}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'ended', label: 'منتهي' },
                { value: 'cancelled', label: 'ملغي' },
              ]}
            />
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              عند تغيير الحالة إلى منتهي أو ملغي سيتم تحرير المولد تلقائياً.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleSaveContract} className="flex-1">حفظ التعديلات</Button>
              <Button variant="ghost" onClick={() => setEditContract(null)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Contract Modal */}
      <Modal isOpen={showAddContract} onClose={() => setShowAddContract(false)} title="إنشاء عقد إيجار جديد" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="العميل *" value={contractForm.customerId} onChange={e => setContractForm({ ...contractForm, customerId: e.target.value })}
              options={customers.map(c => ({ value: c.id, label: c.name }))} placeholder="اختر العميل" searchable />
            <Select label="المولد *" value={contractForm.generatorId} onChange={e => setContractForm({ ...contractForm, generatorId: e.target.value })}
              options={generators.filter(g => g.status === 'available').map(g => ({ value: g.id, label: `${g.serialNumber} - ${g.capacity}${g.brand ? ` (${g.brand})` : ''}` }))} placeholder="اختر المولد" searchable />
            <Input label="تاريخ البداية *" type="date" value={contractForm.startDate} onChange={e => setContractForm({ ...contractForm, startDate: e.target.value })} />
            <Input label="تاريخ النهاية *" type="date" value={contractForm.endDate} onChange={e => setContractForm({ ...contractForm, endDate: e.target.value })} />
            <Input label="سعر اليوم *" type="number" value={contractForm.dailyRate} onChange={e => setContractForm({ ...contractForm, dailyRate: e.target.value })} />
            <Input label="التأمين" type="number" value={contractForm.deposit} onChange={e => setContractForm({ ...contractForm, deposit: e.target.value })} />
            <Input label="الدفعة المقدمة" type="number" value={contractForm.advancePayment} onChange={e => setContractForm({ ...contractForm, advancePayment: e.target.value })} />
            <Select
              label="طريقة الدفع"
              value={contractForm.paymentMethod}
              onChange={e => setContractForm({ ...contractForm, paymentMethod: e.target.value as PaymentMethod })}
              options={[
                { value: 'cash', label: 'نقدي' },
                { value: 'bank_transfer', label: 'تحويل مصرفي' },
                { value: 'card', label: 'بطاقة' },
              ]}
              placeholder="اختر طريقة الدفع"
            />
          </div>
          
          {contractForm.startDate && contractForm.endDate && contractForm.dailyRate && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-purple-50 border border-purple-100'}`}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">عدد الأيام:</span>
                <span className="font-bold">{calcDays()} يوم</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">إيجار:</span>
                <span>{(calcDays() * parseFloat(contractForm.dailyRate || '0')).toLocaleString('en-US')} {currency}</span>
              </div>
              <div className="flex justify-between font-black text-lg border-t border-brand-primary/30 pt-2 mt-2">
                <span>الإجمالي:</span>
                <span className="text-brand-primary">{calcTotal().toLocaleString('en-US')} {currency}</span>
              </div>
            </div>
          )}
          
          <Textarea label="ملاحظات" value={contractForm.notes} onChange={e => setContractForm({ ...contractForm, notes: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleAddContract} className="flex-1">إنشاء العقد</Button>
            <Button variant="ghost" onClick={() => setShowAddContract(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...genDeleteProps} confirmLabel="حذف" />
      <ConfirmDialog {...contractDeleteProps} confirmLabel="حذف" />
    </div>
  );
}


