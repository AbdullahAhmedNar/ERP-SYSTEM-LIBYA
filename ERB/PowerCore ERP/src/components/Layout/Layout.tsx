import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useStore } from '../../store/useStore';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const { settings } = useStore();
  const isDark = settings.theme === 'dark';

  return (
    <div className={`flex h-screen overflow-hidden dark:bg-brand-bg dark:text-slate-100 ${isDark ? 'bg-brand-bg text-slate-100' : 'bg-[#F0F2F5] text-gray-800'}`}>
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className={`flex-1 overflow-y-auto p-6 dark:bg-brand-bg dark:text-slate-100 ${isDark ? 'bg-brand-bg text-slate-100' : 'bg-[#F0F2F5]'}`}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

