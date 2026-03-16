import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Printer, DollarSign, User, Package as PackageIcon, Warehouse as WarehouseIcon, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { Card, Badge, Button } from '../../components/UI';
import { openQuotationInvoicePrint } from '../../utils/printHelpers';

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saleInvoices, customers, warehouses, products, settings } = useStore();

  const invoice = saleInvoices.find(si => si.id === id);
  if (!invoice) {
    return <div className="p-8 text-center text-sm text-slate-500">الفاتورة غير موجودة.</div>;
  }

  const isDark = settings.theme === 'dark';
  const currency = settings.currency;

  const customer = customers.find(c => c.id === invoice.customerId);
  const warehouse = warehouses.find(w => w.id === invoice.warehouseId);
  const remaining = invoice.totalAmount - invoice.paidAmount;

  const paymentStatusLabel =
    invoice.paymentType === 'immediate' ? 'فوري' : 'آجل';
  const paymentMethodLabel =
    invoice.paymentMethod === 'bank_transfer'
      ? 'تحويل مصرفي'
      : invoice.paymentMethod === 'card'
      ? 'بطاقة'
      : invoice.paymentMethod === 'cash'
      ? 'نقدي'
      : undefined;

  const handlePrint = () => {
    const orderRows = invoice.items.map((item) => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productName: prod?.name || '—',
        quantity: item.quantity,
        unitPrice: item.unitPrice.toLocaleString('en-US'),
        taxes: '0.00',
        amount: item.totalPrice.toLocaleString('en-US'),
      };
    });
    openQuotationInvoicePrint({
      documentTitle: 'فاتورة بيع',
      documentNumber: '',
      quotationDate: new Date(invoice.date).toLocaleDateString('en-US'),
      customerName: customer?.name || '—',
      customerAddress: customer?.address,
      customerPhone: customer?.phone,
      currency,
      rows: orderRows,
      untaxedAmount: invoice.totalAmount.toLocaleString('en-US'),
      discountAmount: invoice.discount
        ? invoice.discount.toLocaleString('en-US')
        : undefined,
      taxPercent: '0',
      total: invoice.totalAmount.toLocaleString('en-US'),
      paidAmount: invoice.paidAmount.toLocaleString('en-US'),
      remainingAmount: remaining.toLocaleString('en-US'),
      companyName: settings.systemName,
      salespersonName: invoice.salesperson,
      salespersonPhone: invoice.salespersonPhone,
      warehouseName: warehouse?.name,
      paymentMethodLabel,
      paymentStatusLabel,
      fileName: `فاتورة-بيع-${customer?.name || invoice.id}-${invoice.date.split('T')[0]}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/sales')}
          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black">تفاصيل فاتورة بيع</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            رقم الفاتورة: <span className="font-mono">#{invoice.id.slice(0, 8)}</span> •{' '}
            {formatDateDMY(invoice.date)}
          </p>
        </div>
        <Button
          variant={isDark ? 'primary' : 'outline'}
          size="sm"
          icon={<Printer size={14} />}
          onClick={handlePrint}
        >
          طباعة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إجمالي الفاتورة</p>
              <p className="text-lg font-black text-brand-primary">
                {invoice.totalAmount.toLocaleString('en-US')} {currency}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المدفوع</p>
              <p className="text-lg font-black text-emerald-500">
                {invoice.paidAmount.toLocaleString('en-US')} {currency}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المتبقي</p>
              <p className={`text-lg font-black ${remaining > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {remaining.toLocaleString('en-US')} {currency}
              </p>
            </div>
            {/* تم الإبقاء على الربح داخل الشاشة فقط وعدم طباعته في الفاتورة الحرارية */}
          </div>
        </Card>

        <Card title="العميل والمخزن" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <User size={16} className="mt-0.5 text-brand-primary" />
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>العميل</p>
                <p className="font-semibold">{customer?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <WarehouseIcon size={16} className="mt-0.5 text-brand-primary" />
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>المخزن</p>
                <p className="font-semibold">{warehouse?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign size={16} className="mt-0.5 text-brand-primary" />
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>نوع البيع</p>
                <Badge variant={invoice.paymentType === 'immediate' ? 'success' : 'warning'}>
                  {invoice.paymentType === 'immediate' ? 'فوري' : 'آجل'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="الأصناف في الفاتورة">
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
                {['#', 'المنتج', 'الكمية', `سعر الوحدة (${currency})`, `الإجمالي (${currency})`].map(h => (
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
              {invoice.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`text-center py-10 text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    لا توجد أصناف في هذه الفاتورة.
                  </td>
                </tr>
              ) : (
                invoice.items.map((item, index) => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <tr
                      key={`${item.productId}-${index}`}
                      className={`border-b-2 ${
                        isDark
                          ? 'border-white/15 divide-x divide-white/10'
                          : 'border-gray-200 divide-x divide-gray-200'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <PackageIcon size={14} className="text-brand-primary" />
                          <span className="font-medium">{prod?.name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">
                        {item.unitPrice.toLocaleString('en-US')}
                      </td>
                      <td className="px-4 py-3 font-bold text-brand-primary">
                        {item.totalPrice.toLocaleString('en-US')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {invoice.notes && (
        <Card title="ملاحظات">
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{invoice.notes}</p>
        </Card>
      )}

      {remaining > 0 && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
            isDark ? 'bg-red-500/10 border border-red-500/30 text-red-200' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <AlertCircle size={16} />
          <span>
            يوجد رصيد متبقي على العميل قدره{' '}
            <strong>{remaining.toLocaleString('en-US')} {currency}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}

