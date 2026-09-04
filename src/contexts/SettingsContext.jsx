import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as storage from '../services/storage';
import { DEFAULT_CATEGORIES } from '../utils/categories';

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  budget: 20000,
  categories: DEFAULT_CATEGORIES,
  quickAddCategories: ['rapido-college-flat', 'groceries', 'eating-out', 'miscellaneous'],
  currency: 'INR',
  theme: 'dark',
};

export function SettingsProvider({ children }) {
  const [budget, setBudgetState] = useState(DEFAULT_SETTINGS.budget);
  const [categories, setCategoriesState] = useState(DEFAULT_SETTINGS.categories);
  const [quickAddCategories, setQuickAddCategoriesState] = useState(DEFAULT_SETTINGS.quickAddCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedBudget = await storage.getSetting('budget');
      const savedCategories = await storage.getSetting('categories');
      const savedQuickAdd = await storage.getSetting('quickAddCategories');
      
      if (savedBudget !== undefined) setBudgetState(savedBudget);
      if (savedCategories) setCategoriesState(savedCategories);
      if (savedQuickAdd) setQuickAddCategoriesState(savedQuickAdd);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const setBudget = useCallback(async (value) => {
    const num = Number(value);
    setBudgetState(num);
    await storage.setSetting('budget', num);
  }, []);

  const setCategories = useCallback(async (cats) => {
    setCategoriesState(cats);
    await storage.setSetting('categories', cats);
  }, []);

  const addCategory = useCallback(async (category) => {
    setCategoriesState(prev => {
      const updated = [...prev, category];
      storage.setSetting('categories', updated);
      return updated;
    });
  }, []);

  const updateCategory = useCallback(async (categoryId, updates) => {
    setCategoriesState(prev => {
      const updated = prev.map(c => c.id === categoryId ? { ...c, ...updates } : c);
      storage.setSetting('categories', updated);
      return updated;
    });
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    setCategoriesState(prev => {
      const updated = prev.filter(c => c.id !== categoryId);
      storage.setSetting('categories', updated);
      return updated;
    });
  }, []);

  const addSubcategory = useCallback(async (categoryId, subcategory) => {
    setCategoriesState(prev => {
      const updated = prev.map(c => {
        if (c.id === categoryId) {
          return { ...c, subcategories: [...c.subcategories, subcategory] };
        }
        return c;
      });
      storage.setSetting('categories', updated);
      return updated;
    });
  }, []);

  const deleteSubcategory = useCallback(async (categoryId, subcategoryId) => {
    setCategoriesState(prev => {
      const updated = prev.map(c => {
        if (c.id === categoryId) {
          return { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) };
        }
        return c;
      });
      storage.setSetting('categories', updated);
      return updated;
    });
  }, []);

  const setQuickAdd = useCallback(async (ids) => {
    setQuickAddCategoriesState(ids);
    await storage.setSetting('quickAddCategories', ids);
  }, []);

  const value = {
    budget,
    setBudget,
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    quickAddCategories,
    setQuickAdd,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export default SettingsContext;
