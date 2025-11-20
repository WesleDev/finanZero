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
        <title>Recorrente</title>
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
          const installmentDate = new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth() + i, 1);
          const daysInMonth = new Date(installmentDate.getFullYear(), installmentDate.getMonth() + 1, 0).getDate();
          installmentDate.setDate(Math.min(firstPaymentDate.getDate(), daysInMonth));
          
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

  const totalIncome = useMemo(() => {
    const targetMonthYear = getMonthYear(displayedDate);
    return incomes
        .filter(inc => {
            if (inc.isRecurring) {
                return getMonthYear(new Date(inc.date + 'T00:00:00')) <= targetMonthYear;
            }
            return getMonthYear(new Date(inc.date + 'T00:00:00')) === targetMonthYear;
        })
        .reduce((acc, inc) => acc + inc.amount, 0);
  }, [incomes, displayedDate]);

  const displayedMonthIncomes = useMemo(() => {
    const targetMonthYear = getMonthYear(displayedDate);
    return incomes
      .filter(inc => {
          if (inc.isRecurring) {
                return getMonthYear(new Date(inc.date + 'T00:00:00')) <= targetMonthYear;
            }
            return getMonthYear(new Date(inc.date + 'T00:00:00')) === targetMonthYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, displayedDate]);

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
            const installmentDate = new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth() + i, 1);
            const daysInMonth = new Date(installmentDate.getFullYear(), installmentDate.getMonth() + 1, 0).getDate();
            installmentDate.setDate(Math.min(firstPaymentDate.getDate(), daysInMonth));

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
                isCensored={isCensored}
            />
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                 <IncomeManager 
                    incomes={displayedMonthIncomes}
                    onAddIncome={handleStartAddIncome}
                    onEditIncome={handleStartEditIncome}
                    onRemoveIncome={removeIncome}
                    isCensored={isCensored}
                 />
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
        )}

        {activeTab === 'investments' && (
          <InvestmentsPage
            jars={jars}
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
        // Start date is October 2025 (month is 0-indexed).
        const startDate = new Date(2025, 9, 1);
        const currentDate = new Date();

        // No data to show if current date is before the start date.
        if (currentDate < startDate) {
            return [];
        }

        const totalIncomeEver = incomes.reduce((acc, inc) => acc + inc.amount, 0);
        if (totalIncomeEver === 0 && expenses.length === 0) {
          return [];
        }
        
        // Calculate the number of months to display, from startDate up to and including the current month.
        const monthsToDisplay = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth()) + 1;

        for (let i = 0; i < monthsToDisplay; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
            
            const monthLabel = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }).replace(' de', '');
            const targetMonthYear = getMonthYear(date);
            
            const monthlyIncome = incomes
                .filter(inc => {
                     if (inc.isRecurring) {
                         return getMonthYear(new Date(inc.date + 'T00:00:00')) <= targetMonthYear;
                     }
                     return getMonthYear(new Date(inc.date + 'T00:00:00')) === targetMonthYear;
                })
                .reduce((acc, inc) => acc + inc.amount, 0);

            const monthlyExpenses = calculateMonthlyExpensesForDate(expenses, date);
            const surplus = monthlyIncome - monthlyExpenses;

            data.push({
                month: monthLabel,
                income: monthlyIncome,
                expenses: monthlyExpenses,
                surplus: surplus,
            });
        }
        return data;
    }, [incomes, expenses]);

    const startDate = new Date(2025, 9, 1);
    const currentDate = new Date();

    const getEmptyStateMessage = () => {
        if (currentDate < startDate) {
            return "O histórico financeiro começará a ser exibido a partir de Outubro de 2025.";
        }
        return "Adicione receitas e despesas para ver sua evolução financeira.";
    };

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-6 text-center">Evolução Financeira (Desde Out/25)</h2>
            {historicalData.length > 0 ? (
                <FinancialEvolutionChart data={historicalData} isCensored={isCensored} />
            ) : (
                <p className="text-slate-400 text-center py-10">{getEmptyStateMessage()}</p>
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

    const { currentBill, futureDebt } = useMemo(() => {
        const creditCardExpenses = expenses.filter(e => e.category === 'Cartão de Crédito');
        const displayedMonthKey = getMonthYear(displayedDate);

        let bill = 0;
        let future = 0;

        creditCardExpenses.forEach(expense => {
            if (expense.isRecurring) {
                const effectiveStartDate = new Date(expense.date + 'T00:00:00');
                if (effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
                    effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
                }
                const effectiveStartMonthYear = getMonthYear(effectiveStartDate);
                if (effectiveStartMonthYear <= displayedMonthKey) {
                    bill += expense.amount;
                }
            } else if (expense.installments) {
                const installmentAmount = expense.amount / expense.installments.total;
                const firstPaymentDate = new Date(expense.date + 'T00:00:00');
                if (firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
                    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
                }

                for (let i = 0; i < expense.installments.total; i++) {
                    const installmentDate = new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth() + i, 1);
                    const daysInMonth = new Date(installmentDate.getFullYear(), installmentDate.getMonth() + 1, 0).getDate();
                    installmentDate.setDate(Math.min(firstPaymentDate.getDate(), daysInMonth));

                    const installmentMonthKey = getMonthYear(installmentDate);
                    
                    if (installmentMonthKey === displayedMonthKey) {
                        bill += installmentAmount;
                    } else if (installmentMonthKey > displayedMonthKey) {
                        future += installmentAmount;
                    }
                }
            } else { // one-time
                const effectiveDate = new Date(expense.date + 'T00:00:00');
                if (effectiveDate.getDate() >= CARD_CLOSING_DAY) {
                    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
                }
                if (getMonthYear(effectiveDate) === displayedMonthKey) {
                    bill += expense.amount;
                }
            }
        });

        return { currentBill: bill, futureDebt: future };
    }, [expenses, displayedDate]);

    const totalDebt = currentBill + futureDebt;

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

const FinancialChart: React.FC<{ income: number; expenses: number; surplus: number; isCensored: boolean }> = ({ income, expenses, surplus, isCensored }) => {
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
        <div className="bg-dark-800 rounded-xl shadow-lg mt-8">
            <div className="p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-100 mb-8 text-center">Visão Geral do Mês</h2>
                <div className="flex justify-center">
                    {/* Overall Summary Section */}
                    <div className="bg-dark-900/50 rounded-xl p-6 border border-dark-700 flex flex-col items-center justify-center max-w-lg w-full">
                        <h3 className="text-lg font-semibold text-slate-300 mb-6">Balanço</h3>
                        <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-6">
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
                        <div className="flex justify-center gap-6 w-full">
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
                </div>
            </div>
        </div>
    );
};

