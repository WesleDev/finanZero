
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Expense, SavingsJar, Income, Notification } from './types';
import useLocalStorage from './hooks/useLocalStorage';

// --- ICONS ---
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
const WalletIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 mr-2"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const TrendingDownIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
);
const MinusCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const RecurringIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Gasto Recorrente</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
);
const ChevronLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const CurrencyDollarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M12 18v-1m0-1v-1m0 0v-1m0 0V9.99M12 18h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
  </svg>
);
const ChartPieIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);
const CreditCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);
const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExclamationIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const FastForwardIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Antecipar Parcelas</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);


// --- UTILS & CONSTANTS ---
const EXPENSE_CATEGORIES = ['Cartão de Crédito', 'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'] as const;

const SUBCATEGORIES: Record<string, string[]> = {
  'Cartão de Crédito': ['Streaming', 'Roupas', 'Lazer', 'Supermercado', 'Outros'],
  'Alimentação': ['Supermercado', 'Restaurante', 'Delivery', 'Outros'],
  'Moradia': ['Aluguel', 'Condomínio', 'Contas (Água, Luz, etc.)', 'Manutenção', 'Outros'],
  'Transporte': ['Combustível', 'Transporte Público', 'App de Transporte', 'Manutenção', 'Outros'],
  'Lazer': ['Cinema', 'Viagem', 'Hobbies', 'Outros'],
  'Saúde': ['Farmácia', 'Consulta', 'Plano de Saúde', 'Outros'],
  'Educação': ['Curso', 'Livros', 'Mensalidade', 'Outros'],
};

