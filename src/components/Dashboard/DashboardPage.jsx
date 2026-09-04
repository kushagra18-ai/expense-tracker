import React from 'react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useGoogleSheets } from '../../contexts/GoogleSheetsContext';
import { useNavigate } from 'react-router-dom';
import MonthSelector from '../Layout/MonthSelector';
import StatCard from './StatCard';
import BudgetProgress from './BudgetProgress';
import CategoryChart from './CategoryChart';
import DailyChart from './DailyChart';
import RecentExpenses from './RecentExpenses';
import InsightsPanel from './InsightsPanel';
import { 
  calculateTotal, 
  calculateFixed, 
  calculateVariable, 
  getExpensesForMonth,
  getBudgetStatus,
  getTopCategory,
  getHighestExpense,
  calculateAvgDaily,
  compareMonths
} from '../../utils/calculations';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Wallet, Lock, TrendingUp, Target, Hash, Calendar, ArrowUpRight, ArrowDownRight, Award, AlertTriangle, Cloud, PlusCircle, LayoutDashboard, Activity } from 'lucide-react';
import './DashboardPage.css';

const DashboardPage = () => {
  const { expenses, currentMonth } = useExpenses();
  const { budget, categories } = useSettings();
  const { isConnected } = useGoogleSheets();
  const navigate = useNavigate();

  const monthExpenses = getExpensesForMonth(expenses, currentMonth);
  const total = calculateTotal(monthExpenses);
  const fixed = calculateFixed(monthExpenses);
  const variable = calculateVariable(monthExpenses);
  const status = getBudgetStatus(expenses, currentMonth, budget);
  const avgDaily = calculateAvgDaily(expenses, currentMonth);
  const topCategory = getTopCategory(expenses, currentMonth);
  const highestExpense = getHighestExpense(expenses, currentMonth);
  
  const topCategoryDetails = topCategory ? categories.find(c => c.id === topCategory.categoryId) : null;
  
  const prevMonthDate = new Date(currentMonth + '-01');
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthKey = prevMonthDate.toISOString().slice(0, 7);
  const monthComparison = compareMonths(expenses, prevMonthKey, currentMonth);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const renderHeroTrend = () => {
    if (monthComparison.percentChange === 0) return null;
    const isUp = monthComparison.percentChange > 0;
    const Icon = isUp ? ArrowUpRight : ArrowDownRight;
    const colorClass = isUp ? 'up' : 'down'; // Up is bad for expenses, down is good
    
    return (
      <div className={`hero-trend ${colorClass}`}>
        <Icon size={16} />
        {formatPercent(Math.abs(monthComparison.percentChange))} vs last month
      </div>
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="greeting-text">{getGreeting()}</h2>
        {isConnected && (
          <div className="sheets-indicator" title="Connected to Google Sheets">
            <div className="sheets-dot"></div>
            <span>Synced</span>
            <Cloud size={14} />
          </div>
        )}
      </div>

      <MonthSelector />
      
      <div className="dashboard-hero">
        <span className="hero-label">Total Spent</span>
        <h1 className="hero-value">{formatCurrency(total)}</h1>
        {renderHeroTrend()}
      </div>

      <div className="dashboard-grid">
        <StatCard 
          icon={Wallet} 
          label="Total Expenses" 
          value={formatCurrency(total)} 
          color="var(--accent-primary)" 
          index={0}
        />
        <StatCard 
          icon={Lock} 
          label="Fixed" 
          value={formatCurrency(fixed)} 
          color="var(--accent-purple)" 
          index={1}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Variable" 
          value={formatCurrency(variable)} 
          color="var(--accent-secondary)" 
          index={2}
        />
        <StatCard 
          icon={Target} 
          label="Remaining Budget" 
          value={formatCurrency(status.remaining)} 
          color={status.percentage >= 100 ? "var(--accent-danger)" : (status.percentage >= 75 ? "var(--accent-warning)" : "var(--accent-primary)")} 
          index={3}
        />
        <StatCard 
          icon={Hash} 
          label="Transactions" 
          value={monthExpenses.length} 
          color="#3b82f6" 
          index={4}
        />
        <StatCard 
          icon={Calendar} 
          label="Avg Daily" 
          value={formatCurrency(avgDaily)} 
          color="#f43f5e" 
          index={5}
        />
      </div>

      <BudgetProgress expenses={expenses} currentMonth={currentMonth} budget={budget} />

      {monthExpenses.length === 0 ? (
        <div className="empty-state">
          <Activity size={48} />
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>No expenses yet</h3>
            <p style={{ margin: 0 }}>Start tracking your spending to see insights.</p>
          </div>
          <button className="empty-cta" onClick={() => navigate('/add')}>
            <PlusCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem', opacity: 1 }} />
            Add Expense
          </button>
        </div>
      ) : (
        <>
          {(topCategoryDetails || highestExpense) && (
            <div className="highlights-grid">
              {topCategoryDetails && (
                <div className="highlight-card">
                  <span className="highlight-label">Top Category</span>
                  <div className="highlight-content">
                    <div className="highlight-icon" style={{ backgroundColor: topCategoryDetails.color }}>
                      <Award size={20} color="white" />
                    </div>
                    <div className="highlight-text">
                      <span className="highlight-title">{topCategoryDetails.name}</span>
                      <span className="highlight-amount">{formatCurrency(topCategory.total)}</span>
                    </div>
                  </div>
                </div>
              )}
              {highestExpense && (
                <div className="highlight-card">
                  <span className="highlight-label">Highest Expense</span>
                  <div className="highlight-content">
                    <div className="highlight-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                      <AlertTriangle size={20} color="#ef4444" />
                    </div>
                    <div className="highlight-text">
                      <span className="highlight-title">{highestExpense.description || 'Unknown'}</span>
                      <span className="highlight-amount">{formatCurrency(highestExpense.amount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="dashboard-layout">
            <DailyChart expenses={expenses} currentMonth={currentMonth} />
            <CategoryChart expenses={expenses} currentMonth={currentMonth} categories={categories} />
          </div>

          <InsightsPanel expenses={expenses} currentMonth={currentMonth} budget={budget} />
          
          <RecentExpenses expenses={expenses} currentMonth={currentMonth} categories={categories} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
