import React, { useState, useEffect } from 'react';
import * as storage from '../../services/storage';
import { useToast } from '../common/Toast';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Repeat, Check } from 'lucide-react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function RecurringExpenses() {
  const [recurring, setRecurring] = useState([]);
  const { showToast } = useToast();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    // Initial mock data setup for UI visualization
    setRecurring([
      { id: '1', description: 'Netflix Subscription', amount: 649, frequency: 'Monthly', nextDate: '2023-11-15', enabled: true },
      { id: '2', description: 'Internet Bill', amount: 999, frequency: 'Monthly', nextDate: '2023-11-20', enabled: true },
      { id: '3', description: 'Gym Membership', amount: 1500, frequency: 'Monthly', nextDate: '2023-11-05', enabled: false }
    ]);
  }, []);

  const toggleStatus = (id) => {
    setRecurring(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = !item.enabled;
        showToast(`Recurring expense ${newStatus ? 'enabled' : 'disabled'}`, 'success');
        return { ...item, enabled: newStatus };
      }
      return item;
    }));
  };

  const handleDelete = () => {
    setRecurring(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
    showToast('Recurring expense deleted', 'success');
  };

  const handleAdd = () => {
    showToast('Add recurring expense feature coming soon', 'info');
  };

  return (
    <div className="recurring-expenses">
      <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
        Manage expenses that automatically repeat on a schedule.
      </p>

      {recurring.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          <Repeat size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
          <p>No recurring expenses setup yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {recurring.map(item => (
            <div key={item.id} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--glass-border)',
              padding: '1rem', 
              borderRadius: 'var(--radius-md)',
              opacity: item.enabled ? 1 : 0.6,
              transition: 'all 0.2s ease'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  {item.description}
                  {!item.enabled && <span style={{fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--accent-warning)', borderRadius: '4px', color: '#000'}}>Paused</span>}
                </div>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px'}}>{item.frequency}</span>
                  <span>Next: {item.nextDate}</span>
                </div>
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <span style={{fontWeight: '700', color: 'var(--accent-primary)', fontSize: '1.1rem'}}>{formatCurrency(item.amount)}</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button 
                    onClick={() => toggleStatus(item.id)}
                    style={{
                      background: item.enabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: item.enabled ? 'var(--accent-primary)' : 'var(--text-muted)',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    {item.enabled ? <Check size={14} /> : <Repeat size={14} />}
                  </button>
                  <button 
                    onClick={() => setDeleteId(item.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: 'var(--accent-danger)',
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
        <Plus size={18} /> Add Recurring Expense
      </button>

      {deleteId && (
        <ConfirmDialog
          title="Delete Recurring Expense"
          message="Are you sure you want to delete this recurring expense? Future occurrences will not be added."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
