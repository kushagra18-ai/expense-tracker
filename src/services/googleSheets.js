/**
 * Google Sheets API v4 Service
 * All operations use the user's OAuth access token via fetch()
 */

import { getAccessToken } from './googleAuth';
import { formatDateForSheet, getMonthLabel } from '../utils/formatters';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Extract spreadsheet ID from URL
 * Supports: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
 */
export function extractSpreadsheetId(url) {
  if (!url) return null;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Make an authenticated request to Sheets API
 */
async function sheetsRequest(path, options = {}) {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');
  
  const response = await fetch(`${SHEETS_API}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Sheets API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get spreadsheet metadata (sheets list, title)
 */
export async function getSpreadsheetInfo(spreadsheetId) {
  return sheetsRequest(`/${spreadsheetId}?fields=properties.title,sheets.properties`);
}

/**
 * Check if a sheet exists by name
 */
export async function sheetExists(spreadsheetId, sheetName) {
  const info = await getSpreadsheetInfo(spreadsheetId);
  return info.sheets?.some(s => s.properties.title === sheetName) || false;
}

/**
 * Ensure the Expenses sheet tab exists with the correct headers.
 * Safe to call repeatedly — it no-ops if the tab already exists.
 */
export async function ensureExpensesSheet(spreadsheetId) {
  return createExpensesSheet(spreadsheetId);
}

/**
 * Create the Expenses sheet with headers
 */
export async function createExpensesSheet(spreadsheetId) {
  const exists = await sheetExists(spreadsheetId, 'Expenses');
  
  if (!exists) {
    // Add the sheet
    await sheetsRequest(`/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          addSheet: {
            properties: { title: 'Expenses' }
          }
        }]
      }),
    });
  }
  
  // Check if headers exist
  const headerCheck = await sheetsRequest(
    `/${spreadsheetId}/values/Expenses!A1:I1`
  );
  
  if (!headerCheck.values || headerCheck.values.length === 0) {
    // Add headers
    await sheetsRequest(
      `/${spreadsheetId}/values/Expenses!A1:I1?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          values: [['Expense ID', 'Date', 'Month', 'Category', 'Subcategory', 'Description', 'Amount', 'Payment Method', 'Fixed/Variable']],
        }),
      }
    );
  }
  
  return true;
}

/**
 * Create the Dashboard sheet with summary formulas
 */
export async function createDashboardSheet(spreadsheetId) {
  const exists = await sheetExists(spreadsheetId, 'Dashboard');
  
  if (!exists) {
    await sheetsRequest(`/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          addSheet: {
            properties: { title: 'Dashboard' }
          }
        }]
      }),
    });
  }
  
  // Update dashboard with summary formulas
  const dashboardData = [
    ['Expense Tracker Dashboard', '', '', ''],
    ['', '', '', ''],
    ['Summary', '', '', ''],
    ['Total Expenses', '=SUMPRODUCT((Expenses!G2:G)*1)', '', ''],
    ['Total Transactions', '=COUNTA(Expenses!A2:A)', '', ''],
    ['', '', '', ''],
    ['Category Totals', '', '', ''],
    ['Category', 'Total', '% of Total', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),1),"")', '=IFERROR(SUMIF(Expenses!D:D,A9,Expenses!G:G),0)', '=IFERROR(B9/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),2),"")', '=IFERROR(SUMIF(Expenses!D:D,A10,Expenses!G:G),0)', '=IFERROR(B10/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),3),"")', '=IFERROR(SUMIF(Expenses!D:D,A11,Expenses!G:G),0)', '=IFERROR(B11/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),4),"")', '=IFERROR(SUMIF(Expenses!D:D,A12,Expenses!G:G),0)', '=IFERROR(B12/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),5),"")', '=IFERROR(SUMIF(Expenses!D:D,A13,Expenses!G:G),0)', '=IFERROR(B13/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),6),"")', '=IFERROR(SUMIF(Expenses!D:D,A14,Expenses!G:G),0)', '=IFERROR(B14/$B$4*100,0)', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(Expenses!D2:D),1,1),7),"")', '=IFERROR(SUMIF(Expenses!D:D,A15,Expenses!G:G),0)', '=IFERROR(B15/$B$4*100,0)', ''],
    ['', '', '', ''],
    ['Fixed vs Variable', '', '', ''],
    ['Fixed', '=SUMPRODUCT((Expenses!I2:I="Fixed")*(Expenses!G2:G)*1)', '', ''],
    ['Variable', '=SUMPRODUCT((Expenses!I2:I="Variable")*(Expenses!G2:G)*1)', '', ''],
    ['', '', '', ''],
    ['Monthly Totals', '', '', ''],
    ['Month', 'Total', 'Fixed', 'Variable'],
  ];
  
  await sheetsRequest(
    `/${spreadsheetId}/values/Dashboard!A1:D22?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({ values: dashboardData }),
    }
  );
  
  return true;
}

/**
 * Append an expense row to the Expenses sheet
 */
export async function appendExpenseToSheet(spreadsheetId, expense) {
  // Auto-create sheet tab + headers if this is the first write
  await ensureExpensesSheet(spreadsheetId);

  const row = [
    expense.id,
    formatDateForSheet(expense.date),
    getMonthLabel(expense.month),
    expense.categoryName,
    expense.subcategoryName,
    expense.description,
    Number(expense.amount),
    expense.paymentMethod,
    expense.isFixed ? 'Fixed' : 'Variable',
  ];
  
  await sheetsRequest(
    `/${spreadsheetId}/values/Expenses!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({ values: [row] }),
    }
  );
}

