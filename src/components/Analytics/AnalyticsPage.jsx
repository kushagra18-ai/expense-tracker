import React, { useState, useMemo } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import MonthSelector from '../Layout/MonthSelector';
import { formatCurrency, formatPercent, getMonthLabel, getPrevMonthKey } from '../../utils/formatters';
import {
  calculateTotal, calculateFixed, calculateVariable,
  getExpensesForMonth, getCategorySpending, getDailySpending,
  getPaymentMethodSpending, getMonthlyTotals, getTopExpenses,
  compareCategorySpending, getUniqueMonths, getBudgetStatus
} from '../../utils/calculations';
import './AnalyticsPage.css';
import { TrendingUp, PieChart, BarChart2, Calendar, CreditCard, Award, ArrowLeftRight, Target, GitCompare } from 'lucide-react';

const darkGrid = { color: 'rgba(255,255,255,0.06)' };
const darkTick = { color: '#94a3b8' };

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#f1f5f9', padding: 12, usePointStyle: true } },
    tooltip: {
      backgroundColor: 'rgba(17,24,39,0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
    }
  },
  scales: {
    x: { ticks: darkTick, grid: darkGrid, border: { color: 'rgba(255,255,255,0.1)' } },
    y: { ticks: { ...darkTick, callback: v => '₹' + v.toLocaleString('en-IN') }, grid: darkGrid, border: { color: 'rgba(255,255,255,0.1)' } }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17,24,39,0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: ctx => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}`
      }
    }
  }
};

const CHART_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#a855f7'];

export default function AnalyticsPage() {
  const { expenses, currentMonth } = useExpenses();
  const { categories, budget } = useSettings();

  const allMonths = useMemo(() => getUniqueMonths(expenses), [expenses]);
  const currentMonthExp = useMemo(() => getExpensesForMonth(expenses, currentMonth), [expenses, currentMonth]);

  const [compMonth1, setCompMonth1] = useState(currentMonth);
  const [compMonth2, setCompMonth2] = useState(() => {
    const prev = getPrevMonthKey(currentMonth);
    return allMonths.includes(prev) ? prev : currentMonth;
  });

  const hasData = currentMonthExp.length > 0;

  // Guard: don't render until month key is available
  if (!currentMonth) return null;

  // ======= S1: Monthly Spending Trend =======
  const monthlyTrendData = useMemo(() => {
    const monthTotals = getMonthlyTotals(expenses); // returns array of {monthKey, total, ...}
    const sorted = [...monthTotals].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-6);
    return {
      labels: sorted.map(m => getMonthLabel(m.monthKey)),
      datasets: [{
        label: 'Total Spending',
        data: sorted.map(m => m.total),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6,182,212,0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0a0e1a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    };
  }, [expenses]);

  // ======= S2: Category Breakdown =======
  const catBreakdownData = useMemo(() => {
    const catData = getCategorySpending(expenses, currentMonth); // returns array of {categoryName, total, percentage, ...}
    if (catData.length === 0) return null;
    return {
      chartData: {
        labels: catData.map(c => c.categoryName),
        datasets: [{
          data: catData.map(c => c.total),
          backgroundColor: catData.map((c, i) => {
            const cat = categories.find(cat => cat.id === c.categoryId);
            return cat?.color || CHART_COLORS[i % CHART_COLORS.length];
          }),
          borderWidth: 0,
          hoverOffset: 6,
        }]
      },
      legend: catData,
    };
  }, [expenses, currentMonth, categories]);

  // ======= S3: Fixed vs Variable =======
  const fixedTotal = useMemo(() => calculateFixed(currentMonthExp), [currentMonthExp]);
  const variableTotal = useMemo(() => calculateVariable(currentMonthExp), [currentMonthExp]);
  const fvData = {
    labels: ['Spending'],
    datasets: [
      { label: 'Fixed', data: [fixedTotal], backgroundColor: '#8b5cf6', borderRadius: 6 },
      { label: 'Variable', data: [variableTotal], backgroundColor: '#06b6d4', borderRadius: 6 }
    ]
  };

  // ======= S4: Daily Spending =======
  const dailyChartData = useMemo(() => {
    const dailyArr = getDailySpending(expenses, currentMonth); // returns array of {day, total, ...}
    const today = new Date();
    const isCurrentMonth = currentMonth === `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    const todayDay = today.getDate();
    const avgTotal = dailyArr.reduce((s, d) => s + d.total, 0);
    const daysWithSpending = dailyArr.filter(d => d.total > 0).length;
    const avg = daysWithSpending > 0 ? avgTotal / daysWithSpending : 0;

    return {
      labels: dailyArr.map(d => d.day),
      datasets: [{
        label: 'Daily Spending',
        data: dailyArr.map(d => d.total),
        backgroundColor: dailyArr.map(d =>
          (isCurrentMonth && d.day === todayDay) ? '#f59e0b' : 'rgba(16,185,129,0.7)'
        ),
        borderRadius: 4,
      }]
    };
  }, [expenses, currentMonth]);

  // ======= S5: Payment Method =======
  const pmChartData = useMemo(() => {
    const pmArr = getPaymentMethodSpending(expenses, currentMonth); // returns array of {method, total, ...}
    if (pmArr.length === 0) return null;
    const pmColors = { UPI: '#8b5cf6', Cash: '#10b981', Card: '#f59e0b', Other: '#64748b' };
    return {
      labels: pmArr.map(p => p.method),
      datasets: [{
        label: 'Amount',
        data: pmArr.map(p => p.total),
        backgroundColor: pmArr.map(p => pmColors[p.method] || '#64748b'),
        borderRadius: 6,
      }]
    };
  }, [expenses, currentMonth]);

  // ======= S6: Top 5 Expenses =======
  const top5 = useMemo(() => getTopExpenses(expenses, currentMonth, 5), [expenses, currentMonth]);
  const medals = ['🥇', '🥈', '🥉'];

  // ======= S7: Month-to-Month Comparison =======
  const monthCompData = useMemo(() => {
    const monthTotals = getMonthlyTotals(expenses);
    const sorted = [...monthTotals].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-6);

    const chart = {
      labels: sorted.map(m => getMonthLabel(m.monthKey)),
      datasets: [
        { label: 'Fixed', data: sorted.map(m => m.fixed), backgroundColor: '#8b5cf6', borderRadius: 4 },
        { label: 'Variable', data: sorted.map(m => m.variable), backgroundColor: '#06b6d4', borderRadius: 4 }
      ]
    };

    const table = sorted.map((m, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      const diff = prev ? m.total - prev.total : 0;
      const pct = prev && prev.total > 0 ? (diff / prev.total) * 100 : 0;
      return { monthKey: m.monthKey, total: m.total, diff, pct };
    });

    return { chart, table };
  }, [expenses]);

  // ======= S8: Budget vs Actual =======
  const budgetActualData = useMemo(() => {
    const monthTotals = getMonthlyTotals(expenses);
    const sorted = [...monthTotals].sort((a, b) => a.monthKey.localeCompare(b.monthKey)).slice(-6);
    if (budget <= 0) return null;
    return {
      labels: sorted.map(m => getMonthLabel(m.monthKey)),
      datasets: [
        { label: 'Budget', data: sorted.map(() => budget), backgroundColor: 'rgba(148,163,184,0.3)', borderRadius: 4 },
        {
          label: 'Actual',
          data: sorted.map(m => m.total),
          backgroundColor: sorted.map(m => m.total > budget ? '#ef4444' : '#10b981'),
          borderRadius: 4,
        }
      ]
    };
  }, [expenses, budget]);

  // ======= S9: Category Comparison =======
  const catCompare = useMemo(() => {
    return compareCategorySpending(expenses, compMonth1, compMonth2); // returns array of {categoryName, month1Total, month2Total, change, percentChange}
  }, [expenses, compMonth1, compMonth2]);

  // ======= Empty section helper =======
  const EmptyState = ({ message }) => (
    <div className="analytics-empty">
      <p>{message || 'Add some expenses to see analytics here.'}</p>
    </div>
  );

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Analytics</h1>
        <p className="analytics-subtitle">In-depth insights into your spending</p>
      </div>

      <MonthSelector />

      {/* S1: Monthly Trend */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><TrendingUp size={20} /> Monthly Spending Trend</h2>
        <div className="chart-container">
          {allMonths.length > 0 ? (
            <Line data={monthlyTrendData} options={baseOptions} />
          ) : (
            <EmptyState message="Need at least one month of data." />
          )}
        </div>
      </div>

      {/* S2: Category Breakdown */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><PieChart size={20} /> Category Breakdown</h2>
        {catBreakdownData ? (
          <>
            <div className="chart-container doughnut">
              <Doughnut data={catBreakdownData.chartData} options={doughnutOptions} />
            </div>
            <div className="cat-legend">
              {catBreakdownData.legend.map((cat, i) => {
                const catObj = categories.find(c => c.id === cat.categoryId);
                const color = catObj?.color || CHART_COLORS[i % CHART_COLORS.length];
                return (
                  <div key={cat.categoryId} className="cat-legend-item">
                    <span className="cat-legend-dot" style={{ backgroundColor: color }} />
                    <span className="cat-legend-name">{cat.categoryName}</span>
                    <span className="cat-legend-value">{formatCurrency(cat.total)}</span>
                    <span className="cat-legend-pct">{formatPercent(cat.percentage)}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* S3: Fixed vs Variable */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><Target size={20} /> Fixed vs Variable</h2>
        {hasData ? (
          <>
            <div className="chart-container" style={{ height: '120px' }}>
              <Bar data={fvData} options={{
                ...baseOptions,
                indexAxis: 'y',
                scales: {
                  x: { stacked: true, ticks: darkTick, grid: darkGrid },
                  y: { stacked: true, ticks: darkTick, grid: { display: false } }
                }
              }} />
            </div>
            <div className="fv-summary">
              <div className="fv-item"><span className="fv-dot" style={{ background: '#8b5cf6' }} /> Fixed: <strong>{formatCurrency(fixedTotal)}</strong></div>
              <div className="fv-item"><span className="fv-dot" style={{ background: '#06b6d4' }} /> Variable: <strong>{formatCurrency(variableTotal)}</strong></div>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* S4: Daily Spending */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><Calendar size={20} /> Daily Spending</h2>
        <div className="chart-container">
          {hasData ? (
            <Bar data={dailyChartData} options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, legend: { display: false } }
            }} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* S5: Payment Methods */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><CreditCard size={20} /> Payment Methods</h2>
        <div className="chart-container" style={{ height: '200px' }}>
          {pmChartData ? (
            <Bar data={pmChartData} options={{
              ...baseOptions,
              indexAxis: 'y',
              plugins: { ...baseOptions.plugins, legend: { display: false } },
              scales: {
                x: { ticks: darkTick, grid: darkGrid },
                y: { ticks: darkTick, grid: { display: false } }
              }
            }} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>

      {/* S6: Top 5 Expenses */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><Award size={20} /> Top 5 Expenses</h2>
        {top5.length > 0 ? (
          <div className="top-expenses-list">
            {top5.map((exp, i) => (
              <div key={exp.id} className="top-expense-item">
                <div className="top-expense-rank">{medals[i] || (i + 1)}</div>
                <div className="top-expense-details">
                  <div className="top-expense-sub">{exp.subcategoryName || exp.categoryName}</div>
                  <div className="top-expense-desc">{exp.description || '—'}</div>
                </div>
                <div className="top-expense-amount">{formatCurrency(exp.amount)}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* S7: Month-to-Month Comparison */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><ArrowLeftRight size={20} /> Month-to-Month</h2>
        {monthCompData.table.length > 0 ? (
          <>
            <div className="chart-container">
              <Bar data={monthCompData.chart} options={{
                ...baseOptions,
                scales: {
                  x: { stacked: true, ticks: darkTick, grid: darkGrid },
                  y: { stacked: true, ticks: { ...darkTick, callback: v => '₹' + v.toLocaleString('en-IN') }, grid: darkGrid }
                }
              }} />
            </div>
            <table className="analytics-table">
              <thead>
                <tr><th>Month</th><th className="amount">Total</th><th className="amount">Change</th></tr>
              </thead>
              <tbody>
                {monthCompData.table.map(row => (
                  <tr key={row.monthKey}>
                    <td>{getMonthLabel(row.monthKey)}</td>
                    <td className="amount">{formatCurrency(row.total)}</td>
                    <td className={`amount ${row.diff > 0 ? 'text-red' : row.diff < 0 ? 'text-green' : ''}`}>
                      {row.diff > 0 ? '+' : ''}{formatCurrency(row.diff)} ({formatPercent(Math.abs(row.pct))})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <EmptyState message="Need multiple months of data to compare." />
        )}
      </div>

      {/* S8: Budget vs Actual */}
      {budgetActualData && (
        <div className="analytics-section">
          <h2 className="analytics-section-title"><BarChart2 size={20} /> Budget vs Actual</h2>
          <div className="chart-container">
            <Bar data={budgetActualData} options={{
              ...baseOptions,
              plugins: { ...baseOptions.plugins, legend: { labels: { color: '#f1f5f9', padding: 12 } } }
            }} />
          </div>
        </div>
      )}

      {/* S9: Category Comparison */}
      <div className="analytics-section">
        <h2 className="analytics-section-title"><GitCompare size={20} /> Compare Categories</h2>
        <div className="month-selectors">
          <select value={compMonth1} onChange={e => setCompMonth1(e.target.value)}>
            {allMonths.length > 0 ? allMonths.map(m => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            )) : (
              <option value={currentMonth}>{getMonthLabel(currentMonth)}</option>
            )}
          </select>
          <span className="month-vs">vs</span>
          <select value={compMonth2} onChange={e => setCompMonth2(e.target.value)}>
            {allMonths.length > 0 ? allMonths.map(m => (
              <option key={m} value={m}>{getMonthLabel(m)}</option>
            )) : (
              <option value={currentMonth}>{getMonthLabel(currentMonth)}</option>
            )}
          </select>
        </div>
        {catCompare.length > 0 ? (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="amount">{getMonthLabel(compMonth1)}</th>
                <th className="amount">{getMonthLabel(compMonth2)}</th>
                <th className="amount">Change</th>
              </tr>
            </thead>
            <tbody>
              {catCompare.map(row => (
                <tr key={row.categoryId} className={Math.abs(row.percentChange) > 20 ? 'highlight-row' : ''}>
                  <td>{row.categoryName}</td>
                  <td className="amount">{formatCurrency(row.month1Total)}</td>
                  <td className="amount">{formatCurrency(row.month2Total)}</td>
                  <td className={`amount ${row.change > 0 ? 'text-red' : row.change < 0 ? 'text-green' : ''}`}>
                    {row.change > 0 ? '+' : ''}{formatCurrency(row.change)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState message="Add expenses in both months to compare categories." />
        )}
      </div>
    </div>
  );
}
