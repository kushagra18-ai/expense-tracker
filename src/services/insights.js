import { getCategorySpending, getPaymentMethodSpending, calculateTotal, calculateFixed, calculateVariable, getExpensesForMonth, getBudgetStatus, compareMonths } from '../utils/calculations';
import { formatCurrency, formatPercent, getMonthLabel, getPrevMonthKey } from '../utils/formatters';

/**
 * Generate smart insights based on expense data
 */
export function generateInsights(expenses, monthKey, budget) {
  const insights = [];
  const monthExpenses = getExpensesForMonth(expenses, monthKey);
  
  if (monthExpenses.length === 0) {
    insights.push({
      type: 'info',
      icon: '📝',
      title: 'No Data Yet',
      message: 'Start adding expenses to see spending insights.',
    });
    return insights;
  }

  const total = calculateTotal(monthExpenses);
  const prevMonthKey = getPrevMonthKey(monthKey);
  const prevExpenses = getExpensesForMonth(expenses, prevMonthKey);
  const prevTotal = calculateTotal(prevExpenses);
  const categories = getCategorySpending(expenses, monthKey);
  const prevCategories = getCategorySpending(expenses, prevMonthKey);

  // Budget alert
  if (budget > 0) {
    const budgetStatus = getBudgetStatus(expenses, monthKey, budget);
    if (budgetStatus.status === 'exceeded') {
      insights.push({
        type: 'danger',
        icon: '⚠️',
        title: 'Budget Exceeded',
        message: `You have exceeded your monthly budget by ${formatCurrency(Math.abs(budgetStatus.remaining))}.`,
      });
    } else if (budgetStatus.status === 'critical') {
      insights.push({
        type: 'warning',
        icon: '🔴',
        title: 'Budget Alert',
        message: `You've used ${formatPercent(budgetStatus.percentage)} of your budget. Only ${formatCurrency(budgetStatus.remaining)} remaining.`,
      });
    } else if (budgetStatus.status === 'warning') {
      insights.push({
        type: 'warning',
        icon: '🟡',
        title: 'Budget Warning',
        message: `You have ${formatCurrency(budgetStatus.remaining)} remaining in your monthly budget.`,
      });
    }
  }

  // Month-over-month comparison
  if (prevTotal > 0 && total > 0) {
    const comparison = compareMonths(expenses, prevMonthKey, monthKey);
    if (comparison.percentChange < 0) {
      insights.push({
        type: 'positive',
        icon: '📉',
        title: 'Spending Down',
        message: `You spent ${formatPercent(Math.abs(comparison.percentChange))} less this month than last month. Keep it up!`,
      });
    } else if (comparison.percentChange > 15) {
      insights.push({
        type: 'warning',
        icon: '📈',
        title: 'Spending Up',
        message: `Your spending is ${formatPercent(comparison.percentChange)} higher than last month.`,
      });
    }
  }

  // Category-specific insights
  for (const cat of categories) {
    if (cat.count >= 3 && prevCategories.length > 0) {
      const prevCat = prevCategories.find(c => c.categoryId === cat.categoryId);
      if (prevCat && prevCat.total > 0) {
        const catChange = ((cat.total - prevCat.total) / prevCat.total) * 100;
        if (catChange > 20) {
          insights.push({
            type: 'warning',
            icon: '📊',
            title: `${cat.categoryName} Alert`,
            message: `Your ${cat.categoryName} spending is ${formatPercent(catChange)} higher than last month.`,
          });
        }
      }
    }
  }

  // Top category insight
  if (categories.length >= 2) {
    const top = categories[0];
    insights.push({
      type: 'info',
      icon: '🏆',
      title: 'Top Category',
      message: `${top.categoryName} is your largest expense category at ${formatCurrency(top.total)} (${formatPercent(top.percentage)}).`,
    });
    
    const second = categories[1];
    insights.push({
      type: 'info',
      icon: '📋',
      title: 'Second Highest',
      message: `${second.categoryName} is your second-largest expense at ${formatCurrency(second.total)}.`,
    });
  }

  // Eating out alert
  const eatingOut = categories.find(c => c.categoryId === 'food');
  if (eatingOut && eatingOut.total > 0) {
    const foodSubcats = monthExpenses.filter(e => e.subcategoryId === 'eating-out');
    const foodTotal = foodSubcats.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    if (foodTotal > 2000) {
      insights.push({
        type: 'info',
        icon: '🍕',
        title: 'Food Spending',
        message: `You spent ${formatCurrency(foodTotal)} on eating out this month.`,
      });
    }
  }

  // Fixed vs variable insight
  const fixed = calculateFixed(monthExpenses);
  const variable = calculateVariable(monthExpenses);
  if (total > 0) {
    const fixedPct = (fixed / total) * 100;
    if (fixedPct > 60) {
      insights.push({
        type: 'info',
        icon: '🔒',
        title: 'Fixed Heavy',
        message: `${formatPercent(fixedPct)} of your spending is fixed expenses. Focus on reducing variable costs.`,
      });
    }
  }

  // Payment method insight
  const payments = getPaymentMethodSpending(expenses, monthKey);
  if (payments.length > 0) {
    const topPayment = payments[0];
    insights.push({
      type: 'info',
      icon: '💳',
      title: 'Payment Preference',
      message: `Most of your payments (${formatPercent(topPayment.percentage)}) are via ${topPayment.method}.`,
    });
  }

  return insights;
}
