import { describe, it, expect } from 'vitest';

describe('Financial Calculations & Fiduciary Ledger Metrics', () => {
  it('correctly aggregates planned, committed, and paid amounts', () => {
    const budgetItems = [
      { id: '1', plannedAmount: 50000, committedAmount: 52000, paidAmount: 26000 },
      { id: '2', plannedAmount: 30000, committedAmount: 28000, paidAmount: 14000 },
      { id: '3', plannedAmount: 20000, committedAmount: 20000, paidAmount: 20000 },
    ];

    const totalPlanned = budgetItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalCommitted = budgetItems.reduce((sum, item) => sum + item.committedAmount, 0);
    const totalPaid = budgetItems.reduce((sum, item) => sum + item.paidAmount, 0);

    expect(totalPlanned).toBe(100000);
    expect(totalCommitted).toBe(100000);
    expect(totalPaid).toBe(60000);
  });

  it('calculates variance accurately for over-budget and surplus states', () => {
    const plannedTarget = 200000;
    
    // Over-budget scenario
    const committedOver = 215000;
    const varianceOver = committedOver - plannedTarget;
    expect(varianceOver).toBe(15000);
    expect(varianceOver > 0).toBe(true);

    // Surplus scenario
    const committedUnder = 185000;
    const varianceUnder = committedUnder - plannedTarget;
    expect(varianceUnder).toBe(-15000);
    expect(varianceUnder <= 0).toBe(true);
  });

  it('calculates per-guest allocation and guards against division by zero', () => {
    const totalCommitted = 180000;
    
    const calculatePerGuest = (total: number, count: number) => {
      const safeCount = Math.max(1, count || 1);
      return Math.round(total / safeCount);
    };

    expect(calculatePerGuest(totalCommitted, 180)).toBe(1000);
    expect(calculatePerGuest(totalCommitted, 0)).toBe(totalCommitted); // safe fallback
    expect(calculatePerGuest(totalCommitted, -10)).toBe(totalCommitted);
  });

  it('calculates fiduciary health score clamped between 30 and 98', () => {
    const calculateHealthScore = (totalBudget: number, totalCommitted: number) => {
      const variance = totalCommitted - totalBudget;
      return Math.max(30, Math.min(98, Math.round(100 - (Math.abs(variance) / (totalBudget || 1)) * 100)));
    };

    // Exactly on budget
    expect(calculateHealthScore(200000, 200000)).toBe(98);

    // Minor 5% variance
    expect(calculateHealthScore(100000, 105000)).toBe(95);

    // Catastrophic 80% overrun -> clamped to 30
    expect(calculateHealthScore(100000, 180000)).toBe(30);
  });

  it('clamps committed percentage between 0 and 100 for visual progress bars', () => {
    const calculatePercent = (committed: number, planned: number) => {
      if (planned <= 0) return 0;
      return Math.min(100, Math.max(0, Math.round((committed / planned) * 100)));
    };

    expect(calculatePercent(50000, 100000)).toBe(50);
    expect(calculatePercent(150000, 100000)).toBe(100);
    expect(calculatePercent(-1000, 100000)).toBe(0);
  });
});
