import React, { useState } from 'react';
import { generateInsights } from '../../services/insights';
import { AlertCircle, TrendingUp, TrendingDown, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import './DashboardPage.css';

const iconMap = {
  positive: <TrendingDown size={20} color="#10b981" />,
  warning: <AlertCircle size={20} color="#f59e0b" />,
  danger: <TrendingUp size={20} color="#ef4444" />,
  info: <Info size={20} color="#3b82f6" />
};

const borderColorMap = {
  positive: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

const bgTintMap = {
  positive: 'rgba(16, 185, 129, 0.05)',
  warning: 'rgba(245, 158, 11, 0.05)',
  danger: 'rgba(239, 68, 68, 0.05)',
  info: 'rgba(59, 130, 246, 0.05)'
};

const InsightsPanel = ({ expenses, currentMonth, budget }) => {
  const [expanded, setExpanded] = useState(false);
  const insights = generateInsights(expenses, currentMonth, budget);

  if (!insights || insights.length === 0) return null;

  const displayCount = expanded ? insights.length : 3;
  const visibleInsights = insights.slice(0, displayCount);
  const hasMore = insights.length > 3;

  return (
    <div className="insights-panel">
      <h3 className="section-title">
        <Lightbulb size={18} /> Smart Insights
      </h3>
      
      {visibleInsights.map((insight, index) => (
        <div 
          key={index} 
          className="insight-card" 
          style={{ 
            borderLeftColor: borderColorMap[insight.type],
            backgroundColor: bgTintMap[insight.type],
            animationDelay: `${index * 0.1}s`
          }}
        >
          <div className="insight-icon" style={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            {iconMap[insight.type]}
          </div>
          <div className="insight-content">
            <span className="insight-title">{insight.title}</span>
            <span className="insight-message">{insight.message}</span>
          </div>
        </div>
      ))}
      
      {hasMore && (
        <button 
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text-secondary)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'background 0.2s',
            marginTop: '0.5rem'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          {expanded ? (
            <><ChevronUp size={16} /> Show Less</>
          ) : (
            <><ChevronDown size={16} /> Show {insights.length - 3} More Insights</>
          )}
        </button>
      )}
    </div>
  );
};

export default InsightsPanel;