const formatCurrency = (value: number, isCensored: boolean) => {
  if (isCensored) return 'R$ ●●●';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrencyInput = (value: string): number => {
    if (typeof value !== 'string' || value.trim() === '') return 0;
    const sanitizedValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(sanitizedValue);
    return isNaN(numericValue) ? 0 : numericValue;
};


const getMonthYear = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getBillingDayInMonth = (expenseDate: string, displayedDate: Date): Date => {
    const originalDate = new Date(expenseDate + 'T00:00:00');
    const day = originalDate.getDate();
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const billingDay = Math.min(day, daysInMonth);
    
    return new Date(year, month, billingDay);
};

const calculateMonthlyExpensesForDate = (expenses: Expense[], date: Date): number => {
    const targetMonthYear = getMonthYear(date);
    const CARD_CLOSING_DAY = 15;

    return expenses.reduce((total, expense) => {
      if (expense.isRecurring) {
        const effectiveStartDate = new Date(expense.date + 'T00:00:00');
        if (expense.category === 'Cartão de Crédito' && effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
            effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
        }
        const effectiveStartMonthYear = getMonthYear(effectiveStartDate);

        if (effectiveStartMonthYear <= targetMonthYear) {
          return total + expense.amount;
        }
      } else if (expense.installments) {
        const effectiveStartDate = new Date(expense.date + 'T00:00:00');
        const firstPaymentDate = new Date(effectiveStartDate);
         if (expense.category === 'Cartão de Crédito' && firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
            firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        }
        
        const installmentAmount = expense.amount / expense.installments.total;
        for (let i = 0; i < expense.installments.total; i++) {
          const installmentDate = new Date(firstPaymentDate);
          installmentDate.setMonth(firstPaymentDate.getMonth() + i);
          if (getMonthYear(installmentDate) === targetMonthYear) {
            return total + installmentAmount;
          }
        }
      } else { // One-time expense
        const effectiveDate = new Date(expense.date + 'T00:00:00');
        if (expense.category === 'Cartão de Crédito' && effectiveDate.getDate() >= CARD_CLOSING_DAY) {
            effectiveDate.setMonth(effectiveDate.getMonth() + 1);
        }
        const effectiveMonthYear = getMonthYear(effectiveDate);

        if (effectiveMonthYear === targetMonthYear) {
          return total + expense.amount;
        }
      }
      return total;
    }, 0);
};

// --- MODAL COMPONENTS ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-dark-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Excluir', confirmVariant = 'danger' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantClasses = {
      danger: 'bg-danger hover:bg-red-700',
      primary: 'bg-primary hover:bg-secondary'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-dark-700">
          <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        </div>
        <div className="p-6">
          <p className="text-slate-300">{message}</p>
        </div>
        <div className="p-4 bg-dark-700/50 flex justify-end gap-4 rounded-b-lg">
          <button onClick={onClose} className="bg-dark-600 hover:bg-dark-500 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={handleConfirm} className={`${variantClasses[confirmVariant]} text-white font-bold py-2 px-4 rounded-lg transition-colors`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
export default function App() {
  const [incomes, setIncomes] = useLocalStorage<Income[]>('incomes', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [jars, setJars] = useLocalStorage<SavingsJar[]>('jars', []);
  const [fortnightlyIncome, setFortnightlyIncome] = useLocalStorage<number>('fortnightlyIncome', 0);
  const [monthlyPayment, setMonthlyPayment] = useLocalStorage<number>('monthlyPayment', 0);
  const [midMonthPercentages, setMidMonthPercentages] = useLocalStorage<Record<string, number>>('midMonthPercentages', {});
  const [endOfMonthPercentages, setEndOfMonthPercentages] = useLocalStorage<Record<string, number>>('endOfMonthPercentages', {});
  const [isCensored, setIsCensored] = useLocalStorage<boolean>('isCensored', false);
  const [investmentFrequency, setInvestmentFrequency] = useLocalStorage<'bi-monthly' | 'monthly'>('investmentFrequency', 'bi-monthly');
  const [categoryThresholds, setCategoryThresholds] = useLocalStorage<Record<string, number>>('categoryThresholds', {});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const [anticipationState, setAnticipationState] = useState<{
    isOpen: boolean;
    expense: Expense | null;
  }>({ isOpen: false, expense: null });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isJarModalOpen, setJarModalOpen] = useState(false);

  const [displayedDate, setDisplayedDate] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState('dashboard');

  // Expense Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');
  const [recurringFilter, setRecurringFilter] = useState('all'); // 'all', 'yes', 'no'

  const totalIncome = useMemo(() => incomes.reduce((acc, inc) => acc + inc.amount, 0), [incomes]);

  const calculateMonthlyExpenses = useCallback((date: Date) => {
    return calculateMonthlyExpensesForDate(expenses, date);
  }, [expenses]);

  const { displayedMonthExpenses, previousMonthExpenses, surplus } = useMemo(() => {
    const displayedMonthExpenses = calculateMonthlyExpenses(displayedDate);
    
    const prevMonthDate = new Date(displayedDate);
    prevMonthDate.setMonth(displayedDate.getMonth() - 1);
    const previousMonthExpenses = calculateMonthlyExpenses(prevMonthDate);

    const surplus = totalIncome - displayedMonthExpenses;
    return { displayedMonthExpenses, previousMonthExpenses, surplus };
  }, [totalIncome, calculateMonthlyExpenses, displayedDate]);

  const displayedMonthExpensesList = useMemo(() => {
    const displayedMonthKey = getMonthYear(displayedDate);
    const CARD_CLOSING_DAY = 15;
    
    return expenses.filter(expense => {
      if (expense.isRecurring) {
          const effectiveStartDate = new Date(expense.date + 'T00:00:00');
          if (expense.category === 'Cartão de Crédito' && effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
              effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
          }
          const effectiveStartMonthYear = getMonthYear(effectiveStartDate);
          return effectiveStartMonthYear <= displayedMonthKey;
      }

      if (expense.installments) {
          const effectiveStartDate = new Date(expense.date + 'T00:00:00');
          const firstPaymentDate = new Date(effectiveStartDate);
          if (expense.category === 'Cartão de Crédito' && firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
              firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
          }
          for (let i = 0; i < expense.installments.total; i++) {
            const installmentDate = new Date(firstPaymentDate);
            installmentDate.setMonth(firstPaymentDate.getMonth() + i);
            if (getMonthYear(installmentDate) === displayedMonthKey) {
                return true;
            }
          }
          return false;
      }
      
      const effectiveDate = new Date(expense.date + 'T00:00:00');
      if (expense.category === 'Cartão de Crédito' && effectiveDate.getDate() >= CARD_CLOSING_DAY) {
          effectiveDate.setMonth(effectiveDate.getMonth() + 1);
      }
      const effectiveMonthYear = getMonthYear(effectiveDate);
      return effectiveMonthYear === displayedMonthKey;
    });
  }, [expenses, displayedDate]);

  const filteredExpensesList = useMemo(() => {
    return displayedMonthExpensesList.filter(expense => {
      const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
      const subcategoryMatch = subcategoryFilter === 'all' || expense.subcategory === subcategoryFilter;
      const recurringMatch = recurringFilter === 'all' ||
                           (recurringFilter === 'yes' && expense.isRecurring) ||
                           (recurringFilter === 'no' && !expense.isRecurring && !expense.installments);
      return categoryMatch && subcategoryMatch && recurringMatch;
    });
  }, [displayedMonthExpensesList, categoryFilter, subcategoryFilter, recurringFilter]);

  // --- NOTIFICATION ---
  const addNotification = useCallback((message: string, type: Notification['type'] = 'warning') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- INCOME CRUD ---
  const addIncome = (income: Omit<Income, 'id'>) => {
    setIncomes([...incomes, { ...income, id: Date.now().toString() }]);
    setIncomeModalOpen(false);
  };

  const updateIncome = (updatedIncome: Income) => {
    setIncomes(incomes.map(i => (i.id === updatedIncome.id ? updatedIncome : i)));
    setIncomeModalOpen(false);
    setEditingIncome(null);
  };
    
  const removeIncome = (id: string) => {
    const incomeToDelete = incomes.find(i => i.id === id);
    if (!incomeToDelete) return;
    setConfirmation({
      isOpen: true,
      title: 'Confirmar Exclusão de Receita',
      message: `Tem certeza que deseja excluir a receita "${incomeToDelete.description}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => setIncomes(currentIncomes => currentIncomes.filter(i => i.id !== id)),
      confirmText: 'Excluir',
      confirmVariant: 'danger',
    });
  };
  
  const handleStartAddIncome = () => {
    setEditingIncome(null);
    setIncomeModalOpen(true);
  };

  const handleStartEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeModalOpen(true);
  };

  const handleCloseIncomeModal = () => {
    setIncomeModalOpen(false);
    setEditingIncome(null);
  };

  // --- EXPENSE CRUD ---
  const checkExpenseThreshold = useCallback((expense: Omit<Expense, 'id'>) => {
    const threshold = categoryThresholds[expense.category];
    const expenseAmount = expense.installments ? (expense.amount / expense.installments.total) : expense.amount;
    
    if (threshold && expenseAmount > threshold) {
      addNotification(
        `Despesa "${expense.description}" (${formatCurrency(expenseAmount, false)}) excedeu o limite de ${formatCurrency(threshold, false)} para a categoria "${expense.category}".`,
        'warning'
      );
    }
  }, [categoryThresholds, addNotification]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    checkExpenseThreshold(expense);
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
    setExpenseModalOpen(false);
  };

  const updateExpense = (updatedExpense: Expense) => {
    checkExpenseThreshold(updatedExpense);
    setExpenses(expenses.map(e => (e.id === updatedExpense.id ? updatedExpense : e)));
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };
    
  const removeExpense = (id: string) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) return;
    setConfirmation({
      isOpen: true,
      title: 'Confirmar Exclusão de Despesa',
      message: `Tem certeza que deseja excluir a despesa "${expenseToDelete.description}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => setExpenses(currentExpenses => currentExpenses.filter(e => e.id !== id)),
      confirmText: 'Excluir',
      confirmVariant: 'danger',
    });
  };
    
  const handleStartAddExpense = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };
  
  const handleStartEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };
  
  const handleCloseExpenseModal = () => {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };
  
  const handleStartAnticipateInstallment = (expenseId: string) => {
    const expenseToAnticipate = expenses.find(e => e.id === expenseId);
    if (expenseToAnticipate) {
        setAnticipationState({ isOpen: true, expense: expenseToAnticipate });
    }
  };

  const handleConfirmAnticipation = (expenseId: string, countToAnticipate: number) => {
      const expenseToModify = expenses.find(e => e.id === expenseId);
      if (!expenseToModify || !expenseToModify.installments || countToAnticipate <= 0) return;

      const installmentAmount = expenseToModify.amount / expenseToModify.installments.total;
      const amountToPayNow = countToAnticipate * installmentAmount;

      const newExpense: Omit<Expense, 'id'> = {
          description: `[Antecipado ${countToAnticipate}x] ${expenseToModify.description}`,
          amount: amountToPayNow,
          date: new Date().toISOString().split('T')[0],
          category: expenseToModify.category,
          subcategory: expenseToModify.subcategory,
          isRecurring: false,
      };

      const remainingInstallmentsTotal = expenseToModify.installments.total - countToAnticipate;
      
      let updatedExpenses = [...expenses];

      if (remainingInstallmentsTotal <= 0) {
          updatedExpenses = updatedExpenses.filter(e => e.id !== expenseId);
      } else {
          updatedExpenses = updatedExpenses.map(e => {
              if (e.id === expenseId) {
                  return {
                      ...e,
                      amount: e.amount - amountToPayNow,
                      installments: {
                          ...e.installments,
                          total: remainingInstallmentsTotal,
                      },
                  };
              }
              return e;
          });
      }
      
      updatedExpenses.push({ ...newExpense, id: Date.now().toString() });

      setExpenses(updatedExpenses);
      addNotification(`Antecipação de ${countToAnticipate} parcela(s) de "${expenseToModify.description}" realizada.`, 'success');
      setAnticipationState({ isOpen: false, expense: null });
  };
  
  // --- JAR CRUD ---
  const addJar = (jar: Omit<SavingsJar, 'id'>) => {
      const newJarWithId = { ...jar, id: Date.now().toString() };
      setJars(currentJars => [...currentJars, newJarWithId]);
      setMidMonthPercentages(prev => ({...prev, [newJarWithId.id]: newJarWithId.percentage}));
      setEndOfMonthPercentages(prev => ({...prev, [newJarWithId.id]: newJarWithId.percentage}));
      setJarModalOpen(false);
  };

  const updateJarPercentage = (id: string, percentage: number) => {
    const newJars = jars.map(jar => jar.id === id ? {...jar, percentage} : jar);
    const totalPercentage = newJars.reduce((acc, jar) => acc + jar.percentage, 0);

    setJars(newJars);
    setMidMonthPercentages(prev => ({ ...prev, [id]: percentage }));
    setEndOfMonthPercentages(prev => ({ ...prev, [id]: percentage }));

    if (totalPercentage > 100) {
        console.warn("Total percentage cannot exceed 100%");
    }
  };
    
  const removeJar = (id: string) => {
    const jarToDelete = jars.find(j => j.id === id);
    if (!jarToDelete) return;
    setConfirmation({
      isOpen: true,
      title: 'Confirmar Exclusão de Caixinha',
      message: `Tem certeza que deseja excluir a caixinha "${jarToDelete.name}"? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        setJars(currentJars => currentJars.filter(j => j.id !== id));
        setMidMonthPercentages(currentPercentages => {
            const newPercentages = { ...currentPercentages };
            delete newPercentages[id];
            return newPercentages;
        });
        setEndOfMonthPercentages(currentPercentages => {
            const newPercentages = { ...currentPercentages };
            delete newPercentages[id];
            return newPercentages;
        });
      },
      confirmText: 'Excluir',
      confirmVariant: 'danger',
    });
  };
  
  // --- NAVIGATION ---
  const goToPreviousMonth = useCallback(() => {
    setDisplayedDate(current => {
      const newDate = new Date(current);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setDisplayedDate(current => {
      const newDate = new Date(current);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const dashboardPercentages = useMemo(() => {
    return jars.reduce((acc, jar) => {
        acc[jar.id] = jar.percentage;
        return acc;
    }, {} as Record<string, number>);
  }, [jars]);

  // --- DATA IMPORT/EXPORT ---
  const handleExport = () => {
    const appData = {
      incomes,
      expenses,
      jars,
      fortnightlyIncome,
      monthlyPayment,
      midMonthPercentages,
      endOfMonthPercentages,
      categoryThresholds,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(appData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    const date = new Date().toISOString().split('T')[0];
    link.download = `finanzero-backup-${date}.json`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                throw new Error("File content is not a string");
            }
            const data = JSON.parse(text);

            // Basic validation
            if (!data.incomes || !data.expenses || !data.jars) {
                throw new Error("Arquivo de backup inválido ou corrompido.");
            }
            
            if (window.confirm("Tem certeza que deseja importar os dados? Todos os dados atuais serão substituídos.")) {
                setIncomes(data.incomes);
                setExpenses(data.expenses);
                setJars(data.jars);
                setFortnightlyIncome(data.fortnightlyIncome || 0);
                setMonthlyPayment(data.monthlyPayment || 0);
                setMidMonthPercentages(data.midMonthPercentages || {});
                setEndOfMonthPercentages(data.endOfMonthPercentages || {});
                setCategoryThresholds(data.categoryThresholds || {});
                alert("Dados importados com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao importar dados:", error);
            alert(`Erro ao importar dados: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            // Reset file input to allow re-uploading the same file
            if(event.target) event.target.value = '';
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-dark-900 font-sans text-slate-300">
      <main className="container mx-auto p-4 md:p-8">
        <Header 
          onImport={handleImportClick} 
          onExport={handleExport} 
          isCensored={isCensored} 
          onToggleCensor={() => setIsCensored(!isCensored)} 
        />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'dashboard' && (
          <div id="dashboard-content">
            <MonthlyAlert current={displayedMonthExpenses} previous={previousMonthExpenses} isCensored={isCensored} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-slate-400 text-lg">Receita Mensal</h2>
                    <p className="text-green-400 text-2xl sm:text-3xl font-bold">{formatCurrency(totalIncome, isCensored)}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-slate-400 text-lg">Gastos do Mês</h2>
                    <p className="text-red-400 text-2xl sm:text-3xl font-bold">{formatCurrency(displayedMonthExpenses, isCensored)}</p>
                </div>
                <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                    <h2 className="text-slate-400 text-lg">Sobra no Mês</h2>
                    <p className={`${surplus >= 0 ? 'text-blue-400' : 'text-yellow-400'} text-2xl sm:text-3xl font-bold`}>{formatCurrency(surplus, isCensored)}</p>
                </div>
                <CreditCardSummary expenses={expenses} displayedDate={displayedDate} isCensored={isCensored} />
            </div>
            <FinancialChart 
                income={totalIncome} 
                expenses={displayedMonthExpenses} 
                surplus={surplus} 
                monthlyExpensesList={displayedMonthExpensesList}
                isCensored={isCensored}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div>
                     <IncomeManager 
                        incomes={incomes}
                        onAddIncome={handleStartAddIncome}
                        onEditIncome={handleStartEditIncome}
                        onRemoveIncome={removeIncome}
                        isCensored={isCensored}
                     />
                     <div className="mt-8">
                        <ExpenseManager 
                          expenses={filteredExpensesList} 
                          displayedDate={displayedDate}
                          onAddExpense={handleStartAddExpense} 
                          onEditExpense={handleStartEditExpense} 
                          onRemoveExpense={removeExpense}
                          onAnticipateInstallment={handleStartAnticipateInstallment}
                          onPreviousMonth={goToPreviousMonth}
                          onNextMonth={goToNextMonth}
                          isCensored={isCensored}
                          categoryFilter={categoryFilter}
                          setCategoryFilter={setCategoryFilter}
                          subcategoryFilter={subcategoryFilter}
                          setSubcategoryFilter={setSubcategoryFilter}
                          recurringFilter={recurringFilter}
                          setRecurringFilter={setRecurringFilter}
                        />
                     </div>
                </div>
                <SavingsManager 
                    jars={jars} 
                    percentages={dashboardPercentages}
                    surplus={surplus} 
                    onAddJar={() => setJarModalOpen(true)} 
                    onPercentageChange={updateJarPercentage} 
                    onRemoveJar={removeJar}
                    isCensored={isCensored}
                />
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
          <InvestmentsPage
            jars={jars}
            // Fix: Pass the 'removeJar' function to the 'onRemoveJar' prop of the InvestmentsPage component, resolving a reference error where 'onRemoveJar' was used as both the prop name and the value.
            onRemoveJar={removeJar}
            onAddJar={() => setJarModalOpen(true)}
            expensesForMonth={displayedMonthExpensesList}
            fortnightlyIncome={fortnightlyIncome}
            setFortnightlyIncome={setFortnightlyIncome}
            monthlyPayment={monthlyPayment}
            setMonthlyPayment={setMonthlyPayment}
            midMonthPercentages={midMonthPercentages}
            setMidMonthPercentages={setMidMonthPercentages}
            endOfMonthPercentages={endOfMonthPercentages}
            setEndOfMonthPercentages={setEndOfMonthPercentages}
            isCensored={isCensored}
            investmentFrequency={investmentFrequency}
            setInvestmentFrequency={setInvestmentFrequency}
          />
        )}

        {activeTab === 'evolution' && (
          <FinancialEvolutionPage
            incomes={incomes}
            expenses={expenses}
            isCensored={isCensored}
          />
        )}
        
        {activeTab === 'settings' && (
          <SettingsPage
            categoryThresholds={categoryThresholds}
            setCategoryThresholds={setCategoryThresholds}
          />
        )}
      </main>
      
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={handleCloseIncomeModal}
        onAddIncome={addIncome}
        onUpdateIncome={updateIncome}
        incomeToEdit={editingIncome}
      />
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseExpenseModal} 
        onAddExpense={addExpense} 
        onUpdateExpense={updateExpense}
        expenseToEdit={editingExpense}
      />
      <JarModal isOpen={isJarModalOpen} onClose={() => setJarModalOpen(false)} onAddJar={addJar} />
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        confirmVariant={confirmation.confirmVariant}
      />
      <AnticipateInstallmentModal
        isOpen={anticipationState.isOpen}
        onClose={() => setAnticipationState({ isOpen: false, expense: null })}
        expense={anticipationState.expense}
        onConfirm={handleConfirmAnticipation}
        displayedDate={displayedDate}
        isCensored={isCensored}
      />
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="application/json"
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---
const Header: React.FC<{
  onImport: () => void;
  onExport: () => void;
  isCensored: boolean;
  onToggleCensor: () => void;
}> = ({ onImport, onExport, isCensored, onToggleCensor }) => (
    <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <WalletIcon />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                    FinanZero
                </h1>
            </div>
            <div className="flex items-center gap-2">
                 <button 
                   onClick={onToggleCensor} 
                   title={isCensored ? "Mostrar valores" : "Ocultar valores"} 
                   className="flex items-center bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold py-2 px-3 rounded-lg transition-colors"
                 >
                    {isCensored ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                 </button>
                 <button onClick={onImport} className="flex items-center bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold py-2 px-3 rounded-lg transition-colors">
                    <UploadIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">Importar</span>
                </button>
                 <button onClick={onExport} className="flex items-center bg-dark-700 hover:bg-dark-600 text-slate-300 font-bold py-2 px-3 rounded-lg transition-colors">
                    <DownloadIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">Exportar</span>
                </button>
            </div>
        </div>
        <p className="text-slate-400 mt-2">Seu painel de controle financeiro pessoal.</p>
    </header>
);

const TabNavigation: React.FC<{activeTab: string, setActiveTab: (tab: string) => void}> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', name: 'Painel Principal', icon: <ChartPieIcon className="h-5 w-5 mr-2"/> },
    { id: 'investments', name: 'Investimentos', icon: <CurrencyDollarIcon className="h-5 w-5 mr-2"/> },
    { id: 'evolution', name: 'Evolução', icon: <TrendingUpIcon className="h-5 w-5 mr-2"/> },
    { id: 'settings', name: 'Configurações', icon: <CogIcon className="h-5 w-5 mr-2"/> },
  ];

  return (
    <div className="mb-8 border-b border-dark-700">
      <nav className="-mb-px flex justify-center sm:justify-start space-x-4 sm:space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center transition-colors`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

interface FinancialEvolutionChartProps {
    data: { month: string; income: number; expenses: number; surplus: number; }[];
    isCensored: boolean;
}

const FinancialEvolutionChart: React.FC<FinancialEvolutionChartProps> = ({ data, isCensored }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, dataPoint: any } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const width = 800;
    const height = 400;
    const margin = { top: 40, right: 50, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const { yMin, yMax } = useMemo(() => {
        const allValues = data.flatMap(d => [d.income, d.expenses, d.surplus]);
        return {
            yMin: Math.min(...allValues, 0),
            yMax: Math.max(...allValues, 100), // Ensure max is at least 100 for small values
        };
    }, [data]);
    
    const yScale = useCallback((value: number) => {
        const range = yMax - yMin;
        if (range === 0) return innerHeight / 2;
        return innerHeight - ((value - yMin) / range) * innerHeight;
    }, [yMin, yMax, innerHeight]);

    const xScale = useCallback((index: number) => {
        if (data.length <= 1) return innerWidth / 2;
        return (index / (data.length - 1)) * innerWidth;
    }, [data.length, innerWidth]);
    
    const lineGenerator = (key: 'income' | 'expenses' | 'surplus') => {
        return data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d[key])}`).join(' ');
    };

    const yAxisTicks = useMemo(() => {
        const ticks = [];
        const tickCount = 5;
        const range = yMax - yMin;
        if (range === 0) return [{ value: yMax, y: yScale(yMax) }];

        const step = range / (tickCount - 1);
        for (let i = 0; i < tickCount; i++) {
            const value = yMin + (step * i);
            ticks.push({ value, y: yScale(value) });
        }
        return ticks;
    }, [yMin, yMax, yScale]);

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - svgRect.left - margin.left;
        
        let index = 0;
        if(data.length > 1) {
          index = Math.round((x / innerWidth) * (data.length - 1));
        }

        if (index >= 0 && index < data.length) {
            const dataPoint = data[index];
            const pointX = xScale(index);
            const pointY = e.clientY - svgRect.top - margin.top;
            setTooltip({ x: pointX, y: pointY, dataPoint });
        }
    };
    
    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const colors = { income: '#16a34a', expenses: '#dc2626', surplus: '#3b82f6' };

    if(isCensored) {
      return <div className="text-center py-10 text-slate-400">Desative o modo de ocultar valores para ver o gráfico.</div>
    }

    return (
        <div className="relative">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full h-auto">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Y-axis */}
                    {yAxisTicks.map(({ value, y }) => (
                        <g key={value} transform={`translate(0, ${y})`}>
                            <line x2={innerWidth} className="stroke-dark-700" />
                            <text x="-10" dy="0.32em" textAnchor="end" className="fill-slate-400 text-xs">
                                {formatCurrency(value, false).replace(/\s/g, '').replace('R$', '')}
                            </text>
                        </g>
                    ))}
                    
                    {/* X-axis */}
                    {data.map((d, i) => (
                        <g key={d.month} transform={`translate(${xScale(i)}, ${innerHeight})`}>
                            <text y="20" textAnchor="middle" className="fill-slate-400 text-xs capitalize">
                                {d.month}
                            </text>
                        </g>
                    ))}
                    
                    {/* Lines */}
                    <path d={lineGenerator('income')} fill="none" stroke={colors.income} strokeWidth="3" />
                    <path d={lineGenerator('expenses')} fill="none" stroke={colors.expenses} strokeWidth="3" />
                    <path d={lineGenerator('surplus')} fill="none" stroke={colors.surplus} strokeWidth="3" />

                    {/* Tooltip Indicator Line */}
                    {tooltip && (
                        <g>
                           <line x1={tooltip.x} y1="0" x2={tooltip.x} y2={innerHeight} className="stroke-slate-500" strokeDasharray="4 2" />
                           <circle cx={tooltip.x} cy={yScale(tooltip.dataPoint.income)} r="5" fill={colors.income} className="stroke-dark-800" strokeWidth="2" />
                           <circle cx={tooltip.x} cy={yScale(tooltip.dataPoint.expenses)} r="5" fill={colors.expenses} className="stroke-dark-800" strokeWidth="2" />
                           <circle cx={tooltip.x} cy={yScale(tooltip.dataPoint.surplus)} r="5" fill={colors.surplus} className="stroke-dark-800" strokeWidth="2" />
                        </g>
                    )}
                </g>
            </svg>

            {/* Tooltip box (HTML for easier styling) */}
            {tooltip && (
                <div
                    className="absolute bg-dark-900 p-3 rounded-lg shadow-lg pointer-events-none transition-transform duration-100 border border-dark-600"
                    style={{
                        left: `${margin.left + tooltip.x}px`,
                        top: `${margin.top + tooltip.y}px`,
                        transform: `translate(${tooltip.x > innerWidth / 2 ? '-110%' : '10%'}, -50%)`,
                        minWidth: '160px'
                    }}
                >
                    <p className="font-bold text-center text-slate-200 mb-2 capitalize">{tooltip.dataPoint.month}</p>
                    <ul className="space-y-1 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: colors.income}}></div>Receita:</span>
                            <span className="font-bold" style={{color: colors.income}}>{formatCurrency(tooltip.dataPoint.income, false)}</span>
                        </li>
                         <li className="flex justify-between items-center">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: colors.expenses}}></div>Despesas:</span>
                            <span className="font-bold" style={{color: colors.expenses}}>{formatCurrency(tooltip.dataPoint.expenses, false)}</span>
                        </li>
                         <li className="flex justify-between items-center">
                            <span className="flex items-center"><div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: colors.surplus}}></div>Sobra:</span>
                            <span className="font-bold" style={{color: colors.surplus}}>{formatCurrency(tooltip.dataPoint.surplus, false)}</span>
                        </li>
                    </ul>
                </div>
            )}
             {/* Legend */}
            <div className="flex justify-center flex-wrap items-center gap-4 sm:gap-6 mt-4 text-sm">
                <span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors.income}}></div>Receita</span>
                <span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors.expenses}}></div>Despesas</span>
                <span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: colors.surplus}}></div>Sobra</span>
            </div>
        </div>
    );
};

interface FinancialEvolutionPageProps {
  incomes: Income[];
  expenses: Expense[];
  isCensored: boolean;
}

const FinancialEvolutionPage: React.FC<FinancialEvolutionPageProps> = ({ incomes, expenses, isCensored }) => {
    const historicalData = useMemo(() => {
        const data = [];
        // Start date set to October 2025 as requested. Month is 0-indexed (9 = October).
        const startDate = new Date(2025, 9, 1);
        const totalMonthlyIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);

        if (totalMonthlyIncome === 0 && expenses.length === 0) {
          return [];
        }

        // Loop for the next 12 months starting from the defined start date.
        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            const monthLabel = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace(' de', '');

            const monthlyExpenses = calculateMonthlyExpensesForDate(expenses, date);
            const surplus = totalMonthlyIncome - monthlyExpenses;

            data.push({
                month: monthLabel,
                income: totalMonthlyIncome,
                expenses: monthlyExpenses,
                surplus: surplus,
            });
        }
        return data;
    }, [incomes, expenses]);

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">Projeção Financeira (A partir de Out/25)</h2>
            {historicalData.length > 0 ? (
                <FinancialEvolutionChart data={historicalData} isCensored={isCensored} />
            ) : (
                <p className="text-slate-400 text-center py-10">Adicione receitas e despesas para ver sua projeção financeira.</p>
            )}
        </div>
    );
};

interface InvestmentReportProps {
    jars: Omit<SavingsJar, 'percentage'>[];
    midMonthSurplus: number;
    monthlyPayment: number;
    midMonthPercentages: Record<string, number>;
    endOfMonthPercentages: Record<string, number>;
    isCensored: boolean;
}

const InvestmentReport: React.FC<InvestmentReportProps> = ({
    jars,
    midMonthSurplus,
    monthlyPayment,
    midMonthPercentages,
    endOfMonthPercentages,
    isCensored
}) => {
    const investmentTotals = useMemo(() => {
        const totalsByJar = jars.map(jar => {
            const midMonthAmount = (midMonthSurplus > 0 ? midMonthSurplus : 0) * ((midMonthPercentages[jar.id] || 0) / 100);
            const endOfMonthAmount = (monthlyPayment > 0 ? monthlyPayment : 0) * ((endOfMonthPercentages[jar.id] || 0) / 100);
            const total = midMonthAmount + endOfMonthAmount;
            return {
                id: jar.id,
                name: jar.name,
                total,
            };
        });

        const grandTotal = totalsByJar.reduce((acc, item) => acc + item.total, 0);

        return { totalsByJar, grandTotal };
    }, [jars, midMonthSurplus, monthlyPayment, midMonthPercentages, endOfMonthPercentages]);

    if (investmentTotals.grandTotal <= 0) {
        return null;
    }

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">Relatório de Investimentos do Mês</h2>
            
            <ul className="space-y-3 mb-6">
                {investmentTotals.totalsByJar.filter(j => j.total > 0).map(jarTotal => (
                    <li key={jarTotal.id} className="bg-dark-700 p-3 rounded-lg flex justify-between items-center transition-all hover:bg-dark-600">
                        <span className="font-semibold text-slate-300">{jarTotal.name}</span>
                        <span className="font-bold text-lg text-accent">{formatCurrency(jarTotal.total, isCensored)}</span>
                    </li>
                ))}
            </ul>

            <hr className="border-dark-600 my-4"/>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg sm:text-xl mt-4">
                <span className="font-bold text-slate-100">Total Investido no Mês:</span>
                <span className="font-extrabold text-xl sm:text-2xl text-green-400">{formatCurrency(investmentTotals.grandTotal, isCensored)}</span>
            </div>
        </div>
    );
};

interface InvestmentsPageProps {
  jars: Omit<SavingsJar, 'percentage'>[];
  onRemoveJar: (id: string) => void;
  onAddJar: () => void;
  expensesForMonth: Expense[];
  fortnightlyIncome: number;
  setFortnightlyIncome: (value: number) => void;
  monthlyPayment: number;
  setMonthlyPayment: (value: number) => void;
  midMonthPercentages: Record<string, number>;
  setMidMonthPercentages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  endOfMonthPercentages: Record<string, number>;
  setEndOfMonthPercentages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  isCensored: boolean;
  investmentFrequency: 'bi-monthly' | 'monthly';
  setInvestmentFrequency: (value: 'bi-monthly' | 'monthly') => void;
}

const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ 
    jars, onRemoveJar, onAddJar, expensesForMonth,
    fortnightlyIncome, setFortnightlyIncome,
    monthlyPayment, setMonthlyPayment,
    midMonthPercentages, setMidMonthPercentages,
    endOfMonthPercentages, setEndOfMonthPercentages,
    isCensored, investmentFrequency, setInvestmentFrequency
}) => {
    
    const [fortnightlyIncomeInput, setFortnightlyIncomeInput] = useState(fortnightlyIncome > 0 ? fortnightlyIncome.toString().replace('.', ',') : '');
    const [monthlyPaymentInput, setMonthlyPaymentInput] = useState(monthlyPayment > 0 ? monthlyPayment.toString().replace('.', ',') : '');

    useEffect(() => {
        setFortnightlyIncomeInput(fortnightlyIncome > 0 ? fortnightlyIncome.toString().replace('.', ',') : '');
    }, [fortnightlyIncome]);

    useEffect(() => {
        setMonthlyPaymentInput(monthlyPayment > 0 ? monthlyPayment.toString().replace('.', ',') : '');
    }, [monthlyPayment]);

    const creditCardExpenses = useMemo(() => {
        return expensesForMonth
            .filter(exp => exp.category === 'Cartão de Crédito')
            .reduce((acc, exp) => acc + (exp.installments ? exp.amount / exp.installments.total : exp.amount), 0);
    }, [expensesForMonth]);

    const midMonthSurplus = investmentFrequency === 'bi-monthly' ? fortnightlyIncome - creditCardExpenses : 0;

    const handleFortnightlyIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFortnightlyIncomeInput(value);
        const parsedValue = parseCurrencyInput(value);
        if (!isNaN(parsedValue)) {
            setFortnightlyIncome(parsedValue);
        }
    };

    const handleMonthlyPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMonthlyPaymentInput(value);
        const parsedValue = parseCurrencyInput(value);
        if (!isNaN(parsedValue)) {
            setMonthlyPayment(parsedValue);
        }
    };

    const handlePercentageChange = (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>) => (jarId: string, percentage: number) => {
        setter(prev => ({...prev, [jarId]: percentage }));
    };

    return (
        <div className="mt-2 space-y-8">
            <div className="bg-dark-800 p-1 rounded-xl shadow-lg max-w-md mx-auto">
              <div className="flex justify-center gap-1">
                <button
                  onClick={() => setInvestmentFrequency('bi-monthly')}
                  className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    investmentFrequency === 'bi-monthly' ? 'bg-accent text-white' : 'bg-transparent text-slate-400 hover:bg-dark-700'
                  }`}
                >
                  Quinzenal e Fim de Mês
                </button>
                <button
                  onClick={() => setInvestmentFrequency('monthly')}
                  className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    investmentFrequency === 'monthly' ? 'bg-accent text-white' : 'bg-transparent text-slate-400 hover:bg-dark-700'
                  }`}
                >
                  Apenas Fim de Mês
                </button>
              </div>
            </div>

            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Configurar Ganhos para Investimento</h2>
                <div className="space-y-4">
                    {investmentFrequency === 'bi-monthly' && (
                        <div>
                            <label className="block mb-1 font-semibold text-slate-300">Receita Quinzenal (adiantamento)</label>
                            <input type="text" inputMode="decimal" value={fortnightlyIncomeInput} onChange={handleFortnightlyIncomeChange} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="R$ 0,00" />
                        </div>
                    )}
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Pagamento Fim de Mês (salário)</label>
                        <input type="text" inputMode="decimal" value={monthlyPaymentInput} onChange={handleMonthlyPaymentChange} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="R$ 0,00" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {investmentFrequency === 'bi-monthly' && (
                    <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Planejamento Quinzenal (Dia 15)</h2>
                        <div className="space-y-2 text-lg mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Receita Quinzenal:</span>
                                <span className="font-bold text-green-400">{formatCurrency(fortnightlyIncome, isCensored)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Despesas do Cartão:</span>
                                <span className="font-bold text-red-400">- {formatCurrency(creditCardExpenses, isCensored)}</span>
                            </div>
                            <hr className="border-dark-700 !my-3"/>
                            <div className="flex justify-between items-center text-xl">
                                <span className="text-slate-200">Saldo para investir:</span>
                                <span className={`font-extrabold ${midMonthSurplus >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>{formatCurrency(midMonthSurplus, isCensored)}</span>
                            </div>
                        </div>
                        <hr className="border-dark-600 mb-4"/>
                         <p className="text-slate-400 mb-4 text-center">Distribua o saldo para investir nas suas caixinhas:</p>
                        <SavingsManager 
                            jars={jars} 
                            percentages={midMonthPercentages}
                            surplus={midMonthSurplus} 
                            onAddJar={onAddJar} 
                            onPercentageChange={handlePercentageChange(setMidMonthPercentages)}
                            onRemoveJar={onRemoveJar} 
                            isCensored={isCensored}
                        />
                    </div>
                )}

                <div className={`bg-dark-800 p-6 rounded-xl shadow-lg ${investmentFrequency === 'monthly' ? 'lg:col-span-2' : ''}`}>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Planejamento Fim de Mês</h2>
                     <div className="flex justify-between items-center text-xl">
                        <span className="text-slate-200">Aporte sugerido:</span>
                        <span className="font-extrabold text-green-400">{formatCurrency(monthlyPayment, isCensored)}</span>
                    </div>
                    <p className="text-slate-500 mt-2 text-sm">Este é o valor que você configurou como seu pagamento de fim de mês.</p>
                    <hr className="border-dark-600 my-4"/>
                    <p className="text-slate-400 mb-4 text-center">Distribua o aporte nas suas caixinhas:</p>
                    <SavingsManager 
                        jars={jars}
                        percentages={endOfMonthPercentages}
                        surplus={monthlyPayment}
                        onAddJar={onAddJar}
                        onPercentageChange={handlePercentageChange(setEndOfMonthPercentages)}
                        onRemoveJar={onRemoveJar}
                        isCensored={isCensored}
                    />
                </div>
            </div>
            <InvestmentReport
                jars={jars}
                midMonthSurplus={midMonthSurplus}
                monthlyPayment={monthlyPayment}
                midMonthPercentages={midMonthPercentages}
                endOfMonthPercentages={endOfMonthPercentages}
                isCensored={isCensored}
            />
        </div>
    );
};

