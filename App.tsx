import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Expense, SavingsJar } from './types';
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
// FIX: The 'title' prop is not a valid SVG attribute in React. Use the <title> element for accessibility.
const RecurringIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <title>Gasto Recorrente</title>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
);


// --- UTILS & CONSTANTS ---
const EXPENSE_CATEGORIES = ['Cartão de Crédito', 'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'] as const;

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
  const [income, setIncome] = useLocalStorage('income', 0);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [jars, setJars] = useLocalStorage<SavingsJar[]>('jars', []);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isJarModalOpen, setJarModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
        if (expense.category === 'Cartão de Crédito' && effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
            effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
        }
        
        const installmentAmount = expense.amount / expense.installments.total;
        for (let i = 0; i < expense.installments.total; i++) {
          const installmentDate = new Date(effectiveStartDate);
          installmentDate.setMonth(effectiveStartDate.getMonth() + i);
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

  const { currentMonthExpenses, previousMonthExpenses, surplus } = useMemo(() => {
    const today = new Date();
    const currentMonthExpenses = calculateMonthlyExpenses(today);
    
    const prevMonthDate = new Date();
    prevMonthDate.setMonth(today.getMonth() - 1);
    const previousMonthExpenses = calculateMonthlyExpenses(prevMonthDate);

    const surplus = income - currentMonthExpenses;
    return { currentMonthExpenses, previousMonthExpenses, surplus };
  }, [income, calculateMonthlyExpenses]);

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
  
  const addJar = (jar: Omit<SavingsJar, 'id'>) => {
      setJars([...jars, { ...jar, id: Date.now().toString() }]);
      setJarModalOpen(false);
  };

  const updateJarPercentage = (id: string, percentage: number) => {
    const newJars = jars.map(jar => jar.id === id ? {...jar, percentage} : jar);
    const totalPercentage = newJars.reduce((acc, jar) => acc + jar.percentage, 0);
    if(totalPercentage <= 100) {
        setJars(newJars);
    }
  };
    
  const removeJar = (id: string) => {
    setJars(jars.filter(j => j.id !== id));
  };

  const totalJarPercentage = jars.reduce((acc, jar) => acc + jar.percentage, 0);
  
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


  return (
    <div className="min-h-screen bg-dark-900 font-sans text-slate-300">
      <main className="container mx-auto p-4 md:p-8">
        <Header />
        <MonthlyAlert current={currentMonthExpenses} previous={previousMonthExpenses} />
        <Summary income={income} expenses={currentMonthExpenses} surplus={surplus} onSetIncome={setIncome} />
        <FinancialChart income={income} expenses={currentMonthExpenses} surplus={surplus} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <ExpenseManager expenses={expenses} onAddExpense={handleStartAddExpense} onEditExpense={handleStartEditExpense} onRemoveExpense={removeExpense} />
            <SavingsManager jars={jars} surplus={surplus} onAddJar={() => setJarModalOpen(true)} onUpdateJar={updateJarPercentage} onRemoveJar={removeJar} totalPercentage={totalJarPercentage} />
        </div>
      </main>
      
      <ExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseExpenseModal} 
        onAddExpense={addExpense} 
        onUpdateExpense={updateExpense}
        expenseToEdit={editingExpense}
      />
      <JarModal isOpen={isJarModalOpen} onClose={() => setJarModalOpen(false)} onAddJar={addJar} />
    </div>
  );
}

// --- SUB-COMPONENTS ---
const Header: React.FC = () => (
    <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 flex items-center gap-3">
            <WalletIcon /> FinanZero
        </h1>
        <p className="text-slate-400 mt-2">Seu painel de controle financeiro pessoal.</p>
    </header>
);

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

const Summary: React.FC<{ income: number; expenses: number; surplus: number; onSetIncome: (income: number) => void }> = ({ income, expenses, surplus, onSetIncome }) => {
    const [editingIncome, setEditingIncome] = useState(false);
    const [newIncome, setNewIncome] = useState(income.toString());

    const handleIncomeSave = () => {
        const value = parseFloat(newIncome.replace(',', '.'));
        if(!isNaN(value)) {
            onSetIncome(value);
        }
        setEditingIncome(false);
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105" onClick={() => setEditingIncome(true)}>
                <h2 className="text-slate-400 text-lg">Receita Mensal</h2>
                {editingIncome ? (
                     <div className="flex items-center mt-2">
                        <input type="number" value={newIncome} onChange={(e) => setNewIncome(e.target.value)} onBlur={handleIncomeSave} onKeyDown={(e) => e.key === 'Enter' && handleIncomeSave()} autoFocus className="bg-dark-700 text-3xl font-bold w-full p-1 rounded" />
                     </div>
                ) : (
                    <p className="text-green-400 text-3xl font-bold">{formatCurrency(income)}</p>
                )}
            </div>
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-slate-400 text-lg">Gastos do Mês</h2>
                <p className="text-red-400 text-3xl font-bold">{formatCurrency(expenses)}</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-slate-400 text-lg">Sobra no Mês</h2>
                <p className={`${surplus >= 0 ? 'text-blue-400' : 'text-yellow-400'} text-3xl font-bold`}>{formatCurrency(surplus)}</p>
            </div>
        </div>
    );
};