const IncomeManager: React.FC<{
    incomes: Income[];
    onAddIncome: () => void;
    onEditIncome: (income: Income) => void;
    onRemoveIncome: (id: string) => void;
    isCensored: boolean;
}> = ({ incomes, onAddIncome, onEditIncome, onRemoveIncome, isCensored }) => {
    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Receitas</h2>
                <button onClick={onAddIncome} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-105">
                    <PlusIcon />
                </button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {incomes.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhuma receita registrada neste mês.</p>
                ) : (
                    incomes.map(income => (
                        <div key={income.id} className="bg-dark-700 p-4 rounded-lg flex justify-between items-center group hover:bg-dark-600 transition-colors border-l-4 border-green-500">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-200">{income.description}</h3>
                                    {income.isRecurring && <div title="Receita Recorrente"><RecurringIcon /></div>}
                                </div>
                                <p className="text-xs text-slate-400">{new Date(income.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-green-400 text-lg">{formatCurrency(income.amount, isCensored)}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEditIncome(income)} className="text-slate-400 hover:text-blue-400 p-1 rounded">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onRemoveIncome(income.id)} className="text-slate-400 hover:text-red-400 p-1 rounded">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const ExpenseManager: React.FC<{
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
    setCategoryFilter: (val: string) => void;
    subcategoryFilter: string;
    setSubcategoryFilter: (val: string) => void;
    recurringFilter: string;
    setRecurringFilter: (val: string) => void;
}> = ({ 
    expenses, displayedDate, onAddExpense, onEditExpense, onRemoveExpense, onAnticipateInstallment,
    onPreviousMonth, onNextMonth, isCensored,
    categoryFilter, setCategoryFilter, subcategoryFilter, setSubcategoryFilter, recurringFilter, setRecurringFilter
}) => {
    
    const totalDisplayed = expenses.reduce((acc, curr) => {
         const val = curr.installments ? curr.amount / curr.installments.total : curr.amount;
         return acc + val;
    }, 0);

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onPreviousMonth} className="p-2 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeftIcon />
                    </button>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-100 capitalize w-40 text-center">
                        {displayedDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={onNextMonth} className="p-2 hover:bg-dark-700 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRightIcon />
                    </button>
                </div>
                <button onClick={onAddExpense} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform transform hover:scale-105">
                    <PlusIcon />
                </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <select 
                    value={categoryFilter} 
                    onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter('all'); }}
                    className="bg-dark-700 text-slate-300 text-sm rounded p-2 border border-dark-600 focus:outline-none focus:border-accent"
                >
                    <option value="all">Todas Categorias</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                 <select 
                    value={subcategoryFilter} 
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    disabled={categoryFilter === 'all'}
                    className="bg-dark-700 text-slate-300 text-sm rounded p-2 border border-dark-600 focus:outline-none focus:border-accent disabled:opacity-50"
                >
                    <option value="all">Todas Subcategorias</option>
                     {categoryFilter !== 'all' && SUBCATEGORIES[categoryFilter]?.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select 
                    value={recurringFilter} 
                    onChange={(e) => setRecurringFilter(e.target.value)}
                    className="bg-dark-700 text-slate-300 text-sm rounded p-2 border border-dark-600 focus:outline-none focus:border-accent"
                >
                    <option value="all">Todos Tipos</option>
                    <option value="yes">Recorrentes</option>
                    <option value="no">Não Recorrentes</option>
                </select>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-grow">
                {expenses.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhuma despesa encontrada.</p>
                ) : (
                    expenses.map(expense => {
                        const isInstallment = !!expense.installments;
                        const displayAmount = isInstallment ? (expense.amount / expense.installments!.total) : expense.amount;
                        
                        let installmentLabel = "";
                        if (isInstallment) {
                             installmentLabel = `${expense.installments!.total}x`;
                        }

                        return (
                        <div key={expense.id} className="bg-dark-700 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-dark-600 transition-colors border-l-4 border-red-500">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-200">{expense.description}</h3>
                                    {expense.isRecurring && <div title="Despesa Recorrente"><RecurringIcon /></div>}
                                    {isInstallment && <span className="text-xs bg-dark-900 text-slate-400 px-2 py-0.5 rounded-full border border-dark-600">{installmentLabel}</span>}
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                                    <span className="bg-dark-800 px-2 py-1 rounded">{expense.category}</span>
                                    {expense.subcategory && <span className="bg-dark-800 px-2 py-1 rounded">{expense.subcategory}</span>}
                                    <span>{new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <span className="font-bold text-red-400 text-lg whitespace-nowrap">{formatCurrency(displayAmount, isCensored)}</span>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isInstallment && (
                                         <button onClick={() => onAnticipateInstallment(expense.id)} title="Antecipar Parcelas" className="text-slate-400 hover:text-yellow-400 p-1 rounded">
                                            <FastForwardIcon />
                                        </button>
                                    )}
                                    <button onClick={() => onEditExpense(expense)} className="text-slate-400 hover:text-blue-400 p-1 rounded">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => onRemoveExpense(expense.id)} className="text-slate-400 hover:text-red-400 p-1 rounded">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )})
                )}
            </div>
            
             {expenses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-dark-700 flex justify-between items-center text-slate-300">
                    <span className="font-semibold">Total Visível:</span>
                    <span className="font-bold text-red-400 text-xl">{formatCurrency(totalDisplayed, isCensored)}</span>
                </div>
            )}
        </div>
    );
};