const SettingsPage: React.FC<{
  categoryThresholds: Record<string, number>;
  setCategoryThresholds: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}> = ({ categoryThresholds, setCategoryThresholds }) => {

  const handleThresholdChange = (category: string, value: string) => {
    const parsedValue = parseCurrencyInput(value);
    setCategoryThresholds(prev => {
        const newThresholds = {...prev};
        if(parsedValue > 0) {
            newThresholds[category] = parsedValue;
        } else {
            delete newThresholds[category];
        }
        return newThresholds;
    });
  };

  return (
    <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-2">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-2">Limites de Despesas por Categoria</h2>
      <p className="text-slate-400 mb-6">Defina um limite para uma despesa individual em cada categoria. Você receberá um aviso se um gasto exceder o valor definido.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...EXPENSE_CATEGORIES].map(category => (
          <div key={category}>
            <label className="block mb-1 font-semibold text-slate-300">{category}</label>
             <input 
                type="text" 
                inputMode="decimal" 
                value={(categoryThresholds[category] || '').toString().replace('.', ',')}
                onChange={e => handleThresholdChange(category, e.target.value)} 
                className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" 
                placeholder="R$ 0,00"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  const icons = {
    warning: <ExclamationIcon className="h-6 w-6" />,
    success: <TrendingDownIcon />,
    danger: <TrendingUpIcon />,
  };

  const colors = {
    warning: 'bg-yellow-500/80 border-yellow-400',
    success: 'bg-green-500/80 border-green-400',
    danger: 'bg-red-500/80 border-red-400',
  };

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`relative flex items-start gap-4 p-4 rounded-lg shadow-lg border-l-4 text-white ${colors[notification.type]} backdrop-blur-sm animate-fade-in-right`}
        >
          <div className="flex-shrink-0">{icons[notification.type]}</div>
          <p className="flex-grow text-sm">{notification.message}</p>
          <button onClick={() => onRemove(notification.id)} className="flex-shrink-0 p-1 -m-1 rounded-full hover:bg-white/20">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};


const MonthlyAlert: React.FC<{ current: number; previous: number; isCensored: boolean }> = ({ current, previous, isCensored }) => {
    if (previous === 0 && current > 0) {
        return <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg mb-6 flex items-center"><TrendingUpIcon/> Primeiro mês com gastos registrados. Mantenha o controle!</div>;
    }
    if (previous === 0) return null;

    const difference = current - previous;
    if (difference > 0) {
        return <div className="bg-danger/20 text-red-400 p-4 rounded-lg mb-6 flex items-center"><TrendingUpIcon /> Seus gastos aumentaram em {formatCurrency(difference, isCensored)} este mês.</div>;
    } else if (difference < 0) {
        return <div className="bg-success/20 text-green-400 p-4 rounded-lg mb-6 flex items-center"><TrendingDownIcon/> Ótimo! Seus gastos diminuíram em {formatCurrency(Math.abs(difference), isCensored)} este mês.</div>;
    } else {
        return <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg mb-6 flex items-center"><MinusCircleIcon /> Seus gastos se mantiveram estáveis este mês.</div>;
    }
};

const CreditCardSummary: React.FC<{ expenses: Expense[], displayedDate: Date, isCensored: boolean }> = ({ expenses, displayedDate, isCensored }) => {
    const CARD_CLOSING_DAY = 15;

    const { currentBill, futureDebt, totalDebt } = useMemo(() => {
        const creditCardExpenses = expenses.filter(e => e.category === 'Cartão de Crédito');
        
        // Calculate Current Bill
        const displayedMonthKey = getMonthYear(displayedDate);
        const currentBillExpenses = creditCardExpenses.filter(expense => {
            if (expense.isRecurring) {
                const effectiveStartDate = new Date(expense.date + 'T00:00:00');
                if (effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
                    effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
                }
                const effectiveStartMonthYear = getMonthYear(effectiveStartDate);
                return effectiveStartMonthYear <= displayedMonthKey;
            }

            if (expense.installments) {
                const firstPaymentDate = new Date(expense.date + 'T00:00:00');
                if (firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
                    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
                }
                for (let i = 0; i < expense.installments.total; i++) {
                    const installmentDate = new Date(firstPaymentDate);
                    installmentDate.setMonth(firstPaymentDate.getMonth() + i);
                    if (getMonthYear(installmentDate) === displayedMonthKey) {
                        return true;
                    }
                }
                return false;
            }
            
            const effectiveDate = new Date(expense.date + 'T00:00:00');
            if (effectiveDate.getDate() >= CARD_CLOSING_DAY) {
                effectiveDate.setMonth(effectiveDate.getMonth() + 1);
            }
            return getMonthYear(effectiveDate) === displayedMonthKey;
        });

        const currentBill = currentBillExpenses.reduce((acc, exp) => {
            const amount = exp.installments ? exp.amount / exp.installments.total : exp.amount;
            return acc + amount;
        }, 0);

        // Calculate Future Debt from installments
        const installmentExpenses = creditCardExpenses.filter(e => e.installments);
        const futureDebt = installmentExpenses.reduce((totalFutureDebt, expense) => {
            const installmentAmount = expense.amount / expense.installments!.total;
            
            const firstPaymentDate = new Date(expense.date + 'T00:00:00');
            if (firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
                firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
            }

            const monthsDiff = (displayedDate.getFullYear() - firstPaymentDate.getFullYear()) * 12 + (displayedDate.getMonth() - firstPaymentDate.getMonth());
            
            const paidInstallments = monthsDiff < 0 ? 0 : monthsDiff + 1;

            if (paidInstallments >= expense.installments!.total) {
                return totalFutureDebt;
            }
            
            const remainingInstallments = expense.installments!.total - paidInstallments;
            
            return totalFutureDebt + (remainingInstallments * installmentAmount);
        }, 0);
        
        const totalDebt = currentBill + futureDebt;

        return { currentBill, futureDebt, totalDebt };
    }, [expenses, displayedDate]);

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
                 <h2 className="text-slate-400 text-lg">Cartão de Crédito</h2>
            </div>
            <div className="space-y-1 mt-2">
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Fatura Atual</span>
                    <span className="font-bold text-lg text-amber-400">{formatCurrency(currentBill, isCensored)}</span>
                </div>
                <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">Dívida Futura</span>
                    <span className="font-bold text-lg text-red-400">{formatCurrency(futureDebt, isCensored)}</span>
                </div>
                <hr className="border-dark-700 !my-2"/>
                <div className="flex justify-between items-baseline">
                    <span className="text-slate-200 font-bold">Dívida Total</span>
                    <span className="font-extrabold text-2xl text-danger">{formatCurrency(totalDebt, isCensored)}</span>
                </div>
            </div>
        </div>
    );
};

