/**
 * Generate unique expense ID: EXP-YYYYMMDD-XXX
 */
let counter = 0;

export function generateExpenseId() {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  
  counter++;
  const seq = String(counter).padStart(3, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `EXP-${dateStr}-${random}${seq}`;
}

/**
 * Create a new expense object with defaults
 */
export function createExpense(overrides = {}) {
  const now = new Date();
  return {
    id: generateExpenseId(),
    date: now.toISOString().split('T')[0],
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    categoryId: '',
    categoryName: '',
    subcategoryId: '',
    subcategoryName: '',
    description: '',
    amount: 0,
    paymentMethod: 'UPI',
    isFixed: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    ...overrides,
  };
}
