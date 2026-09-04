import React, { useEffect, useState } from 'react';
import { getBudgetStatus } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, Info } from 'lucide-react';
import './DashboardPage.css';

const BudgetProgress = ({ expenses, currentMonth, budget }) => {
  const [fillWidth, setFillWidth] = useState(0);
  const status = getBudgetStatus(expenses, currentMonth, budget);
  
  useEffect(() => {
    // Reset and animate fill on mount or when percentage changes
    setFillWidth(0);
    const timer = setTimeout(() => {
      setFillWidth(Math.min(status.percentage, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [status.percentage, currentMonth]);

  let bgGradient = 'linear-gradient(90deg, #10b981, #06b6d4)'; // Green to Cyan
  let isNearLimit = false;

  if (status.percentage >= 90) {
    bgGradient = 'linear-gradient(90deg, #f59e0b, #ef4444)'; // Orange to Red
    isNearLimit = true;
  } else if (status.percentage >= 75) {
    bgGradient = 'linear-gradient(90deg, #10b981, #f59e0b)'; // Green to Orange
  }

  return (
    <div className="budget-progress-card">
      <div className="budget-header">
        <span className="budget-label">Monthly Budget</span>
        <span className="budget-value">{formatCurrency(budget)}</span>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${isNearLimit ? 'pulse-glow' : ''}`} 
          style={{ width: `${fillWidth}%`, backgroundImage: bgGradient }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', textShadow: '0 1px 2px rgba(0,0,0,0.5)', zIndex: 10 }}>
          {status.percentage.toFixed(0)}%
        </div>
      </div>
      
      <div className="budget-footer">
        <span>Spent: {formatCurrency(status.spent)}</span>
        <span>Remaining: {formatCurrency(status.remaining)}</span>
      </div>
      
      {status.percentage >= 90 && status.percentage <= 100 && (
        <div className="budget-warning" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <Info size={16} />
          <span>You are nearing your monthly budget limit.</span>
        </div>
      )}
      
      {status.percentage > 100 && (
        <div className="budget-warning danger">
          <AlertTriangle size={16} />
          <span>You have exceeded your monthly budget by {formatCurrency(Math.abs(status.remaining))}</span>
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
