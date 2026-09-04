import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getExpensesForMonth } from '../../utils/calculations';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { ChevronRight, Clock } from 'lucide-react';
import './DashboardPage.css';

const RecentExpenses = ({ expenses, currentMonth, categories }) => {
  const navigate = useNavigate();
  const monthExpenses = getExpensesForMonth(expenses, currentMonth)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getPaymentClass = (method) => {
    const m = method.toLowerCase();
    if (m.includes('upi')) return 'payment-upi';
    if (m.includes('cash')) return 'payment-cash';
    return 'payment-card';
  };

  return (
    <div className="recent-expenses-card">
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="section-title" style={{ margin: 0, background: 'none', WebkitTextFillColor: 'initial', color: 'var(--text-primary)' }}>
          <Clock size={18} color="var(--accent-primary)" /> Recent Expenses
        </h3>
        <Link to="/expenses" className="view-all-btn">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      
      {monthExpenses.length === 0 ? (
        <div className="empty-state" style={{ border: 'none', margin: '2rem 1rem' }}>
          <p>No recent expenses.</p>
        </div>
      ) : (
        <div className="recent-list">
          {monthExpenses.map(expense => {
            const category = categories.find(c => c.id === expense.categoryId);
            const icon = category?.icon || '📦';
            const catName = category?.name || 'Unknown Category';
            const subName = expense.subcategoryName || expense.description;
            
            return (
              <div key={expense.id} className="recent-item" onClick={() => navigate(`/add/${expense.id}`)}>
                <div className="recent-left">
                  <div className="recent-icon" style={{ backgroundColor: category?.color || '#94a3b8' }}>
                    {icon}
                  </div>
                  <div className="recent-details">
                    <span className="recent-cat">{catName}</span>
                    <span className="recent-sub">{subName && subName !== catName ? subName : 'General'}</span>
                    <span className="recent-date">{formatDateShort(expense.date)}</span>
                  </div>
                </div>
                <div className="recent-right">
                  <span className="recent-amount">-{formatCurrency(expense.amount)}</span>
                  <span className={`recent-payment ${getPaymentClass(expense.paymentMethod)}`}>
                    {expense.paymentMethod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentExpenses;
