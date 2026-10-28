import React, { useState, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import { generateBudgetAdvisorApi } from '../../services/api';
import { BudgetAdvisorResponse } from '../../types';
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  Zap
} from 'lucide-react';

export const BudgetAdvisorModal: React.FC = () => {
  const { currentEvent, isBudgetAdvisorOpen, setIsBudgetAdvisorOpen } = useEventContext();

  const [isLoading, setIsLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<BudgetAdvisorResponse | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isBudgetAdvisorOpen && !isLoading) {
        setIsBudgetAdvisorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBudgetAdvisorOpen, isLoading, setIsBudgetAdvisorOpen]);

  useEffect(() => {
    if (isBudgetAdvisorOpen) {
      fetchAdvisorReport();
    }
  }, [isBudgetAdvisorOpen, currentEvent.id]);

  if (!isBudgetAdvisorOpen) return null;

  const fetchAdvisorReport = async () => {
    setIsLoading(true);
    try {
      const res = await generateBudgetAdvisorApi({
        eventTitle: currentEvent.title,
        eventType: currentEvent.type,
        budgetTotal: currentEvent.budgetTotal,
        guestCount: currentEvent.guestCount,
        budgetItems: currentEvent.budgetItems,
      });
      setAdvisorData(res);
    } catch (err) {
      console.error('Failed to run budget advisor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const riskBadge = (risk: 'low' | 'medium' | 'high') => {
    const map = {
      low: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      medium: 'text-amber-800 bg-amber-50 border-amber-200',
      high: 'text-rose-800 bg-rose-50 border-rose-200',
    };
    return (
      <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${map[risk]}`}>
        {risk} Risk
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-modal-title"
      aria-describedby="advisor-modal-desc"
    >
      <div className="bg-white border border-[#B4863A]/40 w-full max-w-3xl rounded-sm shadow-luxury-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-charcoal-900 flex items-center justify-center border border-[#B4863A]/40" aria-hidden="true">
              <Sparkles className="w-4 h-4 text-[#B4863A]" />
            </div>
            <div>
              <h3 id="advisor-modal-title" className="font-serif text-xl font-semibold text-charcoal-900">
                AI Fiduciary Budget Advisor
              </h3>
              <p id="advisor-modal-desc" className="text-xs text-charcoal-500 font-light">
                Autonomous financial risk modeling & vendor negotiation levers via Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBudgetAdvisorOpen(false)}
            aria-label="Close dialog"
            className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B4863A] rounded"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center space-y-3" role="status" aria-live="polite">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#B4863A]" aria-hidden="true" />
            <h4 className="font-serif text-base text-charcoal-900">
              Analyzing Portfolio Allocations...
            </h4>
            <p className="text-xs text-charcoal-400 font-mono">
              Evaluating category commitments, per-guest metrics, and contract liabilities
            </p>
          </div>
        )}

        {/* Content Report */}
        {!isLoading && advisorData && (
          <div className="mt-6 space-y-6 animate-in fade-in">
            
            {/* Top Stat Row: Health Score & Executive Summary */}
            <div className="p-5 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F4EFEA] border border-[#B4863A]/30 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="max-w-lg">
                <span className="text-[10px] uppercase tracking-widest text-[#946A29] font-semibold block mb-1">
                  Executive Fiduciary Summary
                </span>
                <p className="text-xs sm:text-sm text-charcoal-700 font-light leading-relaxed">
                  {advisorData.summary}
                </p>
              </div>

              {/* Health Score Gauge */}
              <div className="shrink-0 text-center p-3 bg-white rounded border border-stone-200 shadow-2xs min-w-[120px]" aria-label={`Health Index: ${advisorData.healthScore} out of 100`}>
                <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">
                  Health Index
                </span>
                <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-[#B4863A]">
                  {advisorData.healthScore}<span className="text-xs text-charcoal-400">/100</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium font-mono">
                  Fiduciary Stable
                </span>
              </div>
            </div>

            {/* Category Variance Alerts */}
            {advisorData.varianceAlerts?.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-3 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  <span>Category Variance & Exposure Alerts</span>
                </h4>
                <div className="space-y-3">
                  {advisorData.varianceAlerts.map((alert, idx) => (
                    <div key={idx} className="p-4 bg-white border border-stone-200 rounded text-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-semibold text-charcoal-900 text-sm">
                          {alert.category}
                        </span>
                        {riskBadge(alert.risk)}
                      </div>

                      <div className="mt-1 flex items-center space-x-3 text-xs font-mono text-charcoal-500">
                        <span>Planned: <strong className="text-charcoal-800">${alert.planned.toLocaleString()}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Committed: <strong className="text-charcoal-800">${alert.committed.toLocaleString()}</strong></span>
                      </div>

                      <p className="mt-2 text-xs text-charcoal-600 font-light leading-relaxed bg-[#FAF8F5] p-2.5 rounded border border-stone-100">
                        Recommendation: {alert.advice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Cost Saving Levers */}
            {advisorData.costSavingLevers?.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-charcoal-700 mb-3 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#B4863A]" aria-hidden="true" />
                  <span>Cost Optimization Trade-Offs</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {advisorData.costSavingLevers.map((lever, idx) => (
                    <div key={idx} className="p-4 bg-[#FAF8F5]/60 border border-[#B4863A]/30 rounded flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h5 className="font-serif text-sm font-semibold text-charcoal-900">
                            {lever.title}
                          </h5>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 ml-2">
                            +${lever.potentialSaving.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-600 font-light mt-2 leading-relaxed">
                          {lever.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] text-[#8F5B34] font-light italic">
                        Trade-Off: {lever.tradeOff}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor Negotiation Levers */}
            {advisorData.negotiationPointers?.length > 0 && (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded">
                <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold block mb-2">
                  Tactical Vendor Negotiation Directives:
                </span>
                <ul className="space-y-1.5 text-xs text-charcoal-700 font-light">
                  {advisorData.negotiationPointers.map((pointer, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-[#B4863A] font-bold" aria-hidden="true">·</span>
                      <span>{pointer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={fetchAdvisorReport}
                className="flex items-center space-x-1.5 text-xs text-[#946A29] hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-[#B4863A] rounded px-1"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>Re-run Analysis</span>
              </button>

              <button
                onClick={() => setIsBudgetAdvisorOpen(false)}
                className="px-5 py-2 bg-charcoal-900 hover:bg-[#2A2421] text-white text-xs font-medium uppercase tracking-wider rounded focus:outline-none focus:ring-2 focus:ring-[#B4863A]"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
