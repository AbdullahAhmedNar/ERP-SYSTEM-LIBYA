import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import SuppliersList from './pages/Suppliers/SuppliersList';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import CustomersList from './pages/Customers/CustomersList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import Warehouses from './pages/Inventory/Warehouses';
import WarehouseDetail from './pages/Inventory/WarehouseDetail';
import Products from './pages/Inventory/Products';
import PurchasesPage from './pages/Purchases/PurchasesPage';
import SalesPage from './pages/Sales/SalesPage';
import RentalsPage from './pages/Rentals/RentalsPage';
import AfterSalesPage from './pages/AfterSales/AfterSalesPage';
import EmployeesPage from './pages/Employees/EmployeesPage';
import ExpensesPage from './pages/Expenses/ExpensesPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  const { settings, isLoggedIn, generateNotifications, currentUser } = useStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const persist = (useStore as { persist?: { onFinishHydration: (cb: () => void) => () => void; hasHydrated: () => boolean } }).persist;
    if (!persist) {
      setHasHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHasHydrated(true));
    if (persist.hasHydrated()) setHasHydrated(true);
    const fallback = setTimeout(() => setHasHydrated(true), 200);
    return () => {
      unsub();
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    document.documentElement.className = settings.theme === 'dark' ? 'dark' : '';
  }, [settings.theme]);

  useEffect(() => {
    if (!hasHydrated) return;
    generateNotifications();
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#875A7B]/30 border-t-[#875A7B] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <Login />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              currentUser?.role === 'cashier'
                ? <Navigate to="/sales" />
                : <Dashboard />
            }
          />
          <Route path="suppliers" element={<SuppliersList />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="inventory/warehouses" element={<Warehouses />} />
          <Route path="inventory/warehouses/:id" element={<WarehouseDetail />} />
          <Route path="inventory/products" element={<Products />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="after-sales" element={<AfterSalesPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
