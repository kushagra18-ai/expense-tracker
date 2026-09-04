import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatCurrency, formatDateShort, getMonthKey, getDayName } from '../../utils/formatters';
import { calculateTotal } from '../../utils/calculations';
import { Search, List, Calendar as CalendarIcon, Edit2, Trash2, Copy } from 'lucide-react';
import MonthSelector from '../Layout/MonthSelector';
import ExpenseFilters from './ExpenseFilters';
import ExpenseItem from './ExpenseItem';
import CalendarView from './CalendarView';
import { useToast } from '../common/Toast';
import './ExpensesPage.css';

const ExpensesPage = () => {
  const navigate = useNavigate();
  const { expenses, currentMonth, setCurrentMonth, removeExpense, duplicateExpense, loading } = useExpenses();
  const { categories } = useSettings();
  const { showToast } = useToast();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  
  const [filters, setFilters] = useState({
    search: '',
    categoryId: 'all',
    paymentMethod: 'all',
    type: 'all',
    sort: 'date-desc' // date-desc, date-asc, amount-desc, amount-asc
  });

  const monthExpenses = useMemo(() => {
    return expenses.filter(exp => getMonthKey(exp.date) === currentMonth);
  }, [expenses, currentMonth]);

  const monthTotal = calculateTotal(monthExpenses);

  const filteredExpenses = useMemo(() => {
    let result = [...monthExpenses];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => 
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.categoryName && e.categoryName.toLowerCase().includes(q)) ||
        (e.subcategoryName && e.subcategoryName.toLowerCase().includes(q)) ||
        e.amount.toString().includes(q)
      );
    }

    if (filters.categoryId !== 'all') {
      result = result.filter(e => e.categoryId === filters.categoryId);
    }

    if (filters.paymentMethod !== 'all') {
      result = result.filter(e => e.paymentMethod === filters.paymentMethod);
    }

    if (filters.type !== 'all') {
      if (filters.type === 'fixed') result = result.filter(e => e.isFixed);
      if (filters.type === 'variable') result = result.filter(e => !e.isFixed);
    }

    result.sort((a, b) => {
      if (filters.sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (filters.sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (filters.sort === 'amount-desc') return b.amount - a.amount;
      if (filters.sort === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [monthExpenses, filters]);

  // Group by date for list view
  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach(exp => {
      const dateKey = exp.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(exp);
    });
    
    // Sort keys descending
    return Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).map(date => {
      let displayDate = `${formatDateShort(date)}, ${getDayName(date)}`;
      
      const today = new Date();
      const expenseDate = new Date(date);
      const isToday = today.toISOString().split('T')[0] === date;
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = yesterday.toISOString().split('T')[0] === date;

      if (isToday) displayDate = 'Today';
      else if (isYesterday) displayDate = 'Yesterday';

      return {
        date,
        displayDate,
        items: groups[date]
      };
    });
  }, [filteredExpenses]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      removeExpense(id);
      showToast('Expense deleted', 'success');
    }
  };

  const handleDuplicate = (expense) => {
    duplicateExpense(expense.id);
    showToast('Expense duplicated', 'success');
  };

  const handleEdit = (id) => {
    navigate(`/add/${id}`);
  };

  return (
    <div className="expenses-page">
      <div className="expenses-header glass-card">
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
        
        <div className="expenses-total-display">
          <span className="expenses-total-label">Total Spent</span>
          <h2 className="expenses-total-amount">{formatCurrency(monthTotal)}</h2>
        </div>
      </div>

      <ExpenseFilters 
        filters={filters} 
        onFilterChange={setFilters} 
        categories={categories} 
      />

      <div className="view-toggle">
        <button 
          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <List size={16} /> List
        </button>
        <button 
          className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          <CalendarIcon size={16} /> Calendar
        </button>
      </div>

      <div className="expenses-content">
        {loading ? (
          <div className="loading-state">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No expenses found</h3>
            <p>You haven't added any expenses that match your filters.</p>
            <button className="btn-primary empty-action" onClick={() => navigate('/add')}>
              Add Expense
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="expense-list">
            {groupedExpenses.map(group => (
              <div key={group.date} className="expense-date-group">
                <h4 className="date-header">{group.displayDate}</h4>
                <div className="expense-items">
                  {group.items.map(expense => (
                    <ExpenseItem 
                      key={expense.id} 
                      expense={expense} 
                      onEdit={() => handleEdit(expense.id)}
                      onDelete={() => handleDelete(expense.id)}
                      onDuplicate={() => handleDuplicate(expense)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CalendarView 
            expenses={filteredExpenses} 
            monthKey={currentMonth}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesPage;
