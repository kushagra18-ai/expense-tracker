import React, { useState } from 'react';
import './DashboardPage.css';

const StatCard = ({ icon: Icon, label, value, color, trend, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="stat-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="stat-icon" 
        style={{ 
          backgroundColor: color,
          boxShadow: isHovered ? `0 0 15px ${color}80` : 'none',
          transition: 'box-shadow 0.3s'
        }}
      >
        <Icon size={20} />
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {trend && (
          <div className={`stat-trend ${trend.direction}`}>
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
