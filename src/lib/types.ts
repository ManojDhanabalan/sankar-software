// Site Types
export interface SiteRole {
  type: string;
  cost: number;
}

export interface Site {
  id: string;
  siteName: string;
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
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
}

export interface DailyMaterial {
  materialName: string;
  company: string;
  qty: number;
  amount: number;
}

export interface DailyExpense {
  title: string;
  amount: number;
}

export interface DailyEntry {
  id: string;
  date: string;
  time: string;
  siteId: string;
  workers: DailyWorker[];
  materials: DailyMaterial[];
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
