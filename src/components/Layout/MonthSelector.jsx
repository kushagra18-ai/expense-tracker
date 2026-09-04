import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useExpenses } from '../../contexts/ExpenseContext';
import { getMonthLabel, getPrevMonthKey, getNextMonthKey } from '../../utils/formatters';
import './MonthSelector.css';

const MonthSelector = () => {
  const { currentMonth, setCurrentMonth } = useExpenses();

  const handlePrev = () => {
    setCurrentMonth(getPrevMonthKey(currentMonth));
  };

  const handleNext = () => {
    setCurrentMonth(getNextMonthKey(currentMonth));
  };

  return (
    <div className="month-selector">
      <button className="month-selector__btn" onClick={handlePrev}>
        <ChevronLeft size={20} />
      </button>
      
      <div className="month-selector__current">
        <span className="month-selector__label">{getMonthLabel(currentMonth)}</span>
        <div className="month-selector__underline"></div>
      </div>
      
      <button className="month-selector__btn" onClick={handleNext}>
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default MonthSelector;
