import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../common/Toast';
import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, Tag } from 'lucide-react';

export default function CategoryManager() {
  const { categories } = useSettings();
  const { showToast } = useToast();
  const [expandedCat, setExpandedCat] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedCat(expandedCat === idx ? null : idx);
  };

  const handleAddCategory = () => {
    showToast('Add category feature coming soon', 'info');
  };

  const handleAddSubcategory = (e, catName) => {
    e.stopPropagation();
    showToast(`Add subcategory to ${catName} coming soon`, 'info');
  };

  const handleDelete = (e, name) => {
    e.stopPropagation();
    showToast(`Deleted ${name}`, 'success');
  };

  return (
    <div className="category-manager">
      <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
        Organize your expenses with custom categories and subcategories.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {categories && categories.map((cat, idx) => {
          const isExpanded = expandedCat === idx;
          return (
            <div key={idx} style={{ 
              background: isExpanded ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${isExpanded ? cat.color + '40' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-md)', 
              overflow: 'hidden',
              transition: 'all 0.2s ease'
            }}>
              <div 
                onClick={() => toggleExpand(idx)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', height: '36px', 
                    borderRadius: '50%', 
                    background: `${cat.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{cat.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {cat.subcategories.length} subcategories
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{padding: '0.35rem', borderRadius: '50%'}} onClick={(e) => handleDelete(e, cat.name)}>
                    <Trash2 size={14} className="text-danger" />
                  </button>
                  {isExpanded ? <ChevronDown size={20} color="var(--text-muted)"/> : <ChevronRight size={20} color="var(--text-muted)"/>}
                </div>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {cat.subcategories.map((sub, i) => (
                      <span key={i} style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '99px', 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <Tag size={12} style={{color: cat.color}} /> {sub}
                      </span>
                    ))}
                    <button 
                      onClick={(e) => handleAddSubcategory(e, cat.name)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px dashed var(--text-muted)', 
                        color: 'var(--text-secondary)', 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '99px', 
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAddCategory}>
        <Plus size={18} /> Create New Category
      </button>
    </div>
  );
}
