import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExpenses } from '../../contexts/ExpenseContext';
import { useSettings } from '../../contexts/SettingsContext';
import { formatDateInput } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../utils/categories';
import QuickAdd from './QuickAdd';
import { useToast } from '../common/Toast';
import './AddExpensePage.css';

const AddExpensePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { expenses, addExpense, editExpense, removeExpense } = useExpenses();
  const { categories, quickAddCategories } = useSettings();
  const { showToast } = useToast();

  const isEditMode = Boolean(id);
  // Guard: only fill the edit form once (the first time the expense is found).
  // Prevents any subsequent re-render from clobbering the user's in-progress edits.
  const filledRef = React.useRef(false);

  const [formData, setFormData] = useState({
    amount: '',
    categoryId: '',
    subcategoryId: '',
    date: formatDateInput(new Date()),
    description: '',
    paymentMethod: 'UPI',
    isFixed: false
  });
  
  const [error, setError] = useState(false);

  // Reset the fill-guard whenever we navigate to a different expense
  useEffect(() => { filledRef.current = false; }, [id]);

  // Edit mode: fill form when expense is found in the (async-loaded) array.
  // `expenses` is in deps so we retry once data arrives from IndexedDB.
  // `filledRef` ensures we only ever fill once — subsequent renders (e.g.
  // when `categories` loads) won't overwrite what the user has typed.
  useEffect(() => {
    if (!isEditMode) return;
    if (filledRef.current) return;
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    filledRef.current = true;

    // Resolve categoryId/subcategoryId from names for old expenses that only
    // have categoryName/subcategoryName stored (before the fix was applied).
    let categoryId = exp.categoryId || '';
    let subcategoryId = exp.subcategoryId || '';
    if (!categoryId && exp.categoryName && categories?.length > 0) {
      const cat = categories.find(c => c.name === exp.categoryName);
      if (cat) {
        categoryId = cat.id;
        if (!subcategoryId && exp.subcategoryName) {
          const sub = cat.subcategories?.find(s => s.name === exp.subcategoryName);
          if (sub) subcategoryId = sub.id;
        }
      }
    }
    // Final fallback: use first category so dropdown is never blank
    if (!categoryId && categories?.length > 0) {
      categoryId = categories[0].id;
      subcategoryId = categories[0].subcategories?.[0]?.id || '';
    }

    setFormData({
      amount: exp.amount.toString(),
      categoryId,
      subcategoryId,
      date: exp.date,
      description: exp.description || '',
      paymentMethod: exp.paymentMethod || 'UPI',
      isFixed: !!exp.isFixed,
    });
  }, [id, isEditMode, expenses, categories]);


  // Add mode: set default category/subcategory once categories load.
  // Skipped entirely in edit mode.
  useEffect(() => {
    if (isEditMode) return;
    if (categories?.length > 0) {
      setFormData(prev => ({
        ...prev,
        categoryId: prev.categoryId || categories[0].id,
        subcategoryId: prev.subcategoryId || categories[0].subcategories[0]?.id || '',
      }));
    }
  }, [isEditMode, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError(false);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto-update subcategory if category changes
      if (name === 'categoryId') {
        const cat = categories.find(c => c.id === value);
        if (cat && cat.subcategories.length > 0) {
          newData.subcategoryId = cat.subcategories[0].id;
        } else {
          newData.subcategoryId = '';
        }
      }
      return newData;
    });
  };

  const handleQuickAddSelect = (selected) => {
    setFormData(prev => ({
      ...prev,
      categoryId: selected.categoryId,
      subcategoryId: selected.subcategoryId,
      isFixed: selected.isFixed || false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      setError(true);
      showToast('Please enter a valid amount', 'error');
      return;
    }

    // Resolve human-readable names so Google Sheets columns are populated
    const selectedCat = categories?.find(c => c.id === formData.categoryId);
    const selectedSub = selectedCat?.subcategories?.find(s => s.id === formData.subcategoryId);
    const enrichedData = {
      ...formData,
      amount: Number(formData.amount),
      categoryName: selectedCat?.name || '',
      subcategoryName: selectedSub?.name || '',
    };

    try {
      if (isEditMode) {
        const { syncResult } = await editExpense(id, enrichedData);
        showToast('Expense updated', 'success');
        if (syncResult && !syncResult.success) {
          showToast('Saved locally. Sheet sync failed: ' + syncResult.error, 'warning');
        }
      } else {
        const { syncResult } = await addExpense(enrichedData);
        showToast('Expense added', 'success');
        if (syncResult && !syncResult.success) {
          showToast('Saved locally. Sheet sync failed: ' + syncResult.error, 'warning');
        }
      }
      navigate(-1);
    } catch (err) {
      showToast('Error saving expense', 'error');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this expense?')) {
      removeExpense(id);
      showToast('Expense deleted', 'success');
      navigate(-1);
    }
  };

  const selectedCategory = categories?.find(c => c.id === formData.categoryId);

  return (
    <div className="add-expense-page">
      <div className="header-actions">
        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
        <h2>{isEditMode ? 'Edit Expense' : 'Add Expense'}</h2>
        {isEditMode ? (
          <button type="button" className="btn-delete-header" onClick={handleDelete}>Delete</button>
        ) : (
          <div style={{ width: '45px' }}></div>
        )}
      </div>

      {!isEditMode && (
        <QuickAdd 
          quickAddItems={quickAddCategories} 
          categories={categories}
          onSelect={handleQuickAddSelect} 
        />
      )}

      <form onSubmit={handleSubmit} className="add-expense-form glass-card">
        <div className={`form-group amount-group ${error ? 'has-error' : ''}`}>
          <span className="currency-symbol">₹</span>
          <input
            type="number"
            name="amount"
            className="amount-input"
            placeholder="0"
            value={formData.amount}
            onChange={handleChange}
            inputMode="decimal"
            autoFocus
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="custom-select">
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Subcategory</label>
            <select name="subcategoryId" value={formData.subcategoryId} onChange={handleChange} required className="custom-select">
              {selectedCategory?.subcategories.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="custom-input"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What was this for?"
            className="custom-input"
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <div className="pill-group payment-methods">
            {PAYMENT_METHODS?.map(pm => (
              <button
                type="button"
                key={pm}
                className={`filter-pill pm-btn ${formData.paymentMethod === pm ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: pm }))}
              >
                {pm}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group toggle-row">
          <div className="toggle-info">
            <span className="toggle-title">Fixed Expense</span>
            <span className="toggle-desc">Occurs regularly (rent, subs)</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="isFixed"
              checked={formData.isFixed}
              onChange={handleChange}
              className="toggle-input"
            />
            <div className="toggle-slider"></div>
          </label>
        </div>

        <button type="submit" className="btn-submit">
          {isEditMode ? 'Update Expense' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
};

export default AddExpensePage;