const FinancialChart: React.FC<{ income: number; expenses: number; surplus: number; }> = ({ income, expenses, surplus }) => {
    if (income <= 0) {
        return (
            <div className="bg-dark-800 p-6 rounded-xl shadow-lg mt-8 text-center">
                 <h2 className="text-2xl font-bold text-slate-100 mb-4">Distribuição Mensal</h2>
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
            <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Distribuição Mensal</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="relative w-52 h-52">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                        {/* Center Text */}
                        <text x="100" y="95" textAnchor="middle" className="fill-current text-slate-400 text-sm">
                            Receita Total
                        </text>
                        <text x="100" y="120" textAnchor="middle" className="fill-current text-slate-100 text-2xl font-bold">
                            {formatCurrency(income)}
                        </text>

                        {/* Chart Rings */}
                        <circle
                            cx="100" cy="100" r={radius}
                            fill="transparent"
                            strokeWidth="20"
                            className="text-red-500/20 stroke-current"
                        />
                        <circle
                             cx="100" cy="100" r={radius}
                             fill="transparent"
                             strokeWidth="20"
                             strokeDasharray={circumference}
                             strokeDashoffset={expenseStrokeDashoffset}
                             strokeLinecap="round"
                             transform="rotate(-90 100 100)"
                             className="text-red-500 stroke-current"
                        />
                       
                         {surplus > 0 && <circle
                             cx="100" cy="100" r={radius}
                             fill="transparent"
                             strokeWidth="20"
                             strokeDasharray={circumference}
                             strokeDashoffset={circumference - (surplusPercentage / 100) * circumference}
                             strokeLinecap="round"
                             transform={`rotate(${expenseRotation - 90} 100 100)`}
                             className="text-blue-500 stroke-current"
                        />}
                    </svg>
                </div>
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
            </div>
        </div>
    );
};


const ExpenseManager: React.FC<{ expenses: Expense[], onAddExpense: () => void, onEditExpense: (expense: Expense) => void, onRemoveExpense: (id: string) => void }> = ({ expenses, onAddExpense, onEditExpense, onRemoveExpense }) => {
  const currentMonthExpenses = useMemo(() => {
    const today = new Date();
    const currentMonthKey = getMonthYear(today);
    const CARD_CLOSING_DAY = 15;
    
    return expenses.filter(expense => {
      if (expense.isRecurring) {
          const effectiveStartDate = new Date(expense.date + 'T00:00:00');
          if (expense.category === 'Cartão de Crédito' && effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
              effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
          }
          const effectiveStartMonthYear = getMonthYear(effectiveStartDate);
          return effectiveStartMonthYear <= currentMonthKey;
      }

      if (expense.installments) {
          const effectiveStartDate = new Date(expense.date + 'T00:00:00');
           if (expense.category === 'Cartão de Crédito' && effectiveStartDate.getDate() >= CARD_CLOSING_DAY) {
              effectiveStartDate.setMonth(effectiveStartDate.getMonth() + 1);
          }
          const endDate = new Date(effectiveStartDate);
          endDate.setMonth(effectiveStartDate.getMonth() + expense.installments.total - 1);
          return today >= effectiveStartDate && today <= endDate;
      }
      
      const effectiveDate = new Date(expense.date + 'T00:00:00');
      if (expense.category === 'Cartão de Crédito' && effectiveDate.getDate() >= CARD_CLOSING_DAY) {
          effectiveDate.setMonth(effectiveDate.getMonth() + 1);
      }
      const effectiveMonthYear = getMonthYear(effectiveDate);
      return effectiveMonthYear === currentMonthKey;
    });
  }, [expenses]);
    
  return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Despesas</h2>
                <button onClick={onAddExpense} className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5 mr-2" /> Adicionar
                </button>
            </div>
            <div className="flex-grow overflow-y-auto max-h-96 pr-2">
            {currentMonthExpenses.length === 0 ? (
                <p className="text-slate-400 text-center py-10">Nenhuma despesa este mês.</p>
            ) : (
                <ul className="space-y-3">
                    {currentMonthExpenses.map(exp => {
                        const expenseDate = new Date(exp.date + 'T00:00:00');
                        let currentInstallment = 0;
                        if(exp.installments){
                            const today = new Date();
                            const monthsDiff = (today.getFullYear() - expenseDate.getFullYear()) * 12 + (today.getMonth() - expenseDate.getMonth());
                            currentInstallment = monthsDiff + 1;
                        }

                        return(
                            <li key={exp.id} className="bg-dark-700 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold">{exp.description}</p>
                                        {exp.isRecurring && <RecurringIcon />}
                                    </div>
                                    <div className="text-sm text-slate-400 flex items-center gap-4">
                                        <span className="bg-dark-600 px-2 py-0.5 rounded-full text-xs font-medium">{exp.category}</span>
                                        {exp.installments && (
                                            <div className="flex-grow">
                                                <span>Parcela {currentInstallment}/{exp.installments.total}</span>
                                                <div className="w-full bg-dark-900 rounded-full h-1.5 mt-1">
                                                    <div className="bg-accent h-1.5 rounded-full" style={{ width: `${(currentInstallment / exp.installments.total) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center">
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

const SavingsManager: React.FC<{ jars: SavingsJar[], surplus: number, onAddJar: () => void, onUpdateJar: (id: string, p: number) => void, onRemoveJar: (id: string) => void, totalPercentage: number }> = ({ jars, surplus, onAddJar, onUpdateJar, onRemoveJar, totalPercentage }) => {
    return (
        <div className="bg-dark-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Caixinhas</h2>
                <button onClick={onAddJar} className="flex items-center bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    <PlusIcon className="h-5 w-5 mr-2" /> Criar
                </button>
            </div>
            {surplus <= 0 ? (
                <p className="text-center text-slate-400 py-10">Você precisa de um saldo positivo para criar caixinhas.</p>
            ) : (
                <div className="flex-grow">
                    <div className="mb-4">
                        <div className="w-full bg-dark-600 rounded-full h-4">
                            <div className={`rounded-full h-4 text-xs flex items-center justify-center text-white ${totalPercentage > 100 ? 'bg-danger' : 'bg-success'}`} style={{ width: `${Math.min(totalPercentage, 100)}%` }}>{totalPercentage}%</div>
                        </div>
                        {totalPercentage > 100 && <p className="text-danger text-sm mt-1">Total não pode exceder 100%.</p>}
                         {totalPercentage < 100 && <p className="text-yellow-400 text-sm mt-1">Faltam {100-totalPercentage}% para distribuir.</p>}
                    </div>
                    {jars.length === 0 ? (
                         <p className="text-slate-400 text-center py-10">Crie caixinhas para guardar o dinheiro que sobra.</p>
                    ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {jars.map(jar => (
                            <li key={jar.id} className="bg-dark-700 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold">{jar.name}</span>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={jar.percentage} onChange={(e) => onUpdateJar(jar.id, parseInt(e.target.value) || 0)} className="w-16 bg-dark-600 text-center rounded p-1" />
                                        <span>%</span>
                                        <button onClick={() => onRemoveJar(jar.id)} className="text-slate-500 hover:text-danger">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-accent font-bold mt-1">{formatCurrency((surplus * jar.percentage) / 100)}</p>
                            </li>
                        ))}
                    </ul>
                    )}
                </div>
            )}
        </div>
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
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [installments, setInstallments] = useState('2');
    const [currentInstallment, setCurrentInstallment] = useState('1');

    const isEditing = !!expenseToEdit;

    const resetForm = useCallback(() => {
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory(EXPENSE_CATEGORIES[0]);
        setIsRecurring(false);
        setIsInstallment(false);
        setInstallments('2');
        setCurrentInstallment('1');
    }, []);

    useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(expenseToEdit.amount.toString().replace('.', ','));
            setDate(expenseToEdit.date);
            setCategory(expenseToEdit.category);
            setIsRecurring(expenseToEdit.isRecurring);
            const hasInstallments = !!expenseToEdit.installments;
            setIsInstallment(hasInstallments);
            if (hasInstallments) {
                setInstallments(expenseToEdit.installments!.total.toString());
            } else {
                setInstallments('2');
            }
        } else {
            resetForm();
        }
    }, [expenseToEdit, resetForm]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        let finalDate = date;
        if (!isEditing && isInstallment) {
            const currentPaymentDate = new Date(date + 'T00:00:00');
            currentPaymentDate.setMonth(currentPaymentDate.getMonth() - (parseInt(currentInstallment, 10) - 1));
            finalDate = currentPaymentDate.toISOString().split('T')[0];
        }

        const expenseData = {
            description,
            amount: numericAmount,
            date: finalDate,
            category,
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
                    <label className="block mb-1 font-semibold text-slate-300">Data {isInstallment ? (isEditing ? 'de Início' : 'da Parcela Atual') : ''}</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-slate-300">Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} required className="w-full bg-dark-700 p-2 rounded border border-dark-600 focus:outline-none focus:ring-2 focus:ring-accent">
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
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