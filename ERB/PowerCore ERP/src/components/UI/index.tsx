import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, AlertTriangle, ChevronDown, Eye, Pencil, Trash2, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';

/* ─────────────────────────────────────────
   Colour palette (icon bg / text / accent)
   used by KpiCard and StatCard
───────────────────────────────────────── */
const COLOR = {
  teal:   { text: 'text-teal-400',    icon: 'bg-teal-500/15 text-teal-400',    accent: 'kpi-accent-teal'   },
  purple: { text: 'text-brand-primary-light', icon: 'bg-brand-primary/15 text-brand-primary-light', accent: 'kpi-accent-purple' },
  primary:{ text: 'text-brand-primary-light', icon: 'bg-brand-primary/15 text-brand-primary-light', accent: 'kpi-accent-purple' },
  green:  { text: 'text-emerald-400', icon: 'bg-emerald-500/15 text-emerald-400', accent: 'kpi-accent-green'  },
  blue:   { text: 'text-blue-400',    icon: 'bg-blue-500/15 text-blue-400',    accent: 'kpi-accent-blue'   },
  red:    { text: 'text-red-400',     icon: 'bg-red-500/15 text-red-400',      accent: 'kpi-accent-red'    },
  amber:  { text: 'text-amber-400',   icon: 'bg-amber-500/15 text-amber-400',  accent: 'kpi-accent-amber'  },
  indigo: { text: 'text-indigo-400',  icon: 'bg-indigo-500/15 text-indigo-400',accent: 'kpi-accent-indigo' },
  rose:   { text: 'text-rose-400',    icon: 'bg-rose-500/15 text-rose-400',    accent: 'kpi-accent-rose'   },
} as const;
type ColorKey = keyof typeof COLOR;

