export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // Start date for recurring/installments, transaction date for one-time
  category: string;
  subcategory?: string;
  isRecurring: boolean;
  installments?: {
    total: number;
  };
}

export interface SavingsJar {
  id:string;
  name: string;
  percentage: number;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'success' | 'danger';
}