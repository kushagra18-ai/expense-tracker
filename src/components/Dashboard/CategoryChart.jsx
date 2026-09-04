import React, { useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getCategorySpending } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { PieChart } from 'lucide-react';
import './DashboardPage.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ expenses, currentMonth, categories }) => {
  const chartRef = useRef(null);
  const categorySpendingArray = getCategorySpending(expenses, currentMonth);
  
  const total = categorySpendingArray.reduce((sum, item) => sum + item.total, 0);

  if (total === 0) {
    return (
      <div className="chart-card">
        <h3 className="section-title"><PieChart size={18} /> Expenses by Category</h3>
        <div className="empty-state" style={{ minHeight: '280px', padding: '1rem' }}>
          <PieChart size={32} />
          <p>No category data available yet.</p>
        </div>
      </div>
    );
  }

  const labels = [];
  const data = [];
  const backgroundColor = [];
  const legendData = [];

  categorySpendingArray.forEach(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const name = category ? category.name : item.categoryName;
    const color = category?.color || '#94a3b8';
    
    labels.push(name);
    data.push(item.total);
    backgroundColor.push(color);
    
    legendData.push({
      id: item.categoryId,
      name: name,
      color: color,
      amount: item.total,
      percent: item.percentage.toFixed(1)
    });
  });

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#111827', // Matches dark card background
        hoverOffset: 8,
        hoverBorderColor: 'transparent'
      },
    ],
  };

  const options = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f1f5f9',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percent = ((value / total) * 100).toFixed(1);
            return ` ${formatCurrency(value)} (${percent}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  legendData.sort((a, b) => b.amount - a.amount);

  const handleLegendClick = (categoryId) => {
    // Future feature prep: filter by category or navigate
    console.log(`Clicked category: ${categoryId}`);
  };

  return (
    <div className="chart-card">
      <h3 className="section-title"><PieChart size={18} /> Expenses by Category</h3>
      <div className="chart-container">
        <Doughnut ref={chartRef} data={chartData} options={options} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{formatCurrency(total)}</div>
        </div>
      </div>
      <div className="category-legend">
        {legendData.map((item, index) => (
          <div key={index} className="legend-item" onClick={() => handleLegendClick(item.id)}>
            <div className="legend-left">
              <div className="legend-color" style={{ backgroundColor: item.color }}></div>
              <span className="legend-name">{item.name}</span>
            </div>
            <div className="legend-right">
              <span className="legend-amount">{formatCurrency(item.amount)}</span>
              <span className="legend-percent">{item.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryChart;