/**
 * Find a row by Expense ID and update it
 */
export async function updateExpenseInSheet(spreadsheetId, expense) {
  // First find the row
  const data = await sheetsRequest(`/${spreadsheetId}/values/Expenses!A:A`);
  const rows = data.values || [];
  let rowIndex = -1;
  
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === expense.id) {
      rowIndex = i + 1; // 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    // Not found, append instead
    await appendExpenseToSheet(spreadsheetId, expense);
    return;
  }
  
  const row = [
    expense.id,
    formatDateForSheet(expense.date),
    getMonthLabel(expense.month),
    expense.categoryName,
    expense.subcategoryName,
    expense.description,
    Number(expense.amount),
    expense.paymentMethod,
    expense.isFixed ? 'Fixed' : 'Variable',
  ];
  
  await sheetsRequest(
    `/${spreadsheetId}/values/Expenses!A${rowIndex}:I${rowIndex}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      body: JSON.stringify({ values: [row] }),
    }
  );
}

/**
 * Delete an expense row by ID
 */
export async function deleteExpenseFromSheet(spreadsheetId, expenseId) {
  // Find the row
  const data = await sheetsRequest(`/${spreadsheetId}/values/Expenses!A:A`);
  const rows = data.values || [];
  let rowIndex = -1;
  
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === expenseId) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) return;
  
  // Get sheet ID
  const info = await getSpreadsheetInfo(spreadsheetId);
  const expensesSheet = info.sheets?.find(s => s.properties.title === 'Expenses');
  if (!expensesSheet) return;
  
  // Delete the row
  await sheetsRequest(`/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId: expensesSheet.properties.sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          }
        }
      }]
    }),
  });
}

/**
 * Fetch all expenses from the sheet.
 * Auto-creates the Expenses tab + headers if they don't exist yet.
 */
export async function fetchAllExpensesFromSheet(spreadsheetId) {
  // Ensure the sheet tab exists before reading — fixes "Unable to parse range"
  await ensureExpensesSheet(spreadsheetId);
  const data = await sheetsRequest(`/${spreadsheetId}/values/Expenses!A2:I`);
  const rows = data.values || [];
  
  return rows.map(row => {
    // Parse date from DD/MM/YYYY format
    let dateStr = '';
    if (row[1]) {
      const parts = row[1].split('/');
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      } else {
        dateStr = row[1];
      }
    }
    
    const date = new Date(dateStr);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    return {
      id: row[0] || '',
      date: dateStr,
      month: monthKey,
      categoryName: row[3] || '',
      subcategoryName: row[4] || '',
      description: row[5] || '',
      amount: Number(row[6]) || 0,
      paymentMethod: row[7] || 'UPI',
      isFixed: (row[8] || '').toLowerCase() === 'fixed',
      // Try to resolve category/subcategory IDs from names
      categoryId: '',
      subcategoryId: '',
    };
  }).filter(exp => exp.id); // Filter out empty rows
}
