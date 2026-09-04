/**
 * Format amount as Indian Rupees
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount with decimals
 */
export function formatCurrencyDecimal(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date as "04 Sep"
 */
export function formatDateShort(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/**
 * Format date as "04 Sep 2026"
 */
export function formatDateFull(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Format as "September 2026"
 */
export function formatMonth(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Format as "Sep 2026"
 */
export function formatMonthShort(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/**
 * Format percentage
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

/**
 * Format date as YYYY-MM-DD for input fields
 */
export function formatDateInput(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as DD/MM/YYYY for Google Sheets
 */
export function formatDateForSheet(dateStr) {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get month key "YYYY-MM" from a date
 */
export function getMonthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get the month label "September 2026" from a month key "2026-09"
 */
export function getMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return formatMonth(date);
}

/**
 * Parse a month key to year and month
 */
export function parseMonthKey(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month: month - 1 }; // month is 0-indexed
}

/**
 * Get previous month key
 */
export function getPrevMonthKey(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month - 1, 1);
  return getMonthKey(d);
}

/**
 * Get next month key
 */
export function getNextMonthKey(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  const d = new Date(year, month + 1, 1);
  return getMonthKey(d);
}

/**
 * Get number of days in a month
 */
export function getDaysInMonth(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get start of month date
 */
export function getMonthStartDate(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(year, month, 1);
}

/**
 * Get relative time string "2 minutes ago"
 */
export function timeAgo(date) {
  const now = new Date();
  const d = date instanceof Date ? date : new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDateFull(d);
}

/**
 * Get day of week name
 */
export function getDayName(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
}