/* ─────────────────────────────────────────
   KpiCard  – the Odoo-style stat card
   used at top of every page
───────────────────────────────────────── */
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: ColorKey;
  sub?: string;
}
export function KpiCard({ title, value, icon, color = 'teal', sub }: KpiCardProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const c = COLOR[color] ?? COLOR.teal;

  return (
    <div
      className={`rounded-md border ${
        isDark ? 'bg-brand-surface border-white/10' : 'bg-white border-gray-200'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</p>
          <p className={`text-lg font-black mt-0.5 leading-tight ${c.text}`}>{value}</p>
          {sub && (
            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              {sub}
            </p>
          )}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   StatCard  – alias of KpiCard (legacy)
───────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: ColorKey;
  subtitle?: string;
}
export function StatCard({ title, value, icon, color = 'teal', subtitle }: StatCardProps) {
  return <KpiCard title={title} value={value} icon={icon} color={color} sub={subtitle} />;
}

/* ─────────────────────────────────────────
   Button
───────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}
export function Button({ variant = 'primary', size = 'md', icon, children, className = '', ...props }: ButtonProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const primaryText = isDark ? 'text-white' : 'text-gray-900';
  const secondaryText = isDark ? 'text-white' : 'text-gray-900';
  const variants = {
    primary:  `bg-brand-primary hover:bg-brand-primary-dark shadow-md ring-2 ring-brand-primary border-2 border-brand-primary-dark ${primaryText}`,
    secondary:`bg-brand-teal hover:bg-brand-teal-dark shadow-md ring-2 ring-brand-teal border-2 border-brand-teal-dark ${secondaryText}`,
    danger:   'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost:    'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-slate-100 dark:hover:bg-white/8 border border-transparent',
    outline:  'border-2 border-brand-primary ring-2 ring-brand-primary/40 text-brand-primary hover:bg-brand-primary/10 bg-white dark:bg-transparent dark:text-brand-primary-light',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   Card
───────────────────────────────────────── */
interface CardProps { children: React.ReactNode; className?: string; title?: string; actions?: React.ReactNode; headerPurple?: boolean; /** تقليل ارتفاع الهيدر والمحتوى (للإجماليات) */ compact?: boolean; }
export function Card({ children, className = '', title, actions, headerPurple, compact }: CardProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const headerPadding = compact ? 'px-4 py-2' : 'px-5 py-3';
  const contentPadding = compact ? 'p-3' : 'p-5';
  return (
    <div className={`rounded-xl overflow-hidden ${isDark ? 'card-dark' : 'bg-white border border-gray-200 shadow-sm border-r-[3px] border-r-brand-primary'} ${className}`}>
      {(title || actions) && (
        <div className={`flex items-center justify-between ${headerPadding} ${
          headerPurple
            ? 'bg-brand-primary text-white'
            : `border-b ${isDark ? 'border-white/[0.08]' : 'border-gray-100'}`
        }`}>
          {title && <h3 className={`font-bold text-sm ${headerPurple ? 'text-white' : isDark ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>}
          {actions && <div className={`flex items-center gap-2 ${headerPurple ? 'text-white/80' : ''}`}>{actions}</div>}
        </div>
      )}
      <div className={contentPadding}>{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal
───────────────────────────────────────── */
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; }
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-2xl shadow-2xl animate-fade-in border-r-4 border-r-brand-primary ${
        isDark ? 'bg-brand-surface border border-white/[0.1]' : 'bg-white border-2 border-brand-primary/20'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 bg-brand-primary border-b border-brand-primary-dark/30 rounded-t-2xl">
          <h2 className="font-bold text-base text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors hover:bg-white/20 text-white">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Input
───────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export function Input({ label, error, className = '', ...props }: InputProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</label>
      )}
      <input className={`w-full px-3 py-2 rounded-lg border text-sm transition-all input-focus ${
        isDark
          ? 'bg-brand-surface2 border-white/[0.12] text-slate-100 placeholder-slate-400'
          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
      } ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Select
───────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchable?: boolean;
}
export function Select({ label, options, placeholder, searchable, className = '', value, onChange, disabled, ...props }: SelectProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);
  const displayLabel = selectedOption?.label ?? '';
  const searchNorm = search.trim().toLowerCase();
  const filteredOptions = searchable
    ? options.filter(o => String(o.label).toLowerCase().includes(searchNorm))
    : options;

  useEffect(() => {
    if (!searchable || !open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchable, open]);

  if (searchable) {
    const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none pr-9 ${
      isDark
        ? 'bg-brand-surface2 border-white/[0.12] text-slate-100 placeholder-slate-500'
        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
    } ${className}`;
    return (
      <div className="space-y-1 relative" ref={containerRef}>
        {label && (
          <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</label>
        )}
        <div className="relative">
          <input
            type="text"
            value={open ? search : displayLabel}
            onChange={e => {
              setSearch(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => !disabled && setOpen(true)}
            placeholder={placeholder || 'بحث...'}
            autoComplete="off"
            disabled={disabled}
            className={inputCls}
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={16} className={isDark ? 'text-slate-400' : 'text-gray-400'} />
          </span>
        </div>
        {open && !disabled && (
          <ul
            className={`absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-auto rounded-lg border shadow-lg py-1 ${
              isDark ? 'bg-brand-surface2 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            {placeholder && (
              <li>
                <button
                  type="button"
                  className={`w-full text-right px-3 py-2 text-sm ${value === '' ? 'bg-brand-primary/20 text-brand-primary' : ''} ${isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-gray-100 text-gray-800'}`}
                  onClick={() => { onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLSelectElement>); setOpen(false); setSearch(''); }}
                >
                  {placeholder}
                </button>
              </li>
            )}
            {filteredOptions.length === 0 ? (
              <li className={`px-3 py-3 text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>لا توجد نتائج</li>
            ) : (
              filteredOptions.map(o => (
                <li key={o.value}>
                  <button
                    type="button"
                    className={`w-full text-right px-3 py-2 text-sm ${value === o.value ? 'bg-brand-primary/20 text-brand-primary font-medium' : ''} ${isDark ? 'hover:bg-white/10 text-slate-200' : 'hover:bg-gray-100 text-gray-800'}`}
                    onClick={() => { onChange?.({ target: { value: o.value } } as React.ChangeEvent<HTMLSelectElement>); setOpen(false); setSearch(''); }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</label>
      )}
      <select
        className={`w-full px-3 py-2 rounded-lg border text-sm transition-all input-focus ${
          isDark
            ? 'bg-brand-surface2 border-white/[0.12] text-slate-100'
            : 'bg-white border-gray-300 text-gray-800'
        } ${className}`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─────────────────────────────────────────
   Badge
───────────────────────────────────────── */
interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'xs' | 'sm';
  className?: string;
  children: React.ReactNode;
}
export function Badge({ variant = 'neutral', size = 'xs', className = '', children }: BadgeProps) {
  const v = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    danger:  'bg-red-500/15 text-red-400 border-red-500/20',
    info:    'bg-blue-500/15 text-blue-400 border-blue-500/20',
    neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  };
  const sizes = {
    xs: 'text-xs',
    sm: 'text-[11px] md:text-xs font-bold',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold border ${sizes[size]} ${v[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────
   SearchBox  – reusable search row
───────────────────────────────────────── */
interface SearchBoxProps { value: string; onChange: (v: string) => void; placeholder?: string; }
export function SearchBox({ value, onChange, placeholder = 'بحث...' }: SearchBoxProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-4 ${
      isDark ? 'bg-brand-surface2 border border-white/[0.09]' : 'bg-gray-100 border border-gray-200'
    }`}>
      <svg className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
      </svg>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-slate-100 placeholder-slate-400' : 'text-gray-800 placeholder-gray-400'}`} />
      {value && (
        <button onClick={() => onChange('')} className={isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ActionsCell – عمود إجراءات ديناميكي لأي جدول
───────────────────────────────────────── */
export interface ActionButton {
  icon: LucideIcon;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'view' | 'edit' | 'delete' | 'success' | 'custom';
}
interface ActionsCellProps {
  actions: ActionButton[];
  className?: string;
}
export function ActionsCell({ actions, className = '' }: ActionsCellProps) {
  const variantClasses: Record<string, string> = {
    view:   'text-blue-400 hover:bg-blue-500/10',
    edit:   'text-brand-primary hover:bg-brand-primary/10',
    delete: 'text-red-400 hover:bg-red-500/10',
    success:'text-green-400 hover:bg-green-500/10',
    custom: 'text-slate-400 hover:bg-white/10 hover:text-white',
  };
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {actions.map((a, i) => {
        const Icon = a.icon;
        const cls = variantClasses[a.variant || 'custom'] || variantClasses.custom;
        return (
          <button
            key={i}
            onClick={a.onClick}
            className={`p-1.5 rounded-lg transition-colors ${cls}`}
            title={a.label}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   Table
───────────────────────────────────────── */
interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
}
interface TableProps<T> { columns: Column<T>[]; data: T[]; emptyMessage?: string; onRowClick?: (row: T) => void; }
export function Table<T extends { id: string }>({ columns, data, emptyMessage = 'لا توجد بيانات', onRowClick }: TableProps<T>) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-max w-full text-sm table-auto border-collapse">
        <thead>
          <tr
            className={`border-b-2 ${
              isDark
                ? 'border-white/20 divide-x divide-white/10'
                : 'border-gray-300 divide-x divide-gray-200'
            }`}
          >
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`text-right px-4 py-3 font-semibold text-xs tracking-wide bg-brand-primary text-white ${
                  col.headerClassName || ''
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={`text-center py-12 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={`border-b-2 table-row-hover transition-colors ${
                  isDark
                    ? 'border-white/15 text-slate-200 divide-x divide-white/10'
                    : 'border-gray-200 text-gray-700 divide-x divide-gray-200'
                } ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIndex) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────
   Textarea
───────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; }
export function Textarea({ label, className = '', ...props }: TextareaProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  return (
    <div className="space-y-1">
      {label && <label className={`block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{label}</label>}
      <textarea className={`w-full px-3 py-2 rounded-lg border text-sm transition-all input-focus resize-none ${
        isDark
          ? 'bg-brand-surface2 border-white/[0.12] text-slate-100 placeholder-slate-400'
          : 'bg-white border-gray-300 text-gray-800'
      } ${className}`} rows={3} {...props} />
    </div>
  );
}

/* ─────────────────────────────────────────
   ConfirmDialog
───────────────────────────────────────── */
interface ConfirmDialogProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; itemName?: string;
  confirmLabel?: string; cancelLabel?: string;
}
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, itemName, confirmLabel = 'حذف', cancelLabel = 'إلغاء' }: ConfirmDialogProps) {
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl animate-fade-in ${
        isDark ? 'bg-brand-surface border border-white/[0.1]' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border-2 border-red-500/25 flex items-center justify-center mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{title}</h3>
          {itemName && (
            <div className={`text-sm font-semibold mb-2 px-3 py-1 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {itemName}
            </div>
          )}
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors shadow-sm">
            <AlertTriangle size={15} />
            {confirmLabel}
          </button>
          <button onClick={onClose}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
              isDark ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   useConfirmDelete hook
───────────────────────────────────────── */
export function useConfirmDelete() {
  const [state, setState] = useState<{ isOpen: boolean; title: string; message: string; itemName: string; onConfirm: () => void }>({
    isOpen: false, title: '', message: '', itemName: '', onConfirm: () => {},
  });
  const confirmDelete = useCallback((opts: { title: string; message: string; itemName: string; onConfirm: () => void }) => {
    setState({ isOpen: true, ...opts });
  }, []);
  const closeDialog = useCallback(() => setState(prev => ({ ...prev, isOpen: false })), []);
  const dialogProps = { isOpen: state.isOpen, onClose: closeDialog, onConfirm: state.onConfirm, title: state.title, message: state.message, itemName: state.itemName };
  return { confirmDelete, dialogProps };
}

