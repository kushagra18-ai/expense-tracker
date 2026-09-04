import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, Trash2, Copy } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import './ExpenseItem.css';

const ExpenseItem = ({ expense, onEdit, onDelete, onDuplicate }) => {
  const { categories } = useSettings();

  const category = categories?.find(c => c.id === expense.categoryId);
  const color = category?.color || '#94a3b8';
  const emoji = category?.icon || '💸';

  const paymentColors = {
    UPI: 'var(--accent-purple)',
    Cash: 'var(--accent-primary)',
    Card: 'var(--accent-warning)',
    Other: 'var(--text-muted)'
  };
  const pmColor = paymentColors[expense.paymentMethod] || paymentColors.Other;

  return (
    <div className="expense-item glass-card">
      {/* Icon */}
      <div
        className="expense-icon-wrapper"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 10px ${color}10`,
          border: `1px solid ${color}40`
        }}
      >
        <span className="expense-emoji">{emoji}</span>
      </div>

      {/* Middle: name + description + payment */}
      <div className="expense-details">
        <div className="expense-title-row">
          <span className="subcategory-name">
            {expense.subcategoryName || expense.categoryName || 'Expense'}
          </span>
          {expense.isFixed && <span className="fixed-pill">Fixed</span>}
        </div>
        {expense.description && (
          <p className="expense-description">{expense.description}</p>
        )}
        <span
          className="payment-pill"
          style={{ color: pmColor, backgroundColor: `${pmColor}15` }}
        >
          {expense.paymentMethod}
        </span>
      </div>

      {/* Right: amount + action buttons stacked */}
      <div className="expense-right">
        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
        <div className="expense-actions">
          <button className="action-btn edit-btn" onClick={onEdit} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="action-btn duplicate-btn" onClick={onDuplicate} title="Duplicate">
            <Copy size={14} />
          </button>
          <button className="action-btn delete-btn" onClick={onDelete} title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;
