import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Expense, SavingsJar, Income } from './types';
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
const TrendingUpIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
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

const formatCurrency = (value: number) => {
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

// --- MODAL COMPONENT ---
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

// --- APP COMPONENT ---
export default function App() {
  const [incomes, setIncomes] = useLocalStorage<Income[]>('incomes', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [jars, setJars] = useLocalStorage<SavingsJar[]>('jars', []);
  const [fortnightlyIncome, setFortnightlyIncome] = useLocalStorage<number>('fortnightlyIncome', 0);
  const [monthlyPayment, setMonthlyPayment] = useLocalStorage<number>('monthlyPayment', 0);
  const [midMonthPercentages, setMidMonthPercentages] = useLocalStorage<Record<string, number>>('midMonthPercentages', {});
  const [endOfMonthPercentages, setEndOfMonthPercentages] = useLocalStorage<Record<string, number>>('endOfMonthPercentages', {});

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isJarModalOpen, setJarModalOpen] = useState(false);

  const [displayedDate, setDisplayedDate] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState('dashboard');

  const totalIncome = useMemo(() => incomes.reduce((acc, inc) => acc + inc.amount, 0), [incomes]);

  const calculateMonthlyExpenses = useCallback((date: Date) => {
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
    setIncomes(incomes.filter(i => i.id !== id));
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
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses([...expenses, { ...expense, id: Date.now().toString() }]);
    setExpenseModalOpen(false);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map(e => (e.id === updatedExpense.id ? updatedExpense : e)));
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };
    
  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
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
  
  // --- JAR CRUD ---
  const addJar = (jar: Omit<SavingsJar, 'id'>) => {
      setJars([...jars, { ...jar, id: Date.now().toString() }]);
      setJarModalOpen(false);
  };

  const updateJarPercentage = (id: string, percentage: number) => {
    const newJars = jars.map(jar => jar.id === id ? {...jar, percentage} : jar);
    const totalPercentage = newJars.reduce((acc, jar) => acc + jar.percentage, 0);
    if(totalPercentage <= 100) {
        setJars(newJars);
    } else {
        // Optionally show an alert or handle the error
        console.warn("Total percentage cannot exceed 100%");
        // For a better UX, you might want to still set the value but show an error
        setJars(newJars);
    }
  };
    
  const removeJar = (id: string) => {
    setJars(jars.filter(j => j.id !== id));
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
            if (!data.incomes || !data.expenses || !data.jars || data.fortnightlyIncome === undefined) {
                throw new Error("Arquivo de backup inválido ou corrompido.");
            }
            
            if (window.confirm("Tem certeza que deseja importar os dados? Todos os dados atuais serão substituídos.")) {
                setIncomes(data.incomes);
                setExpenses(data.expenses);
                setJars(data.jars);
                setFortnightlyIncome(data.fortnightlyIncome);
                setMonthlyPayment(data.monthlyPayment);
                setMidMonthPercentages(data.midMonthPercentages);
                setEndOfMonthPercentages(data.endOfMonthPercentages);
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
        <Header onImport={handleImportClick} onExport={handleExport} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {activeTab === 'dashboard' && (
          <div id="dashboard-content">
            <MonthlyAlert current={displayedMonthExpenses} previous={previousMonthExpenses} />
            <Summary income={totalIncome} expenses={displayedMonthExpenses} surplus={surplus} />
            <FinancialChart 
                income={totalIncome} 
                expenses={displayedMonthExpenses} 
                surplus={surplus} 
                monthlyExpensesList={displayedMonthExpensesList}
                displayedDate={displayedDate}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div>
                     <IncomeManager 
                        incomes={incomes}
                        onAddIncome={handleStartAddIncome}
                        onEditIncome={handleStartEditIncome}
                        onRemoveIncome={removeIncome}
                     />
                     <div className="mt-8">
                        <ExpenseManager 
                          expenses={displayedMonthExpensesList} 
                          displayedDate={displayedDate}
                          onAddExpense={handleStartAddExpense} 
                          onEditExpense={handleStartEditExpense} 
                          onRemoveExpense={removeExpense}
                          onPreviousMonth={goToPreviousMonth}
                          onNextMonth={goToNextMonth}
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
          />
        )}
      </main>
      
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
const Header: React.FC<{onImport: () => void, onExport: () => void}> = ({ onImport, onExport }) => (
    <header className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <WalletIcon />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                    FinanZero
                </h1>
            </div>
            <div className="flex items-center gap-2">
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

interface InvestmentReportProps {
    jars: Omit<SavingsJar, 'percentage'>[];
    midMonthSurplus: number;
    monthlyPayment: number;
    midMonthPercentages: Record<string, number>;
    endOfMonthPercentages: Record<string, number>;
}

const InvestmentReport: React.FC<InvestmentReportProps> = ({
    jars,
    midMonthSurplus,
    monthlyPayment,
    midMonthPercentages,
    endOfMonthPercentages
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
                        <span className="font-bold text-lg text-accent">{formatCurrency(jarTotal.total)}</span>
                    </li>
                ))}
            </ul>

            <hr className="border-dark-600 my-4"/>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg sm:text-xl mt-4">
                <span className="font-bold text-slate-100">Total Investido no Mês:</span>
                <span className="font-extrabold text-xl sm:text-2xl text-green-400">{formatCurrency(investmentTotals.grandTotal)}</span>
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
}

const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ 
    jars, onRemoveJar, onAddJar, expensesForMonth,
    fortnightlyIncome, setFortnightlyIncome,
    monthlyPayment, setMonthlyPayment,
    midMonthPercentages, setMidMonthPercentages,
    endOfMonthPercentages, setEndOfMonthPercentages
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

    const midMonthSurplus = fortnightlyIncome - creditCardExpenses;

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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Configurar Ganhos para Investimento</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 font-semibold text-slate-300">Receita Quinzenal (adiantamento)</label>
                                <input type="text" inputMode="decimal" value={fortnightlyIncomeInput} onChange={handleFortnightlyIncomeChange} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="R$ 0,00" />
                            </div>
                            <div>
                                <label className="block mb-1 font-semibold text-slate-300">Pagamento Fim de Mês (salário)</label>
                                <input type="text" inputMode="decimal" value={monthlyPaymentInput} onChange={handleMonthlyPaymentChange} className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="R$ 0,00" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Planejamento Quinzenal (Dia 15)</h2>
                        <div className="space-y-2 text-lg mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Receita Quinzenal:</span>
                                <span className="font-bold text-green-400">{formatCurrency(fortnightlyIncome)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Despesas do Cartão:</span>
                                <span className="font-bold text-red-400">- {formatCurrency(creditCardExpenses)}</span>
                            </div>
                            <hr className="border-dark-700 !my-3"/>
                            <div className="flex justify-between items-center text-xl">
                                <span className="text-slate-200">Saldo para investir:</span>
                                <span className={`font-extrabold ${midMonthSurplus >= 0 ? 'text-blue-400' : 'text-yellow-400'}`}>{formatCurrency(midMonthSurplus)}</span>
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
                        />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Planejamento Fim de Mês</h2>
                         <div className="flex justify-between items-center text-xl">
                            <span className="text-slate-200">Aporte sugerido:</span>
                            <span className="font-extrabold text-green-400">{formatCurrency(monthlyPayment)}</span>
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
                        />
                    </div>
                </div>
            </div>
            <InvestmentReport
                jars={jars}
                midMonthSurplus={midMonthSurplus}
                monthlyPayment={monthlyPayment}
                midMonthPercentages={midMonthPercentages}
                endOfMonthPercentages={endOfMonthPercentages}
            />
        </div>
    );
};


const MonthlyAlert: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
    if (previous === 0 && current > 0) {
        return <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg mb-6 flex items-center"><TrendingUpIcon/> Primeiro mês com gastos registrados. Mantenha o controle!</div>;
    }
    if (previous === 0) return null;

    const difference = current - previous;
    if (difference > 0) {
        return <div className="bg-danger/20 text-red-400 p-4 rounded-lg mb-6 flex items-center"><TrendingUpIcon /> Seus gastos aumentaram em {formatCurrency(difference)} este mês.</div>;
    } else if (difference < 0) {
        return <div className="bg-success/20 text-green-400 p-4 rounded-lg mb-6 flex items-center"><TrendingDownIcon/> Ótimo! Seus gastos diminuíram em {formatCurrency(Math.abs(difference))} este mês.</div>;
    } else {
        return <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg mb-6 flex items-center"><MinusCircleIcon /> Seus gastos se mantiveram estáveis este mês.</div>;
    }
};

const Summary: React.FC<{ income: number; expenses: number; surplus: number; }> = ({ income, expenses, surplus }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-slate-400 text-lg">Receita Mensal</h2>
                <p className="text-green-400 text-2xl sm:text-3xl font-bold">{formatCurrency(income)}</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-slate-400 text-lg">Gastos do Mês</h2>
                <p className="text-red-400 text-2xl sm:text-3xl font-bold">{formatCurrency(expenses)}</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-slate-400 text-lg">Sobra no Mês</h2>
                <p className={`${surplus >= 0 ? 'text-blue-400' : 'text-yellow-400'} text-2xl sm:text-3xl font-bold`}>{formatCurrency(surplus)}</p>
            </div>
        </div>
    );
};

