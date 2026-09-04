import { openDB } from 'idb';

const DB_NAME = 'expense-tracker';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Expenses store
        if (!db.objectStoreNames.contains('expenses')) {
          const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
          expenseStore.createIndex('date', 'date');
          expenseStore.createIndex('month', 'month');
          expenseStore.createIndex('categoryId', 'categoryId');
          expenseStore.createIndex('paymentMethod', 'paymentMethod');
        }
        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        // Recurring expenses store
        if (!db.objectStoreNames.contains('recurringExpenses')) {
          db.createObjectStore('recurringExpenses', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ============ EXPENSES ============

export async function getAllExpenses() {
  const db = await getDB();
  return db.getAll('expenses');
}

export async function getExpenseById(id) {
  const db = await getDB();
  return db.get('expenses', id);
}

export async function getExpensesByMonth(monthKey) {
  const db = await getDB();
  return db.getAllFromIndex('expenses', 'month', monthKey);
}

export async function addExpense(expense) {
  const db = await getDB();
  await db.put('expenses', { ...expense, updatedAt: new Date().toISOString() });
  return expense;
}

export async function updateExpense(id, updates) {
  const db = await getDB();
  const existing = await db.get('expenses', id);
  if (!existing) throw new Error(`Expense ${id} not found`);
  const updated = { ...existing, ...updates, id, updatedAt: new Date().toISOString() };
  await db.put('expenses', updated);
  return updated;
}

export async function deleteExpense(id) {
  const db = await getDB();
  await db.delete('expenses', id);
}

export async function bulkAddExpenses(expenses) {
  const db = await getDB();
  const tx = db.transaction('expenses', 'readwrite');
  for (const exp of expenses) {
    await tx.store.put(exp);
  }
  await tx.done;
}

export async function clearAllExpenses() {
  const db = await getDB();
  await db.clear('expenses');
}

// ============ SETTINGS ============

export async function getSetting(key) {
  const db = await getDB();
  const result = await db.get('settings', key);
  return result?.value;
}

export async function setSetting(key, value) {
  const db = await getDB();
  await db.put('settings', { key, value });
}

export async function getAllSettings() {
  const db = await getDB();
  const all = await db.getAll('settings');
  const result = {};
  for (const item of all) {
    result[item.key] = item.value;
  }
  return result;
}

// ============ RECURRING EXPENSES ============

export async function getAllRecurringExpenses() {
  const db = await getDB();
  return db.getAll('recurringExpenses');
}

export async function addRecurringExpense(recurring) {
  const db = await getDB();
  await db.put('recurringExpenses', recurring);
  return recurring;
}

export async function updateRecurringExpense(id, updates) {
  const db = await getDB();
  const existing = await db.get('recurringExpenses', id);
  if (!existing) throw new Error(`Recurring expense ${id} not found`);
  const updated = { ...existing, ...updates, id };
  await db.put('recurringExpenses', updated);
  return updated;
}

export async function deleteRecurringExpense(id) {
  const db = await getDB();
  await db.delete('recurringExpenses', id);
}

// ============ EXPORT / IMPORT ============

export async function exportAllData() {
  const expenses = await getAllExpenses();
  const settings = await getAllSettings();
  const recurring = await getAllRecurringExpenses();
  return { expenses, settings, recurring, exportDate: new Date().toISOString(), version: 1 };
}

export async function importAllData(data) {
  if (data.expenses) {
    await bulkAddExpenses(data.expenses);
  }
  if (data.settings) {
    for (const [key, value] of Object.entries(data.settings)) {
      await setSetting(key, value);
    }
  }
  if (data.recurring) {
    const db = await getDB();
    const tx = db.transaction('recurringExpenses', 'readwrite');
    for (const rec of data.recurring) {
      await tx.store.put(rec);
    }
    await tx.done;
  }
}
