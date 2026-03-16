import { useState, useRef, useEffect } from 'react';
import { Save, Download, Upload, Eye, EyeOff, Settings, User, Database, RefreshCw, Users, Trash2, Sparkles, Pencil, Copy } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import { Button, Card, Input, Select, ConfirmDialog, useConfirmDelete, Modal } from '../../components/UI';

export default function SettingsPage() {
  const { settings, users, addUser, updateUser, deleteUser, updateSettings, exportData, importData, resetAllData, seedDemoData, replaceStateFromSqlite } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [showPass, setShowPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [saved, setSaved] = useState(false);
  const [importConfirm, setImportConfirm] = useState<{ isOpen: boolean; data: string }>({ isOpen: false, data: '' });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [seedConfirmOpen, setSeedConfirmOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');
  const [userError, setUserError] = useState('');
  const [editUser, setEditUser] = useState<{ id: string; username: string; password: string; role: UserRole } | null>(null);
  const [editUserShowPass, setEditUserShowPass] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [sqliteBackupMsg, setSqliteBackupMsg] = useState('');
  const [showSqliteRestoreConfirm, setShowSqliteRestoreConfirm] = useState(false);
  const [sqliteRestoreLoading, setSqliteRestoreLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isDark = settings.theme === 'dark';
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;
  const { confirmDelete, dialogProps: userDeleteDialogProps } = useConfirmDelete();

  useEffect(() => {
    setForm((f) => ({ ...f, ...settings }));
  }, [settings.systemName, settings.currency, settings.theme]);

  const handleSave = () => {
    updateSettings({ ...form, ...(newPass ? { password: newPass } : {}) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `powercore-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result as string;
      setImportConfirm({ isOpen: true, data });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSqliteBackup = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI) {
      setSqliteBackupMsg('النسخ الاحتياطي SQLite متاح فقط في تطبيق سطح المكتب.');
      setTimeout(() => setSqliteBackupMsg(''), 4000);
      return;
    }
    setSqliteBackupMsg('جاري حفظ النسخة الاحتياطية...');
    try {
      const fullState = useStore.getState();
      const stateToSave = {
        suppliers: fullState.suppliers,
        customers: fullState.customers,
        users: fullState.users,
        warehouses: fullState.warehouses,
        products: fullState.products,
        stockMovements: fullState.stockMovements,
        purchaseOrders: fullState.purchaseOrders,
        saleInvoices: fullState.saleInvoices,
        generators: fullState.generators,
        rentalContracts: fullState.rentalContracts,
        afterSalesRequests: fullState.afterSalesRequests,
        employees: fullState.employees,
        salaryPayments: fullState.salaryPayments,
        payments: fullState.payments,
        returns: fullState.returns,
        notifications: fullState.notifications,
        settings: fullState.settings,
        isLoggedIn: fullState.isLoggedIn,
      };
      // إرسال الحالة مع طلب النسخ لكتابتها في SQLite ثم نسخ الملف (ضمان عدم حفظ ملف فارغ)
      const res = await electronAPI.invoke('backup:copySqlite', stateToSave);
      if (res?.success && res?.filePath) {
        setSqliteBackupMsg(`✓ تم الحفظ: ${res.filePath}`);
      } else {
        setSqliteBackupMsg(res?.message || 'فشل النسخ الاحتياطي');
      }
    } catch (e: any) {
      setSqliteBackupMsg(e?.message || 'حدث خطأ أثناء النسخ');
    }
    setTimeout(() => setSqliteBackupMsg(''), 5000);
  };

  const handleSqliteRestoreClick = () => {
    if (!(window as any).electronAPI) {
      setSqliteBackupMsg('النسخ الاحتياطي SQLite متاح فقط في تطبيق سطح المكتب.');
      setTimeout(() => setSqliteBackupMsg(''), 4000);
      return;
    }
    setShowSqliteRestoreConfirm(true);
  };

  const handleSqliteRestoreConfirm = async () => {
    setShowSqliteRestoreConfirm(false);
    setSqliteRestoreLoading(true);
    setSqliteBackupMsg('جاري الاستعادة... اختر ملف النسخة الاحتياطية (.db)');

    try {
      const res = await (window as any).electronAPI.invoke('backup:restoreFromSqlite');

      // تشخيص الاستجابة القادمة من Electron أثناء التطوير
      try {
        // eslint-disable-next-line no-console
        console.log('Restore response:', JSON.stringify(res));
      } catch {
        // تجاهل أي خطأ في console
      }

      const hasValidState =
        res?.state &&
        typeof res.state === 'object' &&
        (Object.keys(res.state).length > 0 || (res.state as any).settings);

      if (res?.success && hasValidState) {
        if (typeof replaceStateFromSqlite === 'function') {
          // استبدال البيانات المستعادة مع الإبقاء على تسجيل الدخول الحالي (لا إعادة توجيه لصفحة تسجيل الدخول)
          replaceStateFromSqlite(res.state as Record<string, unknown>, false);
        }

        setSqliteBackupMsg('✓ تم استعادة البيانات بنجاح. أنت ما زلت داخل النظام.');
        setTimeout(() => setSqliteBackupMsg(''), 5000);
      } else {
        const errMsg =
          res?.message ||
          (!res?.state
            ? 'لم يتم استرجاع أي بيانات من الملف.'
            : !hasValidState
            ? 'البيانات المسترجعة غير صالحة أو فارغة.'
            : 'فشل الاستعادة');
        setSqliteBackupMsg(errMsg);
        setTimeout(() => setSqliteBackupMsg(''), 6000);
      }
    } catch (e: any) {
      setSqliteBackupMsg(e?.message || 'حدث خطأ أثناء الاستعادة');
      setTimeout(() => setSqliteBackupMsg(''), 6000);
    } finally {
      setSqliteRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black">الإعدادات</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>إدارة إعدادات النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* System Settings */}
        <Card title="إعدادات النظام" headerPurple actions={<Settings size={18} />}>
          <div className="space-y-4">
            <Input label="اسم النظام" value={form.systemName}
              onChange={e => setForm({ ...form, systemName: e.target.value })} />
            <Select label="العملة" value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              options={[
                { value: 'دينار', label: 'دينار ليبي (دينار)' },
                { value: 'EGP', label: 'جنيه مصري (EGP)' },
                { value: 'USD', label: 'دولار أمريكي (USD)' },
                { value: 'SAR', label: 'ريال سعودي (SAR)' },
                { value: 'AED', label: 'درهم إماراتي (AED)' },
              ]} />
            <Select label="المظهر" value={form.theme}
              onChange={e => setForm({ ...form, theme: e.target.value as 'light'|'dark' })}
              options={[
                { value: 'dark', label: 'الوضع الليلي (Dark)' },
                { value: 'light', label: 'الوضع النهاري (Light)' },
              ]} />
          </div>
        </Card>

        {/* User Settings + Users */}
        <Card title="إعدادات الدخول" headerPurple actions={<User size={18} />}>
          <div className="space-y-4">
            <Input label="اسم المستخدم الرئيسي" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} />
            <div className="relative">
              <Input label="كلمة المرور الجديدة (اتركها فارغة إذا لم تريد التغيير)"
                type={showPass ? 'text' : 'password'} value={newPass}
                onChange={e => setNewPass(e.target.value)} placeholder="أدخل كلمة مرور جديدة" />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute left-3 bottom-2.5 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className={`p-3 rounded-lg text-xs ${isDark ? 'bg-brand-surface2 text-slate-400' : 'bg-gray-50 text-gray-500'}`}>
              كلمة المرور الحالية: <span className="font-mono font-bold text-brand-primary">{'*'.repeat(settings.password.length)}</span>
            </div>

            <div className={`mt-2 p-3 rounded-lg border text-xs ${isDark ? 'border-white/[0.08] bg-brand-surface' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-brand-primary" />
                <span className="font-semibold text-sm">إضافة مستخدم جديد</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  label="اسم المستخدم"
                  value={newUserName}
                  onChange={(e) => {
                    setNewUserName(e.target.value);
                    setUserError('');
                  }}
                />
                <Input
                  label="كلمة المرور"
                  type="password"
                  value={newUserPass}
                  onChange={(e) => {
                    setNewUserPass(e.target.value);
                    setUserError('');
                  }}
                />
                <Select
                  label="نوع المستخدم"
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  options={[
                    { value: 'admin', label: 'مدير (وصول كامل)' },
                    { value: 'cashier', label: 'مستخدم عادي' },
                    { value: 'viewer', label: 'عرض فقط' },
                  ]}
                />
              </div>
              {userError && (
                <p className="text-xs text-red-400 mb-2">{userError}</p>
              )}
              <Button
                size="sm"
                onClick={() => {
                  if (!newUserName || !newUserPass) {
                    setUserError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
                    return;
                  }
                  const existsMain =
                    newUserName === settings.username;
                  const existsOther = users.some(
                    (u) => u.username === newUserName
                  );
                  if (existsMain || existsOther) {
                    setUserError('اسم المستخدم موجود بالفعل.');
                    return;
                  }
                  addUser({ username: newUserName, password: newUserPass, role: newUserRole });
                  setNewUserName('');
                  setNewUserPass('');
                  setNewUserRole('cashier');
                }}
              >
                إضافة مستخدم
              </Button>

              {users.length > 0 && (
                <div className="mt-3 border-t border-white/[0.06] pt-2">
                  <p className={`mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    المستخدمون الحاليون:
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded bg-black/5 dark:bg-white/5"
                      >
                        <span className="font-mono">{u.username}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-semibold">
                          {u.role === 'admin' ? 'مدير' : u.role === 'cashier' ? 'مستخدم عادي' : 'عرض فقط'}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditUser({ id: u.id, username: u.username, password: '', role: u.role || 'cashier' }); setEditUserShowPass(false); }}
                            className="p-1 rounded text-brand-primary hover:bg-brand-primary/10"
                            title="تعديل المستخدم"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => confirmDelete({
                              title: 'حذف المستخدم',
                              message: 'سيتم حذف هذا المستخدم من النظام. هل أنت متأكد؟',
                              itemName: u.username,
                              onConfirm: () => deleteUser(u.id),
                            })}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            title="حذف المستخدم"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Database Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card title="قاعدة البيانات والنسخ الاحتياطي" headerPurple actions={<Database size={18} />}>
          <div className="space-y-4">
            {isElectron ? (
              <>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  يمكنك حفظ نسخة احتياطية كاملة من قاعدة البيانات في ملف واحد بصيغة <span className="font-semibold">.db</span> ثم استعادتها لاحقاً عند الحاجة.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Button
                    icon={<Copy size={16} />}
                    onClick={handleSqliteBackup}
                    variant="primary"
                    className="flex-1 min-w-[160px]"
                  >
                    حفظ نسخة احتياطية (.db)
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Upload size={16} />}
                    onClick={handleSqliteRestoreClick}
                    className="flex-1 min-w-[160px]"
                    disabled={sqliteRestoreLoading}
                  >
                    {sqliteRestoreLoading ? 'جاري الاستعادة...' : 'استعادة من ملف .db'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                  النسخ الاحتياطي بملف قاعدة بيانات <span className="font-semibold">SQLite (.db)</span> متاح فقط في تطبيق سطح المكتب.
                  يمكنك هنا تنزيل نسخة احتياطية بصيغة JSON ثم استعادتها عند الحاجة.
                </p>
                <div className="flex gap-3">
                  <Button icon={<Download size={16} />} onClick={handleExport} className="flex-1">
                    تنزيل نسخة JSON
                  </Button>
                  <Button
                    variant="outline"
                    icon={<Upload size={16} />}
                    onClick={() => fileRef.current?.click()}
                    className="flex-1"
                  >
                    استعادة من JSON
                  </Button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </div>
              </>
            )}

            {sqliteBackupMsg && (
              <div
                className={`text-xs rounded-md px-3 py-2 ${
                  sqliteBackupMsg.startsWith('✓')
                    ? isDark
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isDark
                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {sqliteBackupMsg}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Reset & Demo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          <Card title="تحميل بيانات تجريبية" headerPurple actions={<Sparkles size={18} />}>
            <div className="space-y-3">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                يملأ النظام ببيانات واقعية تجريبية (عملاء، موردين، منتجات، فواتير، موظفين، مولدات) لاختبار كل وظائف النظام.
              </p>
              <Button
                variant="secondary"
                icon={<Sparkles size={16} />}
                onClick={() => setSeedConfirmOpen(true)}
                className="w-full"
              >
                تحميل بيانات تجريبية
              </Button>
            </div>
          </Card>

          <Card title="إعادة ضبط البرنامج" headerPurple actions={<RefreshCw size={18} />}>
            <div className="space-y-3">
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                يعيد النظام إلى حالته الافتراضية (حذف كل البيانات).
              </p>
              <Button
                variant="danger"
                icon={<RefreshCw size={16} />}
                onClick={() => setResetConfirmOpen(true)}
                className="w-full"
              >
                إعادة ضبط البرنامج بالكامل
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* About */}
      <Card title="حول النظام" headerPurple>
        <div className="space-y-2">
          {[
            { label: 'اسم النظام', value: 'PowerCore ERP' },
            { label: 'الإصدار', value: '1.0.0' },
            { label: 'تطوير', value: 'Eng/ Abdullah Ahmed Nar' },
          ].map(item => (
            <div key={item.label} className={`flex justify-between py-2 border-b last:border-0 text-sm ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button icon={<Save size={16} />} onClick={handleSave} size="lg"
          className={saved ? 'bg-green-500 hover:bg-green-600 from-green-500 to-green-600' : ''}>
          {saved ? '✓ تم الحفظ!' : 'حفظ الإعدادات'}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={importConfirm.isOpen}
        onClose={() => setImportConfirm({ isOpen: false, data: '' })}
        onConfirm={() => importData(importConfirm.data)}
        title="استعادة نسخة احتياطية"
        message="سيتم استبدال جميع البيانات الحالية بالبيانات المستعادة. هذا الإجراء لا يمكن التراجع عنه."
        itemName="جميع بيانات النظام"
        confirmLabel="استعادة"
      />

      <ConfirmDialog
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetAllData();
          window.location.reload();
        }}
        title="إعادة ضبط البرنامج"
        message="سيتم حذف كل البيانات (عملاء، موردين، فواتير، مخزون، سجلات... إلخ) وإرجاع النظام للحالة الافتراضية. هل أنت متأكد؟"
        itemName="جميع بيانات النظام"
        confirmLabel="نعم، إعادة الضبط"
      />

      <ConfirmDialog
        isOpen={seedConfirmOpen}
        onClose={() => setSeedConfirmOpen(false)}
        onConfirm={() => {
          seedDemoData();
          setSeedConfirmOpen(false);
        }}
        title="تحميل بيانات تجريبية"
        message="سيتم استبدال جميع البيانات الحالية ببيانات تجريبية واقعية. هل تريد المتابعة؟"
        itemName="جميع البيانات الحالية"
        confirmLabel="نعم، تحميل البيانات"
      />

      <ConfirmDialog {...userDeleteDialogProps} />

      <ConfirmDialog
        isOpen={showSqliteRestoreConfirm}
        onClose={() => setShowSqliteRestoreConfirm(false)}
        onConfirm={handleSqliteRestoreConfirm}
        title="استعادة من نسخة احتياطية SQLite"
        message="سيتم استبدال جميع البيانات الحالية (عملاء، موردين، فواتير، مخزون، إلخ) ببيانات الملف الذي تختاره. هل تريد المتابعة؟"
        confirmLabel="نعم، استعادة"
      />

      <Modal
        isOpen={!!editUser}
        onClose={() => { setEditUser(null); setEditUserError(''); }}
        title="تعديل المستخدم"
      >
        {editUser && (
          <div className="space-y-4">
            <Input
              label="اسم المستخدم"
              value={editUser.username}
              onChange={(e) => {
                setEditUser({ ...editUser, username: e.target.value });
                setEditUserError('');
              }}
            />
            <div className="relative">
              <Input
                label="كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)"
                type={editUserShowPass ? 'text' : 'password'}
                value={editUser.password}
                onChange={(e) => {
                  setEditUser({ ...editUser, password: e.target.value });
                  setEditUserError('');
                }}
                placeholder="••••••"
              />
              <button
                type="button"
                onClick={() => setEditUserShowPass(!editUserShowPass)}
                className="absolute left-3 bottom-2.5 text-slate-500 hover:text-slate-300"
              >
                {editUserShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Select
              label="نوع المستخدم"
              value={editUser.role}
              onChange={e => setEditUser({ ...editUser, role: e.target.value as UserRole })}
              options={[
                { value: 'admin', label: 'مدير (وصول كامل)' },
                { value: 'cashier', label: 'كاشير / مبيعات' },
                { value: 'viewer', label: 'عرض فقط' },
              ]}
            />
            {editUserError && (
              <p className="text-xs text-red-400">{editUserError}</p>
            )}
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => {
                  if (!editUser.username.trim()) {
                    setEditUserError('الرجاء إدخال اسم المستخدم.');
                    return;
                  }
                  const existsMain = editUser.username === settings.username;
                  const existsOther = users.some(
                    (u) => u.id !== editUser.id && u.username === editUser.username
                  );
                  if (existsMain || existsOther) {
                    setEditUserError('اسم المستخدم موجود بالفعل.');
                    return;
                  }
                  updateUser(editUser.id, {
                    username: editUser.username.trim(),
                    ...(editUser.password ? { password: editUser.password } : {}),
                    role: editUser.role,
                  });
                  setEditUser(null);
                  setEditUserError('');
                }}
              >
                حفظ التعديلات
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => { setEditUser(null); setEditUserError(''); }}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