const SavingsManager: React.FC<{
    jars: Omit<SavingsJar, 'percentage'>[];
    percentages: Record<string, number>;
    surplus: number;
    onAddJar: () => void;
    onPercentageChange: (id: string, val: number) => void;
    onRemoveJar: (id: string) => void;
    isCensored: boolean;
}> = ({ jars, percentages, surplus, onAddJar, onPercentageChange, onRemoveJar, isCensored }) => {
    const totalPercentage = jars.reduce((acc, jar) => acc + (percentages[jar.id] || 0), 0);

    return (
        <div className="space-y-4">
            {jars.map(jar => {
                const percentage = percentages[jar.id] || 0;
                const amount = Math.max(0, surplus * (percentage / 100));
                
                return (
                    <div key={jar.id} className="bg-dark-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{jar.name}</span>
                                <button onClick={() => onRemoveJar(jar.id)} className="text-slate-500 hover:text-red-400"><XIcon className="h-4 w-4"/></button>
                             </div>
                             <span className="font-bold text-accent">{formatCurrency(amount, isCensored)}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={percentage} 
                                onChange={(e) => onPercentageChange(jar.id, Number(e.target.value))}
                                className="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <span className="text-sm w-12 text-right font-mono">{percentage}%</span>
                        </div>
                    </div>
                );
            })}
            
            <div className="flex justify-between items-center px-2 text-sm font-semibold">
                 <span className={totalPercentage > 100 ? 'text-red-400' : 'text-slate-400'}>
                    Total Alocado: {totalPercentage}%
                 </span>
                 {totalPercentage > 100 && <span className="text-red-400 text-xs">Atenção: Total excede 100%</span>}
            </div>

            <button 
                onClick={onAddJar}
                className="w-full py-3 border-2 border-dashed border-dark-600 text-slate-400 rounded-lg hover:border-accent hover:text-accent transition-colors flex justify-center items-center gap-2"
            >
                <PlusIcon className="h-5 w-5" /> Criar Nova Caixinha
            </button>
        </div>
    );
};

const IncomeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddIncome: (income: Omit<Income, 'id'>) => void;
    onUpdateIncome: (income: Income) => void;
    incomeToEdit: Income | null;
}> = ({ isOpen, onClose, onAddIncome, onUpdateIncome, incomeToEdit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(false);

    useEffect(() => {
        if (incomeToEdit) {
            setDescription(incomeToEdit.description);
            setAmount(incomeToEdit.amount.toString().replace('.', ','));
            setDate(incomeToEdit.date);
            setIsRecurring(!!incomeToEdit.isRecurring);
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsRecurring(false);
        }
    }, [incomeToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyInput(amount);
        if (!description || numericAmount <= 0) return;

        const incomeData = {
            description,
            amount: numericAmount,
            date,
            isRecurring
        };

        if (incomeToEdit) {
            onUpdateIncome({ ...incomeData, id: incomeToEdit.id });
        } else {
            onAddIncome(incomeData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={incomeToEdit ? "Editar Receita" : "Nova Receita"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" placeholder="Ex: Salário, Freelance..." required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Valor</label>
                    <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" placeholder="R$ 0,00" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" required />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="recurringIncome" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                    <label htmlFor="recurringIncome" className="text-sm font-medium text-slate-300">Receita Recorrente (Mensal)</label>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4">
                    {incomeToEdit ? 'Salvar Alterações' : 'Adicionar Receita'}
                </button>
            </form>
        </Modal>
    );
};

const ExpenseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onUpdateExpense: (expense: Expense) => void;
    expenseToEdit: Expense | null;
}> = ({ isOpen, onClose, onAddExpense, onUpdateExpense, expenseToEdit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
    const [subcategory, setSubcategory] = useState<string>('');
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [installments, setInstallments] = useState(2);

    useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            // If it's an installment expense, show the TOTAL amount for editing? Or the installment amount?
            // Typically edit the total amount.
            setAmount(expenseToEdit.amount.toString().replace('.', ','));
            setDate(expenseToEdit.date);
            setCategory(expenseToEdit.category);
            setSubcategory(expenseToEdit.subcategory || '');
            setIsRecurring(!!expenseToEdit.isRecurring);
            if (expenseToEdit.installments) {
                setIsInstallment(true);
                setInstallments(expenseToEdit.installments.total);
            } else {
                setIsInstallment(false);
                setInstallments(2);
            }
        } else {
            setDescription('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory(EXPENSE_CATEGORIES[0]);
            setSubcategory('');
            setIsRecurring(false);
            setIsInstallment(false);
            setInstallments(2);
        }
    }, [expenseToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyInput(amount);
        if (!description || numericAmount <= 0) return;

        const expenseData: any = {
            description,
            amount: numericAmount,
            date,
            category,
            subcategory,
            isRecurring: isRecurring && !isInstallment, // Recurring and installments are mutually exclusive in this logic usually
        };

        if (isInstallment && !isRecurring) {
            expenseData.installments = { total: installments };
        }

        if (expenseToEdit) {
            onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
        } else {
            onAddExpense(expenseData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={expenseToEdit ? "Editar Despesa" : "Nova Despesa"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" placeholder="Ex: Supermercado" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Valor Total</label>
                    <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" placeholder="R$ 0,00" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                         <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none">
                            {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                    </div>
                </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-400 mb-1">Subcategoria (Opcional)</label>
                     <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none">
                        <option value="">Selecione...</option>
                        {SUBCATEGORIES[category]?.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="recurring" checked={isRecurring} onChange={(e) => { setIsRecurring(e.target.checked); if(e.target.checked) setIsInstallment(false); }} className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <label htmlFor="recurring" className="text-sm font-medium text-slate-300">Despesa Recorrente (Mensal)</label>
                    </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" id="installment" checked={isInstallment} onChange={(e) => { setIsInstallment(e.target.checked); if(e.target.checked) setIsRecurring(false); }} className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent" />
                        <label htmlFor="installment" className="text-sm font-medium text-slate-300">Parcelado</label>
                    </div>
                </div>

                {isInstallment && (
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Número de Parcelas</label>
                        <input type="number" min="2" max="48" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" />
                        <p className="text-xs text-slate-500 mt-1">Valor da parcela: {formatCurrency(parseCurrencyInput(amount) / installments, false)}</p>
                    </div>
                )}

                <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4">
                    {expenseToEdit ? 'Salvar Alterações' : 'Adicionar Despesa'}
                </button>
            </form>
        </Modal>
    );
};

const JarModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddJar: (jar: Omit<SavingsJar, 'id'>) => void;
}> = ({ isOpen, onClose, onAddJar }) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState(10);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onAddJar({ name, percentage });
        setName('');
        setPercentage(10);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nova Caixinha">
             <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Caixinha</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" placeholder="Ex: Viagem, Reserva de Emergência..." required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Porcentagem Inicial (%)</label>
                    <input type="number" min="1" max="100" value={percentage} onChange={(e) => setPercentage(parseInt(e.target.value))} className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" required />
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4">
                    Criar Caixinha
                </button>
            </form>
        </Modal>
    );
};

const AnticipateInstallmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    expense: Expense | null;
    onConfirm: (expenseId: string, count: number) => void;
    displayedDate: Date;
    isCensored: boolean;
}> = ({ isOpen, onClose, expense, onConfirm, displayedDate, isCensored }) => {
    const [count, setCount] = useState(1);
    
    if (!isOpen || !expense || !expense.installments) return null;

    // Calculate remaining installments from displayed date onwards?
    // Or just generic anticipation. The logic in App.tsx handles reducing total.
    // Usually users want to anticipate X installments from the end or next X.
    // Simple logic: "How many installments do you want to anticipate?"
    
    const installmentValue = expense.amount / expense.installments.total;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Antecipar Parcelas">
             <div className="space-y-4">
                <p className="text-slate-300">
                    Deseja antecipar parcelas para <strong>{expense.description}</strong>?
                </p>
                <div className="bg-dark-700 p-3 rounded border border-dark-600">
                     <p className="text-sm text-slate-400">Valor da Parcela: <span className="text-slate-200 font-bold">{formatCurrency(installmentValue, isCensored)}</span></p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Número de parcelas a antecipar</label>
                    <input 
                        type="number" 
                        min="1" 
                        max={expense.installments.total} 
                        value={count} 
                        onChange={(e) => setCount(parseInt(e.target.value))} 
                        className="w-full bg-dark-700 rounded border border-dark-600 p-2 text-white focus:border-accent focus:outline-none" 
                    />
                </div>
                
                <div className="p-3 bg-blue-900/20 rounded border border-blue-800/50">
                    <p className="text-blue-300 text-sm">Total a pagar agora: <span className="font-bold text-lg block">{formatCurrency(count * installmentValue, isCensored)}</span></p>
                </div>

                <button 
                    onClick={() => onConfirm(expense.id, count)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-4"
                >
                    Confirmar Antecipação
                </button>
            </div>
        </Modal>
    );
};