import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Package, DollarSign, Warehouse as WarehouseIcon, Plus, Eye, Pencil, Printer } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Card, KpiCard, Table, Button, Modal, Input, Select, ActionsCell } from '../../components/UI';
import { openOdooStylePrint } from '../../utils/printHelpers';

export default function WarehouseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { warehouses, products, addProduct, updateProduct, settings } = useStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<typeof products[0] | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 0, costPrice: 0, salePrice: 0 });
  const [productForm, setProductForm] = useState({
    code: '',
    name: '',
    type: 'sale' as 'sale' | 'rental' | 'both',
    salePrice: '',
    costPrice: '',
    rentalPricePerDay: '',
    minStock: '',
    quantity: '',
  });

  const [viewProduct, setViewProduct] = useState<typeof products[0] | null>(null);

  const warehouse = warehouses.find(w => w.id === id);
  if (!warehouse) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        المخزن غير موجود.
      </div>
    );
  }

  const isDark = settings.theme === 'dark';
  const currency = settings.currency;

  const warehouseProducts = products.filter(p => p.warehouseId === warehouse.id);

  const handleSaveProduct = () => {
    if (!productForm.code || !productForm.name) return;
    addProduct({
      code: productForm.code,
      name: productForm.name,
      type: productForm.type,
      salePrice: parseFloat(productForm.salePrice) || 0,
      costPrice: parseFloat(productForm.costPrice) || 0,
      rentalPricePerDay: productForm.type !== 'sale' ? parseFloat(productForm.rentalPricePerDay) || 0 : undefined,
      minStock: parseInt(productForm.minStock) || 0,
      warehouseId: warehouse.id,
      quantity: parseInt(productForm.quantity) || 0,
    });
    setProductForm({ code: '', name: '', type: 'sale', salePrice: '', costPrice: '', rentalPricePerDay: '', minStock: '', quantity: '' });
    setShowAddProduct(false);
  };

  const totalQty = warehouseProducts.reduce((s, p) => s + p.quantity, 0);
  const totalCostValue = warehouseProducts.reduce(
    (s, p) => s + p.quantity * p.costPrice,
    0
  );
  const totalSaleValue = warehouseProducts.reduce(
    (s, p) => s + p.quantity * p.salePrice,
    0
  );

  const columns = [
    {
      key: 'index',
      label: '#',
      render: (row: typeof warehouseProducts[0]) => {
        const index = warehouseProducts.findIndex(p => p.id === row.id);
        return <span className="text-xs text-slate-400">{index + 1}</span>;
      },
    },
    {
      key: 'code',
      label: 'الكود',
      render: (row: typeof warehouseProducts[0]) => (
        <span className="font-mono text-xs bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">
          {row.code}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'المنتج',
      render: (row: typeof warehouseProducts[0]) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-brand-primary" />
          <span className="font-medium text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'الكمية',
      render: (row: typeof warehouseProducts[0]) => (
        <span className="font-bold">
          {row.quantity.toLocaleString('en-US')}
        </span>
      ),
    },
    {
      key: 'costPrice',
      label: `سعر التكلفة (${currency})`,
      render: (row: typeof warehouseProducts[0]) =>
        row.costPrice.toLocaleString('en-US'),
    },
    {
      key: 'salePrice',
      label: `سعر البيع (${currency})`,
      render: (row: typeof warehouseProducts[0]) =>
        row.salePrice.toLocaleString('en-US'),
    },
    {
      key: 'totalCost',
      label: `إجمالي التكلفة (${currency})`,
      render: (row: typeof warehouseProducts[0]) =>
        (row.quantity * row.costPrice).toLocaleString('en-US'),
    },
    {
      key: 'actions',
      label: 'الإجراءات',
      render: (row: typeof warehouseProducts[0]) => (
        <ActionsCell
          actions={[
            { icon: Eye, label: 'عرض', onClick: (e) => { e.stopPropagation(); setViewProduct(row); }, variant: 'view' },
            { icon: Pencil, label: 'تعديل', onClick: (e) => { e.stopPropagation(); setEditProduct(row); setEditForm({ quantity: row.quantity, costPrice: row.costPrice, salePrice: row.salePrice }); }, variant: 'edit' },
          ]}
        />
      ),
    },
  ];

  const handlePrintWarehouse = () => {
    if (warehouseProducts.length === 0) return;
    const rowsHtml = warehouseProducts.map((p, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${p.code}</td>
        <td>${p.name}</td>
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
          <th>الكمية</th>
          <th>سعر التكلفة (${currency})</th>
          <th>إجمالي التكلفة (${currency})</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>`;

    openOdooStylePrint({
      systemName: settings.systemName,
      pageTitle: `محتويات المخزن - ${warehouse.name}`,
      pageSubtitle: warehouse.location || undefined,
      tableHtml,
      summaryBlocks: [
        { label: 'عدد المنتجات', value: warehouseProducts.length.toLocaleString('en-US') },
        { label: `إجمالي الكمية`, value: totalQty.toLocaleString('en-US') },
        { label: `إجمالي القيمة بالتكلفة (${currency})`, value: totalCostValue.toLocaleString('en-US') },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/inventory/warehouses')}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <ArrowRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black">تفاصيل المخزن</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {warehouse.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center">
              <WarehouseIcon size={20} className="text-brand-primary" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base">{warehouse.name}</p>
              {warehouse.location && (
                <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                  {warehouse.location}
                </p>
              )}
              {warehouse.description && (
                <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>
                  {warehouse.description}
                </p>
              )}
            </div>
          </div>
        </Card>

        <KpiCard
          title="عدد المنتجات"
          value={warehouseProducts.length}
          icon={<Package size={18} />}
          color="purple"
        />
        <KpiCard
          title={`قيمة التكلفة (${currency})`}
          value={totalCostValue.toLocaleString('en-US')}
          icon={<DollarSign size={18} />}
          color="green"
        />
      </div>

      <Card
        title="المنتجات في هذا المخزن"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isDark ? 'primary' : 'outline'}
              icon={<Printer size={14} />}
              onClick={handlePrintWarehouse}
            >
              طباعة
            </Button>
            <Button icon={<Plus size={16} />} onClick={() => setShowAddProduct(true)}>
              إضافة منتج
            </Button>
          </div>
        }
      >
        {warehouseProducts.length === 0 ? (
          <p
            className={`text-sm text-center py-10 ${
              isDark ? 'text-slate-500' : 'text-gray-400'
            }`}
          >
            لا توجد منتجات مسجلة في هذا المخزن.
          </p>
        ) : (
          <Table columns={columns} data={warehouseProducts} emptyMessage="لا توجد منتجات" />
        )}
      </Card>

      {viewProduct && (
        <Modal
          isOpen
          onClose={() => setViewProduct(null)}
          title={`تفاصيل المنتج - ${viewProduct.name}`}
          size="lg"
        >
          <div className="space-y-4 text-sm">
            <div className={`rounded-xl p-4 ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                  <Package size={20} className="text-brand-primary" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-base">{viewProduct.name}</div>
                  <div className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                    الكود: <span className="font-mono">{viewProduct.code}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`rounded-xl p-4 ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                <h4 className={`text-xs font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>بيانات المخزون</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>الكمية الحالية</dt>
                    <dd className="font-bold">{viewProduct.quantity.toLocaleString('en-US')}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>الحد الأدنى</dt>
                    <dd className="font-semibold">{viewProduct.minStock.toLocaleString('en-US')}</dd>
                  </div>
                </dl>
              </div>
              <div className={`rounded-xl p-4 ${isDark ? 'bg-brand-surface2' : 'bg-gray-50'}`}>
                <h4 className={`text-xs font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>الأسعار</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>سعر التكلفة</dt>
                    <dd className="font-semibold">{viewProduct.costPrice.toLocaleString('en-US')} {currency}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>سعر البيع</dt>
                    <dd className="font-semibold">{viewProduct.salePrice.toLocaleString('en-US')} {currency}</dd>
                  </div>
                  {(viewProduct.rentalPricePerDay || 0) > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className={isDark ? 'text-slate-400' : 'text-gray-500'}>سعر الإيجار/يوم</dt>
                      <dd className="font-semibold">{viewProduct.rentalPricePerDay?.toLocaleString('en-US')} {currency}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        title="إضافة منتج للمخزن"
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="كود المنتج *"
            value={productForm.code}
            onChange={e => setProductForm({ ...productForm, code: e.target.value })}
          />
          <Input
            label="اسم المنتج *"
            value={productForm.name}
            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
          />
          <Select
            label="النوع"
            value={productForm.type}
            onChange={e => setProductForm({ ...productForm, type: e.target.value as 'sale' | 'rental' | 'both' })}
            options={[
              { value: 'sale', label: 'للبيع' },
              { value: 'rental', label: 'للتأجير' },
              { value: 'both', label: 'بيع وتأجير' },
            ]}
            searchable
          />
          <Input
            label="سعر البيع"
            type="number"
            value={productForm.salePrice}
            onChange={e => setProductForm({ ...productForm, salePrice: e.target.value })}
          />
          <Input
            label="سعر التكلفة"
            type="number"
            value={productForm.costPrice}
            onChange={e => setProductForm({ ...productForm, costPrice: e.target.value })}
          />
          {(productForm.type === 'rental' || productForm.type === 'both') && (
            <Input
              label="سعر الإيجار/يوم"
              type="number"
              value={productForm.rentalPricePerDay}
              onChange={e => setProductForm({ ...productForm, rentalPricePerDay: e.target.value })}
            />
          )}
          <Input
            label="الحد الأدنى للمخزن"
            type="number"
            value={productForm.minStock}
            onChange={e => setProductForm({ ...productForm, minStock: e.target.value })}
          />
          <Input
            label="الكمية الحالية"
            type="number"
            value={productForm.quantity}
            onChange={e => setProductForm({ ...productForm, quantity: e.target.value })}
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={handleSaveProduct} className="flex-1">
            حفظ المنتج
          </Button>
          <Button variant="ghost" onClick={() => setShowAddProduct(false)} className="flex-1">
            إلغاء
          </Button>
        </div>
      </Modal>

      {editProduct && (
        <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="تعديل المنتج" size="md">
          <div className="space-y-4">
            <p className="font-medium text-sm">{editProduct.name}</p>
            <Input
              label="الكمية"
              type="number"
              value={editForm.quantity}
              onChange={e => setEditForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
            />
            <Input
              label={`سعر التكلفة (${currency})`}
              type="number"
              value={editForm.costPrice}
              onChange={e => setEditForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label={`سعر البيع (${currency})`}
              type="number"
              value={editForm.salePrice}
              onChange={e => setEditForm(f => ({ ...f, salePrice: parseFloat(e.target.value) || 0 }))}
            />
            <div className="flex gap-3">
              <Button onClick={() => { updateProduct(editProduct.id, editForm); setEditProduct(null); }} className="flex-1">حفظ</Button>
              <Button variant="ghost" onClick={() => setEditProduct(null)} className="flex-1">إلغاء</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

