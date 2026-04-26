// Site Types
export interface SiteRole {
  type: string;
  cost: number;
}

export interface Site {
  id: string;
  siteName: string;
  location?: string;
  startDate: string;
  endDate: string;
  roles: SiteRole[];
  status: "Ongoing" | "Completed";
  createdAt: string;
  updatedAt: string;
}

// Daily Entry Types
export interface DailyWorker {
  personName: string;
  type: string;
  shift: number;
  qty: number;
  rate: number;
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
  labourCount?: number;
}

export interface DailyMaterial {
  materialName: string;
  company: string;
  qty: number;
  marketCost: number;
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
}

export interface DailyMachinery {
  personName: string;
  machineryName: string;
  qty: number;
  cost: number;
  bata?: number;
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
}

export interface DailyExpense {
  title: string;
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
}

export interface DailyEntry {
  id: string;
  date: string;
  time: string;
  siteId: string;
  workers: DailyWorker[];
  materials: DailyMaterial[];
  machinery: DailyMachinery[];
  expenses: DailyExpense[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  totalSites: number;
  totalPendingAmount: number;
  todayTotalAmount: number;
  todayLabourCost: number;
  todayMaterialCost: number;
  todayExpenseCost: number;
}

// Contact Form
export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}
