export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // Start date for recurring/installments, transaction date for one-time
  category: string;
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