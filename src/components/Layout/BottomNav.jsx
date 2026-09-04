import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Receipt, Plus, BarChart3, Settings } from 'lucide-react';
import './BottomNav.css';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__container">
        <NavLink to="/" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/expenses" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Receipt size={24} />
          <span>Expenses</span>
        </NavLink>
        
        <div className="bottom-nav__item bottom-nav__item--fab" onClick={() => navigate('/add')}>
          <div className="fab-button">
            <Plus size={28} color="white" />
          </div>
        </div>
        
        <NavLink to="/analytics" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={24} />
          <span>Analytics</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `bottom-nav__item ${isActive ? 'active' : ''}`}>
          <Settings size={24} />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
