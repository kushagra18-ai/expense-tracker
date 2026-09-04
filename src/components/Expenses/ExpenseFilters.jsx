import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './ExpenseFilters.css';

const ExpenseFilters = ({ filters, onFilterChange, categories }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      categoryId: 'all',
      paymentMethod: 'all',
      type: 'all',
      sort: 'date-desc'
    });
    setExpanded(false);
  };

  const activeFiltersCount = 
    (filters.categoryId !== 'all' ? 1 : 0) +
    (filters.paymentMethod !== 'all' ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0);

  return (
    <div className="expense-filters glass-card">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button className="clear-search" onClick={() => handleChange('search', '')}>
              <X size={14} />
            </button>
          )}
        </div>
        <button 
          className={`filter-toggle ${expanded ? 'active' : ''} ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={18} />
          {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
        </button>
      </div>

      <div className={`filters-collapsible ${expanded ? 'expanded' : ''}`}>
        <div className="filters-content">
          <div className="filter-row">
            <div className="filter-group">
              <label>Sort By</label>
              <select 
                value={filters.sort} 
                onChange={(e) => handleChange('sort', e.target.value)}
                className="filter-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select 
                value={filters.categoryId} 
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>Payment Method</label>
            <div className="pill-group">
              {['All', 'UPI', 'Cash', 'Card', 'Other'].map(pm => {
                const val = pm === 'All' ? 'all' : pm;
                return (
                  <button
                    key={pm}
                    className={`filter-pill ${filters.paymentMethod === val ? 'active' : ''}`}
                    onClick={() => handleChange('paymentMethod', val)}
                  >
                    {pm}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="filter-group">
            <label>Expense Type</label>
            <div className="pill-group">
              {[
                { label: 'All', value: 'all' },
                { label: 'Fixed', value: 'fixed' },
                { label: 'Variable', value: 'variable' }
              ].map(t => (
                <button
                  key={t.value}
                  className={`filter-pill ${filters.type === t.value ? 'active' : ''}`}
                  onClick={() => handleChange('type', t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={14} /> Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilters;
