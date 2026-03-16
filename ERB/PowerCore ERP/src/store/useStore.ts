import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { dbStorage } from '../utils/dbStorage';
import type {
  Supplier,
  Customer,
  Warehouse,
  Product,
  StockMovement,
  PurchaseOrder,
  SaleInvoice,
  Generator,
  RentalContract,
  AfterSalesRequest,
  Employee,
  SalaryPayment,
  Expense,
  Payment,
  PaymentMethod,
  Notification,
  Return,
  AppSettings,
  UserAccount,
  EmployeeLoan,
  UserRole,
} from '../types';
import { generateSeedData } from '../utils/seedData';

interface AppState {
  // Data
  suppliers: Supplier[];
  customers: Customer[];
  users: UserAccount[];
  warehouses: Warehouse[];
  products: Product[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  saleInvoices: SaleInvoice[];
  generators: Generator[];
  rentalContracts: RentalContract[];
  afterSalesRequests: AfterSalesRequest[];
  employees: Employee[];
  salaryPayments: SalaryPayment[];
  employeeLoans: EmployeeLoan[];
  expenses: Expense[];
  payments: Payment[];
  returns: Return[];
  notifications: Notification[];
  settings: AppSettings;
  isLoggedIn: boolean;
  currentUser?: { id: string; username: string; role: UserRole };

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoggedIn: (v: boolean) => void;
  setCurrentUser: (u: { id: string; username: string; role: UserRole } | undefined) => void;
  resetAllData: () => void;
  seedDemoData: () => void;
  addUser: (u: Omit<UserAccount, 'id'>) => void;
  updateUser: (id: string, u: Partial<Pick<UserAccount, 'username' | 'password' | 'role'>>) => void;
  deleteUser: (id: string) => void;

  // Notifications
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  generateNotifications: () => void;

  // Suppliers
  addSupplier: (s: Omit<Supplier, 'id' | 'createdAt' | 'balance'>) => string;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Customers
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'balance'>) => string;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Warehouses
  addWarehouse: (w: Omit<Warehouse, 'id' | 'createdAt'>) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;

  // Products
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Purchase Orders
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id'>) => void;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addSupplierPayment: (supplierId: string, amount: number, refId?: string, method?: PaymentMethod) => void;

  // Sales
  addSaleInvoice: (si: Omit<SaleInvoice, 'id'>) => void;
  updateSaleInvoice: (id: string, si: Omit<SaleInvoice, 'id'>) => void;
  deleteSaleInvoice: (id: string) => void;
  addCustomerPayment: (customerId: string, amount: number, refId?: string, method?: PaymentMethod) => void;
  updatePayment: (id: string, updates: { amount?: number; date?: string; method?: PaymentMethod }) => void;
  deletePayment: (id: string) => void;

  // Generators
  addGenerator: (g: Omit<Generator, 'id' | 'createdAt'>) => void;
  updateGenerator: (id: string, g: Partial<Generator>) => void;
  deleteGenerator: (id: string) => void;

  // Rentals
  addRentalContract: (rc: Omit<RentalContract, 'id' | 'createdAt'>) => void;
  updateRentalContract: (id: string, rc: Partial<RentalContract>) => void;
  endRental: (id: string) => void;
  deleteRentalContract: (id: string) => void;

  // After Sales
  addAfterSalesRequest: (r: Omit<AfterSalesRequest, 'id' | 'createdAt'>) => void;
  updateAfterSalesRequest: (id: string, r: Partial<AfterSalesRequest>) => void;
  deleteAfterSalesRequest: (id: string) => void;

