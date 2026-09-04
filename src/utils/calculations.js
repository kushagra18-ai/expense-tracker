import { getMonthKey, getDaysInMonth, getPrevMonthKey } from './formatters';

/**
 * Calculate total spending for a list of expenses
 */
export function calculateTotal(expenses) {
  return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
}

/**
 * Calculate fixed expenses total
 */
export function calculateFixed(expenses) {
  return expenses.filter(e => e.isFixed).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Calculate variable expenses total
 */
export function calculateVariable(expenses) {
  return expenses.filter(e => !e.isFixed).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
}

/**
 * Get expenses for a specific month
 */
export function getExpensesForMonth(expenses, monthKey) {
  return expenses.filter(e => e.month === monthKey);
}

/**
 * Calculate average daily spending for a month
 */
export function calculateAvgDaily(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const total = calculateTotal(monthExpenses);
  const today = new Date();
  const currentMonthKey = getMonthKey(today);
  
  let days;
  if (monthKey === currentMonthKey) {
    days = today.getDate(); // Days elapsed this month
  } else {
    days = getDaysInMonth(monthKey);
  }
  
  return days > 0 ? total / days : 0;
}

/**
 * Get spending by category for a month
 */
export function getCategorySpending(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const total = calculateTotal(monthExpenses);
  const categoryMap = {};
  
  for (const exp of monthExpenses) {
    const key = exp.categoryId || 'uncategorized';
    if (!categoryMap[key]) {
      categoryMap[key] = {
        categoryId: exp.categoryId,
        categoryName: exp.categoryName || 'Uncategorized',
        total: 0,
        count: 0,
        expenses: [],
      };
    }
    categoryMap[key].total += Number(exp.amount) || 0;
    categoryMap[key].count++;
    categoryMap[key].expenses.push(exp);
  }
  
  // Add percentage
  const result = Object.values(categoryMap).map(cat => ({
    ...cat,
    percentage: total > 0 ? (cat.total / total) * 100 : 0,
  }));
  
  // Sort by total descending
  result.sort((a, b) => b.total - a.total);
  return result;
}

/**
 * Get spending by subcategory for a month
 */
export function getSubcategorySpending(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const total = calculateTotal(monthExpenses);
  const subMap = {};
  
  for (const exp of monthExpenses) {
    const key = exp.subcategoryId || exp.categoryId || 'uncategorized';
    if (!subMap[key]) {
      subMap[key] = {
        subcategoryId: exp.subcategoryId,
        subcategoryName: exp.subcategoryName || exp.categoryName || 'Uncategorized',
        categoryId: exp.categoryId,
        categoryName: exp.categoryName,
        total: 0,
        count: 0,
      };
    }
    subMap[key].total += Number(exp.amount) || 0;
    subMap[key].count++;
  }
  
  const result = Object.values(subMap).map(s => ({
    ...s,
    percentage: total > 0 ? (s.total / total) * 100 : 0,
  }));
  
  result.sort((a, b) => b.total - a.total);
  return result;
}

/**
 * Get daily spending for a month
 */
export function getDailySpending(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const daysInMonth = getDaysInMonth(monthKey);
  const [year, month] = monthKey.split('-').map(Number);
  
  const dailyMap = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyMap[dateStr] = { date: dateStr, day: d, total: 0, count: 0, expenses: [] };
  }
  
  for (const exp of monthExpenses) {
    if (dailyMap[exp.date]) {
      dailyMap[exp.date].total += Number(exp.amount) || 0;
      dailyMap[exp.date].count++;
      dailyMap[exp.date].expenses.push(exp);
    }
  }
  
  return Object.values(dailyMap);
}

/**
 * Get spending by payment method
 */