// Helper functions for SVG Arc
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

const describeDonutArc = (x: number, y: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) => {
    if (endAngle - startAngle >= 360) {
      endAngle = 359.99;
    }
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const d = [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");

    return d;
};

const ExpenseCategoryChart: React.FC<{ expenses: Expense[]; totalExpenses: number; isCensored: boolean }> = ({ expenses, totalExpenses, isCensored }) => {
    const [activeSlice, setActiveSlice] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

    const COLORS = ['#3b82f6', '#16a34a', '#facc15', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#64748b'];

    const categoryData = useMemo(() => {
        if (!expenses || expenses.length === 0 || totalExpenses <= 0) return [];
        
        // Fix: Explicitly type the accumulator in `reduce` to ensure correct type inference for `expensesByCategory`, resolving arithmetic operation errors.
        const expensesByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
            const category = expense.category || 'Outros';
            const amount = expense.installments ? expense.amount / expense.installments.total : expense.amount;
            acc[category] = (acc[category] || 0) + amount;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(expensesByCategory)
            .map(([name, value], index) => ({ name, value, color: COLORS[index % COLORS.length] }))
            .sort((a, b) => b.value - a.value);
    }, [expenses, totalExpenses]);

    const expensesBySubcategory = useMemo(() => {
        const result: Record<string, { name: string; value: number }[]> = {};
        categoryData.forEach(cat => {
          // Fix: Explicitly type the accumulator in `reduce` to ensure correct type inference for `subcategories`, resolving type assignment and arithmetic operation errors.
          const subcategories = expenses
            .filter(e => e.category === cat.name)
            .reduce((acc: Record<string, number>, expense) => {
              const subcatName = expense.subcategory || 'Outros';
              const amount = expense.installments ? expense.amount / expense.installments.total : expense.amount;
              acc[subcatName] = (acc[subcatName] || 0) + amount;
              return acc;
            }, {} as Record<string, number>);
            
          result[cat.name] = Object.entries(subcategories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
        });
        return result;
    }, [expenses, categoryData]);

    const handleToggleCategory = (categoryName: string) => {
      setExpandedCategories(prev => 
        prev.includes(categoryName) 
          ? prev.filter(c => c !== categoryName)
          : [...prev, categoryName]
      );
    };

    let cumulativeAngle = 0;

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-slate-300 mb-4 text-center lg:text-left">Gastos por Categoria</h3>
            {categoryData.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Nenhum gasto para exibir.</p>
            ) : (
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative w-40 h-40 mx-auto flex-shrink-0">
                        <svg viewBox="0 0 200 200">
                            {categoryData.map((slice) => {
                                const percentage = (slice.value / totalExpenses) * 100;
                                const startAngle = cumulativeAngle;
                                const endAngle = cumulativeAngle + (percentage / 100) * 360;
                                const pathData = describeDonutArc(100, 100, 100, 70, startAngle, endAngle);
                                cumulativeAngle = endAngle;

                                const isSliceActive = activeSlice === slice.name;

                                return (
                                    <g 
                                        key={slice.name} 
                                        onMouseEnter={() => setActiveSlice(slice.name)}
                                        onMouseLeave={() => setActiveSlice(null)}
                                    >
                                        <path 
                                            d={pathData} 
                                            fill={slice.color} 
                                            className="transition-transform duration-200"
                                            style={{ transform: isSliceActive ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center center' }}
                                        />
                                    </g>
                                );
                            })}
                        </svg>
                        {activeSlice ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <p className="text-sm text-slate-300 break-words px-2">{activeSlice}</p>
                                <p className="font-bold text-lg text-white">
                                    {formatCurrency(categoryData.find(d => d.name === activeSlice)?.value || 0, isCensored)}
                                </p>
                            </div>
                        ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <p className="text-sm text-slate-400">Passe o mouse</p>
                                <p className="text-sm text-slate-400">para ver</p>
                            </div>
                        )}
                    </div>
                    <ul className="w-full space-y-1 text-sm self-center sm:self-start max-h-48 overflow-y-auto pr-2">
                        {categoryData.map(slice => {
                             const isExpanded = expandedCategories.includes(slice.name);
                             const subcategories = expensesBySubcategory[slice.name] || [];
                             const hasSubcategories = subcategories.length > 1 || (subcategories.length === 1 && subcategories[0].name !== 'Outros');
                            return (
                                <React.Fragment key={slice.name}>
                                    <li
                                        className="flex items-center justify-between gap-2 p-1 rounded transition-colors"
                                        style={{ backgroundColor: activeSlice === slice.name ? 'rgba(255, 255, 255, 0.05)' : 'transparent', cursor: hasSubcategories ? 'pointer' : 'default' }}
                                        onMouseEnter={() => setActiveSlice(slice.name)}
                                        onMouseLeave={() => setActiveSlice(null)}
                                        onClick={() => hasSubcategories && handleToggleCategory(slice.name)}
                                    >
                                    <div className="flex items-center gap-2 truncate">
                                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }}></div>
                                        <span className="truncate">{slice.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{((slice.value / totalExpenses) * 100).toFixed(1)}%</span>
                                        {hasSubcategories && (
                                            <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>
                                    </li>
                                     {isExpanded && hasSubcategories && (
                                      <ul className="pl-8 pr-2 pt-1 pb-2 space-y-1 text-xs">
                                        {subcategories.map(sub => (
                                          <li key={sub.name} className="flex justify-between items-center text-slate-400">
                                            <span>- {sub.name}</span>
                                            <span className="font-medium">{formatCurrency(sub.value, isCensored)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};


const FinancialChart: React.FC<{ income: number; expenses: number; surplus: number; monthlyExpensesList: Expense[]; isCensored: boolean }> = ({ income, expenses, surplus, monthlyExpensesList, isCensored }) => {
    if (income <= 0) {
        return (
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-8 text-center">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Visão Geral do Mês</h2>
                 <p className="text-slate-400">Adicione uma receita para ver o gráfico de distribuição.</p>
            </div>
        );
    }
    
    const expensesPercentage = (expenses / income) * 100;
    const surplusPercentage = Math.max(0, (surplus / income) * 100);

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    
    const surplusRotation = (surplusPercentage / 100) * 360;

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">Visão Geral do Mês</h2>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-around">

                {/* Overall Summary Section */}
                <div className="flex flex-col items-center gap-4 flex-shrink-0">
                    <div className="relative w-48 h-48 sm:w-52 sm:h-52">
                         <svg className="w-full h-full" viewBox="0 0 200 200">
                            <text x="100" y="95" textAnchor="middle" className="fill-current text-slate-400 text-sm">Receita Total</text>
                            <text x="100" y="120" textAnchor="middle" className="fill-current text-slate-100 text-2xl font-bold">{formatCurrency(income, isCensored)}</text>
                            
                            <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" className="text-blue-500/10 stroke-current" />
                            
                            {surplus > 0 && 
                                <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" 
                                    strokeDasharray={circumference} 
                                    strokeDashoffset={circumference - (surplusPercentage / 100) * circumference} 
                                    strokeLinecap="round" 
                                    transform="rotate(-90 100 100)" 
                                    className="text-blue-500 stroke-current" />
                            }

                            <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" 
                                strokeDasharray={circumference} 
                                strokeDashoffset={circumference - (expensesPercentage / 100) * circumference} 
                                strokeLinecap="round" 
                                transform={`rotate(${(surplus > 0 ? surplusRotation : 0) - 90} 100 100)`}
                                className="text-red-500 stroke-current" />
                        </svg>
                    </div>
                    <div className="flex justify-center gap-6">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <div>
                                <p className="text-slate-400 text-sm">Despesas</p>
                                <p className="font-bold text-base text-red-400">{formatCurrency(expenses, isCensored)}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <div>
                                <p className="text-slate-400 text-sm">Sobra</p>
                                <p className="font-bold text-base text-blue-400">{formatCurrency(surplus, isCensored)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px lg:w-px lg:h-auto bg-dark-700 self-stretch"></div>

                <div className="w-full lg:max-w-md">
                    <ExpenseCategoryChart expenses={monthlyExpensesList} totalExpenses={expenses} isCensored={isCensored} />
                </div>
            </div>
        </div>
    );
};

interface IncomeManagerProps {
  incomes: Income[];
  onAddIncome: () => void;
  onEditIncome: (income: Income) => void;
  onRemoveIncome: (id: string) => void;
  isCensored: boolean;
}

const IncomeManager: React.FC<IncomeManagerProps> = ({ incomes, onAddIncome, onEditIncome, onRemoveIncome, isCensored }) => {
  return (
    <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-100">Receitas</h2>
            <button onClick={onAddIncome} className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors">
                <PlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline ml-2">Adicionar</span>
            </button>
        </div>
        <div className="flex-grow overflow-y-auto max-h-48 pr-2">
            {incomes.length === 0 ? (
                <p className="text-slate-400 text-center py-10">Nenhuma receita cadastrada.</p>
            ) : (
                <ul className="space-y-3">
                    {incomes.map(inc => (
                        <li key={inc.id} className="bg-dark-700 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <p className="font-semibold self-start">{inc.description}</p>
                            <div className="flex items-center self-end sm:self-center">
                                <p className="font-bold text-green-400 mr-4">{formatCurrency(inc.amount, isCensored)}</p>
                                <button onClick={() => onEditIncome(inc)} className="text-slate-500 hover:text-accent p-1">
                                    <EditIcon />
                                </button>
                                <button onClick={() => onRemoveIncome(inc.id)} className="text-slate-500 hover:text-danger p-1">
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
  );
};

interface ExpenseFilterProps {
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (value: string) => void;
  recurringFilter: string;
  setRecurringFilter: (value: string) => void;
}

const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  categoryFilter, setCategoryFilter,
  subcategoryFilter, setSubcategoryFilter,
  recurringFilter, setRecurringFilter,
}) => {
  const availableSubcategories = SUBCATEGORIES[categoryFilter as keyof typeof SUBCATEGORIES] || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    setSubcategoryFilter('all');
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setSubcategoryFilter('all');
    setRecurringFilter('all');
  };

  return (
    <div className="bg-dark-700/50 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block mb-1 text-sm font-semibold text-slate-300">Categoria</label>
          <select value={categoryFilter} onChange={handleCategoryChange} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
            <option value="all">Todas</option>
            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold text-slate-300">Subcategoria</label>
          <select value={subcategoryFilter} onChange={e => setSubcategoryFilter(e.target.value)} disabled={categoryFilter === 'all' || availableSubcategories.length === 0} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            <option value="all">Todas</option>
            {availableSubcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-semibold text-slate-300">Tipo</label>
          <select value={recurringFilter} onChange={e => setRecurringFilter(e.target.value)} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent text-sm">
            <option value="all">Todos</option>
            <option value="yes">Recorrentes</option>
            <option value="no">Não Recorrentes</option>
          </select>
        </div>
        <button onClick={handleClearFilters} className="w-full bg-dark-600 hover:bg-dark-500 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors text-sm">
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

interface ExpenseManagerProps {
  expenses: Expense[];
  displayedDate: Date;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
  onAnticipateInstallment: (id: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  isCensored: boolean;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  subcategoryFilter: string;
  setSubcategoryFilter: (value: string) => void;
  recurringFilter: string;
  setRecurringFilter: (value: string) => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, displayedDate, onAddExpense, onEditExpense, onRemoveExpense, onAnticipateInstallment, onPreviousMonth, onNextMonth, isCensored, ...filterProps }) => {
  const monthYearDisplay = displayedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
  return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2 self-center sm:self-auto">
                    <h2 className="text-2xl font-bold text-slate-100 hidden sm:block">Despesas</h2>
                     <button onClick={onPreviousMonth} className="p-2 rounded-full hover:bg-dark-700 transition-colors">
                        <ChevronLeftIcon />
                    </button>
                    <span className="font-semibold text-lg text-slate-400 capitalize w-36 text-center">{monthYearDisplay}</span>
                    <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-dark-700 transition-colors">
                        <ChevronRightIcon />
                    </button>
                </div>
                <button onClick={onAddExpense} className="flex items-center justify-center bg-primary hover:bg-secondary text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">Adicionar</span>
                </button>
            </div>
            <ExpenseFilter {...filterProps} />
            <div className="flex-grow overflow-y-auto max-h-96 pr-2">
            {expenses.length === 0 ? (
                <p className="text-slate-400 text-center py-10">Nenhuma despesa encontrada para este mês com os filtros aplicados.</p>
            ) : (
                <ul className="space-y-3">
                    {expenses.map(exp => {
                        let currentInstallment = 0;
                        if(exp.installments){
                            const CARD_CLOSING_DAY = 15;
                            const firstPaymentDate = new Date(exp.date + 'T00:00:00');
                            if (exp.category === 'Cartão de Crédito' && firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
                                firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
                            }
                            const monthsDiff = (displayedDate.getFullYear() - firstPaymentDate.getFullYear()) * 12 + (displayedDate.getMonth() - firstPaymentDate.getMonth());
                            currentInstallment = monthsDiff + 1;
                        }
                        
                        const billingDate = getBillingDayInMonth(exp.date, displayedDate);

                        return(
                            <li key={exp.id} className="bg-dark-700 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div className="w-full">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold">{exp.description}</p>
                                        {exp.isRecurring && <RecurringIcon />}
                                    </div>
                                    <div className="text-sm text-slate-400 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                        <span className="bg-dark-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {exp.category} {exp.subcategory ? `> ${exp.subcategory}` : ''}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs">
                                            <CalendarIcon className="h-4 w-4 text-slate-500" />
                                            {billingDate.toLocaleDateString('pt-BR')}
                                        </span>
                                        {exp.installments && (
                                            <div className="flex-grow w-full sm:w-auto">
                                                <span>Parcela {currentInstallment}/{exp.installments.total}</span>
                                                <div className="w-full bg-dark-900 rounded-full h-1.5 mt-1">
                                                    <div className="bg-accent h-1.5 rounded-full" style={{ width: `${(currentInstallment / exp.installments.total) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center self-end sm:self-center">
                                    <p className="font-bold text-red-400 mr-4">
                                        {formatCurrency(exp.installments ? exp.amount / exp.installments.total : exp.amount, isCensored)}
                                    </p>
                                    {exp.installments && (
                                        <button onClick={() => onAnticipateInstallment(exp.id)} className="text-slate-500 hover:text-blue-400 p-1" title="Antecipar Parcelas">
                                            <FastForwardIcon />
                                        </button>
                                    )}
                                    <button onClick={() => onEditExpense(exp)} className="text-slate-500 hover:text-accent p-1">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onRemoveExpense(exp.id)} className="text-slate-500 hover:text-danger p-1">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        )}
                    )}
                </ul>
            )}
            </div>
        </div>
    );
};

const SavingsManager: React.FC<{ 
    jars: {id: string, name: string}[], 
    percentages: Record<string, number>,
    surplus: number, 
    onAddJar: () => void, 
    onPercentageChange: (id: string, p: number) => void, 
    onRemoveJar: (id: string) => void,
    isCensored: boolean
}> = ({ jars, percentages, surplus, onAddJar, onPercentageChange, onRemoveJar, isCensored }) => {
    
    const totalPercentage = useMemo(() => {
        return jars.reduce((acc, jar) => acc + (percentages[jar.id] || 0), 0);
    }, [jars, percentages]);

    const isDistributionDisabled = surplus <= 0;

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Caixinhas</h2>
                <button onClick={onAddJar} className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5" />
                     <span className="hidden sm:inline ml-2">Criar</span>
                </button>
            </div>
            
            {isDistributionDisabled && jars.length > 0 && (
                <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-lg mb-4 flex items-center gap-2">
                    <ExclamationIcon className="h-5 w-5" />
                    <p>Saldo insuficiente para distribuir. Os valores não serão aplicados.</p>
                </div>
            )}

            <div className="flex-grow">
                <div className="mb-4">
                    <div className="w-full bg-dark-600 rounded-full h-4">
                        <div className={`rounded-full h-4 text-xs flex items-center justify-center text-white ${totalPercentage > 100 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}>{totalPercentage}%</div>
                    </div>
                    {totalPercentage > 100 && (
                        <div className="text-danger text-sm mt-2 flex items-center gap-1">
                            <ExclamationIcon className="h-4 w-4" />
                            <span>Total não pode exceder 100%.</span>
                        </div>
                    )}
                    {totalPercentage < 100 && totalPercentage > 0 && <p className="text-yellow-400 text-sm mt-1">Faltam {100-totalPercentage}% para distribuir.</p>}
                </div>
                {jars.length === 0 ? (
                        <p className="text-slate-400 text-center py-10">Crie caixinhas para guardar o dinheiro que sobra.</p>
                ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {jars.map(jar => {
                        const percentage = percentages[jar.id] || 0;
                        return (
                            <li key={jar.id} className="bg-dark-700 p-3 rounded-lg">
                                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                                    <span className="font-semibold self-start sm:self-center">{jar.name}</span>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        <input 
                                          type="number" 
                                          value={percentage} 
                                          onChange={(e) => onPercentageChange(jar.id, parseInt(e.target.value) || 0)} 
                                          className="w-16 bg-dark-600 text-center rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                          disabled={isDistributionDisabled}
                                        />
                                        <span>%</span>
                                        <button onClick={() => onRemoveJar(jar.id)} className="text-slate-500 hover:text-danger">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-accent font-bold mt-1 text-right sm:text-left">{formatCurrency((surplus * percentage) / 100, isCensored)}</p>
                            </li>
                        )
                    })}
                </ul>
                )}
            </div>
        </div>
    );
};

const IncomeModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    onAddIncome: (income: Omit<Income, 'id'>) => void,
    onUpdateIncome: (income: Income) => void,
    incomeToEdit: Income | null
}> = ({ isOpen, onClose, onAddIncome, onUpdateIncome, incomeToEdit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const isEditing = !!incomeToEdit;

    useEffect(() => {
        if (incomeToEdit) {
            setDescription(incomeToEdit.description);
            setAmount(incomeToEdit.amount.toString().replace('.', ','));
        } else {
            setDescription('');
            setAmount('');
        }
    }, [incomeToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyInput(amount);
        if (numericAmount <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        const incomeData = { description, amount: numericAmount };

        if (isEditing) {
            onUpdateIncome({ ...incomeData, id: incomeToEdit.id });
        } else {
            onAddIncome(incomeData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Receita' : 'Adicionar Receita'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Descrição</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ex: Salário, Adiantamento" />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Valor</label>
                    <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</button>
            </form>
        </Modal>
    );
};

const ExpenseModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    onAddExpense: (expense: Omit<Expense, 'id'>) => void,
    onUpdateExpense: (expense: Expense) => void,
    expenseToEdit: Expense | null
}> = ({ isOpen, onClose, onAddExpense, onUpdateExpense, expenseToEdit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
    const [subcategory, setSubcategory] = useState('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [installments, setInstallments] = useState('2');
    const [currentInstallment, setCurrentInstallment] = useState('1');

    const isEditing = !!expenseToEdit;
    const availableSubcategories = SUBCATEGORIES[category as keyof typeof SUBCATEGORIES];

    const resetForm = useCallback(() => {
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory(EXPENSE_CATEGORIES[0]);
        setSubcategory(SUBCATEGORIES[EXPENSE_CATEGORIES[0] as keyof typeof SUBCATEGORIES]?.[0] || '');
        setIsRecurring(false);
        setIsInstallment(false);
        setInstallments('2');
        setCurrentInstallment('1');
    }, []);

    useEffect(() => {
      if (!isEditing && category) {
        setSubcategory(SUBCATEGORIES[category as keyof typeof SUBCATEGORIES]?.[0] || '');
      }
    }, [category, isEditing]);

    useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(expenseToEdit.amount.toString().replace('.', ','));
            setDate(expenseToEdit.date);
            setCategory(expenseToEdit.category);
            setSubcategory(expenseToEdit.subcategory || '');
            setIsRecurring(expenseToEdit.isRecurring);
            setIsInstallment(!!expenseToEdit.installments);
            setInstallments(expenseToEdit.installments ? expenseToEdit.installments.total.toString() : '2');
        } else {
            resetForm();
        }
    }, [expenseToEdit, resetForm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyInput(amount);

        if (numericAmount <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        const expenseData: Omit<Expense, 'id'> = {
            description,
            amount: numericAmount,
            date,
            category,
            subcategory: subcategory === 'Outros' || !subcategory ? undefined : subcategory,
            isRecurring,
            installments: isInstallment ? { total: parseInt(installments) } : undefined,
        };
        
        if (isEditing) {
            onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
        } else {
            onAddExpense(expenseData);
        }
    };
    
    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Descrição</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ex: Compra no Supermercado" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Valor {isInstallment ? 'Total' : ''}</label>
                        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                     <div>
                        <label className="block mb-1 font-semibold text-slate-300">Data da Transação</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent">
                            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Subcategoria</label>
                        <select value={subcategory} onChange={e => setSubcategory(e.target.value)} disabled={!availableSubcategories || availableSubcategories.length === 0} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50">
                            {availableSubcategories?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isRecurring} onChange={e => { setIsRecurring(e.target.checked); if(e.target.checked) setIsInstallment(false); }} className="form-checkbox h-5 w-5 text-accent bg-dark-700 border-dark-600 rounded focus:ring-accent" />
                        <span>É recorrente?</span>
                    </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isInstallment} onChange={e => { setIsInstallment(e.target.checked); if(e.target.checked) setIsRecurring(false); }} className="form-checkbox h-5 w-5 text-accent bg-dark-700 border-dark-600 rounded focus:ring-accent" />
                        <span>É parcelado?</span>
                    </label>
                </div>

                {isInstallment && !isEditing && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-semibold text-slate-300">Total de Parcelas</label>
                            <input type="number" value={installments} onChange={e => setInstallments(e.target.value)} min="2" className="w-full bg-dark-700 p-2 rounded border border-dark-600" />
                        </div>
                    </div>
                )}
                
                {isInstallment && isEditing && (
                    <p className="text-sm text-yellow-400">Não é possível editar o número de parcelas de uma despesa existente. Crie uma nova despesa se necessário.</p>
                )}


                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">{isEditing ? 'Salvar Alterações' : 'Adicionar Despesa'}</button>
            </form>
        </Modal>
    );
};

const JarModal: React.FC<{ 
    isOpen: boolean, 
    onClose: () => void, 
    onAddJar: (jar: Omit<SavingsJar, 'id'>) => void
}> = ({ isOpen, onClose, onAddJar }) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericPercentage = parseInt(percentage, 10);
        if (!name.trim()) {
            alert('Por favor, insira um nome para a caixinha.');
            return;
        }
        if (isNaN(numericPercentage) || numericPercentage < 0 || numericPercentage > 100) {
            alert('Por favor, insira uma porcentagem válida entre 0 e 100.');
            return;
        }

        onAddJar({ name, percentage: numericPercentage });
        setName('');
        setPercentage('');
    };
    
    const handleClose = () => {
        setName('');
        setPercentage('');
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Criar Nova Caixinha">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Nome da Caixinha</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" 
                        placeholder="Ex: Viagem, Reserva de Emergência" 
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Porcentagem Inicial (%)</label>
                    <input 
                        type="number" 
                        inputMode="numeric" 
                        value={percentage} 
                        onChange={e => setPercentage(e.target.value)} 
                        required 
                        className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="0"
                        min="0"
                        max="100"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Esta é a porcentagem padrão para novos investimentos. Você pode ajustar depois.
                    </p>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Criar Caixinha
                </button>
            </form>
        </Modal>
    );
};

interface AnticipateInstallmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    expense: Expense | null;
    onConfirm: (expenseId: string, countToAnticipate: number) => void;
    displayedDate: Date;
    isCensored: boolean;
}

const AnticipateInstallmentModal: React.FC<AnticipateInstallmentModalProps> = ({ isOpen, onClose, expense, onConfirm, displayedDate, isCensored }) => {
    const [count, setCount] = useState(1);

    const remainingInstallments = useMemo(() => {
        if (!expense || !expense.installments) return 0;
        const CARD_CLOSING_DAY = 15;
        const firstPaymentDate = new Date(expense.date + 'T00:00:00');
        if (expense.category === 'Cartão de Crédito' && firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
            firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
        }
        const monthsDiff = (displayedDate.getFullYear() - firstPaymentDate.getFullYear()) * 12 + (displayedDate.getMonth() - firstPaymentDate.getMonth());
        const paidInstallments = monthsDiff + 1;
        
        return Math.max(0, expense.installments.total - paidInstallments);
    }, [expense, displayedDate]);

    useEffect(() => {
      setCount(1);
    }, [isOpen]);

    if (!isOpen || !expense || !expense.installments) return null;
    
    const installmentAmount = expense.amount / expense.installments.total;
    const totalToAnticipate = count * installmentAmount;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Antecipar Parcelas`}>
            <div className="space-y-4">
                <p className="font-bold text-slate-200 text-lg">{expense.description}</p>
                <p>Você pode antecipar até <span className="font-bold">{remainingInstallments}</span> parcelas futuras.</p>
                
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Quantas parcelas deseja antecipar?</label>
                    <input 
                        type="number" 
                        value={count} 
                        onChange={(e) => setCount(Math.max(1, Math.min(parseInt(e.target.value) || 1, remainingInstallments)))}
                        min="1"
                        max={remainingInstallments}
                        className="w-full bg-dark-700 p-2 rounded border border-dark-600"
                    />
                </div>
                
                <div className="bg-dark-700 p-4 rounded-lg text-center">
                    <p className="text-slate-400">Valor a ser pago agora</p>
                    <p className="text-2xl font-bold text-accent">{formatCurrency(totalToAnticipate, isCensored)}</p>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-dark-600 hover:bg-dark-500 text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(expense.id, count)} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors" disabled={count > remainingInstallments || count <= 0}>
                        Confirmar Antecipação
                    </button>
                </div>
            </div>
        </Modal>
    )
}
