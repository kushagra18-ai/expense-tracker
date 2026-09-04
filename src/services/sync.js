/**
 * Bidirectional Sync Engine
 * Handles App ↔ Google Sheets synchronization
 */

import { getAllExpenses, addExpense, updateExpense, deleteExpense, bulkAddExpenses } from './storage';
import { fetchAllExpensesFromSheet, appendExpenseToSheet, updateExpenseInSheet, deleteExpenseFromSheet } from './googleSheets';
import { isAuthenticated, refreshToken } from './googleAuth';
import { DEFAULT_CATEGORIES } from '../utils/categories';

/**
 * Resolve category/subcategory IDs from names
 */
function resolveIds(expense, categories = DEFAULT_CATEGORIES) {
  const resolved = { ...expense };
  
  if (!resolved.categoryId && resolved.categoryName) {
    const cat = categories.find(c => c.name === resolved.categoryName);
    if (cat) {
      resolved.categoryId = cat.id;
      if (!resolved.subcategoryId && resolved.subcategoryName) {
        const sub = cat.subcategories.find(s => s.name === resolved.subcategoryName);
        if (sub) resolved.subcategoryId = sub.id;
      }
    }
  }
  
  return resolved;
}

/**
 * Ensure we have a valid token, attempting a silent refresh if needed.
 * Throws if authentication cannot be restored.
 */
async function ensureAuthenticated() {
  if (isAuthenticated()) return;
  // Token may have expired — try a silent refresh (no prompt)
  refreshToken();
  // Give GIS up to 3 seconds to deliver a new token via the callback
  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (!isAuthenticated()) {
    throw new Error('Google session expired. Please reconnect in Settings → Google Sheets.');
  }
}

/**
 * Sync App → Sheets for a single expense
 */
export async function syncExpenseToSheet(spreadsheetId, expense, action = 'add') {
  if (!spreadsheetId) return { success: false, error: 'No spreadsheet configured' };

  try {
    await ensureAuthenticated();
    switch (action) {
      case 'add':
        await appendExpenseToSheet(spreadsheetId, expense);
        break;
      case 'update':
        await updateExpenseInSheet(spreadsheetId, expense);
        break;
      case 'delete':
        await deleteExpenseFromSheet(spreadsheetId, expense.id || expense);
        break;
    }
    return { success: true };
  } catch (error) {
    console.error(`Sync to sheet failed (${action}):`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Full sync: Sheets → App
 * Imports/updates all expenses from the sheet
 */
export async function syncFromSheet(spreadsheetId, categories = DEFAULT_CATEGORIES) {
  if (!isAuthenticated() || !spreadsheetId) {
    return { success: false, error: 'Not authenticated or no spreadsheet connected' };
  }
  
  try {
    const sheetExpenses = await fetchAllExpensesFromSheet(spreadsheetId);
    const localExpenses = await getAllExpenses();
    
    // Build lookup maps
    const localMap = new Map(localExpenses.map(e => [e.id, e]));
    const sheetMap = new Map(sheetExpenses.map(e => [e.id, e]));
    
    let added = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const sheetExp of sheetExpenses) {
      const resolved = resolveIds(sheetExp, categories);
      const localExp = localMap.get(resolved.id);
      
      if (!localExp) {
        // New expense from sheet
        await addExpense({
          ...resolved,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        added++;
      } else {
        // Existing - update if sheet data is different
        const hasChanges = 
          localExp.amount !== resolved.amount ||
          localExp.description !== resolved.description ||
          localExp.categoryName !== resolved.categoryName ||
          localExp.subcategoryName !== resolved.subcategoryName ||
          localExp.paymentMethod !== resolved.paymentMethod ||
          localExp.date !== resolved.date;
        
        if (hasChanges) {
          await updateExpense(resolved.id, {
            ...resolved,
            updatedAt: new Date().toISOString(),
          });
          updated++;
        } else {
          skipped++;
        }
      }
    }
    
    return { success: true, added, updated, skipped, total: sheetExpenses.length };
  } catch (error) {
    console.error('Sync from sheet failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Full sync: App → Sheets
 * Pushes all local expenses to the sheet
 */
export async function syncToSheet(spreadsheetId) {
  if (!isAuthenticated() || !spreadsheetId) {
    return { success: false, error: 'Not authenticated or no spreadsheet connected' };
  }
  
  try {
    const localExpenses = await getAllExpenses();
    const sheetExpenses = await fetchAllExpensesFromSheet(spreadsheetId);
    const sheetMap = new Map(sheetExpenses.map(e => [e.id, e]));
    
    let pushed = 0;
    let updated = 0;
    
    for (const exp of localExpenses) {
      const sheetExp = sheetMap.get(exp.id);
      if (!sheetExp) {
        await appendExpenseToSheet(spreadsheetId, exp);
        pushed++;
      } else {
        // Could update if local is newer, but for simplicity just push
        await updateExpenseInSheet(spreadsheetId, exp);
        updated++;
      }
    }
    
    return { success: true, pushed, updated };
  } catch (error) {
    console.error('Sync to sheet failed:', error);
    return { success: false, error: error.message };
  }
}
