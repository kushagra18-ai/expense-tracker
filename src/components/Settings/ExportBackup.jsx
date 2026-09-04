import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useToast } from '../common/Toast';
import * as storage from '../../services/storage';
import { FileText, FileSpreadsheet, Database, Upload, Download, RefreshCw } from 'lucide-react';

export default function ExportBackup() {
  const { expenses, refreshExpenses } = useExpenses();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(null);

  const handleExportCSV = () => {
    if (!expenses.length) return showToast('No expenses to export', 'error');
    setIsLoading('csv');
    setTimeout(() => {
      const headers = ['ID', 'Date', 'Amount', 'Category', 'Subcategory', 'Payment Method', 'Description'];
      const rows = expenses.map(e => [e.id, e.date, e.amount, e.categoryName, e.subcategoryName, e.paymentMethod, `"${e.description || ''}"`]);
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `expenses_${new Date().toISOString().slice(0,10)}.csv`);
      showToast('Exported CSV successfully', 'success');
      setIsLoading(null);
    }, 500);
  };

  const handleExportExcel = () => {
    if (!expenses.length) return showToast('No expenses to export', 'error');
    setIsLoading('excel');
    setTimeout(() => {
      const worksheet = XLSX.utils.json_to_sheet(expenses);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
      XLSX.writeFile(workbook, `expenses_${new Date().toISOString().slice(0,10)}.xlsx`);
      showToast('Exported Excel successfully', 'success');
      setIsLoading(null);
    }, 500);
  };

  const handleBackup = async () => {
    setIsLoading('backup');
    try {
      const data = await storage.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      saveAs(blob, `expense_backup_${new Date().toISOString().slice(0,10)}.json`);
      showToast('Backup created successfully', 'success');
    } catch (err) {
      showToast('Backup failed', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading('restore');
    try {
      const text = await file.text();
      const success = await storage.importAllData(text);
      if (success) {
        if (refreshExpenses) await refreshExpenses();
        showToast('Data restored successfully', 'success');
      } else {
        showToast('Invalid backup file', 'error');
      }
    } catch (err) {
      showToast('Failed to restore data', 'error');
    } finally {
      setIsLoading(null);
      e.target.value = null; // Reset input
    }
  };

  const ActionCard = ({ icon: Icon, title, description, onClick, loading, colorClass }) => (
    <div 
      onClick={!loading ? onClick : undefined}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        cursor: loading ? 'wait' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.7 : 1
      }}
      className="export-card"
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
    >
      <div style={{ marginBottom: '0.75rem', color: colorClass }}>
        {loading ? <RefreshCw size={28} className="spin" /> : <Icon size={28} />}
      </div>
      <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>{title}</h4>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{description}</p>
    </div>
  );

  return (
    <div>
      <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
        Export your data for external use or create backups to keep it safe.
      </p>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <ActionCard 
          icon={Download} 
          title="Export CSV" 
          description="Download as .csv file" 
          onClick={handleExportCSV}
          loading={isLoading === 'csv'}
          colorClass="var(--accent-primary)"
        />
        <ActionCard 
          icon={FileSpreadsheet} 
          title="Export Excel" 
          description="Download as .xlsx file" 
          onClick={handleExportExcel}
          loading={isLoading === 'excel'}
          colorClass="var(--accent-secondary)"
        />
        <ActionCard 
          icon={Database} 
          title="Backup" 
          description="Save all app data" 
          onClick={handleBackup}
          loading={isLoading === 'backup'}
          colorClass="var(--accent-purple)"
        />
        <ActionCard 
          icon={Upload} 
          title="Restore" 
          description="Load from backup" 
          onClick={() => fileInputRef.current?.click()}
          loading={isLoading === 'restore'}
          colorClass="var(--accent-warning)"
        />
        
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json" 
          onChange={handleRestore} 
        />
      </div>
    </div>
  );
}
