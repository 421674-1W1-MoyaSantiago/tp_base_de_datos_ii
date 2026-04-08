export enum ServiceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED'
}

export enum ServiceType {
  BASIC = 'BASIC',
  COMPLETE = 'COMPLETE',
  PREMIUM = 'PREMIUM',
  EXPRESS = 'EXPRESS'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum EmployeeRole {
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER'
}

export interface Vehicle {
  licensePlate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
}

export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dni: string;
  vehicles: Vehicle[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: EmployeeRole;
  username: string;
  password?: string;
  active?: boolean;
  createdAt?: string;
}

export interface ServiceOrder {
  id?: string;
  orderNumber?: string;
  clientId: string;
  vehicleLicensePlate: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  assignedEmployeeId?: string;
  price: number;
  startTime?: string;
  endTime?: string;
  deliveryTime?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  serviceOrderId: string;
  clientId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  issuedBy: string;
  issuedAt: string;
  notes?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
}

export interface SalesReport {
  totalAmount: number;
  totalInvoices: number;
  byPaymentMethod: { [key: string]: number };
  countByPaymentMethod: { [key: string]: number };
}
