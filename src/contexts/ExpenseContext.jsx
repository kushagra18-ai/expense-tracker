import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as storage from '../services/storage';
import { syncExpenseToSheet } from '../services/sync';
import { getMonthKey } from '../utils/formatters';
import { createExpense } from '../utils/expenseId';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(getMonthKey(new Date()));
  const spreadsheetIdRef = useRef(null);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  // Bug 3 fix: read spreadsheetId from storage on mount AND keep the ref
  // current by re-reading whenever storage changes (e.g. user saves Sheet URL).
  // We poll every 2 seconds so the ref is always up-to-date without needing
  // cross-context coupling. This is intentionally lightweight — storage reads
  // are synchronous IndexedDB gets, not network calls.
  useEffect(() => {
    const sync = () =>
      storage.getSetting('spreadsheetId').then(id => {
        spreadsheetIdRef.current = id || null;
      });

    sync(); // read immediately on mount

    const interval = setInterval(sync, 2000); // re-read every 2 s
    return () => clearInterval(interval);
  }, []);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const allExpenses = await storage.getAllExpenses();
      setExpenses(allExpenses);
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Bug 2 fix: instead of fire-and-forget `.catch(console.error)` we now
   * await the sync and return its result so callers (e.g. AddExpensePage)
   * can surface a warning toast if the sheet write failed.
   */
  const addNewExpense = useCallback(async (expenseData) => {
    const expense = createExpense({
      ...expenseData,
      month: getMonthKey(new Date(expenseData.date)),
    });
    await storage.addExpense(expense);
    setExpenses(prev => [...prev, expense]);

    // Sync to Google Sheets — awaited so errors propagate to the caller
    let syncResult = null;
    if (spreadsheetIdRef.current) {
      syncResult = await syncExpenseToSheet(spreadsheetIdRef.current, expense, 'add');
    }

    return { expense, syncResult };
  }, []);

  const editExpense = useCallback(async (id, updates) => {
    if (updates.date) {
      updates.month = getMonthKey(new Date(updates.date));
    }
    const updated = await storage.updateExpense(id, updates);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));

    let syncResult = null;
    if (spreadsheetIdRef.current) {
      syncResult = await syncExpenseToSheet(spreadsheetIdRef.current, updated, 'update');
    }

    return { expense: updated, syncResult };
  }, []);

  const removeExpense = useCallback(async (id) => {
    await storage.deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));

    if (spreadsheetIdRef.current) {
      await syncExpenseToSheet(spreadsheetIdRef.current, id, 'delete');
    }
  }, []);

  const duplicateExpense = useCallback(async (id) => {
    const original = expenses.find(e => e.id === id);
    if (!original) return;
    const { id: _, createdAt: __, updatedAt: ___, ...data } = original;
    return addNewExpense(data);
  }, [expenses, addNewExpense]);

  // Allow GoogleSheetsContext to push the latest spreadsheetId into this ref
  // immediately (so there's no 2-second polling lag after the user saves the URL)
  const setSpreadsheetId = useCallback((id) => {
    spreadsheetIdRef.current = id || null;
  }, []);

  const value = {
    expenses,
    loading,
    currentMonth,
    setCurrentMonth,
    addExpense: addNewExpense,
    editExpense,
    removeExpense,
    duplicateExpense,
    loadExpenses,
    setSpreadsheetId,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}

export default ExpenseContext;
