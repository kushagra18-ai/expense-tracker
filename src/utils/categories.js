// Default expense categories and subcategories
export const DEFAULT_CATEGORIES = [
  {
    id: 'transportation',
    name: 'Transportation',
    icon: '🚗',
    color: '#3b82f6',
    subcategories: [
      { id: 'rapido-college-flat', name: 'Rapido — College → Flat', defaultFixed: false },
      { id: 'rapido-flat-college', name: 'Rapido — Flat → College', defaultFixed: false },
      { id: 'other-transport', name: 'Other Transportation', defaultFixed: false },
    ],
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: '🏠',
    color: '#8b5cf6',
    subcategories: [
      { id: 'rent', name: 'Rent', defaultFixed: true },
      { id: 'maid-salary', name: 'Maid Salary', defaultFixed: true },
      { id: 'flat-supplies', name: 'Flat Supplies', defaultFixed: false },
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🍔',
    color: '#f59e0b',
    subcategories: [
      { id: 'groceries', name: 'Groceries / Ration', defaultFixed: false },
      { id: 'vegetables', name: 'Vegetables / Sabzi', defaultFixed: false },
      { id: 'eating-out', name: 'Food / Eating Out', defaultFixed: false },
      { id: 'snacks', name: 'Snacks / Drinks', defaultFixed: false },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#06b6d4',
    subcategories: [
      { id: 'college', name: 'College', defaultFixed: true },
      { id: 'books', name: 'Books / Stationery', defaultFixed: false },
      { id: 'education-misc', name: 'Education Miscellaneous', defaultFixed: false },
    ],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '💪',
    color: '#10b981',
    subcategories: [
      { id: 'gym', name: 'Gym', defaultFixed: true },
      { id: 'supplements', name: 'Protein / Supplements', defaultFixed: false },
      { id: 'health', name: 'Health', defaultFixed: false },
    ],
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: '👤',
    color: '#ec4899',
    subcategories: [
      { id: 'personal-care', name: 'Personal Care', defaultFixed: false },
      { id: 'clothes', name: 'Clothes', defaultFixed: false },
      { id: 'mobile-internet', name: 'Mobile / Internet', defaultFixed: true },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    icon: '🎉',
    color: '#f97316',
    subcategories: [
      { id: 'entertainment', name: 'Entertainment', defaultFixed: false },
      { id: 'shopping', name: 'Shopping', defaultFixed: false },
      { id: 'miscellaneous', name: 'Miscellaneous', defaultFixed: false },
    ],
  },
];

// Smart categorization keywords
export const CATEGORY_KEYWORDS = {
  'rapido-college-flat': ['rapido from college', 'rapido college to flat', 'rapido college', 'college to flat', 'ride from college'],
  'rapido-flat-college': ['rapido to college', 'rapido flat to college', 'flat to college', 'ride to college'],
  'other-transport': ['auto', 'uber', 'ola', 'metro', 'bus', 'train', 'petrol', 'fuel', 'parking'],
  'rent': ['rent', 'house rent'],
  'maid-salary': ['maid', 'maid salary', 'bai', 'helper'],
  'flat-supplies': ['flat supplies', 'broom', 'cleaning', 'detergent', 'soap', 'toilet'],
  'groceries': ['groceries', 'ration', 'rice', 'dal', 'atta', 'flour', 'oil', 'sugar', 'salt', 'grocery', 'kirana'],
  'vegetables': ['vegetables', 'sabzi', 'veggies', 'fruits', 'fruit'],
  'eating-out': ['food', 'eating out', 'restaurant', 'swiggy', 'zomato', 'dining', 'lunch', 'dinner', 'biryani', 'pizza', 'burger'],
  'snacks': ['snacks', 'drinks', 'tea', 'coffee', 'chai', 'juice', 'cold drink', 'soda', 'chips', 'biscuits'],
  'college': ['college fee', 'tuition', 'semester'],
  'books': ['book', 'stationery', 'pen', 'notebook', 'copy'],
  'gym': ['gym', 'gym fee', 'gym membership'],
  'supplements': ['protein', 'supplement', 'whey', 'creatine', 'vitamins'],
  'health': ['doctor', 'medicine', 'medical', 'hospital', 'pharmacy', 'health'],
  'personal-care': ['haircut', 'salon', 'grooming', 'skincare', 'shampoo', 'toothpaste'],
  'clothes': ['clothes', 'clothing', 'shirt', 'jeans', 'shoes', 'shoes'],
  'mobile-internet': ['mobile', 'recharge', 'internet', 'wifi', 'broadband', 'data pack', 'airtel', 'jio'],
  'entertainment': ['movie', 'netflix', 'spotify', 'game', 'subscription', 'outing'],
  'shopping': ['shopping', 'amazon', 'flipkart', 'online', 'mall'],
  'miscellaneous': ['misc', 'other', 'miscellaneous'],
};

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Other'];

export const EXPENSE_TYPES = ['Variable', 'Fixed'];

export const RECURRING_FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

/**
 * Suggest a subcategory based on description text
 */
export function suggestCategory(description) {
  if (!description) return null;
  const lower = description.toLowerCase().trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const [subcatId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        const score = keyword.length; // Longer matches are better
        if (score > bestScore) {
          bestScore = score;
          bestMatch = subcatId;
        }
      }
    }
  }

  if (!bestMatch) return null;

  // Find the parent category
  for (const cat of DEFAULT_CATEGORIES) {
    const subcat = cat.subcategories.find(s => s.id === bestMatch);
    if (subcat) {
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        subcategoryId: subcat.id,
        subcategoryName: subcat.name,
        isFixed: subcat.defaultFixed,
      };
    }
  }
  return null;
}

/**
 * Get a flat list of all subcategories with their parent info
 */
export function getAllSubcategories(categories = DEFAULT_CATEGORIES) {
  const result = [];
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      result.push({
        ...sub,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
      });
    }
  }
  return result;
}

/**
 * Find category by ID
 */
export function getCategoryById(categoryId, categories = DEFAULT_CATEGORIES) {
  return categories.find(c => c.id === categoryId) || null;
}

/**
 * Find subcategory by ID
 */
export function getSubcategoryById(subcategoryId, categories = DEFAULT_CATEGORIES) {
  for (const cat of categories) {
    const sub = cat.subcategories.find(s => s.id === subcategoryId);
    if (sub) return { ...sub, categoryId: cat.id, categoryName: cat.name, categoryIcon: cat.icon, categoryColor: cat.color };
  }
  return null;
}
