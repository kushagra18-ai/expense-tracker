import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../common/Toast';
import { Save, Target } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export default function BudgetSettings() {
  const { budget, setBudget } = useSettings();
  const [localBudget, setLocalBudget] = useState(budget);
  const { showToast } = useToast();

  const handleSave = () => {
    if (localBudget >= 0) {
      setBudget(Number(localBudget));
      showToast('Budget updated successfully!', 'success');
    } else {
      showToast('Please enter a valid amount', 'error');
    }
  };

  return (
    <div className="budget-settings">
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        textAlign: 'center',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Current Monthly Budget</p>
        <h2 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          margin: 0,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {formatCurrency(budget)}
        </h2>
      </div>

      <div className="form-group" style={{ position: 'relative' }}>
        <label>Update Budget Amount</label>
        <div style={{ position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>₹</span>
          <input 
            type="number" 
            className="form-control" 
            value={localBudget} 
            onChange={(e) => setLocalBudget(e.target.value)}
            placeholder="e.g. 20000"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>
      
      <button className="btn btn-primary" onClick={handleSave} style={{ width: '100%' }}>
        <Save size={18} /> Save Budget
      </button>
    </div>
  );
}