const SubcategoryRanking: React.FC<{ expenses: Expense[]; displayedDate: Date }> = ({ expenses, displayedDate }) => {
    const rankedExpenses = useMemo(() => {
        const expensesBySubcategory: { [key: string]: number } = {};

        expenses.forEach(expense => {
            if (expense.subcategory) {
                let amountToConsider = expense.amount; // Default for non-installments

                if (expense.installments) {
                    const CARD_CLOSING_DAY = 15;
                    const firstPaymentDate = new Date(expense.date + 'T00:00:00');
                    if (expense.category === 'Cartão de Crédito' && firstPaymentDate.getDate() >= CARD_CLOSING_DAY) {
                        firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);
                    }
                    
                    const firstPaymentMonthYear = getMonthYear(firstPaymentDate);
                    const displayedMonthYear = getMonthYear(displayedDate);
                    
                    if (firstPaymentMonthYear === displayedMonthYear) {
                        amountToConsider = expense.amount; // First month, use total amount
                    } else {
                        amountToConsider = expense.amount / expense.installments.total; // Subsequent months, use monthly amount
                    }
                }
                
                expensesBySubcategory[expense.subcategory] = (expensesBySubcategory[expense.subcategory] || 0) + amountToConsider;
            }
        });
        
        return Object.entries(expensesBySubcategory)
            .sort(([, amountA], [, amountB]) => amountB - amountA)
            .slice(0, 5);
    }, [expenses, displayedDate]);
    
    if (rankedExpenses.length === 0) {
        return <p className="text-slate-500 text-center md:text-left mt-6">Nenhum gasto com subcategoria para exibir no ranking.</p>;
    }

    return (
        <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-300 mb-2">Top Gastos por Subcategoria</h3>
            <ul className="space-y-2">
                {rankedExpenses.map(([subcategory, total]) => (
                    <li key={subcategory} className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">{subcategory}</span>
                        <span className="font-bold text-slate-200">{formatCurrency(total)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const FinancialChart: React.FC<{ income: number; expenses: number; surplus: number; monthlyExpensesList: Expense[]; displayedDate: Date }> = ({ income, expenses, surplus, monthlyExpensesList, displayedDate }) => {
    if (income <= 0) {
        return (
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-8 text-center">
                 <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4">Distribuição Mensal</h2>
                 <p className="text-slate-400">Adicione uma receita para ver o gráfico de distribuição.</p>
            </div>
        );
    }
    
    const expensesPercentage = (expenses / income) * 100;
    const surplusPercentage = Math.max(0, (surplus / income) * 100);

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const expenseStrokeDashoffset = circumference - (expensesPercentage / 100) * circumference;
    
    const expenseRotation = (surplusPercentage / 100) * 360;

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-4 text-center">Visão Geral do Mês</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative w-48 h-48 sm:w-52 sm:h-52 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                        <text x="100" y="95" textAnchor="middle" className="fill-current text-slate-400 text-sm">Receita Total</text>
                        <text x="100" y="120" textAnchor="middle" className="fill-current text-slate-100 text-2xl font-bold">{formatCurrency(income)}</text>
                        <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" className="text-red-500/20 stroke-current" />
                        <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" strokeDasharray={circumference} strokeDashoffset={expenseStrokeDashoffset} strokeLinecap="round" transform="rotate(-90 100 100)" className="text-red-500 stroke-current" />
                        {surplus > 0 && <circle cx="100" cy="100" r={radius} fill="transparent" strokeWidth="20" strokeDasharray={circumference} strokeDashoffset={circumference - (surplusPercentage / 100) * circumference} strokeLinecap="round" transform={`rotate(${expenseRotation - 90} 100 100)`} className="text-blue-500 stroke-current" />}
                    </svg>
                </div>
                <div>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
                            <div>
                                <p className="text-slate-400">Despesas</p>
                                <p className="font-bold text-lg text-red-400">{formatCurrency(expenses)}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <div>
                                <p className="text-slate-400">Sobra</p>
                                <p className="font-bold text-lg text-blue-400">{formatCurrency(surplus)}</p>
                            </div>
                        </div>
                    </div>
                    <SubcategoryRanking expenses={monthlyExpensesList} displayedDate={displayedDate} />
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
}

const IncomeManager: React.FC<IncomeManagerProps> = ({ incomes, onAddIncome, onEditIncome, onRemoveIncome }) => {
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
                                <p className="font-bold text-green-400 mr-4">{formatCurrency(inc.amount)}</p>
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

interface ExpenseManagerProps {
  expenses: Expense[];
  displayedDate: Date;
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onRemoveExpense: (id: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, displayedDate, onAddExpense, onEditExpense, onRemoveExpense, onPreviousMonth, onNextMonth }) => {
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
            <div className="flex-grow overflow-y-auto max-h-96 pr-2">
            {expenses.length === 0 ? (
                <p className="text-slate-400 text-center py-10">Nenhuma despesa este mês.</p>
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
                                        {formatCurrency(exp.installments ? exp.amount / exp.installments.total : exp.amount)}
                                    </p>
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
    onRemoveJar: (id: string) => void 
}> = ({ jars, percentages, surplus, onAddJar, onPercentageChange, onRemoveJar }) => {
    
    const totalPercentage = useMemo(() => {
        return jars.reduce((acc, jar) => acc + (percentages[jar.id] || 0), 0);
    }, [jars, percentages]);

    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Caixinhas</h2>
                <button onClick={onAddJar} className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5" />
                     <span className="hidden sm:inline ml-2">Criar</span>
                </button>
            </div>
            {surplus <= 0 && jars.length > 0 ? (
                <p className="text-center text-slate-400 py-10">Você precisa de um saldo positivo para distribuir.</p>
            ) : (
                <div className="flex-grow">
                    <div className="mb-4">
                        <div className="w-full bg-dark-600 rounded-full h-4">
                            <div className={`rounded-full h-4 text-xs flex items-center justify-center text-white ${totalPercentage > 100 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}>{totalPercentage}%</div>
                        </div>
                        {totalPercentage > 100 && <p className="text-danger text-sm mt-1">Total não pode exceder 100%.</p>}
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
                                            <input type="number" value={percentage} onChange={(e) => onPercentageChange(jar.id, parseInt(e.target.value) || 0)} className="w-16 bg-dark-600 text-center rounded p-1" />
                                            <span>%</span>
                                            <button onClick={() => onRemoveJar(jar.id)} className="text-slate-500 hover:text-danger">
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-accent font-bold mt-1 text-right sm:text-left">{formatCurrency((surplus * percentage) / 100)}</p>
                                </li>
                            )
                        })}
                    </ul>
                    )}
                </div>
            )}
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
            const hasInstallments = !!expenseToEdit.installments;
            setIsInstallment(hasInstallments);
            if (hasInstallments) {
                setInstallments(expenseToEdit.installments!.total.toString());
                setCurrentInstallment('1'); 
            } else {
                setInstallments('2');
            }
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

        let finalDate = date;
        if (isInstallment) {
            const currentPaymentDate = new Date(date + 'T00:00:00');
            const currentInstallmentNum = parseInt(currentInstallment, 10);
            
            if (!isEditing && currentInstallmentNum > 1) {
              currentPaymentDate.setMonth(currentPaymentDate.getMonth() - (currentInstallmentNum - 1));
            }
            finalDate = currentPaymentDate.toISOString().split('T')[0];
        }

        const expenseData = {
            description,
            amount: numericAmount,
            date: finalDate,
            category,
            subcategory: availableSubcategories ? subcategory : undefined,
            isRecurring: isRecurring && !isInstallment,
            installments: isInstallment ? { total: parseInt(installments, 10) } : undefined
        };

        if (isEditing) {
            onUpdateExpense({ ...expenseData, id: expenseToEdit.id });
        } else {
            onAddExpense(expenseData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Despesa' : 'Adicionar Despesa'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Descrição</label>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Valor Total</label>
                    <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                 <div>
                    <label className="block mb-1 font-semibold text-slate-300">Data {isInstallment ? (isEditing ? 'de Início da Compra' : 'do Pagamento Atual') : 'da Despesa'}</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent">
                            {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     {availableSubcategories && availableSubcategories.length > 0 && (
                        <div>
                            <label className="block mb-1 font-semibold text-slate-300">Subcategoria</label>
                            <select value={subcategory} onChange={e => setSubcategory(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent">
                                {availableSubcategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input type="checkbox" id="isInstallment" checked={isInstallment} onChange={e => setIsInstallment(e.target.checked)} className="mr-2 h-4 w-4 rounded accent-accent"/>
                        <label htmlFor="isInstallment">É parcelado?</label>
                    </div>
                     <div className="flex items-center">
                        <input type="checkbox" id="isRecurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} disabled={isInstallment} className="mr-2 h-4 w-4 rounded accent-accent disabled:opacity-50"/>
                        <label htmlFor="isRecurring" className={isInstallment ? 'text-slate-500' : ''}>É recorrente?</label>
                    </div>
                </div>
                {isInstallment && (
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Quantidade Total de Parcelas</label>
                        <input type="number" min="2" value={installments} onChange={e => setInstallments(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                )}
                {!isEditing && isInstallment && (
                    <div>
                        <label className="block mb-1 font-semibold text-slate-300">Número da Parcela Atual</label>
                        <input type="number" min="1" max={installments} value={currentInstallment} onChange={e => setCurrentInstallment(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                    </div>
                )}
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</button>
            </form>
        </Modal>
    );
};


const JarModal: React.FC<{ isOpen: boolean, onClose: () => void, onAddJar: (jar: Omit<SavingsJar, 'id'>) => void }> = ({ isOpen, onClose, onAddJar }) => {
    const [name, setName] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddJar({ name, percentage: 0 });
        setName('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Caixinha">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Nome da Caixinha</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Ex: Viagem, Reserva de Emergência"/>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">Criar</button>
            </form>
        </Modal>
    );
};
