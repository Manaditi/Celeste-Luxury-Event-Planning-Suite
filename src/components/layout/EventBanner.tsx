import React, { useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import { 
  formatCurrency, 
  formatDate, 
  calculateDaysRemaining, 
  calculateBudgetMetrics 
} from '../../utils/formatters';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Sparkles, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  ShieldCheck,
  Radio
} from 'lucide-react';

export const EventBanner: React.FC = () => {
  const { currentEvent, setActiveView, setIsBudgetAdvisorOpen, isSimulationActive } = useEventContext();

  // Memoized financial calculations
  const budgetMetrics = useMemo(() => {
    return calculateBudgetMetrics(
      currentEvent.budgetTotal || 1,
      currentEvent.budgetItems || [],
      currentEvent.guestCount || 1
    );
  }, [currentEvent.budgetTotal, currentEvent.budgetItems, currentEvent.guestCount]);

  const { totalPlanned, totalCommitted, totalPaid, variance: budgetVariance, committedPercent } = budgetMetrics;

  // Memoized timeline calculations
  const timelineMetrics = useMemo(() => {
    const list = currentEvent.timeline || [];
    return {
      totalTimeline: list.length,
      completedTimeline: list.filter(t => t.status === 'completed').length,
      inProgressTimeline: list.filter(t => t.status === 'in_progress').length,
    };
  }, [currentEvent.timeline]);

  const { totalTimeline, completedTimeline, inProgressTimeline } = timelineMetrics;

  // Memoized vendor calculations
  const vendorMetrics = useMemo(() => {
    const list = currentEvent.vendors || [];
    return {
      totalVendors: list.length,
      contractedVendors: list.filter(v => 
        v.contractStatus === 'contract_signed' || v.contractStatus === 'deposit_paid' || v.contractStatus === 'fulfilled'
      ).length,
    };
  }, [currentEvent.vendors]);

  const { totalVendors, contractedVendors } = vendorMetrics;

  // Collaborator counts
  const activeCollaborators = useMemo(() => {
    return (currentEvent.collaborators || []).filter(c => c.status !== 'away');
  }, [currentEvent.collaborators]);

  const daysRemaining = useMemo(() => {
    return calculateDaysRemaining(currentEvent.date);
  }, [currentEvent.date]);

  return (
    <section className="bg-[#FAF8F5] border-b border-[#B4863A]/20 pt-8 pb-6 transition-all">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ROW 1: EDITORIAL TITLE & UNBOXED METADATA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-stone-200/70">
          <div className="max-w-3xl">
            {/* Unboxed Metadata Strip (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center text-xs tracking-wider uppercase font-medium text-charcoal-500 mb-2.5 gap-x-3 gap-y-1">
              <span className="text-[#946A29] font-serif italic normal-case text-sm">
                {currentEvent.type === 'wedding' ? 'Bespoke Nuptials' : currentEvent.type === 'birthday' ? 'Milestone Celebration' : 'Curated Gala'}
              </span>
              <span className="text-stone-300">/</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B4863A]" />
                <span className="font-mono tabular-nums">{formatDate(currentEvent.date)}</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B4863A]" />
                <span>{currentEvent.location}</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#B4863A]" />
                <span className="font-mono tabular-nums">{currentEvent.guestCount}</span>
                <span>Guests</span>
              </span>
              <span className="text-stone-300">·</span>
              <span className="font-mono tabular-nums text-[#946A29] font-semibold">
                {daysRemaining} Days Out
              </span>
            </div>

            {/* Event Display Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-charcoal-900 tracking-tight leading-tight">
              {currentEvent.title}
            </h1>

            {/* Editorial Subtitle Narrative */}
            <p className="mt-2 text-sm sm:text-base text-charcoal-600 font-light leading-relaxed max-w-2xl">
              {currentEvent.subtitle}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-3 self-start lg:self-end">
            <button
              onClick={() => setIsBudgetAdvisorOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-[#F4EFEA] border border-[#B4863A]/30 rounded-sm text-xs text-charcoal-800 font-medium transition-all shadow-sm hover:border-[#B4863A] group"
              title="Run AI budget variance audit & negotiation levers"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B4863A] group-hover:rotate-12 transition-transform" />
              <span>AI Budget Advisor</span>
              <ArrowUpRight className="w-3 h-3 text-charcoal-400" />
            </button>
            <button
              onClick={() => setActiveView('timeline')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-[#F4EFEA] border border-stone-200/80 rounded-sm text-xs text-charcoal-700 font-medium transition-all shadow-sm hover:border-[#B4863A]/40"
            >
              <Clock className="w-3.5 h-3.5 text-[#946A29]" />
              <span>Master Schedule</span>
            </button>
          </div>
        </div>

        {/* ROW 2: 4-STAT METRIC STRIP WITH TABULAR NUMERALS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* STAT 1: BUDGET PROGRESSION & VARIANCE */}
          <div 
            onClick={() => setActiveView('budget')}
            className="p-4 bg-white/80 hover:bg-white rounded-sm border border-stone-200/80 hover:border-[#B4863A]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-medium text-charcoal-500">Budget Portfolio</span>
              <DollarSign className="w-4 h-4 text-[#B4863A] group-hover:scale-110 transition-transform" />
            </div>
            
            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-charcoal-900">
                  ${totalCommitted.toLocaleString()}
                </span>
                <span className="text-xs text-charcoal-400 font-mono ml-1.5">
                  / ${totalPlanned.toLocaleString()}
                </span>
              </div>
              <span className={`text-xs font-mono tabular-nums font-medium ${
                budgetVariance > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {budgetVariance > 0 ? `+$${budgetVariance.toLocaleString()}` : 'On Target'}
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  budgetVariance > 0 ? 'bg-amber-600' : 'bg-gradient-to-r from-[#B4863A] to-[#946A29]'
                }`}
                style={{ width: `${committedPercent}%` }}
              />
            </div>
            
            <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-500 font-light">
              <span>{committedPercent}% Committed</span>
              <span className="font-mono tabular-nums">${totalPaid.toLocaleString()} Paid</span>
            </div>
          </div>

          {/* STAT 2: RUN-OF-SHOW MILESTONES */}
          <div 
            onClick={() => setActiveView('timeline')}
            className="p-4 bg-white/80 hover:bg-white rounded-sm border border-stone-200/80 hover:border-[#B4863A]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-medium text-charcoal-500">Run-of-Show Milestones</span>
              <Clock className="w-4 h-4 text-[#946A29] group-hover:scale-110 transition-transform" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-charcoal-900">
                  {completedTimeline}
                </span>
                <span className="text-xs text-charcoal-400 font-mono ml-1.5">
                  / {totalTimeline} Complete
                </span>
              </div>
              <span className="text-xs font-mono text-[#946A29] font-medium">
                {inProgressTimeline > 0 ? `${inProgressTimeline} In Flight` : 'Synchronized'}
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8F5B34] to-[#B4863A] transition-all duration-500"
                style={{ width: `${totalTimeline > 0 ? (completedTimeline / totalTimeline) * 100 : 0}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-500 font-light">
              <span>{totalTimeline - completedTimeline} Remaining</span>
              <span className="font-mono">Minute-by-minute day-of</span>
            </div>
          </div>

          {/* STAT 3: VENDOR PROCUREMENT & CONTRACTS */}
          <div 
            onClick={() => setActiveView('vendors')}
            className="p-4 bg-white/80 hover:bg-white rounded-sm border border-stone-200/80 hover:border-[#B4863A]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-medium text-charcoal-500">Procurement & Vendors</span>
              <ShieldCheck className="w-4 h-4 text-[#B4863A] group-hover:scale-110 transition-transform" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-charcoal-900">
                  {contractedVendors}
                </span>
                <span className="text-xs text-charcoal-400 font-mono ml-1.5">
                  / {totalVendors} Locked
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-medium">
                {Math.round((contractedVendors / (totalVendors || 1)) * 100)}% Secured
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="mt-3 w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${totalVendors > 0 ? (contractedVendors / totalVendors) * 100 : 0}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-500 font-light">
              <span>AI Outreach Generator</span>
              <span>Deliverables Tracked</span>
            </div>
          </div>

          {/* STAT 4: LIVE COLLABORATIVE PRESENCE */}
          <div 
            onClick={() => setActiveView('team')}
            className="p-4 bg-white/80 hover:bg-white rounded-sm border border-stone-200/80 hover:border-[#B4863A]/50 transition-all cursor-pointer group shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] uppercase tracking-wider font-medium text-charcoal-500">Collaborative Team</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <Radio className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div>
                <span className="font-mono text-xl sm:text-2xl font-semibold tabular-nums text-charcoal-900">
                  {activeCollaborators.length}
                </span>
                <span className="text-xs text-charcoal-400 font-mono ml-1.5">
                  / {currentEvent.collaborators?.length || 5} Active
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-medium">
                {isSimulationActive ? 'Real-time Sync' : 'Paused'}
              </span>
            </div>

            {/* Collaborator Avatars Preview */}
            <div className="mt-3 flex items-center -space-x-1.5 overflow-hidden">
              {currentEvent.collaborators?.map((c) => (
                <img
                  key={c.id}
                  src={c.avatar}
                  alt={c.name}
                  title={`${c.name} (${c.role}) · ${c.status}`}
                  className="w-5 h-5 rounded-full ring-2 ring-white object-cover border border-[#B4863A]/30"
                />
              ))}
              <span className="text-[10px] text-charcoal-400 font-mono pl-2">
                Audit Feed Active
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-500 font-light">
              <span className="truncate max-w-[160px]">Elena, Julian, Marcus</span>
              <span className="text-[#946A29] font-medium group-hover:underline">Open Room →</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
