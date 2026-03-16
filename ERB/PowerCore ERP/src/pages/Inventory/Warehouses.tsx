import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Warehouse as WarehouseIcon, Package, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button, Card, Modal, Input, Textarea, ConfirmDialog, useConfirmDelete } from '../../components/UI';

export default function Warehouses() {
  const { warehouses, products, addWarehouse, updateWarehouse, deleteWarehouse, settings } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', description: '' });
  const isDark = settings.theme === 'dark';
  const { confirmDelete, dialogProps } = useConfirmDelete();
  const navigate = useNavigate();

  const handleSave = () => {
    if (!form.name) return;
    if (editId) { updateWarehouse(editId, form); setEditId(null); }
    else addWarehouse(form);
    setForm({ name: '', location: '', description: '' });
    setShowAdd(false);
  };

  const startEdit = (wh: typeof warehouses[0]) => {
    setForm({ name: wh.name, location: wh.location || '', description: wh.description || '' });
    setEditId(wh.id);
    setShowAdd(true);
  };

  const getProductCount = (wid: string) => products.filter(p => p.warehouseId === wid).length;
  const getStockValue = (wid: string) => products.filter(p => p.warehouseId === wid).reduce((s, p) => s + p.quantity * p.costPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">المخازن</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{warehouses.length} مخازن مسجلة</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', location: '', description: '' }); }}>
          إضافة مخزن
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map(wh => (
          <div key={wh.id} className={`rounded-xl p-5 border transition-all hover:scale-[1.02] ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-white/[0.08]' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br bg-brand-primary/10 border border-brand-primary/30 rounded-xl flex items-center justify-center">
                <WarehouseIcon size={22} className="text-brand-primary" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(wh)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => confirmDelete({ title: 'حذف المخزن', message: 'سيتم حذف هذا المخزن نهائياً. تأكد من نقل المنتجات أولاً.', itemName: wh.name, onConfirm: () => deleteWarehouse(wh.id) })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg">{wh.name}</h3>
            {wh.location && <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{wh.location}</p>}
            {wh.description && <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{wh.description}</p>}
            <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`}>
              <div className="flex items-center gap-1.5">
                <Package size={14} className="text-brand-primary" />
                <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{getProductCount(wh.id)} منتج</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-brand-primary">
                  {getStockValue(wh.id).toLocaleString('en-US')} {settings.currency}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/10"
                  onClick={() => navigate(`/inventory/warehouses/${wh.id}`)}
                >
                  تفاصيل المخزن
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Add card */}
        <button onClick={() => { setShowAdd(true); setEditId(null); setForm({ name: '', location: '', description: '' }); }}
          className={`rounded-xl p-5 border-2 border-dashed transition-all hover:border-brand-primary/50 hover:bg-brand-primary/5 flex flex-col items-center justify-center gap-3 min-h-[180px] ${isDark ? 'border-white/[0.08]' : 'border-gray-200'}`}>
          <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
            <Plus size={22} className="text-brand-primary" />
          </div>
          <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إضافة مخزن جديد</span>
        </button>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editId ? 'تعديل المخزن' : 'إضافة مخزن جديد'}>
        <div className="space-y-4">
          <Input label="اسم المخزن *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="الموقع" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <Textarea label="الوصف" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">حفظ</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">إلغاء</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}


