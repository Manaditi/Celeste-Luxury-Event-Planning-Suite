import { describe, it, expect, vi } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  calculateDaysRemaining, 
  calculateBudgetMetrics, 
  getInitials 
} from '../utils/formatters';
import { debounce, throttle, safeJsonParse } from '../utils/performance';
import { BudgetItem } from '../types';

describe('Formatters and Performance Utilities Suite', () => {
  it('formats currency with custom currencies and fractional specifications', () => {
    expect(formatCurrency(150000)).toBe('$150,000');
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(-2500)).toBe('-$2,500');
    expect(formatCurrency(undefined)).toBe('$0');
    expect(formatCurrency(NaN)).toBe('$0');
    expect(formatCurrency('invalid')).toBe('$0');
  });

  it('formats dates cleanly into editorial long-form', () => {
    const formatted = formatDate('2027-09-18');
    expect(formatted).toContain('September');
    expect(formatted).toContain('2027');

    expect(formatDate('')).toBe('TBD');
    expect(formatDate(null)).toBe('TBD');
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });

  it('calculates days remaining accurately', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const days = calculateDaysRemaining(futureDate);
    expect(days).toBeGreaterThanOrEqual(9);
    expect(days).toBeLessThanOrEqual(11);

    const pastDate = '2020-01-01';
    expect(calculateDaysRemaining(pastDate)).toBe(0);
    expect(calculateDaysRemaining('')).toBe(0);
  });

  it('calculates high-precision budget metrics and variances', () => {
    const sampleItems: BudgetItem[] = [
      {
        id: '1',
        category: 'Venue & Structure',
        name: 'Estate Buyout',
        plannedAmount: 50000,
        committedAmount: 52000,
        paidAmount: 26000,
        status: 'deposit_paid',
        notes: '',
        assignedTo: '',
      },
      {
        id: '2',
        category: 'Catering & Spirits',
        name: 'Plated Dinner',
        plannedAmount: 30000,
        committedAmount: 28000,
        paidAmount: 14000,
        status: 'contracted',
        notes: '',
        assignedTo: '',
      },
    ];

    const metrics = calculateBudgetMetrics(80000, sampleItems, 100);
    expect(metrics.totalPlanned).toBe(80000);
    expect(metrics.totalCommitted).toBe(80000);
    expect(metrics.totalPaid).toBe(40000);
    expect(metrics.variance).toBe(0);
    expect(metrics.committedPercent).toBe(100);
    expect(metrics.paidPercent).toBe(50);
    expect(metrics.costPerGuest).toBe(800);
  });

  it('generates 2-letter uppercase initials properly', () => {
    expect(getInitials('Elena Vance')).toBe('EV');
    expect(getInitials('Julian Ross')).toBe('JR');
    expect(getInitials('Cher')).toBe('CH');
    expect(getInitials('')).toBe('??');
    expect(getInitials(null)).toBe('??');
  });

  it('debounces rapid sequential function invocations', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const debounced = debounce(mockFn, 100);

    debounced();
    debounced();
    debounced();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(105);
    expect(mockFn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('throttles high-frequency function invocations', () => {
    vi.useFakeTimers();
    const mockFn = vi.fn();
    const throttled = throttle(mockFn, 100);

    throttled();
    throttled();
    throttled();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(110);
    throttled();
    expect(mockFn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('safely parses JSON with fallback guarantee', () => {
    expect(safeJsonParse('{"valid": true}', { valid: false })).toEqual({ valid: true });
    expect(safeJsonParse('invalid-json', { fallback: true })).toEqual({ fallback: true });
    expect(safeJsonParse(null, { default: 1 })).toEqual({ default: 1 });
  });
});
