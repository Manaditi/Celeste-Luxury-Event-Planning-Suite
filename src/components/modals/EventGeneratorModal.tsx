import React, { useState, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import { EventType, CelesteEvent } from '../../types';
import { generateEventPlanApi } from '../../services/api';
import { DEFAULT_COLLABORATORS } from '../../data/benchmarkEvents';
import { 
  Sparkles, 
  RefreshCw, 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

export const EventGeneratorModal: React.FC = () => {
  const { isGeneratorOpen, setIsGeneratorOpen, addNewEvent } = useEventContext();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState('2027-08-21');
  const [location, setLocation] = useState('Villa Balbiano, Lake Como, Italy');
  const [guestCount, setGuestCount] = useState<number>(140);
  const [budgetTotal, setBudgetTotal] = useState<number>(210000);
  const [vibe, setVibe] = useState('Old World Gilded Romanticism, dramatic lakeside candlelight, and bespoke opera');
  const [locationType, setLocationType] = useState('Historical Waterfront Villa');
  const [specialRequests, setSpecialRequests] = useState('Include midnight fireworks from private barge and vintage Riva boat departure');

  const [isGenerating, setIsGenerating] = useState(false);
  const [stepMessage, setStepMessage] = useState('');

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isGeneratorOpen && !isGenerating) {
        setIsGeneratorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGeneratorOpen, isGenerating, setIsGeneratorOpen]);

  if (!isGeneratorOpen) return null;

  const presets = [
    {
      label: 'Lake Como Villa Wedding',
      title: 'Villa Balbiano Renaissance Nuptials',
      type: 'wedding' as EventType,
      date: '2027-08-21',
      location: 'Villa Balbiano, Lake Como, Italy',
      locationType: 'Historical Waterfront Villa',
      guestCount: 140,
      budget: 220000,
      vibe: 'Gilded Italian Renaissance elegance, antique crystal, candlelit cypress gardens',
      special: 'Private Riva water taxi arrivals and midnight operatic fireworks',
    },
    {
      label: 'Parisian Milestone 50th Gala',
      title: 'Hôtel de Crillon Midnight Soirée',
      type: 'birthday' as EventType,
      date: '2027-11-14',
      location: 'Hôtel de Crillon, Place de la Concorde, Paris',
      locationType: 'Historical Palace Hotel',
      guestCount: 95,
      budget: 175000,
      vibe: 'Haute couture black tie, vintage champagne cellar, gypsy jazz quartet',
      special: 'Private rooftop terrace viewing of Eiffel Tower at midnight',
    },
    {
      label: 'Coastal Architectural Gala',
      title: 'Pacific Horizons Oceanographic Gala',
      type: 'community' as EventType,
      date: '2027-10-02',
      location: 'Big Sur Coastal Cliff Conservatory, Carmel, CA',
      locationType: 'Cliffside Modernist Pavilion',
      guestCount: 260,
      budget: 110000,
      vibe: 'Modern organic coastal botanical, driftwood & bronze sculptures, sustainable farm-to-table',
      special: 'Live philanthropic paddle raise for marine sanctuary conservation',
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTitle(p.title);
    setType(p.type);
    setDate(p.date);
    setLocation(p.location);
    setLocationType(p.locationType);
    setGuestCount(p.guestCount);
    setBudgetTotal(p.budget);
    setVibe(p.vibe);
    setSpecialRequests(p.special);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsGenerating(true);
    setStepMessage('Connecting to Gemini 3.8 Flash intelligence...');

    try {
      setTimeout(() => setStepMessage('Curating sensory motifs & harmonic palettes...'), 900);
      setTimeout(() => setStepMessage('Allocating fiduciary line items & vendor contracts...'), 1800);
      setTimeout(() => setStepMessage('Constructing minute-by-minute master run-of-show...'), 2700);

      const generatedPlan = await generateEventPlanApi({
        title,
        type,
        date,
        location,
        guestCount,
        budgetTotal,
        vibe,
        locationType,
        specialRequests,
      });

      const fullEvent: CelesteEvent = {
        id: `event-${Date.now()}`,
        title: generatedPlan.title || title,
        subtitle: generatedPlan.subtitle || `A curated ${type} celebration at ${location}`,
        type,
        date: generatedPlan.date || date,
        location: generatedPlan.location || location,
        guestCount: Number(guestCount) || 150,
        budgetTotal: Number(budgetTotal) || 180000,
        currency: 'USD',
        themeDescription: generatedPlan.themeDescription || vibe,
        palette: generatedPlan.palette || [
          { name: 'Warm Ivory', hex: '#FAF8F5', role: 'Canvas' },
          { name: 'Burnished Bronze', hex: '#B4863A', role: 'Metallic' },
          { name: 'Vintage Rosewood', hex: '#9E6A65', role: 'Accent' },
        ],
        sensoryMotifs: generatedPlan.sensoryMotifs || {
          aroma: 'Mediterranean neroli and beeswax pillars',
          lighting: 'Warm 2200K amber candlelight',
          tactile: 'Raw silk and Italian cotton paper',
          soundscape: 'Live classical cello and jazz quartet',
        },
        menuPairings: generatedPlan.menuPairings || [],
        budgetItems: (generatedPlan.budgetItems as any) || [],
        timeline: (generatedPlan.timeline as any) || [],
        vendors: (generatedPlan.vendors as any) || [],
        collaborators: DEFAULT_COLLABORATORS,
        activityLogs: [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            authorName: 'Céleste GenAI Engine',
            authorRole: 'System Orchestrator',
            actionType: 'plan_generated',
            detail: `Generated complete structured event plan "${title}" with ${generatedPlan.budgetItems?.length || 6} budget items and ${generatedPlan.timeline?.length || 8} milestones.`,
            badge: 'AI Plan Generated',
          },
        ],
      };

      addNewEvent(fullEvent);
      setIsGeneratorOpen(false);
    } catch (err: any) {
      console.error('Failed to generate event plan:', err);
      alert('Generation encounter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generator-modal-title"
      aria-describedby="generator-modal-desc"
    >
      <div className="bg-white border border-[#B4863A]/40 w-full max-w-2xl rounded-sm shadow-luxury-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-charcoal-900 flex items-center justify-center border border-[#B4863A]/40" aria-hidden="true">
              <Sparkles className="w-4 h-4 text-[#B4863A]" />
            </div>
            <div>
              <h3 id="generator-modal-title" className="font-serif text-xl font-semibold text-charcoal-900">
                Generate Event Plan with Gemini
              </h3>
              <p id="generator-modal-desc" className="text-xs text-charcoal-500 font-light">
                Generates complete budgets, run-of-show schedules, sensory themes & vendor matrices
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsGeneratorOpen(false)}
            disabled={isGenerating}
            aria-label="Close dialog"
            className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#B4863A] rounded"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Quick Presets Strip */}
        <div className="mt-4 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-charcoal-500 font-semibold block mb-2">
            Instant Luxury Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-3 py-1.5 rounded bg-[#FAF8F5] hover:bg-[#F4EFEA] border border-stone-200 hover:border-[#B4863A] text-charcoal-800 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-[#B4863A]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="gen-title" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Event Title
              </label>
              <input
                id="gen-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The St. Clair Estate Wedding"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>

            <div>
              <label htmlFor="gen-type" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Event Type
              </label>
              <select
                id="gen-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none bg-white focus:ring-1 focus:ring-[#B4863A]"
              >
                <option value="wedding">Luxury Wedding</option>
                <option value="birthday">Milestone Birthday / Gala</option>
                <option value="community">Community Festival / Fundraiser</option>
                <option value="corporate">Private Soirée / Corporate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gen-date" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Target Date
              </label>
              <input
                id="gen-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>

            <div>
              <label htmlFor="gen-location" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Venue Location & Region
              </label>
              <input
                id="gen-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. St. Helena, Napa Valley, CA"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="gen-guests" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Guest Count
              </label>
              <input
                id="gen-guests"
                type="number"
                required
                min={10}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>

            <div>
              <label htmlFor="gen-budget" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Total Budget ($ USD)
              </label>
              <input
                id="gen-budget"
                type="number"
                required
                step={1000}
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded font-mono focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>

            <div>
              <label htmlFor="gen-loctype" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
                Venue Archetype
              </label>
              <input
                id="gen-loctype"
                type="text"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                placeholder="e.g. Chateau Vineyards"
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gen-vibe" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
              Aesthetic Direction & Sensory Vibe
            </label>
            <textarea
              id="gen-vibe"
              rows={2}
              required
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="e.g. Old World French Riviera romanticism, weathered limestone, low candlelight..."
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
            />
          </div>

          <div>
            <label htmlFor="gen-special" className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
              Special Client Directives & Key Moments
            </label>
            <input
              id="gen-special"
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Caviar station, midnight brass fanfare, 35mm film only"
              className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none focus:ring-1 focus:ring-[#B4863A]"
            />
          </div>

          {/* Loading status progress indicator */}
          {isGenerating && (
            <div className="p-4 bg-[#FAF8F5] border border-[#B4863A]/40 rounded text-center space-y-2 animate-pulse" role="status" aria-live="polite">
              <div className="flex items-center justify-center space-x-2 text-xs font-serif font-semibold text-[#946A29]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#B4863A]" aria-hidden="true" />
                <span>{stepMessage}</span>
              </div>
              <p className="text-[10px] text-charcoal-400 font-mono">
                Structuring financial ledger and minute-by-minute timeline...
              </p>
            </div>
          )}

          {/* Footer CTAs */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-charcoal-400 font-light">
              Server-side GenAI proxy: <code className="font-mono text-[#B4863A]">gemini-3.8-flash</code>
            </span>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                disabled={isGenerating}
                className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-stone-400 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center space-x-2 px-6 py-2.5 bg-charcoal-900 hover:bg-[#2A2421] disabled:opacity-50 text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B4863A]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#B4863A]" aria-hidden="true" />
                    <span>Generate Full Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
