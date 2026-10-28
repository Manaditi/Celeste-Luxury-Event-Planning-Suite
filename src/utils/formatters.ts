import { BudgetItem, BudgetMetrics } from '../types';

/**
 * Cached NumberFormat instance for performance efficiency.
 * Avoids reconstructing Intl.NumberFormat on every render cycle.
 */
const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency = 'USD', decimals = 0): Intl.NumberFormat {
  const key = `${currency}-${decimals}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Format a numeric amount into an editorial currency string.
 * e.g., 150000 -> "$150,000"
 */
export function formatCurrency(amount: unknown, currency = 'USD', decimals = 0): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return getCurrencyFormatter(currency, decimals).format(num);
}

/**
 * Format an ISO date string into editorial long-form.
 * e.g., "2027-09-18" -> "September 18, 2027"
 */
export function formatDate(
  dateStr: unknown,
  options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
): string {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return 'TBD';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', options);
  } catch {
    return String(dateStr);
  }
}

/**
 * Calculate the integer days remaining between today and an event date.
 * Returns 0 if the date has already passed.
 */
export function calculateDaysRemaining(dateStr: unknown): number {
  if (typeof dateStr !== 'string' || !dateStr.trim()) return 0;
  try {
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return 0;
    const now = Date.now();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  } catch {
    return 0;
  }
}

/**
 * Calculate high-precision fiduciary budget metrics.
 * Memoized by callers to prevent layout thrashing and render bottlenecks.
 */
export function calculateBudgetMetrics(
  totalPlanned: number,
  items: BudgetItem[] = [],
  guestCount = 1
): BudgetMetrics {
  const planned = totalPlanned > 0 ? totalPlanned : 1;
  const committed = items.reduce((sum, item) => sum + (Number(item.committedAmount) || 0), 0);
  const paid = items.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0);
  const variance = committed - planned;
  const committedPercent = Math.min(100, Math.round((committed / planned) * 100));
  const paidPercent = Math.min(100, Math.round((paid / planned) * 100));
  const validGuests = guestCount > 0 ? guestCount : 1;
  const costPerGuest = Math.round(committed / validGuests);

  return {
    totalPlanned: planned,
    totalCommitted: committed,
    totalPaid: paid,
    variance,
    committedPercent,
    paidPercent,
    costPerGuest,
  };
}

/**
 * Generates clean 2-letter uppercase initials from a full name.
 * e.g., "Elena Vance" -> "EV"
 */
export function getInitials(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
