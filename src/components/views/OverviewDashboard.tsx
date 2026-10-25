import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckSquare, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Eye, 
  Copy, 
  Check, 
  Flame, 
  Wine, 
  Music, 
  Feather,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { 
    currentEvent, 
    setActiveView, 
    setIsGeneratorOpen, 
    setIsBudgetAdvisorOpen, 
    setSelectedVendorForInquiry, 
    toggleTimelineStatus,
    triggerSimulatedAction
  } = useEventContext();

  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Immediate upcoming timeline items
  const upcomingItems = (currentEvent.timeline || [])
    .filter(t => t.status !== 'completed')
    .slice(0, 4);

  // Key budget items
  const keyBudgetItems = (currentEvent.budgetItems || [])
    .slice()
    .sort((a, b) => b.committedAmount - a.committedAmount)
    .slice(0, 5);

  const totalCommitted = currentEvent.budgetItems?.reduce((sum, item) => sum + item.committedAmount, 0) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* SECTION 1: EDITORIAL AESTHETIC HIGHLIGHT & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Artistic Vision & Narrative Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white via-[#FAF8F5] to-[#F4EFEA] border border-[#B4863A]/30 p-6 sm:p-8 rounded-sm shadow-luxury relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#B4863A]/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#946A29] font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" />
            <span>Editorial Concept & Direction</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-charcoal-900 font-normal leading-snug">
            "{currentEvent.themeDescription}"
          </h2>

          {/* Palette Swatches with click-to-copy */}
          <div className="mt-6 pt-6 border-t border-[#B4863A]/20">
            <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block mb-3">
              Curated Swatch Palette · Click to Copy Hex
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {currentEvent.palette?.map((c, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(c.hex)}
                  className="flex flex-col text-left p-2 rounded bg-white/70 hover:bg-white border border-stone-200/80 hover:border-[#B4863A]/60 transition-all group shadow-2xs"
                  title={`Click to copy ${c.hex}`}
                >
                  <div 
                    className="w-full h-10 rounded-xs mb-2 border border-black/10 transition-transform group-hover:scale-[1.02] shadow-inner"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-xs font-serif font-medium text-charcoal-900 truncate">
                    {c.name}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-charcoal-400">
                    <span>{c.hex}</span>
                    {copiedHex === c.hex ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('timeline')}
              className="flex items-center space-x-2 px-4 py-2 bg-charcoal-900 hover:bg-[#2A2421] text-[#FAF8F5] text-xs font-medium uppercase tracking-wider rounded-sm transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#B4863A]" />
              <span>Open Master Run-of-Show</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsBudgetAdvisorOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F4EFEA] border border-[#B4863A]/40 text-charcoal-800 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" />
              <span>Run AI Fiduciary Audit</span>
            </button>
            <button
              onClick={() => setActiveView('creative')}
              className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-[#F4EFEA] border border-stone-200/80 text-charcoal-700 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors"
            >
              <Feather className="w-3.5 h-3.5 text-[#946A29]" />
              <span>Explore Sensory Moodboard</span>
            </button>
          </div>
        </div>

        {/* Sensory Motifs Preview Card */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs uppercase tracking-widest font-semibold text-charcoal-800">
                Sensory & Atmosphere Architecture
              </span>
              <button 
                onClick={() => setActiveView('creative')}
                className="text-[11px] text-[#946A29] hover:underline flex items-center space-x-1"
              >
                <span>Full Concept</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-start space-x-3">
                <Flame className="w-4 h-4 text-[#B4863A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">Olfactory Aroma</span>
                  <p className="text-xs text-charcoal-700 font-light leading-relaxed mt-0.5">
                    {currentEvent.sensoryMotifs?.aroma}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Sparkles className="w-4 h-4 text-[#946A29] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">Illumination</span>
                  <p className="text-xs text-charcoal-700 font-light leading-relaxed mt-0.5">
                    {currentEvent.sensoryMotifs?.lighting}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Wine className="w-4 h-4 text-[#8F5B34] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">Tactile Textures</span>
                  <p className="text-xs text-charcoal-700 font-light leading-relaxed mt-0.5">
                    {currentEvent.sensoryMotifs?.tactile}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Music className="w-4 h-4 text-[#1C1917] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block">Acoustic Soundscape</span>
                  <p className="text-xs text-charcoal-700 font-light leading-relaxed mt-0.5">
                    {currentEvent.sensoryMotifs?.soundscape}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-500">
            <span>{currentEvent.menuPairings?.length || 4} Gastronomy Courses</span>
            <span className="font-mono text-[#946A29]">Sommelier Paired</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: RUN-OF-SHOW SCHEDULE & BUDGET LEDGER PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Run-of-Show Milestones Card */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                Immediate Run-of-Show Milestones
              </h3>
              <p className="text-xs text-charcoal-500 font-light mt-0.5">
                Click status marker to cycle pending / in progress / complete
              </p>
            </div>
            <button
              onClick={() => setActiveView('timeline')}
              className="text-xs text-[#946A29] hover:text-[#B4863A] font-medium flex items-center space-x-1"
            >
              <span>View All ({currentEvent.timeline?.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {upcomingItems.map((item) => {
              const statusColors = {
                pending: 'text-stone-400 bg-stone-50 border-stone-200',
                in_progress: 'text-amber-800 bg-amber-50 border-amber-200',
                completed: 'text-emerald-800 bg-emerald-50 border-emerald-200',
                delayed: 'text-rose-800 bg-rose-50 border-rose-200',
              };

              return (
                <div key={item.id} className="py-3.5 flex items-start justify-between group">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTimelineStatus(item.id)}
                      className={`mt-0.5 text-xs px-2 py-0.5 rounded border font-mono uppercase tracking-wider transition-colors ${statusColors[item.status]}`}
                      title="Click to toggle status"
                    >
                      {item.status.replace('_', ' ')}
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-charcoal-900 group-hover:text-[#946A29] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-charcoal-500 font-light line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-[10px] text-charcoal-400 font-mono">
                        <span className="text-[#946A29]">{item.time}</span>
                        <span>·</span>
                        <span>{item.location}</span>
                        <span>·</span>
                        <span>{item.ownerRole}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-charcoal-500">
            <span>Dual-view: Months Out + Day-of minute-by-minute</span>
            <button
              onClick={() => setActiveView('timeline')}
              className="font-medium text-[#946A29] hover:underline"
            >
              Add Timeline Item +
            </button>
          </div>
        </div>

        {/* Top Budget Allocations Card */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                Key Budget Allocations
              </h3>
              <p className="text-xs text-charcoal-500 font-light mt-0.5">
                Top line items sorted by committed capital
              </p>
            </div>
            <button
              onClick={() => setActiveView('budget')}
              className="text-xs text-[#946A29] hover:text-[#B4863A] font-medium flex items-center space-x-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {keyBudgetItems.map((item) => {
              const itemPercent = Math.round((item.committedAmount / totalCommitted) * 100);
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate max-w-[280px]">
                      <span className="font-medium text-charcoal-900">{item.name}</span>
                      <span className="text-[10px] text-charcoal-400 ml-2">({item.category})</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono tabular-nums font-semibold text-charcoal-900">
                        ${item.committedAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono text-charcoal-400 ml-1.5">
                        ({itemPercent}%)
                      </span>
                    </div>
                  </div>
                  
                  {/* Visual Bar */}
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#B4863A] rounded-full"
                      style={{ width: `${itemPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <div className="text-xs text-charcoal-500 font-mono">
              Committed: <span className="font-semibold text-charcoal-900">${totalCommitted.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setIsBudgetAdvisorOpen(true)}
              className="text-xs text-[#946A29] hover:underline font-medium flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-[#B4863A]" />
              <span>AI Cost Levers</span>
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 3: VENDORS SNAPSHOT & LIVE COLLABORATIVE AUDIT TICKER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Preferred Vendors Snapshot */}
        <div className="lg:col-span-2 bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-lg font-semibold text-charcoal-900">
                Secured Vendor Directory
              </h3>
              <p className="text-xs text-charcoal-500 font-light mt-0.5">
                Contract statuses, contacts, and one-click GenAI inquiries
              </p>
            </div>
            <button
              onClick={() => setActiveView('vendors')}
              className="text-xs text-[#946A29] hover:text-[#B4863A] font-medium flex items-center space-x-1"
            >
              <span>All Vendors ({currentEvent.vendors?.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentEvent.vendors?.slice(0, 4).map((vendor) => (
              <div 
                key={vendor.id}
                className="p-3.5 border border-stone-200/80 rounded bg-[#FAF8F5]/50 hover:bg-white hover:border-[#B4863A]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#946A29] font-medium">
                      {vendor.category}
                    </span>
                    <span className="text-[10px] font-mono capitalize px-1.5 py-0.5 rounded bg-white border border-stone-200 text-charcoal-600">
                      {vendor.contractStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-serif text-sm font-semibold text-charcoal-900 mt-1">
                    {vendor.companyName}
                  </h4>
                  <p className="text-xs text-charcoal-500 font-light mt-0.5">
                    {vendor.contactName} · {vendor.email}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
                  <span className="font-mono text-xs tabular-nums text-charcoal-800 font-semibold">
                    ${vendor.costEstimate.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedVendorForInquiry(vendor)}
                    className="text-[11px] text-[#946A29] hover:text-[#B4863A] font-medium flex items-center space-x-1 px-2 py-0.5 rounded bg-white border border-[#B4863A]/30 hover:border-[#B4863A]"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Draft Inquiry</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Collaborative Activity Ticker */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-serif text-base font-semibold text-charcoal-900">
                  Live Team Audit Feed
                </h3>
              </div>
              <button
                onClick={() => triggerSimulatedAction()}
                className="text-[10px] font-mono text-[#946A29] hover:text-[#B4863A] px-2 py-0.5 rounded border border-[#B4863A]/30 hover:border-[#B4863A]"
                title="Trigger simulated collaborator update"
              >
                + Simulate Action
              </button>
            </div>

            <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-stone-50">
              {currentEvent.activityLogs?.slice(0, 4).map((log) => (
                <div key={log.id} className="pt-2.5 first:pt-0">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-charcoal-900">{log.authorName}</span>
                    <span className="text-charcoal-400 font-mono">{log.timestamp}</span>
                  </div>
                  <span className="text-[10px] text-[#946A29] font-light block">{log.authorRole}</span>
                  <p className="text-xs text-charcoal-600 font-light mt-1 leading-relaxed">
                    {log.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100">
            <button
              onClick={() => setActiveView('team')}
              className="w-full py-2 text-center text-xs text-charcoal-800 bg-[#FAF8F5] hover:bg-[#F4EFEA] border border-stone-200/80 rounded font-medium flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#B4863A]" />
              <span>Join Live Team Room</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
