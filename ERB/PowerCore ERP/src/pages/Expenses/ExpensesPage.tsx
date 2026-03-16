import { useState } from 'react';
import { Plus, Wallet, Pencil, Trash2, Eye, Printer, CreditCard, ArrowLeftRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import {
  Button,
  Card,
  Badge,
  Table,
  Modal,
  Input,
  Select,
  Textarea,
  KpiCard,
  SearchBox,
  ConfirmDialog,
  useConfirmDelete,
  ActionsCell,
} from '../../components/UI';
import { openOdooStylePrint } from '../../utils/printHelpers';
import type { PaymentMethod } from '../../types';

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, settings } = useStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paymentMethod: 'cash' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const isDark = settings.theme === 'dark';
  const currency = settings.currency;
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const paymentMethodMeta = (m?: PaymentMethod) => {
    switch (m) {
      case 'bank_transfer':
        return { label: 'تحويل مصرفي', icon: <ArrowLeftRight size={12} />, variant: 'warning' as const };
      case 'card':
        return { label: 'بطاقة', icon: <CreditCard size={12} />, variant: 'info' as const };
      case 'cash':
      default:
        return { label: 'نقدي', icon: <Wallet size={12} />, variant: 'success' as const };
    }
  };

  const filtered = expenses.filter((e) => {
    const term = search.toLowerCase();
    const dateStr = formatDateDMY(e.date);
    return (
      e.description.toLowerCase().includes(term) ||
      (e.notes ?? '').toLowerCase().includes(term) ||
      dateStr.includes(term)
    );
  });

  const handleSave = () => {
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || !amount || amount <= 0) return;
    const payload = {
      description: form.description.trim(),
      amount,
      paymentMethod: form.paymentMethod,
      date: new Date(form.date).toISOString(),
      notes: form.notes.trim() || undefined,
    };
    if (editId) {
      updateExpense(editId, payload);
      setEditId(null);
    } else {
      addExpense(payload);
    }
    setForm({
      description: '',
      amount: '',
      paymentMethod: 'cash' as PaymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setShowAdd(false);
  };

  const startEdit = (row: typeof expenses[0]) => {
    setEditId(row.id);
    setForm({
      description: row.description,
      amount: String(row.amount),
      paymentMethod: (row.paymentMethod || 'cash') as PaymentMethod,
      date: row.date.split('T')[0],
      notes: row.notes || '',
    });
    setShowAdd(true);
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = expenses
    .filter((e) => e.date.startsWith(thisMonthKey))
    .reduce((s, e) => s + e.amount, 0);

  const columns = [
    {
      key: 'index',
      label: '#',
      render: (_row: typeof expenses[0], index: number) => (
        <span className="text-xs text-slate-400">{index + 1}</span>
      ),
    },
    {
      key: 'description',
      label: 'وصف المصروف',
      render: (row: typeof expenses[0]) => (
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-brand-primary" />
          <div>
            <button
              type="button"
              className="font-semibold text-sm max-w-xs truncate text-right hover:text-brand-primary cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setViewId(row.id);
              }}
              title={row.description}
            >
              {row.description}
            </button>
            {row.notes && (
              <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                {row.notes}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'التاريخ',
      render: (row: typeof expenses[0]) =>
        formatDateDMY(row.date),
    },
    {
      key: 'paymentMethod',
      label: 'طريقة الدفع',
      render: (row: typeof expenses[0]) => {
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
    {
      key: 'amount',
      label: `المبلغ (${currency})`,
      render: (row: typeof expenses[0]) => (
        <span className="font-bold text-red-500">
          {row.amount.toLocaleString('en-US')} {currency}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (row: typeof expenses[0]) => (
        <ActionsCell
          actions={[
            {
              icon: Eye,
              label: 'عرض',
              onClick: (e) => {
                e.stopPropagation();
                setViewId(row.id);
              },
              variant: 'view',
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
                  title: 'حذف المصروف',
                  message: 'سيتم حذف هذا المصروف نهائياً. هل أنت متأكد؟',
                  itemName: 'مصروف',
                  onConfirm: () => deleteExpense(row.id),
                });
              },
              variant: 'delete',
            },
          ]}
        />
      ),
    },
  ];

  const handlePrint = () => {
    const rows = filtered
      .map((e, idx) => {
        const meta = paymentMethodMeta(e.paymentMethod as PaymentMethod | undefined);
        return `<tr>
  <td style="text-align:center">${idx + 1}</td>
  <td>${e.description}</td>
  <td>${formatDateDMY(e.date)}</td>
  <td>${meta.label}</td>
  <td style="color:#dc2626;font-weight:600">${e.amount.toLocaleString('en-US')} ${currency}</td>
</tr>`;
      })
      .join('');

    const tableHtml = `<table>
  <thead>
    <tr>
      <th>#</th>
      <th>وصف المصروف</th>
      <th>التاريخ</th>
      <th>طريقة الدفع</th>
      <th>المبلغ (${currency})</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>`;

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: 'تقرير المصروفات',
      pageSubtitle: `إجمالي البنود: ${filtered.length}`,
      tableHtml,
      summaryBlocks: [
        {
          label: `إجمالي المصروفات (${currency})`,
          value: totalExpenses.toLocaleString('en-US'),
          color: 'red',
        },
        {
          label: `مصروفات هذا الشهر (${currency})`,
          value: thisMonthExpenses.toLocaleString('en-US'),
          color: 'amber',
        },
      ],
      statsText: `عدد المصروفات في التقرير: ${filtered.length}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">المصروفات العامة</h1>
          <p
            className={`text-sm mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}
          >
            مصروفات تشغيلية مثل الأكل والشرب والإيجارات وغيرها
          </p>
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
          <Button icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
            إضافة مصروف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title={`إجمالي المصروفات (${currency})`}
          value={totalExpenses.toLocaleString('en-US')}
          icon={<Wallet size={20} />}
          color="red"
        />
        <KpiCard
          title={`مصروفات هذا الشهر (${currency})`}
          value={thisMonthExpenses.toLocaleString('en-US')}
          icon={<Wallet size={20} />}
          color="amber"
        />
        <KpiCard
          title="عدد بنود المصروفات"
          value={expenses.length}
          icon={<Eye size={20} />}
          color="purple"
        />
      </div>

      <Card title="سجل المصروفات">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="بحث في الوصف أو التاريخ..."
        />
        <Table
          columns={columns}
          data={filtered}
          emptyMessage="لا توجد مصروفات مسجلة"
        />
      </Card>

      <Modal
        isOpen={showAdd}
        onClose={() => {
          setShowAdd(false);
          setEditId(null);
        }}
        title={editId ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="وصف المصروف *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`المبلغ (${currency}) *`}
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
            <Select
              label="طريقة الدفع"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
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
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <Textarea
            label="ملاحظات"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="أي تفاصيل إضافية عن هذا المصروف"
          />
          <div className="flex gap-3 mt-2">
            <Button onClick={handleSave} className="flex-1">
              حفظ
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className={`flex-1 ${isDark ? 'text-slate-100 hover:text-white' : ''}`}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {viewId &&
        (() => {
          const exp = expenses.find((e) => e.id === viewId);
          if (!exp) return null;
          return (
            <Modal
              isOpen
              onClose={() => setViewId(null)}
              title="تفاصيل المصروف"
              size="sm"
            >
              <div className="space-y-3 text-sm">
                <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>الوصف</p>
                  <div className="mt-1 max-h-40 overflow-y-auto break-words whitespace-pre-wrap text-right text-sm font-bold">
                    {exp.description}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>التاريخ</p>
                    <p className="mt-1 font-medium">
                      {formatDateDMY(exp.date)}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المبلغ</p>
                    <p className="mt-1 font-black text-red-500">
                      {exp.amount.toLocaleString('en-US')} {currency}
                    </p>
                  </div>
                </div>
                <div className={`rounded-lg p-3 border ${isDark ? 'bg-brand-surface2 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ملاحظات</p>
                  <p className="mt-1 text-sm">
                    {exp.notes || 'لا توجد ملاحظات'}
                  </p>
                </div>
              </div>
            </Modal>
          );
        })()}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}

