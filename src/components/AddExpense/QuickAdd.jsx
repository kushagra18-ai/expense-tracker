import React from 'react';
import { Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSubcategoryById } from '../../utils/categories';
import './QuickAdd.css';

const QuickAdd = ({ quickAddItems, categories, onSelect }) => {
  const navigate = useNavigate();

  if (!quickAddItems || quickAddItems.length === 0) return null;

  return (
    <div className="quick-add-container">
      <div className="quick-add-header">
        <h3 className="quick-add-title">Suggestions</h3>
      </div>
      <div className="quick-add-scroll">
        {quickAddItems.map(item => {
          // Resolve subcategory details
          const subcat = getSubcategoryById(categories, item.subcategoryId);
          const name = subcat ? subcat.name : 'Item';
          
          return (
            <button 
              key={item.id} 
              className="quick-add-btn"
              onClick={() => onSelect(item)}
            >
              <span className="emoji">{item.emoji || '⚡'}</span>
              <span className="label">{name}</span>
            </button>
          );
        })}
        <button 
          className="quick-add-btn settings-btn"
          onClick={() => navigate('/settings')}
        >
          <Settings2 size={16} />
          <span className="label">Edit</span>
        </button>
      </div>
    </div>
  );
};

export default QuickAdd;
