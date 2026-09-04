import React, { useState } from 'react';
import './SettingsPage.css';
import BudgetSettings from './BudgetSettings';
import GoogleSheetsSetup from './GoogleSheetsSetup';
import CategoryManager from './CategoryManager';
import RecurringExpenses from './RecurringExpenses';
import ExportBackup from './ExportBackup';
import { useExpenses } from '../../contexts/ExpenseContext';
import { Target, Cloud, Tags, Repeat, Download, Info, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className={`settings-section ${isOpen ? 'open' : ''}`}>
      <div className="settings-section-header" onClick={() => setIsOpen(!isOpen)}>
        <Icon size={20} className="section-icon" />
        <span className="section-title">{title}</span>
        {isOpen ? <ChevronDown size={20} className="chevron" /> : <ChevronRight size={20} className="chevron" />}
      </div>
      {isOpen && <div className="settings-content">{children}</div>}
    </div>
  );
};

export default function SettingsPage() {
  const { expenses } = useExpenses();
  
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1><Settings size={28} /> Settings</h1>
        <p>Configure your personal expense tracker</p>
      </div>

      <CollapsibleSection title="Budget" icon={Target} defaultOpen={true}>
        <BudgetSettings />
      </CollapsibleSection>

      <CollapsibleSection title="Google Sheets" icon={Cloud}>
        <GoogleSheetsSetup />
      </CollapsibleSection>

      <CollapsibleSection title="Categories" icon={Tags}>
        <CategoryManager />
      </CollapsibleSection>

      <CollapsibleSection title="Recurring Expenses" icon={Repeat}>
        <RecurringExpenses />
      </CollapsibleSection>

      <CollapsibleSection title="Export & Backup" icon={Download}>
        <ExportBackup />
      </CollapsibleSection>

      <CollapsibleSection title="About" icon={Info}>
        <div className="about-section">
          <div className="about-brand">
            <h3>Expense Tracker v1.0</h3>
            <p>Your personal finance companion</p>
          </div>
          <div className="about-stats">
            <div className="stat-card">
              <span className="stat-value">{expenses.length}</span>
              <span className="stat-label">Total Expenses</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatCurrency(totalSpending)}</span>
              <span className="stat-label">Total Spending</span>
            </div>
          </div>
          <div className="about-footer">
            <p>Storage: Local Device & Google Sheets</p>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
