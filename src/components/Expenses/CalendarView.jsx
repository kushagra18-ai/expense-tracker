import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { X } from 'lucide-react';
import ExpenseItem from './ExpenseItem';
import './CalendarView.css';

const CalendarView = ({ expenses, monthKey }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayTotal = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayExps = expenses.filter(e => e.date === dateStr);
    return dayExps.reduce((sum, e) => sum + e.amount, 0);
  };

  const getIntensityClass = (total) => {
    if (total === 0) return 'intensity-0';
    if (total < 500) return 'intensity-1';
    if (total < 2000) return 'intensity-2';
    if (total < 5000) return 'intensity-3';
    return 'intensity-4';
  };

  const formatCompact = (val) => {
    if (val === 0) return '';
    if (val >= 10000) return `₹${(val / 1000).toFixed(1)}k`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
    return `₹${val}`;
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayExps = expenses.filter(e => e.date === dateStr);
    if (dayExps.length > 0) {
      setSelectedDate(dateStr);
      setSelectedExpenses(dayExps);
    }
  };

  return (
    <>
      <div className="calendar-view glass-card">
        <div className="calendar-header">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="calendar-day-header">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {blanks.map(b => <div key={`blank-${b}`} className="calendar-cell blank"></div>)}
          {days.map(day => {
            const total = getDayTotal(day);
            const isToday = new Date().getDate() === day && 
                            new Date().getMonth() + 1 === month && 
                            new Date().getFullYear() === year;
            
            return (
              <div 
                key={day} 
                className={`calendar-cell ${getIntensityClass(total)} ${isToday ? 'today' : ''} ${total > 0 ? 'has-data' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <span className="day-number">{day}</span>
                {total > 0 && <span className="day-total">{formatCompact(total)}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="calendar-modal-overlay" onClick={() => setSelectedDate(null)}>
          <div className="calendar-modal glass-card" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h3>{new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
              <button className="close-modal" onClick={() => setSelectedDate(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="calendar-modal-content">
              {selectedExpenses.map(expense => (
                <ExpenseItem 
                  key={expense.id} 
                  expense={expense}
                  onEdit={() => {}} // Disabled in modal for simplicity
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarView;
