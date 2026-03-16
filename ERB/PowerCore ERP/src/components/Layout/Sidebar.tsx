import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Package, ShoppingCart,
  TrendingUp, Zap, Wrench, BarChart3, Settings,
  ChevronDown, ChevronLeft, LogOut, Warehouse, UserCog, Wallet
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types';
import systemLogo from '../../imgaes/lib.ico';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'الداشبورد', exact: true },
  { label: 'الموردون والمشتريات', icon: ShoppingCart,
    children: [
      { path: '/suppliers', icon: Users,       label: 'الموردون'   },
      { path: '/purchases', icon: ShoppingCart, label: 'المشتريات'  },
    ]},
  { label: 'العملاء والمبيعات', icon: UserCheck,
    children: [
      { path: '/customers', icon: UserCheck, label: 'العملاء'  },
      { path: '/sales',     icon: TrendingUp,label: 'المبيعات' },
    ]},
  { label: 'المخزون', icon: Package,
    children: [
      { path: '/inventory/warehouses', icon: Warehouse, label: 'المخازن'  },
      { path: '/inventory/products',   icon: Package,   label: 'المنتجات' },
    ]},
  { path: '/rentals',    icon: Zap,     label: 'تأجير المولدات'        },
  { path: '/after-sales',icon: Wrench,  label: 'خدمة ما بعد البيع'     },
  { path: '/employees',  icon: UserCog, label: 'إدارة الموظفين'         },
  { path: '/expenses',   icon: Wallet,  label: 'المصروفات'              },
  { path: '/reports',    icon: BarChart3,label: 'التقارير والإحصائيات'  },
  { path: '/settings',   icon: Settings, label: 'الإعدادات'             },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const [openGroups, setOpenGroups] = useState<string[]>(['الموردون والمشتريات', 'العملاء والمبيعات', 'المخزون']);
  const { settings, setLoggedIn, currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const toggle = (l: string) => setOpenGroups(p => p.includes(l) ? p.filter(g => g !== l) : [...p, l]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
      isActive ? 'bg-white/20 text-white' : 'text-white/85 hover:text-white hover:bg-white/10'
    }`;

  const role: UserRole = currentUser?.role || 'admin';
  const roleAllowedPaths: Record<UserRole, string[] | 'all'> = {
    admin: 'all',
    cashier: [
      '/sales',
      '/customers',
      '/expenses',
      '/after-sales',
      '/rentals',
      '/suppliers',
      '/purchases',
      '/inventory/warehouses',
      '/inventory/products',
    ],
    viewer: ['/', '/reports'],
  };
  const canAccess = (path?: string) => {
    if (!path) return true;
    const allowed = roleAllowedPaths[role];
    if (allowed === 'all') return true;
    return allowed.includes(path);
  };

  return (
    <aside
      style={{ backgroundColor: 'var(--brand-primary)' }}
      className={`h-full flex flex-col transition-all duration-300 border-l border-white/10 rounded-l-2xl ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/15">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <img
            src={systemLogo}
            alt={settings.systemName}
            className="w-9 h-9 object-contain"
          />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-tight">{settings.systemName}</div>
            <div className="text-white/70 text-xs mt-0.5">نظام إدارة مركزي</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          if ('path' in item && item.path && !canAccess(item.path)) {
            return null;
          }
          if ('children' in item) {
            const isOpen = openGroups.includes(item.label);
            if (collapsed) return null;
            return (
              <div key={item.label} className="border-b border-white/15 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                <button onClick={() => toggle(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors text-white/70 hover:text-white mt-3 mb-1">
                  <span>{item.label}</span>
                  {isOpen ? <ChevronDown size={11} /> : <ChevronLeft size={11} />}
                </button>
                {isOpen && (
                  <div className="mr-3 border-r border-white/15 pr-2 [&>a]:border-b [&>a]:border-white/15 [&>a]:py-2 [&>a:last-child]:border-0">
                    {item.children!
                      .filter(child => canAccess(child.path))
                      .map(child => (
                        <NavLink key={child.path} to={child.path} className={linkClass}>
                          <child.icon size={15} className="flex-shrink-0" />
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={item.path} className="border-b border-white/15 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
              <NavLink to={item.path!} end={item.exact} className={linkClass} title={collapsed ? item.label : undefined}>
                <item.icon size={17} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/15">
        <button onClick={() => { setLoggedIn(false); setCurrentUser(undefined); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm text-white/75 hover:text-white hover:bg-white/10"
          title={collapsed ? 'تسجيل الخروج' : undefined}>
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
}

