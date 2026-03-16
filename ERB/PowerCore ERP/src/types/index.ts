export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // positive = we owe them, negative = they owe us
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number; // positive = they owe us, negative = we owe them
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  description?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  type: 'sale' | 'rental' | 'both';
  salePrice: number;
  costPrice: number;
  rentalPricePerDay?: number;
  minStock: number;
  warehouseId: string;
  quantity: number;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: 'in' | 'out' | 'transfer' | 'return' | 'rental_out' | 'rental_return';
  quantity: number;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  date: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  warehouseId: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  /** طريقة الدفع للدفعة المسجلة مع الأوردر (إن وجدت) */
  paymentMethod?: PaymentMethod;
  paymentType: 'full' | 'partial' | 'deferred';
  status: 'pending' | 'received' | 'cancelled';
  notes?: string;
  date: string;
  buyerName?: string;
   /** رقم هاتف مسؤول الشراء (اختياري) */
  buyerPhone?: string;
  /** قيمة الخصم على أوردر الشراء (إن وُجد) */
  discount?: number;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleInvoice {
  id: string;
  customerId: string;
  warehouseId: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  /** طريقة الدفع للدفعة المسجلة مع الفاتورة (إن وجدت) */
  paymentMethod?: PaymentMethod;
  discount: number;
  paymentType: 'immediate' | 'deferred';
  profit: number;
  status: 'active' | 'cancelled';
  notes?: string;
  date: string;
  salesperson?: string;
  /** رقم هاتف مسؤول البيع (اختياري) */
  salespersonPhone?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
}

export interface Generator {
  id: string;
  serialNumber: string;
  capacity: string;
  brand?: string;
  model?: string;
  status: 'available' | 'rented' | 'maintenance';
  notes?: string;
  createdAt: string;
}

export interface RentalContract {
  id: string;
  customerId: string;
  generatorId: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  deposit: number;
  advancePayment: number;
  totalDays: number;
  totalAmount: number;
  paidAmount: number;
  /** طريقة الدفع للدفعة المقدمة (إن وجدت) */
  paymentMethod?: PaymentMethod;
  status: 'active' | 'ended' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface AfterSalesRequest {
  id: string;
  customerId: string;
  productId?: string;
  generatorId?: string;
  reportDate: string;
  problemType: string;
  description: string;
  maintenanceCost: number;
  status: 'inspection' | 'repaired' | 'delivered';
  assignedTo?: string;
  /** رقم هاتف مسؤول الصيانة (اختياري) */
  assignedPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email?: string;
  position: string;
  department: string;
  salary: number;
  /** رصيد السُلَف الحالي للموظف (مبلغ متبقي عليه) */
  loanBalance?: number;
  startDate: string;
  status: 'active' | 'inactive';
  address?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  amount: number;
  month: string;
  bonuses: number;
  deductions: number;
  netSalary: number;
  /** طريقة صرف الراتب (اختياري) */
  paymentMethod?: PaymentMethod;
  paidAt: string;
  notes?: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  amount: number;
  type: 'advance' | 'repayment';
  date: string;
  notes?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  /** طريقة الدفع للمصروف (اختياري) */
  paymentMethod?: PaymentMethod;
  date: string;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card';

export interface Payment {
  id: string;
  type: 'customer_payment' | 'supplier_payment';
  entityId: string;
  amount: number;
  method?: PaymentMethod;
  referenceId?: string;
  notes?: string;
  date: string;
}

export interface EmployeeLoan {
  id: string;
  employeeId: string;
  /** قيمة السلفة (+) تعني سلفة جديدة، (-) تعني تسديد جزء من السلفة */
  amount: number;
  type: 'advance' | 'repayment';
  date: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'low_stock' | 'rental_expiring' | 'payment_overdue' | 'maintenance' | 'info';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Return {
  id: string;
  type: 'purchase_return' | 'sale_return';
  entityId: string;
  supplierId?: string;
  customerId?: string;
  items: ReturnItem[];
  totalAmount: number;
  reason: string;
  date: string;
}

export interface ReturnItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface AppSettings {
  systemName: string;
  username: string;
  password: string;
  logo?: string;
  currency: string;
  theme: 'light' | 'dark';
  language: 'ar';
}

export type UserRole = 'admin' | 'cashier' | 'viewer';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}
