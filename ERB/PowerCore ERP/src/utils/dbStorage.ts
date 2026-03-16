/**
 * PowerCore ERP - Storage Adapter
 * يستخدم SQLite في Electron و localStorage في المتصفح
 */

declare global {
  interface Window {
    electronAPI?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      isElectron?: boolean;
    };
  }
}

const STORAGE_KEY = 'powercore-erp-data';

function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
}

export const dbStorage = {
  // يعيد نفس الـ string الذي يخزّنه zustand (JSON) سواء من SQLite أو من localStorage
  getItem: async (name: string): Promise<string | null> => {
    if (name !== STORAGE_KEY) return null;

    if (isElectron()) {
      try {
        const state = await window.electronAPI!.invoke('db:loadState');
        if (!state) return null;
        if (state.settings?.currency === 'EGP') {
          state.settings = { ...state.settings, currency: 'دينار' };
        }
        // نلف الحالة في الشكل الذي يتوقعه persist: { state: ... }
        return JSON.stringify({ state });
      } catch {
        return null;
      }
    }

    const str = localStorage.getItem(name);
    if (!str) return null;
    return str;
  },

  // يستقبل الـ string الجاهز من persist كما هو، ويقوم فقط بإرساله إلى SQLite أو localStorage
  setItem: async (name: string, value: string): Promise<void> => {
    if (name !== STORAGE_KEY) return;

    if (isElectron()) {
      try {
        const parsed = JSON.parse(value);
        const state = parsed?.state ?? parsed;
        await window.electronAPI!.invoke('db:saveState', state);
      } catch (e) {
        console.error('dbStorage setItem error:', e);
      }
      return;
    }

    localStorage.setItem(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (name !== STORAGE_KEY) return;

    if (isElectron()) {
      await window.electronAPI!.invoke('db:saveState', {
        suppliers: [],
        customers: [],
        users: [],
        warehouses: [],
        products: [],
        stockMovements: [],
        purchaseOrders: [],
        saleInvoices: [],
        generators: [],
        rentalContracts: [],
        afterSalesRequests: [],
        employees: [],
        salaryPayments: [],
        payments: [],
        returns: [],
        notifications: [],
        settings: {
          systemName: 'PowerCore ERP',
          username: 'admin',
          password: '123456',
          currency: 'دينار',
          theme: 'light',
          language: 'ar',
        },
        isLoggedIn: false,
      });
      return;
    }

    localStorage.removeItem(name);
  },
};
