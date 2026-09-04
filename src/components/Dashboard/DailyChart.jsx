import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getDailySpending } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';
import './DashboardPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DailyChart = ({ expenses, currentMonth }) => {
  const dailySpending = getDailySpending(expenses, currentMonth);
  const total = dailySpending.reduce((sum, item) => sum + item.total, 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <h3 className="section-title"><BarChart3 size={18} /> Daily Spending</h3>
        <div className="empty-state" style={{ minHeight: '280px', padding: '1rem' }}>
          <BarChart3 size={32} />
          <p>No daily data available yet.</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const isCurrentMonth = today.toISOString().slice(0, 7) === currentMonth;
  const currentDay = today.getDate();

  const labels = dailySpending.map(item => item.day);
  const data = dailySpending.map(item => item.total);
  
  // Highlight today's bar if in current month
  const backgroundColors = dailySpending.map(item => {
    if (isCurrentMonth && item.day === currentDay) {
      return '#f59e0b'; // Amber/Gold for today
    }
    // Gradient logic can be done with context in chart.js, but since we map colors:
    // Let's return a nice cyan/emerald solid color, or chartjs gradient if we use a plugin. 
    // Here we just use a cyan solid that looks good in dark mode.
    return '#06b6d4'; 
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Spending',
        data,
        backgroundColor: backgroundColors,
        borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
        barPercentage: 0.7,
        hoverBackgroundColor: '#10b981'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#94a3b8',
        bodyColor: '#f1f5f9',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const item = dailySpending[index];
            const dateObj = new Date(item.date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            return `${dayName}, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          },
          label: (context) => `Spent: ${formatCurrency(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', maxTicksLimit: 15, font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { 
          color: '#64748b', 
          font: { size: 10 },
          callback: (value) => value > 0 ? `₹${value}` : '0'
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="chart-card">
      <h3 className="section-title"><BarChart3 size={18} /> Daily Spending</h3>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DailyChart;