export function getPaymentMethodSpending(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const total = calculateTotal(monthExpenses);
  const methodMap = {};
  
  for (const exp of monthExpenses) {
    const method = exp.paymentMethod || 'Other';
    if (!methodMap[method]) {
      methodMap[method] = { method, total: 0, count: 0 };
    }
    methodMap[method].total += Number(exp.amount) || 0;
    methodMap[method].count++;
  }
  
  return Object.values(methodMap).map(m => ({
    ...m,
    percentage: total > 0 ? (m.total / total) * 100 : 0,
  })).sort((a, b) => b.total - a.total);
}

/**
 * Get monthly totals across all months
 */
export function getMonthlyTotals(expenses) {
  const monthMap = {};
  
  for (const exp of expenses) {
    if (!monthMap[exp.month]) {
      monthMap[exp.month] = { monthKey: exp.month, total: 0, fixed: 0, variable: 0, count: 0 };
    }
    const amount = Number(exp.amount) || 0;
    monthMap[exp.month].total += amount;
    monthMap[exp.month].count++;
    if (exp.isFixed) {
      monthMap[exp.month].fixed += amount;
    } else {
      monthMap[exp.month].variable += amount;
    }
  }
  
  return Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

/**
 * Compare two months' spending
 */
export function compareMonths(expenses, monthKey1, monthKey2) {
  const exp1 = getExpensesForMonth(expenses, monthKey1);
  const exp2 = getExpensesForMonth(expenses, monthKey2);
  
  const total1 = calculateTotal(exp1);
  const total2 = calculateTotal(exp2);
  
  const change = total2 - total1;
  const percentChange = total1 > 0 ? ((total2 - total1) / total1) * 100 : 0;
  
  return {
    month1: { key: monthKey1, total: total1 },
    month2: { key: monthKey2, total: total2 },
    change,
    percentChange,
  };
}

/**
 * Compare categories between two months
 */
export function compareCategorySpending(expenses, monthKey1, monthKey2) {
  const cats1 = getCategorySpending(expenses, monthKey1);
  const cats2 = getCategorySpending(expenses, monthKey2);
  
  const allCatIds = new Set([
    ...cats1.map(c => c.categoryId),
    ...cats2.map(c => c.categoryId),
  ]);
  
  const comparison = [];
  for (const catId of allCatIds) {
    const cat1 = cats1.find(c => c.categoryId === catId);
    const cat2 = cats2.find(c => c.categoryId === catId);
    
    const total1 = cat1?.total || 0;
    const total2 = cat2?.total || 0;
    const change = total2 - total1;
    const percentChange = total1 > 0 ? ((total2 - total1) / total1) * 100 : 0;
    
    comparison.push({
      categoryId: catId,
      categoryName: (cat1 || cat2)?.categoryName || 'Unknown',
      month1Total: total1,
      month2Total: total2,
      change,
      percentChange,
    });
  }
  
  comparison.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  return comparison;
}

/**
 * Get the highest expense for a month
 */
export function getHighestExpense(expenses, monthKey) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  if (monthExpenses.length === 0) return null;
  return monthExpenses.reduce((max, exp) => 
    (Number(exp.amount) || 0) > (Number(max.amount) || 0) ? exp : max
  , monthExpenses[0]);
}

/**
 * Get top N expenses for a month
 */
export function getTopExpenses(expenses, monthKey, n = 5) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  return [...monthExpenses]
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, n);
}

/**
 * Get top spending category for a month
 */
export function getTopCategory(expenses, monthKey) {
  const categories = getCategorySpending(expenses, monthKey);
  return categories.length > 0 ? categories[0] : null;
}

/**
 * Get budget status
 */
export function getBudgetStatus(expenses, monthKey, budget) {
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  const spent = calculateTotal(monthExpenses);
  const remaining = budget - spent;
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  
  let status = 'safe'; // green
  if (percentage >= 100) status = 'exceeded';
  else if (percentage >= 90) status = 'critical';
  else if (percentage >= 75) status = 'warning';
  
  return { spent, remaining, budget, percentage, status };
}

/**
 * Get all unique months from expenses
 */
export function getUniqueMonths(expenses) {
  const months = new Set(expenses.map(e => e.month));
  return [...months].sort();
}
