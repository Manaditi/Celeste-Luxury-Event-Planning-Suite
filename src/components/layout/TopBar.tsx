import React, { useState, useRef, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import { 
  Sparkles, 
  ChevronDown, 
  Key, 
  RotateCcw, 
  Layers, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckSquare, 
  Compass, 
  Radio
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    events, 
    currentEvent, 
    currentEventId, 
    selectEvent, 
    activeView, 
    setActiveView, 
    setIsGeneratorOpen, 
    setIsApiKeyModalOpen, 
    resetToBenchmarks,
    isSimulationActive 
  } = useEventContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  interface NavItem {
    id: 'overview' | 'timeline' | 'budget' | 'vendors' | 'creative' | 'team';
    label: string;
    icon: any;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'timeline', label: 'Timeline & Run-of-Show', icon: Calendar },
    { id: 'budget', label: 'Budget Ledger', icon: DollarSign },
    { id: 'vendors', label: 'Vendor Directory', icon: CheckSquare },
    { id: 'creative', label: 'Creative Concepts', icon: Compass },
    { id: 'team', label: 'Live Team Room', icon: Users, badge: isSimulationActive ? 'Live' : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#B4863A]/20 transition-all">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ZONE 1: BRAND & EVENT SELECTOR */}
          <div className="flex items-center space-x-6 min-w-[340px]">
            {/* Brand Logo & Editorial Monogram */}
            <div className="flex items-center space-x-3.5 group cursor-pointer" onClick={() => setActiveView('overview')}>
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#1C1917] via-[#2A2421] to-[#3B2F2F] flex items-center justify-center border border-[#B4863A]/40 shadow-sm group-hover:border-[#B4863A] transition-colors">
                <span className="font-serif italic text-lg text-[#F4EFEA] tracking-wider">C</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-serif text-xl tracking-[0.2em] font-semibold text-charcoal-900 uppercase">CÉLESTE</span>
                  <span className="text-[10px] tracking-widest text-[#B4863A] uppercase font-medium">Haute Suite</span>
                </div>
                <span className="text-[11px] text-charcoal-500 tracking-wider uppercase font-light">GenAI Orchestration</span>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-charcoal-300/40 hidden sm:block" />

            {/* Event Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 text-left py-1.5 px-3 rounded hover:bg-[#F4EFEA] transition-colors border border-transparent hover:border-[#B4863A]/25"
                title="Switch active event portfolio"
              >
                <div className="max-w-[180px] sm:max-w-[220px]">
                  <p className="text-[10px] uppercase tracking-wider text-[#946A29] font-medium leading-none">
                    {currentEvent.type === 'wedding' ? 'Luxury Wedding' : currentEvent.type === 'birthday' ? 'Milestone Gala' : 'Community Festival'}
                  </p>
                  <p className="font-serif text-sm font-semibold text-charcoal-900 truncate mt-0.5">
                    {currentEvent.title}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-charcoal-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#B4863A]' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white border border-[#B4863A]/30 shadow-luxury-lg rounded-sm py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-charcoal-500 font-semibold">Active Portfolios</span>
                    <span className="text-[10px] font-mono text-[#B4863A]">{events.length} Events</span>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto py-1 divide-y divide-stone-50">
                    {events.map((ev) => {
                      const isSelected = ev.id === currentEventId;
                      return (
                        <button
                          key={ev.id}
                          onClick={() => {
                            selectEvent(ev.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-center justify-between ${
                            isSelected 
                              ? 'bg-[#FAF8F5] border-l-2 border-[#B4863A]' 
                              : 'hover:bg-stone-50'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className={`font-serif text-xs font-semibold ${isSelected ? 'text-[#946A29]' : 'text-charcoal-900'}`}>
                              {ev.title}
                            </p>
                            <p className="text-[11px] text-charcoal-500 truncate mt-0.5 font-light">
                              {ev.location.split(',')[0]} · <span className="font-mono tabular-nums">{ev.guestCount}</span> guests
                            </p>
                          </div>
                          <span className="font-mono text-xs tabular-nums text-charcoal-600 font-medium">
                            ${(ev.budgetTotal / 1000).toFixed(0)}k
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-stone-100 bg-[#FAF8F5]/60 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setIsGeneratorOpen(true);
                      }}
                      className="text-xs font-medium text-[#946A29] hover:text-[#B4863A] flex items-center space-x-1.5 px-2 py-1 rounded transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" />
                      <span>+ Create with AI</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (confirm('Reset to the 3 benchmark luxury events?')) {
                          resetToBenchmarks();
                        }
                      }}
                      className="text-[11px] text-charcoal-400 hover:text-charcoal-700 flex items-center space-x-1 px-1.5 py-1"
                      title="Reset default benchmarks"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 2: NAVIGATION SEGMENTED TABS */}
          <nav className="hidden lg:flex items-center space-x-1 border border-[#B4863A]/20 bg-[#F4EFEA]/60 p-1 rounded-sm shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-sm text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-charcoal-900 shadow-sm border border-[#B4863A]/30 font-semibold'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B4863A]' : 'text-charcoal-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="flex items-center space-x-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-700 font-mono tracking-tight uppercase">{item.badge}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: PRIMARY CTAS & SETTINGS */}
          <div className="flex items-center space-x-3">
            {/* Quick Team Status indicator */}
            <div 
              onClick={() => setActiveView('team')}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 text-xs rounded border border-stone-200/80 bg-white/70 hover:bg-white hover:border-[#B4863A]/40 transition-colors cursor-pointer"
              title="Open Live Multi-User Team Room"
            >
              <Radio className={`w-3 h-3 ${isSimulationActive ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`} />
              <span className="text-charcoal-700 font-medium">Team Room</span>
              <span className="text-[11px] font-mono tabular-nums text-charcoal-500">
                ({currentEvent.collaborators?.filter(c => c.status !== 'away').length || 4}/5 active)
              </span>
            </div>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-2 text-charcoal-500 hover:text-[#946A29] hover:bg-[#F4EFEA] rounded border border-transparent hover:border-[#B4863A]/30 transition-all"
              title="Configure Gemini API Settings"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Primary CTA: Generate New Event with AI */}
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-charcoal-900 hover:bg-[#2A2421] text-[#FAF8F5] text-xs font-medium tracking-wider uppercase rounded-sm border border-[#B4863A]/40 shadow-sm hover:border-[#B4863A] transition-all group"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B4863A] group-hover:scale-110 transition-transform" />
              <span>New Event / AI Plan</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row (visible on small/medium screens) */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-2 border-t border-[#B4863A]/15 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-charcoal-900 text-[#FAF8F5] font-semibold'
                    : 'text-charcoal-600 bg-white/60 hover:bg-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
