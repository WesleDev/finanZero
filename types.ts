
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  installments?: {
    total: number;
  };
}

export interface SavingsJar {
  id:string;
  name: string;
  percentage: number;
}
