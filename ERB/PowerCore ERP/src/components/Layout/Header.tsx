import { Bell, Sun, Moon, Menu, Search, Users, UserCheck, Package, Warehouse, UserCog, Zap, X, Clock, Shield, BadgeDollarSign, Eye } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import NotificationPanel from '../Notifications/NotificationPanel';

interface SearchResult {
  id: string;
  type: 'supplier' | 'customer' | 'product' | 'warehouse' | 'employee' | 'generator';
  label: string; sub: string; path: string; icon: React.ElementType;
}
const typeConfig: Record<SearchResult['type'], { name: string; icon: React.ElementType; color: string }> = {
  supplier:  { name: 'مورد',  icon: Users,     color: 'text-brand-primary bg-brand-primary/10' },
  customer:  { name: 'عميل', icon: UserCheck,  color: 'text-blue-400 bg-blue-500/10' },
  product:   { name: 'منتج', icon: Package,    color: 'text-emerald-400 bg-emerald-500/10' },
  warehouse: { name: 'مخزن', icon: Warehouse,  color: 'text-violet-400 bg-violet-500/10' },
  employee:  { name: 'موظف', icon: UserCog,    color: 'text-amber-400 bg-amber-500/10' },
  generator: { name: 'مولد', icon: Zap,        color: 'text-teal-400 bg-teal-500/10' },
};

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { settings, updateSettings, notifications, suppliers, customers, products, warehouses, employees, generators, currentUser } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(new Date());
  const notifRef  = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const navigate  = useNavigate();
  const unread  = notifications.filter(n => !n.isRead).length;
  const isDark  = settings.theme === 'dark';

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  useEffect(() => { if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50); }, [searchOpen]);

  const allItems = useMemo<SearchResult[]>(() => [
    ...suppliers.map(s  => ({ id: s.id,  type: 'supplier'  as const, label: s.name,         sub: s.phone,                          path: `/suppliers/${s.id}`,  icon: Users     })),
    ...customers.map(c  => ({ id: c.id,  type: 'customer'  as const, label: c.name,         sub: c.phone,                          path: `/customers/${c.id}`,  icon: UserCheck })),
    ...products.map(p   => ({ id: p.id,  type: 'product'   as const, label: p.name,         sub: `كود: ${p.code}`,                  path: '/inventory/products', icon: Package   })),
    ...warehouses.map(w => ({ id: w.id,  type: 'warehouse' as const, label: w.name,         sub: w.location || w.description || '', path: '/inventory/warehouses',icon: Warehouse })),
    ...employees.map(e  => ({ id: e.id,  type: 'employee'  as const, label: e.name,         sub: `${e.position} - ${e.department}`,path: '/employees',          icon: UserCog   })),
    ...generators.map(g => ({ id: g.id,  type: 'generator' as const, label: g.serialNumber, sub: `${g.capacity} - ${g.brand || ''}`,path: '/rentals',           icon: Zap       })),
  ], [suppliers, customers, products, warehouses, employees, generators]);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allItems.filter(i => i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)).slice(0, 12);
  }, [searchQuery, allItems]);

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateString = formatDateDMY(now);

  const role = currentUser?.role || 'admin';
  const username = currentUser?.username || settings.username || 'admin';
  const roleConfig =
    role === 'admin'
      ? { label: 'مدير النظام', icon: Shield, color: isDark ? 'text-amber-300' : 'text-brand-primary' }
      : role === 'cashier'
      ? { label: 'مستخدم عادي', icon: Users, color: isDark ? 'text-sky-300' : 'text-sky-500' }
      : { label: 'مستخدم عرض فقط', icon: Eye, color: 'text-slate-400' };

  return (
    <header className={`h-14 flex items-center justify-between px-6 border-b flex-shrink-0 gap-4 ${
      isDark ? 'bg-brand-surface border-white/[0.08]' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors border border-transparent ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.07]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'}`}>
          <Menu size={19} />
        </button>

        {/* Search trigger */}
        <div className="relative" ref={searchRef}>
          <button onClick={() => setSearchOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
              isDark ? 'bg-brand-surface2 border-white/[0.1] text-slate-300 hover:border-brand-primary/50' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-brand-primary/40'
            }`}>
            <Search size={14} />
            <span>بحث سريع...</span>
          </button>

          {searchOpen && (
            <div className={`absolute top-full right-0 mt-2 w-96 rounded-xl shadow-2xl z-50 border overflow-hidden animate-fade-in ${
              isDark ? 'bg-brand-surface border-white/[0.1]' : 'bg-white border-gray-200'
            }`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`}>
                <Search size={15} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
                <input ref={inputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مورد، عميل، منتج، موظف..."
                  className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-slate-100 placeholder-slate-500' : 'text-gray-800 placeholder-gray-400'}`} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {!searchQuery.trim() ? (
                  <div className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    <Search size={26} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">ابدأ بكتابة اسم للبحث</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className={`py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    لا توجد نتائج لـ "{searchQuery}"
                  </div>
                ) : results.map(r => {
                  const cfg = typeConfig[r.type];
                  return (
                    <button key={`${r.type}-${r.id}`} onClick={() => { navigate(r.path); setSearchOpen(false); setSearchQuery(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors border-b last:border-0 ${
                        isDark ? 'border-white/[0.05] hover:bg-brand-primary/10' : 'border-gray-50 hover:bg-gray-50'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}><cfg.icon size={15} /></div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{r.label}</div>
                        <div className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{r.sub}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-brand-primary/20 text-slate-300' : 'bg-gray-100 text-gray-500'}`}>{cfg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center – Quran verse */}
      <div className="flex-1 hidden md:flex justify-center">
        <p className={`text-xs md:text-base font-semibold tracking-tight text-center ${
          isDark ? 'text-slate-100' : 'text-gray-800'
        }`}>
          ۞ ﴿ هُوَ الَّذِي جَعَلَ لَكُمُ الْأَرْضَ ذَلُولًا فَامْشُوا فِي مَنَاكِبِهَا وَكُلُوا مِن رِّزْقِهِ وَإِلَيْهِ النُّشُورُ ﴾ ۞
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className={`hidden md:flex items-center gap-2 text-sm md:text-base font-mono font-semibold ${
          isDark ? 'text-slate-100' : 'text-gray-800'
        }`}>
          <Clock size={20} className={isDark ? 'text-amber-300' : 'text-brand-primary'} />
          <span>{timeString}</span>
          <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>|</span>
          <span>{dateString}</span>
        </div>
        <button onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          className={`p-2 rounded-lg transition-colors border border-transparent ${isDark ? 'text-slate-400 hover:text-amber-400 hover:bg-white/[0.07]' : 'text-gray-600 hover:text-brand-primary hover:bg-gray-100 border-gray-200'}`}>
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg transition-colors relative border border-transparent ${isDark ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.07]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-gray-200'}`}>
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
        </div>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'bg-brand-surface2 border-white/[0.08]' : 'bg-gray-50 border-gray-200'}`}>
          <roleConfig.icon size={18} className={roleConfig.color} />
          <div className="flex flex-col">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{roleConfig.label}</span>
            <span className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{username}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