  // Employees
  addEmployee: (e: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addSalaryPayment: (sp: Omit<SalaryPayment, 'id'>) => void;
  deleteSalaryPayment: (id: string) => void;
  addEmployeeLoan: (loan: Omit<EmployeeLoan, 'id'>) => void;

  // Expenses
  addExpense: (e: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Returns
  addReturn: (r: Omit<Return, 'id'>) => void;
  deleteReturn: (id: string) => void;

  // Stock
  addStockMovement: (m: Omit<StockMovement, 'id'>) => void;
  transferStock: (productId: string, fromWarehouseId: string, toWarehouseId: string, quantity: number) => void;

  // Backup
  exportData: () => string;
  importData: (data: string) => void;
  replaceStateFromSqlite: (state: Record<string, unknown>, shouldRedirect?: boolean) => void;

  // Computed helpers
  getSupplierBalance: (supplierId: string) => number;
  getCustomerBalance: (customerId: string) => number;
  getProductStock: (productId: string, warehouseId?: string) => number;
  getDashboardStats: () => DashboardStats;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalRentalIncome: number;
  netProfit: number;
  totalExpenses: number;
  inventoryValue: number;
  totalReceivables: number;
  totalPayables: number;
  customersCount: number;
  suppliersCount: number;
  /** عدد موردين بذمم مستحقة (رصيد > 0) */
  suppliersWithPayablesCount: number;
  /** إجمالي المبالغ لنا عند الموردين (رصيد < 0) */
  totalCreditFromSuppliers: number;
  /** عدد موردين لنا عندهم مبالغ */
  suppliersWithCreditCount: number;
  /** عدد عملاء بذمم مستحقة (رصيد > 0) */
  customersWithReceivablesCount: number;
  /** إجمالي المبالغ للعملاء علينا (رصيد عميل < 0) */
  totalCreditToCustomers: number;
  /** عدد عملاء لهم علينا مبالغ */
  customersWithCreditCount: number;
  activeRentals: number;
  lowStockProducts: Product[];
  expiringRentals: RentalContract[];
  overdueCustomers: Customer[];
}

const defaultSettings: AppSettings = {
  systemName: 'PowerCore ERP',
  username: 'admin',
  password: '123456',
  currency: 'دينار',
  theme: 'light',
  language: 'ar',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      suppliers: [],
      customers: [],
      users: [],
      warehouses: [
        { id: uuidv4(), name: 'المخزن الرئيسي', location: '', description: 'المخزن الرئيسي', createdAt: new Date().toISOString() },
        { id: uuidv4(), name: 'مخزن العرض', location: '', description: 'مخزن العرض', createdAt: new Date().toISOString() },
        { id: uuidv4(), name: 'مخزن الصيانة', location: '', description: 'مخزن الصيانة', createdAt: new Date().toISOString() },
      ],
      products: [],
      stockMovements: [],
      purchaseOrders: [],
      saleInvoices: [],
      generators: [],
      rentalContracts: [],
      afterSalesRequests: [],
      employees: [],
      salaryPayments: [],
      employeeLoans: [],
      expenses: [],
      payments: [],
      returns: [],
      notifications: [],
      settings: defaultSettings,
      isLoggedIn: false,
      currentUser: undefined,

      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
      setLoggedIn: (v) => set({ isLoggedIn: v }),
      setCurrentUser: (u) => set({ currentUser: u }),
      resetAllData: () => {
        set(() => ({
          suppliers: [],
          customers: [],
          users: [],
          warehouses: [
            { id: uuidv4(), name: 'المخزن الرئيسي', location: '', description: 'المخزن الرئيسي', createdAt: new Date().toISOString() },
            { id: uuidv4(), name: 'مخزن العرض', location: '', description: 'مخزن العرض', createdAt: new Date().toISOString() },
            { id: uuidv4(), name: 'مخزن الصيانة', location: '', description: 'مخزن الصيانة', createdAt: new Date().toISOString() },
          ],
          products: [],
          stockMovements: [],
          purchaseOrders: [],
          saleInvoices: [],
          generators: [],
          rentalContracts: [],
          afterSalesRequests: [],
          employees: [],
          salaryPayments: [],
          employeeLoans: [],
          expenses: [],
          payments: [],
          returns: [],
          notifications: [],
          settings: defaultSettings,
          isLoggedIn: false,
          currentUser: undefined,
        }));
        // أيضاً نحذف النسخة المخزّنة في localStorage الخاصة بـ zustand
        try {
          localStorage.removeItem('powercore-erp-data');
        } catch {
          // تجاهل أي خطأ في التخزين
        }
      },

      seedDemoData: () => {
        const seed = generateSeedData();
        set((state) => ({
          ...seed,
          settings: state.settings,
          isLoggedIn: state.isLoggedIn,
          users: state.users,
          currentUser: state.currentUser,
        }));
      },

      addUser: (u) => set((state) => ({
        users: [...state.users, { ...u, role: u.role || ('cashier' as UserRole), id: uuidv4() }],
      })),
      updateUser: (id, u) => set((state) => ({
        users: state.users.map(user =>
          user.id === id ? { ...user, ...u } : user
        ),
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id),
      })),

      addNotification: (n) => set((state) => ({
        notifications: [{ ...n, id: uuidv4(), createdAt: new Date().toISOString() }, ...state.notifications],
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      })),
      markAllRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      })),
      deleteNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
      generateNotifications: () => {
        const state = get();
        const newNotifications: Omit<Notification, 'id' | 'createdAt'>[] = [];
        
        // Low stock
        state.products.forEach(p => {
          const stock = get().getProductStock(p.id);
          if (stock <= p.minStock && p.minStock > 0) {
            const exists = state.notifications.some(n => n.type === 'low_stock' && n.message.includes(p.name) && !n.isRead);
            if (!exists) {
              newNotifications.push({
                type: 'low_stock',
                title: 'تنبيه: مخزون منخفض',
                message: `المنتج "${p.name}" وصل للحد الأدنى (${stock} قطعة)`,
                isRead: false,
              });
            }
          }
        });

        // Expiring rentals
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        state.rentalContracts.filter(rc => rc.status === 'active').forEach(rc => {
          const endDate = new Date(rc.endDate);
          if (endDate <= threeDaysFromNow) {
            const exists = state.notifications.some(n => n.type === 'rental_expiring' && n.message.includes(rc.id) && !n.isRead);
            if (!exists) {
              const customer = state.customers.find(c => c.id === rc.customerId);
              newNotifications.push({
                type: 'rental_expiring',
                title: 'تنبيه: عقد إيجار ينتهي قريباً',
                message: `عقد إيجار العميل "${customer?.name}" ينتهي في ${new Date(rc.endDate).toLocaleDateString('en-GB')}`,
                isRead: false,
              });
            }
          }
        });

        // Overdue customers
        state.customers.filter(c => c.balance > 0).forEach(c => {
          const exists = state.notifications.some(n => n.type === 'payment_overdue' && n.message.includes(c.name) && !n.isRead);
          if (!exists) {
            newNotifications.push({
              type: 'payment_overdue',
              title: 'تنبيه: رصيد متأخر',
              message: `العميل "${c.name}" لديه رصيد مستحق ${c.balance.toLocaleString('en-US')} ${get().settings.currency}`,
              isRead: false,
            });
          }
        });

        if (newNotifications.length > 0) {
          set((state) => ({
            notifications: [
              ...newNotifications.map(n => ({ ...n, id: uuidv4(), createdAt: new Date().toISOString() })),
              ...state.notifications,
            ],
          }));
        }
      },

      // Suppliers
      addSupplier: (s) => {
        const id = uuidv4();
        set((state) => ({
          suppliers: [...state.suppliers, { ...s, id, balance: 0, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateSupplier: (id, s) => set((state) => ({
        suppliers: state.suppliers.map(sup => sup.id === id ? { ...sup, ...s } : sup),
      })),
      deleteSupplier: (id) => set((state) => ({
        suppliers: state.suppliers.filter(s => s.id !== id),
      })),

      // Customers
      addCustomer: (c) => {
        const id = uuidv4();
        set((state) => ({
          customers: [...state.customers, { ...c, id, balance: 0, createdAt: new Date().toISOString() }],
        }));
        return id;
      },
      updateCustomer: (id, c) => set((state) => ({
        customers: state.customers.map(cu => cu.id === id ? { ...cu, ...c } : cu),
      })),
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id),
      })),

      // Warehouses
      addWarehouse: (w) => set((state) => ({
        warehouses: [...state.warehouses, { ...w, id: uuidv4(), createdAt: new Date().toISOString() }],
      })),
      updateWarehouse: (id, w) => set((state) => ({
        warehouses: state.warehouses.map(wh => wh.id === id ? { ...wh, ...w } : wh),
      })),
      deleteWarehouse: (id) => set((state) => ({
        warehouses: state.warehouses.filter(w => w.id !== id),
      })),

      // Products
      addProduct: (p) => set((state) => ({
        products: [...state.products, { ...p, id: uuidv4(), createdAt: new Date().toISOString() }],
      })),
      updateProduct: (id, p) => set((state) => ({
        products: state.products.map(pr => pr.id === id ? { ...pr, ...p } : pr),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id),
      })),

      // Purchase Orders
      addPurchaseOrder: (po) => {
        const id = uuidv4();
        set((state) => {
          // Update inventory
          const updatedProducts = [...state.products];
          const newMovements: StockMovement[] = [];
          
          po.items.forEach(item => {
            const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              updatedProducts[pIdx] = {
                ...updatedProducts[pIdx],
                quantity: updatedProducts[pIdx].quantity + item.quantity,
              };
            }
            newMovements.push({
              id: uuidv4(),
              productId: item.productId,
              warehouseId: po.warehouseId,
              type: 'in',
              quantity: item.quantity,
              referenceId: id,
              referenceType: 'purchase',
              date: po.date,
            });
          });

          // Update supplier balance
          const remaining = po.totalAmount - po.paidAmount;
          const updatedSuppliers = state.suppliers.map(s =>
            s.id === po.supplierId ? { ...s, balance: s.balance + remaining } : s
          );

          // Record payment if made
          const newPayments = [...state.payments];
          if (po.paidAmount > 0) {
            newPayments.push({
              id: uuidv4(),
              type: 'supplier_payment',
              entityId: po.supplierId,
              amount: po.paidAmount,
              method: po.paymentMethod || 'cash',
              referenceId: id,
              date: po.date,
            });
          }

          return {
            purchaseOrders: [...state.purchaseOrders, { ...po, id }],
            products: updatedProducts,
            stockMovements: [...state.stockMovements, ...newMovements],
            suppliers: updatedSuppliers,
            payments: newPayments,
          };
        });
      },
      updatePurchaseOrder: (id, po) => set((state) => ({
        purchaseOrders: state.purchaseOrders.map(p => p.id === id ? { ...p, ...po } : p),
      })),
      deletePurchaseOrder: (id) => set((state) => {
        const po = state.purchaseOrders.find(p => p.id === id);
        if (!po) return state;
        const updatedProducts = state.products.map(p => {
          const item = po.items.find(i => i.productId === p.id);
          if (!item) return p;
          return { ...p, quantity: Math.max(0, p.quantity - item.quantity) };
        });
        const remaining = po.totalAmount - po.paidAmount;
        const updatedSuppliers = state.suppliers.map(s =>
          s.id === po.supplierId ? { ...s, balance: s.balance - remaining } : s
        );
        const updatedPayments = state.payments.filter(p => p.referenceId !== id);
        return {
          purchaseOrders: state.purchaseOrders.filter(p => p.id !== id),
          products: updatedProducts,
          suppliers: updatedSuppliers,
          payments: updatedPayments,
        };
      }),
      addSupplierPayment: (supplierId, amount, refId, method = 'cash') => {
        set((state) => ({
          suppliers: state.suppliers.map(s =>
            s.id === supplierId ? { ...s, balance: s.balance - amount } : s
          ),
          payments: [...state.payments, {
            id: uuidv4(),
            type: 'supplier_payment',
            entityId: supplierId,
            amount,
            method,
            referenceId: refId,
            date: new Date().toISOString(),
          }],
        }));
      },

      // Sales
      addSaleInvoice: (si) => {
        const id = uuidv4();
        set((state) => {
          const updatedProducts = [...state.products];
          const newMovements: StockMovement[] = [];

          si.items.forEach(item => {
            const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              updatedProducts[pIdx] = {
                ...updatedProducts[pIdx],
                quantity: Math.max(0, updatedProducts[pIdx].quantity - item.quantity),
              };
            }
            newMovements.push({
              id: uuidv4(),
              productId: item.productId,
              warehouseId: si.warehouseId,
              type: 'out',
              quantity: item.quantity,
              referenceId: id,
              referenceType: 'sale',
              date: si.date,
            });
          });

          const remaining = si.totalAmount - si.paidAmount;
          const updatedCustomers = state.customers.map(c =>
            c.id === si.customerId ? { ...c, balance: c.balance + remaining } : c
          );

          const newPayments = [...state.payments];
          if (si.paidAmount > 0) {
            newPayments.push({
              id: uuidv4(),
              type: 'customer_payment',
              entityId: si.customerId,
              amount: si.paidAmount,
              method: si.paymentMethod || 'cash',
              referenceId: id,
              date: si.date,
            });
          }

          return {
            saleInvoices: [...state.saleInvoices, { ...si, id }],
            products: updatedProducts,
            stockMovements: [...state.stockMovements, ...newMovements],
            customers: updatedCustomers,
            payments: newPayments,
          };
        });
      },
      updateSaleInvoice: (id, si) => {
        set((state) => {
          const existing = state.saleInvoices.find(inv => inv.id === id);
          if (!existing) return state;

          // Reverse old effects
          let products = [...state.products];
          let stockMovements = state.stockMovements.filter(m => !(m.referenceType === 'sale' && m.referenceId === id));

          existing.items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              products[pIdx] = {
                ...products[pIdx],
                quantity: products[pIdx].quantity + item.quantity,
              };
            }
          });

          const oldRemaining = existing.totalAmount - existing.paidAmount;
          let customers = state.customers.map(c =>
            c.id === existing.customerId ? { ...c, balance: c.balance - oldRemaining } : c
          );

          // Remove initial payment linked to old invoice (created at invoice date)
          let payments = state.payments.filter(p =>
            !(p.type === 'customer_payment' && p.referenceId === id && p.date === existing.date)
          );

          // Apply new effects (similar to addSaleInvoice but keep same id)
          const newMovements: StockMovement[] = [];
          const updatedInvoice: SaleInvoice = { ...si, id };

          updatedInvoice.items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              products[pIdx] = {
                ...products[pIdx],
                quantity: Math.max(0, products[pIdx].quantity - item.quantity),
              };
            }
            newMovements.push({
              id: uuidv4(),
              productId: item.productId,
              warehouseId: updatedInvoice.warehouseId,
              type: 'out',
              quantity: item.quantity,
              referenceId: id,
              referenceType: 'sale',
              date: updatedInvoice.date,
            });
          });

          const remaining = updatedInvoice.totalAmount - updatedInvoice.paidAmount;
          customers = customers.map(c =>
            c.id === updatedInvoice.customerId ? { ...c, balance: c.balance + remaining } : c
          );

          if (updatedInvoice.paidAmount > 0) {
            payments = [
              ...payments,
              {
                id: uuidv4(),
                type: 'customer_payment',
                entityId: updatedInvoice.customerId,
                amount: updatedInvoice.paidAmount,
                method: updatedInvoice.paymentMethod || 'cash',
                referenceId: id,
                date: updatedInvoice.date,
              },
            ];
          }

          return {
            saleInvoices: state.saleInvoices.map(inv => (inv.id === id ? updatedInvoice : inv)),
            products,
            stockMovements: [...stockMovements, ...newMovements],
            customers,
            payments,
          };
        });
      },
      deleteSaleInvoice: (id) => {
        set((state) => {
          const existing = state.saleInvoices.find(inv => inv.id === id);
          if (!existing) return state;

          let products = [...state.products];
          const stockMovements = state.stockMovements.filter(m => !(m.referenceType === 'sale' && m.referenceId === id));

          existing.items.forEach(item => {
            const pIdx = products.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              products[pIdx] = {
                ...products[pIdx],
                quantity: products[pIdx].quantity + item.quantity,
              };
            }
          });

          const remaining = existing.totalAmount - existing.paidAmount;
          const customers = state.customers.map(c =>
            c.id === existing.customerId ? { ...c, balance: c.balance - remaining } : c
          );

          const payments = state.payments.filter(p =>
            !(p.type === 'customer_payment' && p.referenceId === id && p.date === existing.date)
          );

          return {
            saleInvoices: state.saleInvoices.filter(inv => inv.id !== id),
            products,
            stockMovements,
            customers,
            payments,
          };
        });
      },
      addCustomerPayment: (customerId, amount, refId, method = 'cash') => {
        set((state) => ({
          customers: state.customers.map(c =>
            c.id === customerId ? { ...c, balance: c.balance - amount } : c
          ),
          payments: [...state.payments, {
            id: uuidv4(),
            type: 'customer_payment',
            entityId: customerId,
            amount,
            method,
            referenceId: refId,
            date: new Date().toISOString(),
          }],
        }));
      },
      updatePayment: (paymentId, updates) => set((state) => {
        const p = state.payments.find(x => x.id === paymentId);
        if (!p || (updates.amount === undefined && updates.date === undefined && updates.method === undefined)) return state;
        const delta = updates.amount !== undefined ? updates.amount - p.amount : 0;
        const updatedPayment = { ...p, ...updates };
        if (p.type === 'customer_payment') {
          return {
            payments: state.payments.map(x => x.id === paymentId ? updatedPayment : x),
            customers: state.customers.map(c =>
              c.id === p.entityId ? { ...c, balance: c.balance - delta } : c
            ),
          };
        }
        return {
          payments: state.payments.map(x => x.id === paymentId ? updatedPayment : x),
          suppliers: state.suppliers.map(s =>
            s.id === p.entityId ? { ...s, balance: s.balance - delta } : s
          ),
        };
      }),
      deletePayment: (paymentId) => set((state) => {
        const p = state.payments.find(x => x.id === paymentId);
        if (!p) return state;
        if (p.type === 'customer_payment') {
          return {
            payments: state.payments.filter(x => x.id !== paymentId),
            customers: state.customers.map(c =>
              c.id === p.entityId ? { ...c, balance: c.balance + p.amount } : c
            ),
          };
        }
        return {
          payments: state.payments.filter(x => x.id !== paymentId),
          suppliers: state.suppliers.map(s =>
            s.id === p.entityId ? { ...s, balance: s.balance + p.amount } : s
          ),
        };
      }),

      // Generators
      addGenerator: (g) => set((state) => ({
        generators: [...state.generators, { ...g, id: uuidv4(), createdAt: new Date().toISOString() }],
      })),
      updateGenerator: (id, g) => set((state) => {
        const gen = state.generators.find(gen => gen.id === id);
        if (!gen) return state;
        const hasActiveContract = state.rentalContracts.some(rc => rc.generatorId === id && rc.status === 'active');
        const isSettingAvailable = g.status === 'available';
        const needEndContract = hasActiveContract && isSettingAvailable;
        return {
          generators: state.generators.map(gen => gen.id === id ? { ...gen, ...g } : gen),
          rentalContracts: needEndContract
            ? state.rentalContracts.map(rc =>
                rc.generatorId === id && rc.status === 'active' ? { ...rc, status: 'ended' as const } : rc
              )
            : state.rentalContracts,
        };
      }),
      deleteGenerator: (id) => set((state) => ({
        generators: state.generators.filter(g => g.id !== id),
        rentalContracts: state.rentalContracts.map(rc =>
          rc.generatorId === id && rc.status === 'active' ? { ...rc, status: 'cancelled' as const } : rc
        ),
      })),

      // Rentals
      addRentalContract: (rc) => {
        const id = uuidv4();
        const days = Math.ceil((new Date(rc.endDate).getTime() - new Date(rc.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const totalAmount = days * rc.dailyRate + rc.deposit;
        const paidAmount = rc.advancePayment;
        const remaining = totalAmount - paidAmount;
        
        set((state) => {
          const updatedCustomers = state.customers.map(c =>
            c.id === rc.customerId ? { ...c, balance: c.balance + remaining } : c
          );
          const updatedGenerators = state.generators.map(g =>
            g.id === rc.generatorId ? { ...g, status: 'rented' as const } : g
          );
          const newPayments = [...state.payments];
          if (paidAmount > 0) {
            newPayments.push({
              id: uuidv4(),
              type: 'customer_payment',
              entityId: rc.customerId,
              amount: paidAmount,
              method: rc.paymentMethod || 'cash',
              referenceId: id,
              date: rc.startDate,
            });
          }
          return {
            rentalContracts: [...state.rentalContracts, {
              ...rc, id,
              totalDays: days,
              totalAmount,
              paidAmount,
              createdAt: new Date().toISOString(),
            }],
            generators: updatedGenerators,
            customers: updatedCustomers,
            payments: newPayments,
          };
        });
      },
      updateRentalContract: (id, rc) => set((state) => {
        const contract = state.rentalContracts.find(r => r.id === id);
        if (!contract) return state;
        const wasActive = contract.status === 'active';
        const wasEndedOrCancelled = contract.status === 'ended' || contract.status === 'cancelled';
        const isNowActive = rc.status === 'active';
        const isNowEndedOrCancelled = rc.status === 'ended' || rc.status === 'cancelled';
        const needFreeGenerator = wasActive && isNowEndedOrCancelled;
        const needRentGenerator = wasEndedOrCancelled && isNowActive;
        const updatedContracts = state.rentalContracts.map(r => r.id === id ? { ...r, ...rc } : r);
        const hasOtherActiveContract = (genId: string, excludeId: string) =>
          updatedContracts.some(rc => rc.generatorId === genId && rc.id !== excludeId && rc.status === 'active');
        return {
          rentalContracts: updatedContracts,
          generators: state.generators.map(g => {
            if (g.id !== contract.generatorId) return g;
            if (needFreeGenerator && !hasOtherActiveContract(g.id, id))
              return { ...g, status: 'available' as const };
            if (needRentGenerator) return { ...g, status: 'rented' as const };
            return g;
          }),
        };
      }),
      endRental: (id) => {
        set((state) => {
          const contract = state.rentalContracts.find(r => r.id === id);
          if (!contract) return state;
          return {
            rentalContracts: state.rentalContracts.map(r =>
              r.id === id ? { ...r, status: 'ended' as const } : r
            ),
            generators: state.generators.map(g =>
              g.id === contract.generatorId ? { ...g, status: 'available' as const } : g
            ),
          };
        });
      },
      deleteRentalContract: (id) => {
        set((state) => {
          const contract = state.rentalContracts.find(r => r.id === id);
          if (!contract) return state;
          const wasActive = contract.status === 'active';
          return {
            rentalContracts: state.rentalContracts.filter(r => r.id !== id),
            generators: wasActive
              ? state.generators.map(g =>
                  g.id === contract.generatorId ? { ...g, status: 'available' as const } : g
                )
              : state.generators,
          };
        });
      },

      // After Sales
      addAfterSalesRequest: (r) => set((state) => ({
        afterSalesRequests: [...state.afterSalesRequests, { ...r, id: uuidv4(), createdAt: new Date().toISOString() }],
      })),
      updateAfterSalesRequest: (id, r) => set((state) => ({
        afterSalesRequests: state.afterSalesRequests.map(req => req.id === id ? { ...req, ...r } : req),
      })),
      deleteAfterSalesRequest: (id) => set((state) => ({
        afterSalesRequests: state.afterSalesRequests.filter(req => req.id !== id),
      })),

      // Employees
      addEmployee: (e) => set((state) => ({
        employees: [
          ...state.employees,
          {
            ...e,
            loanBalance: e.loanBalance ?? 0,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      updateEmployee: (id, e) => set((state) => ({
        employees: state.employees.map(emp => {
          if (emp.id !== id) return emp;
          const updated: Employee = { ...emp, ...e };
          if (updated.loanBalance === undefined) {
            updated.loanBalance = emp.loanBalance ?? 0;
          }
          return updated;
        }),
      })),
      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter(e => e.id !== id),
      })),
      addSalaryPayment: (sp) => set((state) => ({
        salaryPayments: [...state.salaryPayments, { ...sp, id: uuidv4() }],
      })),
      deleteSalaryPayment: (id) => set((state) => ({
        salaryPayments: state.salaryPayments.filter(sp => sp.id !== id),
      })),
      addEmployeeLoan: (loan) => set((state) => {
        const id = uuidv4();
        const baseAmount = Math.abs(loan.amount);
        const signedAmount = loan.type === 'advance' ? baseAmount : -baseAmount;
        const employees = state.employees.map(emp =>
          emp.id === loan.employeeId
            ? {
                ...emp,
                loanBalance: (emp.loanBalance ?? 0) + signedAmount,
              }
            : emp
        );
        return {
          employees,
          employeeLoans: [
            ...(state as any).employeeLoans || [],
            {
              ...loan,
              id,
              amount: signedAmount,
            } as EmployeeLoan,
          ],
        };
      }),

      // Expenses
      addExpense: (e) => set((state) => ({
        expenses: [...state.expenses, { ...e, id: uuidv4() }],
      })),
      updateExpense: (id, e) => set((state) => ({
        expenses: state.expenses.map(exp => exp.id === id ? { ...exp, ...e } : exp),
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id),
      })),

      // Returns
      addReturn: (r) => {
        const id = uuidv4();
        set((state) => {
          const updatedProducts = [...state.products];
          const newMovements: StockMovement[] = [];
          
          r.items.forEach(item => {
            const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
            if (pIdx >= 0) {
              if (r.type === 'sale_return') {
                updatedProducts[pIdx] = { ...updatedProducts[pIdx], quantity: updatedProducts[pIdx].quantity + item.quantity };
              } else {
                updatedProducts[pIdx] = { ...updatedProducts[pIdx], quantity: Math.max(0, updatedProducts[pIdx].quantity - item.quantity) };
              }
            }
            newMovements.push({
              id: uuidv4(),
              productId: item.productId,
              warehouseId: state.warehouses[0]?.id || '',
              type: 'return',
              quantity: item.quantity,
              referenceId: id,
              referenceType: r.type,
              date: r.date,
            });
          });

          let updatedSuppliers = state.suppliers;
          let updatedCustomers = state.customers;
          
          if (r.type === 'purchase_return' && r.supplierId) {
            updatedSuppliers = state.suppliers.map(s =>
              s.id === r.supplierId ? { ...s, balance: s.balance - r.totalAmount } : s
            );
          } else if (r.type === 'sale_return' && r.customerId) {
            updatedCustomers = state.customers.map(c =>
              c.id === r.customerId ? { ...c, balance: c.balance - r.totalAmount } : c
            );
          }

          return {
            returns: [...state.returns, { ...r, id }],
            products: updatedProducts,
            stockMovements: [...state.stockMovements, ...newMovements],
            suppliers: updatedSuppliers,
            customers: updatedCustomers,
          };
        });
      },
      deleteReturn: (returnId) => set((state) => {
        const r = state.returns.find(x => x.id === returnId);
        if (!r) return state;
        const updatedProducts = state.products.map(p => {
          const item = r.items.find(i => i.productId === p.id);
          if (!item) return p;
          if (r.type === 'sale_return') {
            return { ...p, quantity: Math.max(0, p.quantity - item.quantity) };
          }
          return { ...p, quantity: p.quantity + item.quantity };
        });
        let updatedSuppliers = state.suppliers;
        let updatedCustomers = state.customers;
        if (r.type === 'purchase_return' && r.supplierId) {
          updatedSuppliers = state.suppliers.map(s =>
            s.id === r.supplierId ? { ...s, balance: s.balance + r.totalAmount } : s
          );
        } else if (r.type === 'sale_return' && r.customerId) {
          updatedCustomers = state.customers.map(c =>
            c.id === r.customerId ? { ...c, balance: c.balance + r.totalAmount } : c
          );
        }
        return {
          returns: state.returns.filter(x => x.id !== returnId),
          products: updatedProducts,
          suppliers: updatedSuppliers,
          customers: updatedCustomers,
        };
      }),

      addStockMovement: (m) => set((state) => ({
        stockMovements: [...state.stockMovements, { ...m, id: uuidv4() }],
      })),
      transferStock: (productId, fromWarehouseId, toWarehouseId, quantity) => {
        set((state) => {
          const pIdx = state.products.findIndex(p => p.id === productId);
          const updatedProducts = [...state.products];
          if (pIdx >= 0) {
            updatedProducts[pIdx] = {
              ...updatedProducts[pIdx],
              warehouseId: toWarehouseId,
            };
          }
          const now = new Date().toISOString();
          return {
            products: updatedProducts,
            stockMovements: [
              ...state.stockMovements,
              { id: uuidv4(), productId, warehouseId: fromWarehouseId, type: 'transfer' as const, quantity, referenceType: 'transfer_out', date: now },
              { id: uuidv4(), productId, warehouseId: toWarehouseId, type: 'transfer' as const, quantity, referenceType: 'transfer_in', date: now },
            ],
          };
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          suppliers: state.suppliers,
          customers: state.customers,
          warehouses: state.warehouses,
          products: state.products,
          stockMovements: state.stockMovements,
          purchaseOrders: state.purchaseOrders,
          saleInvoices: state.saleInvoices,
          generators: state.generators,
          rentalContracts: state.rentalContracts,
          afterSalesRequests: state.afterSalesRequests,
          employees: state.employees,
          salaryPayments: state.salaryPayments,
          employeeLoans: state.employeeLoans,
          expenses: state.expenses,
          payments: state.payments,
          returns: state.returns,
          settings: state.settings,
          exportDate: new Date().toISOString(),
        }, null, 2);
      },
      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set((state) => ({
            ...state,
            suppliers: parsed.suppliers || state.suppliers,
            customers: parsed.customers || state.customers,
            warehouses: parsed.warehouses || state.warehouses,
            products: parsed.products || state.products,
            stockMovements: parsed.stockMovements || state.stockMovements,
            purchaseOrders: parsed.purchaseOrders || state.purchaseOrders,
            saleInvoices: parsed.saleInvoices || state.saleInvoices,
            generators: parsed.generators || state.generators,
            rentalContracts: parsed.rentalContracts || state.rentalContracts,
            afterSalesRequests: parsed.afterSalesRequests || state.afterSalesRequests,
            employees: parsed.employees || state.employees,
            salaryPayments: parsed.salaryPayments || state.salaryPayments,
            employeeLoans: parsed.employeeLoans || (state as any).employeeLoans || [],
            expenses: parsed.expenses || state.expenses,
            payments: parsed.payments || state.payments,
            returns: parsed.returns || state.returns,
            settings: parsed.settings || state.settings,
          }));
        } catch (e) {
          console.error('Import failed:', e);
        }
      },
      replaceStateFromSqlite: (rawState: Record<string, unknown>, shouldRedirect = false) => {
        set((currentState) => {
          const merged: Partial<typeof currentState> = {};
          const restorableKeys = [
            'suppliers',
            'customers',
            'users',
            'warehouses',
            'products',
            'stockMovements',
            'purchaseOrders',
            'saleInvoices',
            'generators',
            'rentalContracts',
            'afterSalesRequests',
            'employees',
            'salaryPayments',
            'employeeLoans',
            'expenses',
            'payments',
            'returns',
            'notifications',
            'settings',
          ];
          for (const key of restorableKeys) {
            if (key in rawState && rawState[key] !== undefined) {
              (merged as any)[key] = rawState[key];
            }
          }
          // الاحتفاظ بحالة تسجيل الدخول الحالية — لا نلمس isLoggedIn
          if (!shouldRedirect && currentState.isLoggedIn) {
            (merged as any).isLoggedIn = true;
          } else if (shouldRedirect && rawState.isLoggedIn !== undefined) {
            (merged as any).isLoggedIn = !!rawState.isLoggedIn;
          }
          return merged;
        });
      },

      // Computed
      getSupplierBalance: (supplierId) => {
        return get().suppliers.find(s => s.id === supplierId)?.balance || 0;
      },
      getCustomerBalance: (customerId) => {
        return get().customers.find(c => c.id === customerId)?.balance || 0;
      },
      getProductStock: (productId, warehouseId) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return 0;
        if (warehouseId && product.warehouseId !== warehouseId) return 0;
        return product.quantity;
      },
      getDashboardStats: () => {
        const state = get();
        const totalSales = state.saleInvoices.filter(si => si.status === 'active').reduce((sum, si) => sum + si.totalAmount, 0);
        const totalPurchases = state.purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
        const totalRentalIncome = state.rentalContracts.filter(rc => rc.status !== 'cancelled').reduce((sum, rc) => sum + rc.totalAmount, 0);
        const totalCOGS = state.saleInvoices
          .filter(si => si.status === 'active')
          .reduce((sum, si) => sum + si.items.reduce((s, item) => s + item.costPrice * item.quantity, 0), 0);
        const totalSalaries = state.salaryPayments.reduce((sum, sp) => sum + sp.netSalary, 0);
        const totalExpenses = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalAfterSalesCost = state.afterSalesRequests.reduce(
          (sum, r) => sum + (r.maintenanceCost || 0),
          0
        );
        const netProfit =
          (totalSales + totalRentalIncome) -
          totalPurchases -
          totalSalaries -
          totalExpenses -
          totalAfterSalesCost;
        const inventoryValue = state.products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
        const totalReceivables = state.customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);
        const totalPayables = state.suppliers.filter(s => s.balance > 0).reduce((sum, s) => sum + s.balance, 0);
        const suppliersWithPayables = state.suppliers.filter(s => s.balance > 0);
        const suppliersWithCredit = state.suppliers.filter(s => s.balance < 0);
        const totalCreditFromSuppliers = suppliersWithCredit.reduce((sum, s) => sum + Math.abs(s.balance), 0);
        const customersWithReceivables = state.customers.filter(c => c.balance > 0);
        const customersWithCredit = state.customers.filter(c => c.balance < 0);
        const totalCreditToCustomers = customersWithCredit.reduce((sum, c) => sum + Math.abs(c.balance), 0);
        const activeRentals = state.rentalContracts.filter(rc => rc.status === 'active').length;

        const lowStockProducts = state.products.filter(p => p.quantity <= p.minStock && p.minStock > 0);

        const threeDays = new Date();
        threeDays.setDate(threeDays.getDate() + 3);
        const expiringRentals = state.rentalContracts.filter(rc =>
          rc.status === 'active' && new Date(rc.endDate) <= threeDays
        );

        const overdueCustomers = state.customers.filter(c => c.balance > 0);

        return {
          totalSales, totalPurchases, totalRentalIncome, netProfit,
          totalExpenses,
          inventoryValue, totalReceivables, totalPayables,
          customersCount: state.customers.length,
          suppliersCount: state.suppliers.length,
          suppliersWithPayablesCount: suppliersWithPayables.length,
          totalCreditFromSuppliers,
          suppliersWithCreditCount: suppliersWithCredit.length,
          customersWithReceivablesCount: customersWithReceivables.length,
          totalCreditToCustomers,
          customersWithCreditCount: customersWithCredit.length,
          activeRentals,
          lowStockProducts,
          expiringRentals,
          overdueCustomers,
        };
      },
    }),
    {
      name: 'powercore-erp-data',
      storage: {
        getItem: (name: string) => dbStorage.getItem(name),
        // persist يمرّر كائنات JS هنا، فنحوّلها إلى JSON string قبل إرسالها إلى dbStorage
        setItem: (name: string, value: unknown) => dbStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name: string) => dbStorage.removeItem(name),
      } as any,
      partialize: (state) => ({
        suppliers: state.suppliers,
        customers: state.customers,
        users: state.users,
        warehouses: state.warehouses,
        products: state.products,
        stockMovements: state.stockMovements,
        purchaseOrders: state.purchaseOrders,
        saleInvoices: state.saleInvoices,
        generators: state.generators,
        rentalContracts: state.rentalContracts,
        afterSalesRequests: state.afterSalesRequests,
        employees: state.employees,
        salaryPayments: state.salaryPayments,
        employeeLoans: state.employeeLoans,
        expenses: state.expenses,
        payments: state.payments,
        returns: state.returns,
        notifications: state.notifications,
        settings: state.settings,
        isLoggedIn: state.isLoggedIn,
        currentUser: state.currentUser,
      }),
    }
  )
);
