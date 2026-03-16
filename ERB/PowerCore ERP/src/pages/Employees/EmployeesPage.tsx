import { useState } from 'react';
import { Plus, UserCog, DollarSign, Pencil, Trash2, Printer, Users, TrendingUp, Wallet, Eye, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Button, Card, Badge, Table, Modal, Input, Select, Textarea, KpiCard, SearchBox, ConfirmDialog, useConfirmDelete, ActionsCell } from '../../components/UI';
import { openOdooStylePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

export default function EmployeesPage() {
  const {
    employees,
    salaryPayments,
    employeeLoans,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addSalaryPayment,
    deleteSalaryPayment,
    addEmployeeLoan,
    settings,
  } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSalary, setShowSalary] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    loanBalance: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
    address: '',
    nationalId: '',
    notes: '',
  });
  const [salaryForm, setSalaryForm] = useState({
    employeeId: '',
    month: '',
    paymentMethod: 'cash' as PaymentMethod,
    bonuses: '',
    deductions: '',
    notes: '',
  });
  const [advanceForm, setAdvanceForm] = useState({ employeeId: '', amount: '', notes: '' });
  const isDark = settings.theme === 'dark';
  const { confirmDelete, dialogProps } = useConfirmDelete();
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

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.position.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name || !form.position || !form.department) return;
    const data = {
      ...form,
      salary: parseFloat(form.salary) || 0,
      loanBalance: form.loanBalance === '' ? undefined : parseFloat(form.loanBalance) || 0,
    };
    if (editId) {
      updateEmployee(editId, data);
      setEditId(null);
    } else {
      addEmployee(data);
    }
    resetForm();
    setShowAdd(false);
  };

  const resetForm = () =>
    setForm({
      name: '',
      phone: '',
      email: '',
      position: '',
      department: '',
      salary: '',
      loanBalance: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      address: '',
      nationalId: '',
      notes: '',
    });

  const startEdit = (e: typeof employees[0]) => {
    setForm({
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      position: e.position,
      department: e.department,
      salary: String(e.salary),
      loanBalance: e.loanBalance !== undefined ? String(e.loanBalance) : '',
      startDate: e.startDate,
      status: e.status,
      address: e.address || '',
      nationalId: e.nationalId || '',
      notes: e.notes || '',
    });
    setEditId(e.id);
    setShowAdd(true);
  };

  const handleAdvanceSave = () => {
    const emp = employees.find(e => e.id === advanceForm.employeeId);
    const amount = parseFloat(advanceForm.amount);
    if (!emp || !amount || amount <= 0) return;
    addEmployeeLoan({
      employeeId: emp.id,
      amount,
      type: 'advance',
      date: new Date().toISOString(),
      notes: advanceForm.notes,
    });
    setAdvanceForm({ employeeId: '', amount: '', notes: '' });
    setShowAdvance(false);
  };

  const handleSalaryPay = () => {
    const emp = employees.find(e => e.id === salaryForm.employeeId);
    if (!emp || !salaryForm.month) return;
    const bonuses = parseFloat(salaryForm.bonuses) || 0;
    const deductions = parseFloat(salaryForm.deductions) || 0;
    const netSalary = emp.salary + bonuses - deductions;
    addSalaryPayment({
      employeeId: salaryForm.employeeId,
      amount: emp.salary,
      month: salaryForm.month,
      bonuses,
      deductions,
      netSalary,
      paymentMethod: salaryForm.paymentMethod,
      paidAt: new Date().toISOString(),
      notes: salaryForm.notes,
    });
    setSalaryForm({ employeeId: '', month: '', paymentMethod: 'cash' as PaymentMethod, bonuses: '', deductions: '', notes: '' });
    setShowSalary(false);
  };

  const getLastSalary = (empId: string) => {
    const payments = salaryPayments.filter(sp => sp.employeeId === empId);
    if (payments.length === 0) return null;
    return payments[payments.length - 1];
  };

  const getTotalSalariesThisMonth = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return salaryPayments.filter(sp => sp.month.startsWith(thisMonth)).reduce((s, sp) => s + sp.netSalary, 0);
  };

  const departments = [...new Set(employees.map(e => e.department))];

  const columns = [
    {
      key: 'index',
      label: '#',
      render: (_row: typeof employees[0], index: number) => (
        <span className="text-xs text-slate-400">{index + 1}</span>
      ),
    },
    {
      key: 'name',
      label: 'الموظف',
      render: (row: typeof employees[0]) => (
        <div>
          <div className="font-semibold text-sm">{row.name}</div>
          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'position',
      label: 'الوظيفة',
      render: (row: typeof employees[0]) => (
        <div>
          <div className="text-sm font-medium">{row.position}</div>
          <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'salary',
      label: 'الراتب',
      render: (row: typeof employees[0]) => (
        <span className="font-bold text-brand-primary">
          {row.salary.toLocaleString('en-US')} {currency}
        </span>
      ),
    },
    {
      key: 'loan',
      label: 'السلفة',
      render: (row: typeof employees[0]) => {
        const balance = row.loanBalance ?? 0;
        if (!balance) {
          return <span className="text-xs text-slate-400">صفر</span>;
        }
        return (
          <span className="text-xs font-semibold text-amber-500">
            {balance.toLocaleString('en-US')} {currency}
          </span>
        );
      },
    },
    { key: 'startDate', label: 'تاريخ التعيين', render: (row: typeof employees[0]) => formatDateDMY(row.startDate) },
    { key: 'lastSalary', label: 'آخر راتب', render: (row: typeof employees[0]) => {
      const last = getLastSalary(row.id);
      return last ? <span className="text-xs text-green-400">{last.month}</span> : <span className="text-xs text-slate-500">لم يُصرف</span>;
    }},
    { key: 'status', label: 'الحالة', render: (row: typeof employees[0]) => (
      <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>{row.status === 'active' ? 'نشط' : 'غير نشط'}</Badge>
    )},
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (row: typeof employees[0]) => (
        <ActionsCell
          actions={[
            {
              icon: Eye,
              label: 'كشف الموظف',
              onClick: (e) => {
                e.stopPropagation();
                setViewEmployeeId(row.id);
              },
              variant: 'view',
            },
            {
              icon: DollarSign,
              label: 'صرف راتب',
              onClick: (e) => {
                e.stopPropagation();
                setSelectedEmpId(row.id);
                setSalaryForm({ ...salaryForm, employeeId: row.id });
                setShowSalary(true);
              },
              variant: 'success',
            },
            {
              icon: Pencil,
              label: 'تعديل',
              onClick: (e) => {
                e.stopPropagation();
                startEdit(row);
              },
              variant: 'edit',
            },
            {
              icon: Trash2,
              label: 'حذف',
              onClick: (e) => {
                e.stopPropagation();
                confirmDelete({
                  title: 'حذف الموظف',
                  message: 'سيتم حذف هذا الموظف وجميع بياناته نهائياً. هل أنت متأكد؟',
                  itemName: row.name,
                  onConfirm: () => deleteEmployee(row.id),
                });
              },
              variant: 'delete',
            },
          ]}
        />
      ),
    },
  ];

  const [viewSalaryId, setViewSalaryId] = useState<string | null>(null);
  const [viewEmployeeId, setViewEmployeeId] = useState<string | null>(null);
  const [salarySearch, setSalarySearch] = useState('');
  const salaryHistoryColumns = [
    { key: 'employee', label: 'الموظف', render: (row: typeof salaryPayments[0]) => <span className="font-medium">{employees.find(e => e.id === row.employeeId)?.name || '—'}</span> },
    { key: 'month', label: 'الشهر', width: '140px', render: (row: typeof salaryPayments[0]) => row.month },
    { key: 'amount', label: 'الراتب الأساسي', render: (row: typeof salaryPayments[0]) => `${row.amount.toLocaleString('en-US')} ${currency}` },
    { key: 'bonuses', label: 'مكافآت', render: (row: typeof salaryPayments[0]) => <span className="text-green-400">+{row.bonuses.toLocaleString('en-US')}</span> },
    { key: 'deductions', label: 'خصومات', render: (row: typeof salaryPayments[0]) => <span className="text-red-400">-{row.deductions.toLocaleString('en-US')}</span> },
    { key: 'netSalary', label: 'الصافي', render: (row: typeof salaryPayments[0]) => <span className="font-black text-brand-primary">{row.netSalary.toLocaleString('en-US')} {currency}</span> },
    { key: 'paidAt', label: 'تاريخ الصرف', render: (row: typeof salaryPayments[0]) => formatDateDMY(row.paidAt) },
    {
      key: 'paymentMethod',
      label: 'طريقة الصرف',
      render: (row: typeof salaryPayments[0]) => {
        const meta = paymentMethodMeta(row.paymentMethod as PaymentMethod | undefined);
        return (
          <Badge variant={meta.variant}>
            <span className="inline-flex items-center gap-1">
              {meta.icon}
              <span>{meta.label}</span>
            </span>
          </Badge>
        );
      },
    },
    { key: 'actions', label: 'الإجراءات', render: (row: typeof salaryPayments[0]) => (
      <ActionsCell
        actions={[
          { icon: Eye, label: 'عرض التفاصيل', onClick: (e) => { e.stopPropagation(); setViewSalaryId(row.id); }, variant: 'view' },
          { icon: Trash2, label: 'حذف', onClick: (e) => { e.stopPropagation();
            confirmDelete({
              title: 'حذف صرف الراتب',
              message: 'سيتم حذف سجل صرف الراتب نهائياً. هل أنت متأكد؟',
              itemName: 'صرف راتب',
              onConfirm: () => deleteSalaryPayment(row.id),
            });
          }, variant: 'delete' },
        ]}
      />
    )},
  ];

  const salaryFiltered = [...salaryPayments]
    .reverse()
    .filter((sp) => {
      if (!salarySearch.trim()) return true;
      const term = salarySearch.toLowerCase();
      const emp = employees.find((e) => e.id === sp.employeeId);
      const name = emp?.name.toLowerCase() || '';
      return (
        name.includes(term) ||
        sp.month.toLowerCase().includes(term) ||
        (sp.notes || '').toLowerCase().includes(term)
      );
    });

  const handlePrint = () => {
    const rows = filtered
      .map(e => {
        const last = getLastSalary(e.id);
        return `<tr>
  <td>${e.name}</td>
  <td>${e.position}</td>
  <td>${e.department}</td>
  <td style="font-weight:600">${e.salary.toLocaleString('en-US')} ${currency}</td>
  <td>${formatDateDMY(e.startDate)}</td>
  <td>${last ? last.month : 'لم يُصرف'}</td>
  <td>${e.status === 'active' ? 'نشط' : 'غير نشط'}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>الموظف</th>
      <th>الوظيفة</th>
      <th>القسم</th>
      <th>الراتب (${currency})</th>
      <th>تاريخ التعيين</th>
      <th>آخر راتب</th>
      <th>الحالة</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    const totalBaseSalaries = employees
      .filter(e => e.status === 'active')
      .reduce((s, e) => s + e.salary, 0);
    const paidThisMonth = getTotalSalariesThisMonth();

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير بيانات الموظفين',
      pageSubtitle: undefined,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي الرواتب الأساسية (${currency})`,
          value: totalBaseSalaries.toLocaleString('en-US'),
          color: 'purple',
        },
        {
          label: `الرواتب المصروفة هذا الشهر (${currency})`,
          value: paidThisMonth.toLocaleString('en-US'),
          color: 'emerald',
        },
      ],
      statsText: `عدد الموظفين في التقرير: ${filtered.length}`,
    });
  };

  const handlePrintSalaryHistory = () => {
    if (salaryPayments.length === 0) return;

    const rows = [...salaryPayments]
      .sort((a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime())
      .map((sp, index) => {
        const emp = employees.find(e => e.id === sp.employeeId);
        const meta = paymentMethodMeta(sp.paymentMethod as PaymentMethod | undefined);
        const [year, month] = sp.month.split('-');
        const monthDisplay = month && year ? `${month}-${year}` : sp.month;
        return `<tr>
  <td style="text-align:center">${index + 1}</td>
  <td>${emp?.name || '—'}</td>
  <td style="direction:ltr;unicode-bidi:embed;white-space:nowrap;">${monthDisplay}</td>
  <td>${sp.amount.toLocaleString('en-US')} ${currency}</td>
  <td style="color:#16a34a;">+${sp.bonuses.toLocaleString('en-US')}</td>
  <td style="color:#dc2626;">-${sp.deductions.toLocaleString('en-US')}</td>
  <td style="font-weight:700;">${sp.netSalary.toLocaleString('en-US')} ${currency}</td>
  <td style="direction:ltr;unicode-bidi:embed;white-space:nowrap;">${formatDateDMY(sp.paidAt)}</td>
  <td>${meta.label}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#</th>
      <th>الموظف</th>
      <th style="min-width:90px;white-space:nowrap;">الشهر</th>
      <th>الراتب الأساسي (${currency})</th>
      <th>مكافآت</th>
      <th>خصومات</th>
      <th>الصافي (${currency})</th>
      <th>تاريخ الصرف</th>
      <th>طريقة الصرف</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    const totalBase = salaryPayments.reduce((s, sp) => s + sp.amount, 0);
    const totalBonuses = salaryPayments.reduce((s, sp) => s + sp.bonuses, 0);
    const totalDeductions = salaryPayments.reduce((s, sp) => s + sp.deductions, 0);
    const totalNet = salaryPayments.reduce((s, sp) => s + sp.netSalary, 0);

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'سجل صرف الرواتب',
      pageSubtitle: undefined,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي الرواتب الأساسية (${currency})`,
          value: totalBase.toLocaleString('en-US'),
          color: 'purple',
        },
        {
          label: `إجمالي المكافآت (${currency})`,
          value: totalBonuses.toLocaleString('en-US'),
          color: 'emerald',
        },
        {
          label: `إجمالي الخصومات (${currency})`,
          value: totalDeductions.toLocaleString('en-US'),
          color: 'red',
        },
        {
          label: `إجمالي الصافي (${currency})`,
          value: totalNet.toLocaleString('en-US'),
          color: 'purple',
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">إدارة الموظفين</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{employees.filter(e => e.status === 'active').length} موظف نشط</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isDark ? 'primary' : 'outline'}
            size="sm"
            icon={<Printer size={14} />}
            onClick={handlePrint}
          >
            طباعة
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<DollarSign size={14} />}
            onClick={() => {
              setAdvanceForm({ employeeId: '', amount: '', notes: '' });
              setShowAdvance(true);
            }}
          >
            تسجيل سلفة
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              resetForm();
              setEditId(null);
              setShowAdd(true);
            }}
          >
            إضافة موظف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="إجمالي الموظفين" value={employees.length} icon={<Users size={20} />} color="purple" />
        <KpiCard title="موظفون نشطون" value={employees.filter(e => e.status === 'active').length} icon={<UserCog size={20} />} color="green" />
        <KpiCard title={`الرواتب الشهرية (${currency})`} value={employees.filter(e => e.status === 'active').reduce((s, e) => s + e.salary, 0).toLocaleString('en-US')} icon={<TrendingUp size={20} />} color="teal" />
        <KpiCard title={`رواتب هذا الشهر (${currency})`} value={getTotalSalariesThisMonth().toLocaleString('en-US')} icon={<Wallet size={20} />} color="amber" />
      </div>

      <Card title="قائمة الموظفين">
        <SearchBox value={search} onChange={setSearch} placeholder="بحث بالاسم أو الوظيفة أو القسم..." />
        <Table columns={columns} data={filtered} emptyMessage="لا يوجد موظفون" />
      </Card>

      {/* Salary History */}
      <Card
        title="سجل صرف الرواتب"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">{salaryPayments.length}</Badge>
            <Button
              variant={isDark ? 'primary' : 'outline'}
              size="xs"
              icon={<Printer size={12} />}
              onClick={handlePrintSalaryHistory}
            >
              طباعة
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <SearchBox
            value={salarySearch}
            onChange={setSalarySearch}
            placeholder="بحث باسم الموظف أو الشهر أو الملاحظات..."
          />
          <Table columns={salaryHistoryColumns} data={salaryFiltered} emptyMessage="لا يوجد سجل رواتب" />
        </div>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editId ? 'تعديل بيانات موظف' : 'إضافة موظف جديد'} size="xl">
        <div className="grid grid-cols-2 gap-4">
          <Input label="الاسم الكامل *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="رقم الهاتف" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="البريد الإلكتروني" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Input label="الرقم القومي" value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} />
          <Input label="الوظيفة *" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="مثال: مدير مبيعات" />
          <Input label="القسم *" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="مثال: المبيعات" />
          <Input label={`الراتب الأساسي (${currency})`} type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
          <Input label={`رصيد السلفة الحالي (${currency})`} type="number" value={form.loanBalance} onChange={e => setForm({ ...form, loanBalance: e.target.value })} />
          <Input label="تاريخ التعيين" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          <Select label="الحالة" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'active'|'inactive' })}
            options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }]} />
          <Input label="العنوان" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="ملاحظات" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSave} className="flex-1">حفظ</Button>
          <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">إلغاء</Button>
        </div>
      </Modal>

      {/* Salary Payment Modal */}
      <Modal isOpen={showSalary} onClose={() => setShowSalary(false)} title="صرف راتب موظف">
        <div className="space-y-4">
          {salaryForm.employeeId && (() => {
            const emp = employees.find(e => e.id === salaryForm.employeeId);
            const bonuses = parseFloat(salaryForm.bonuses) || 0;
            const deductions = parseFloat(salaryForm.deductions) || 0;
            const net = (emp?.salary || 0) + bonuses - deductions;
            return (
              <>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold">
                      {emp?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{emp?.name}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{emp?.position} — {emp?.department}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الراتب الأساسي:</span>
                    <span className="font-bold text-brand-primary">{emp?.salary.toLocaleString('en-US')} {currency}</span>
                  </div>
                </div>
                <Input label="الشهر" type="month" value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: e.target.value })} />
                <Select
                  label="طريقة الصرف"
                  value={salaryForm.paymentMethod}
                  onChange={e => setSalaryForm({ ...salaryForm, paymentMethod: e.target.value as PaymentMethod })}
                  options={[
                    { value: 'cash', label: 'نقدي' },
                    { value: 'bank_transfer', label: 'تحويل مصرفي' },
                    { value: 'card', label: 'بطاقة' },
                  ]}
                  placeholder="اختر طريقة الصرف"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="مكافآت" type="number" value={salaryForm.bonuses} onChange={e => setSalaryForm({ ...salaryForm, bonuses: e.target.value })} />
                  <Input label="خصومات" type="number" value={salaryForm.deductions} onChange={e => setSalaryForm({ ...salaryForm, deductions: e.target.value })} />
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-brand-primary/10 border border-brand-primary/20' : 'bg-purple-50 border border-purple-100'}`}>
                  <div className="flex justify-between">
                    <span className="font-semibold">صافي الراتب:</span>
                    <span className="text-xl font-black text-brand-primary">{net.toLocaleString('en-US')} {currency}</span>
                  </div>
                </div>
                <Textarea label="ملاحظات" value={salaryForm.notes} onChange={e => setSalaryForm({ ...salaryForm, notes: e.target.value })} />
              </>
            );
          })()}
          {!salaryForm.employeeId && (
            <Select label="الموظف" value={salaryForm.employeeId} onChange={e => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
              options={employees.filter(e => e.status === 'active').map(e => ({ value: e.id, label: `${e.name} — ${e.position}` }))} placeholder="اختر موظف" />
          )}
          <div className="flex gap-3">
            <Button onClick={handleSalaryPay} className="flex-1">صرف الراتب</Button>
            <Button variant="ghost" onClick={() => setShowSalary(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      {/* Employee Advance (Loan) Modal */}
      <Modal
        isOpen={showAdvance}
        onClose={() => setShowAdvance(false)}
        title="تسجيل سلفة لموظف"
      >
        <div className="space-y-4">
          <Select
            label="الموظف"
            value={advanceForm.employeeId}
            onChange={e => setAdvanceForm({ ...advanceForm, employeeId: e.target.value })}
            options={employees
              .filter(e => e.status === 'active')
              .map(e => ({
                value: e.id,
                label: `${e.name} — ${e.position}`,
              }))}
            placeholder="اختر موظف"
            searchable
          />
          <Input
            label={`قيمة السلفة (${currency})`}
            type="number"
            value={advanceForm.amount}
            onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
          />
          <Textarea
            label="ملاحظات"
            value={advanceForm.notes}
            onChange={e => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
          />
          <div className="flex gap-3">
            <Button onClick={handleAdvanceSave} className="flex-1">
              حفظ السلفة
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAdvance(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {viewEmployeeId && (() => {
        const emp = employees.find(e => e.id === viewEmployeeId);
        if (!emp) return null;
        const empSalaries = salaryPayments
          .filter(sp => sp.employeeId === emp.id)
          .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());
        const empLoans = employeeLoans
          .filter(l => l.employeeId === emp.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const totalNet = empSalaries.reduce((s, sp) => s + sp.netSalary, 0);

        const handlePrintEmployeeStatement = () => {
          if (empSalaries.length === 0 && empLoans.length === 0) return;
          const salaryRows = empSalaries
            .map((sp, index) => `<tr>
              <td>${index + 1}</td>
              <td>${sp.month}</td>
              <td>${sp.amount.toLocaleString('en-US')} ${currency}</td>
              <td>${sp.bonuses.toLocaleString('en-US')}</td>
              <td>${sp.deductions.toLocaleString('en-US')}</td>
              <td>${sp.netSalary.toLocaleString('en-US')} ${currency}</td>
              <td>${formatDateDMY(sp.paidAt)}</td>
            </tr>`).join('');
          const loansRows = empLoans
            .map((loan, index) => {
              const isAdvance = loan.type === 'advance';
              const amountAbs = Math.abs(loan.amount);
              return `<tr>
                <td>${index + 1}</td>
                <td>${formatDateDMY(loan.date)}</td>
                <td>${isAdvance ? 'سلفة' : 'سداد من السلفة'}</td>
                <td>${(isAdvance ? '+' : '-') + amountAbs.toLocaleString('en-US')} ${currency}</td>
                <td>${loan.notes || '—'}</td>
              </tr>`;
            }).join('');

          const salaryTable = salaryRows
            ? `<table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الشهر</th>
                    <th>الراتب الأساسي (${currency})</th>
                    <th>مكافآت</th>
                    <th>خصومات</th>
                    <th>الصافي (${currency})</th>
                    <th>تاريخ الصرف</th>
                  </tr>
                </thead>
                <tbody>${salaryRows}</tbody>
              </table>`
            : '<p style="font-size:11px;color:#6b7280;">لا يوجد سجل رواتب لهذا الموظف</p>';

          const loansTable = loansRows
            ? `<table style="margin-top:12px;">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>التاريخ</th>
                    <th>النوع</th>
                    <th>المبلغ</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>${loansRows}</tbody>
              </table>`
            : '<p style="font-size:11px;color:#6b7280;">لا توجد سلف مسجلة لهذا الموظف</p>';

          openOdooStylePrint({
            systemName: settings.systemName,
            pageTitle: 'كشف حساب الموظف',
            pageSubtitle: emp.name,
            infoBlocks: [
              { label: 'القسم', value: emp.department },
              { label: 'الوظيفة', value: emp.position },
              { label: 'تاريخ التعيين', value: formatDateDMY(emp.startDate) },
            ],
            tableHtml: `${salaryTable}${loansTable}`,
            summaryBlocks: [
              { label: `إجمالي صافي الرواتب (${currency})`, value: totalNet.toLocaleString('en-US') },
              { label: `رصيد السلفة الحالي (${currency})`, value: (emp.loanBalance ?? 0).toLocaleString('en-US') },
            ],
          });
        };

        return (
          <Modal
            isOpen
            onClose={() => setViewEmployeeId(null)}
            title="كشف حساب الموظف"
            size="lg"
          >
            <div className="space-y-4 text-sm">
              <div className={`rounded-xl p-3 ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-base">{emp.name}</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {emp.position} — {emp.department}
                    </div>
                    <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      تاريخ التعيين: {formatDateDMY(emp.startDate)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs font-semibold">{`الراتب الأساسي (${currency})`}</div>
                    <div className="font-black text-brand-primary">
                      {emp.salary.toLocaleString('en-US')} {currency}
                    </div>
                    <div className="text-xs font-semibold mt-2">رصيد السلفة</div>
                    <div className="font-bold text-amber-500">
                      {(emp.loanBalance ?? 0).toLocaleString('en-US')} {currency}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="xs"
                    variant={isDark ? 'primary' : 'outline'}
                    icon={<Printer size={12} />}
                    onClick={handlePrintEmployeeStatement}
                  >
                    طباعة كشف حساب الموظف
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">سجل صرف الرواتب</span>
                    <Badge variant="info" size="sm">{empSalaries.length}</Badge>
                  </div>
                  {empSalaries.length === 0 ? (
                    <p className={`text-xs py-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا يوجد سجل رواتب لهذا الموظف</p>
                  ) : (
                    <div className="space-y-1 text-xs">
                      {empSalaries.map(sp => (
                        <div
                          key={sp.id}
                          className={`rounded-md px-2 py-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                        >
                          <div className="flex justify-between">
                            <span>{sp.month}</span>
                            <span className="font-bold text-brand-primary">
                              {sp.netSalary.toLocaleString('en-US')} {currency}
                            </span>
                          </div>
                          <div className={`flex justify-between mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            <span>أساسي: {sp.amount.toLocaleString('en-US')}</span>
                            <span>+{sp.bonuses.toLocaleString('en-US')} / -{sp.deductions.toLocaleString('en-US')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {empSalaries.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs flex justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>إجمالي صافي الرواتب</span>
                      <span className="font-black text-brand-primary">
                        {totalNet.toLocaleString('en-US')} {currency}
                      </span>
                    </div>
                  )}
                </div>

                <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">سجل السلف</span>
                    <Badge variant="warning" size="sm">{empLoans.length}</Badge>
                  </div>
                  {empLoans.length === 0 ? (
                    <p className={`text-xs py-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>لا توجد سلف مسجلة لهذا الموظف</p>
                  ) : (
                    <div className="space-y-1 text-xs">
                      {empLoans.map(loan => {
                        const isAdvance = loan.type === 'advance';
                        const amountAbs = Math.abs(loan.amount);
                        return (
                          <div
                            key={loan.id}
                            className={`rounded-md px-2 py-1.5 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}
                          >
                            <div className="flex justify-between">
                              <span>{formatDateDMY(loan.date)}</span>
                              <span className={`font-bold ${isAdvance ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {isAdvance ? '+' : '-'}{amountAbs.toLocaleString('en-US')} {currency}
                              </span>
                            </div>
                            <div className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {isAdvance ? 'سلفة' : 'سداد من السلفة'}
                              {loan.notes ? ` — ${loan.notes}` : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

      {viewSalaryId && (() => {
        const sp = salaryPayments.find(s => s.id === viewSalaryId);
        const emp = sp ? employees.find(e => e.id === sp.employeeId) : null;
        return sp ? (
          <Modal isOpen onClose={() => setViewSalaryId(null)} title="تفاصيل صرف الراتب" size="sm">
            <div className="space-y-3 text-sm">
              <div><span className="text-slate-400">الموظف:</span> <span className="font-bold">{emp?.name}</span></div>
              <div><span className="text-slate-400">الشهر:</span> {sp.month}</div>
              <div>
                <span className="text-slate-400">طريقة الصرف:</span>{' '}
                {(() => {
                  const meta = paymentMethodMeta(sp.paymentMethod as PaymentMethod | undefined);
                  return (
                    <span className="inline-flex items-center gap-1 ml-1">
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>
                  );
                })()}
              </div>
              <div><span className="text-slate-400">الراتب الأساسي:</span> {sp.amount.toLocaleString('en-US')} {currency}</div>
              <div><span className="text-slate-400">مكافآت:</span> <span className="text-green-400">+{sp.bonuses.toLocaleString('en-US')}</span></div>
              <div><span className="text-slate-400">خصومات:</span> <span className="text-red-400">-{sp.deductions.toLocaleString('en-US')}</span></div>
              <div><span className="text-slate-400">الصافي:</span> <span className="font-black text-brand-primary">{sp.netSalary.toLocaleString('en-US')} {currency}</span></div>
              <div><span className="text-slate-400">تاريخ الصرف:</span> {formatDateDMY(sp.paidAt)}</div>
              {sp.notes && <div><span className="text-slate-400">ملاحظات:</span> {sp.notes}</div>}
            </div>
          </Modal>
        ) : null;
      })()}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}


