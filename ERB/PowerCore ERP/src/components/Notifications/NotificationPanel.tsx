import { useState } from 'react';
import { Bell, Check, Trash2, AlertTriangle, Clock, CreditCard, Info, Wrench } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDateDMY } from '../../utils/date';
import { ConfirmDialog } from '../UI';

const icons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  low_stock: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  rental_expiring: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  payment_overdue: { icon: CreditCard, color: 'text-red-400', bg: 'bg-red-400/10' },
  maintenance: { icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  info: { icon: Info, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
};

export default function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, markAllRead, deleteNotification, settings } = useStore();
  const isDark = settings.theme === 'dark';
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; title: string }>({ isOpen: false, id: '', title: '' });

  return (
    <div className={`absolute left-0 top-12 w-80 rounded-xl shadow-2xl z-50 overflow-hidden border ${
      isDark ? 'bg-brand-navy-light border-white/10' : 'bg-white border-gray-200'
    }`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-primary" />
          <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>الإشعارات</span>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="bg-brand-primary text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </div>
        <button onClick={markAllRead} className="text-xs text-brand-primary hover:text-brand-primary-light flex items-center gap-1">
          <Check size={12} /> قراءة الكل
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className={`py-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.slice(0, 20).map(notif => {
            const cfg = icons[notif.type] || icons.info;
            return (
              <div key={notif.id} onClick={() => markNotificationRead(notif.id)}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${
                  isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'
                } ${!notif.isRead ? (isDark ? 'bg-brand-primary/5' : 'bg-purple-50') : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <cfg.icon size={14} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : ''} ${!notif.isRead ? 'font-bold' : ''}`}>{notif.title}</div>
                  <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{notif.message}</div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                    {formatDateDMY(notif.createdAt)}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: notif.id, title: notif.title }); }}
                  className="text-slate-500 hover:text-red-400 transition-colors mt-1">
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
        onConfirm={() => deleteNotification(deleteConfirm.id)}
        title="حذف الإشعار"
        message="هل تريد حذف هذا الإشعار نهائياً؟"
        itemName={deleteConfirm.title}
      />
    </div>
  );
}

