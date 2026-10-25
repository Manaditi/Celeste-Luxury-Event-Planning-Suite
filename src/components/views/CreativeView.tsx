import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { generateCreativeIdeasApi } from '../../services/api';
import { 
  Compass, 
  Sparkles, 
  Flame, 
  Wine, 
  Music, 
  Copy, 
  Check, 
  Send, 
  Layers, 
  Feather, 
  Eye, 
  Maximize2,
  RefreshCw
} from 'lucide-react';

export const CreativeView: React.FC = () => {
  const { currentEvent, updateEventDetails } = useEventContext();

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormTheme, setBrainstormTheme] = useState(currentEvent.title);
  const [brainstormSeason, setBrainstormSeason] = useState('Autumn Twilight');
  const [brainstormVenue, setBrainstormVenue] = useState('Historic Villa & Orangerie');
  const [brainstormNotes, setBrainstormNotes] = useState('');
  const [generatedConcept, setGeneratedConcept] = useState<any | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleGenerateIdeas = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBrainstorming(true);
    try {
      const result = await generateCreativeIdeasApi({
        theme: brainstormTheme,
        eventType: currentEvent.type,
        season: brainstormSeason,
        venueType: brainstormVenue,
        notes: brainstormNotes,
      });
      setGeneratedConcept(result);
    } catch (err) {
      console.error('Brainstorm failed:', err);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const applyGeneratedConcept = () => {
    if (!generatedConcept) return;
    updateEventDetails({
      themeDescription: generatedConcept.narrative || currentEvent.themeDescription,
      palette: generatedConcept.palette || currentEvent.palette,
      sensoryMotifs: generatedConcept.sensoryMotifs || currentEvent.sensoryMotifs,
      menuPairings: generatedConcept.menuConcepts || currentEvent.menuPairings,
    });
    alert('Concept applied to current event portfolio!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* EDITORIAL THEME HERO */}
      <div className="bg-gradient-to-br from-white via-[#FAF8F5] to-[#F4EFEA] border border-[#B4863A]/30 p-8 rounded-sm shadow-luxury relative overflow-hidden">
        <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#946A29] font-medium mb-2">
          <Compass className="w-3.5 h-3.5 text-[#B4863A]" />
          <span>Spatial & Sensory Architecture</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal-900 font-normal leading-tight max-w-4xl">
          "{currentEvent.themeDescription}"
        </h2>

        <div className="mt-4 flex items-center space-x-4 text-xs text-charcoal-500 font-light">
          <span>Venue: <strong className="font-medium text-charcoal-800">{currentEvent.location}</strong></span>
          <span>·</span>
          <span>Guest Capacity: <strong className="font-medium text-charcoal-800">{currentEvent.guestCount}</strong></span>
          <span>·</span>
          <span>Editorial Curation: <strong className="font-medium text-[#946A29]">Elena Vance & Julian Ross</strong></span>
        </div>
      </div>

      {/* PALETTE SWATCH GRID WITH CLICK-TO-COPY */}
      <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal-900">
              Harmonic Color Palette & Textiles
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              Click any swatch to copy hexadecimal value to clipboard
            </p>
          </div>
          <span className="text-xs font-mono text-[#946A29]">
            {currentEvent.palette?.length || 5} Swatches Defined
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {currentEvent.palette?.map((color, idx) => (
            <div 
              key={idx}
              onClick={() => copyToClipboard(color.hex)}
              className="bg-[#FAF8F5] border border-stone-200/80 rounded p-3 hover:border-[#B4863A] transition-all cursor-pointer group shadow-2xs"
            >
              <div 
                className="w-full h-24 rounded-xs mb-3 border border-black/10 shadow-inner group-hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: color.hex }}
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-[#946A29] font-medium">
                  {color.role}
                </span>
                <button className="text-charcoal-400 group-hover:text-charcoal-800">
                  {copiedHex === color.hex ? (
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center space-x-0.5">
                      <Check className="w-2.5 h-2.5" />
                      <span>Copied</span>
                    </span>
                  ) : (
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              </div>

              <h4 className="font-serif text-sm font-semibold text-charcoal-900 mt-1">
                {color.name}
              </h4>

              <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-charcoal-500">
                <span>{color.hex}</span>
                {color.pantone && <span className="text-[10px] text-charcoal-400">{color.pantone}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SENSORY MOTIFS 4-PILLAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Aroma & Olfactory */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#B4863A] font-semibold mb-2">
              <Flame className="w-4 h-4 text-[#B4863A]" />
              <span>Olfactory Aroma & Botanicals</span>
            </div>
            <h4 className="font-serif text-base font-semibold text-charcoal-900">
              Signature Environmental Fragrance
            </h4>
            <p className="mt-3 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              {currentEvent.sensoryMotifs?.aroma}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-charcoal-400 font-light">
            Custom hand-dipped beeswax pillars & essential neroli diffusers
          </div>
        </div>

        {/* Lighting & Illumination */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#946A29] font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#946A29]" />
              <span>Lux Calibration & Shadow</span>
            </div>
            <h4 className="font-serif text-base font-semibold text-charcoal-900">
              Kelvin Temperature & Candlelight Interplay
            </h4>
            <p className="mt-3 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              {currentEvent.sensoryMotifs?.lighting}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-charcoal-400 font-light">
            Directional pin-spots calibrated to 2200K warm incandescent glow
          </div>
        </div>

        {/* Tactile Materials */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#8F5B34] font-semibold mb-2">
              <Feather className="w-4 h-4 text-[#8F5B34]" />
              <span>Tactile Textures & Finishes</span>
            </div>
            <h4 className="font-serif text-base font-semibold text-charcoal-900">
              Raw Silks, Paper Grain & Honed Stones
            </h4>
            <p className="mt-3 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              {currentEvent.sensoryMotifs?.tactile}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-charcoal-400 font-light">
            450gsm deckled cotton paper suites & travertine stoneware
          </div>
        </div>

        {/* Acoustic Soundscape */}
        <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#1C1917] font-semibold mb-2">
              <Music className="w-4 h-4 text-[#1C1917]" />
              <span>Auditory Soundscape</span>
            </div>
            <h4 className="font-serif text-base font-semibold text-charcoal-900">
              Acoustic Pacing & Transition Stems
            </h4>
            <p className="mt-3 text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed">
              {currentEvent.sensoryMotifs?.soundscape}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-charcoal-400 font-light">
            Acoustic delay speakers positioned in garden perimeter
          </div>
        </div>

      </div>

      {/* GASTRONOMY & SOMMELIER PAIRINGS */}
      <div className="bg-white border border-stone-200/80 p-6 rounded-sm shadow-luxury">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal-900">
              Curated Gastronomy & Reserve Cellar Pairings
            </h3>
            <p className="text-xs text-charcoal-500 font-light mt-0.5">
              4-course tasting synchronized with the evening run-of-show
            </p>
          </div>
          <span className="text-xs font-mono text-[#946A29]">
            Sommelier Curated
          </span>
        </div>

        <div className="mt-4 divide-y divide-stone-100">
          {currentEvent.menuPairings?.map((course, idx) => (
            <div key={idx} className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <div className="md:col-span-3">
                <span className="text-[10px] uppercase tracking-wider text-[#946A29] font-medium block">
                  Course {idx + 1}
                </span>
                <h4 className="font-serif text-sm font-semibold text-charcoal-900 mt-0.5">
                  {course.course}
                </h4>
              </div>

              <div className="md:col-span-5">
                <p className="text-xs font-medium text-charcoal-800 leading-relaxed">
                  {course.dish}
                </p>
                <p className="text-[11px] text-charcoal-500 font-light mt-1 italic">
                  Presentation: {course.notes}
                </p>
              </div>

              <div className="md:col-span-4 bg-[#FAF8F5] p-2.5 rounded border border-stone-200/60">
                <span className="text-[10px] uppercase tracking-wider text-[#8F5B34] font-medium block">
                  Reserve Cellar Pouring
                </span>
                <p className="text-xs font-serif font-semibold text-charcoal-900 mt-0.5">
                  {course.wine}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI CREATIVE BRAINSTORMER TOOL */}
      <div className="bg-gradient-to-r from-stone-900 via-charcoal-900 to-[#2A2421] text-[#FAF8F5] p-6 sm:p-8 rounded-sm shadow-luxury border border-[#B4863A]/40">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#B4863A] font-semibold mb-2">
              <Sparkles className="w-4 h-4 text-[#B4863A]" />
              <span>Gemini 3.8 Flash Creative Generator</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-white">
              Brainstorm Bespoke Aesthetic Variations
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Explore seasonal adaptations, atmospheric installations, or architectural themes formulated specifically for this celebration's venue and guest profile.
            </p>

            <form onSubmit={handleGenerateIdeas} className="mt-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block mb-1">
                    Season & Time
                  </label>
                  <input
                    type="text"
                    value={brainstormSeason}
                    onChange={(e) => setBrainstormSeason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-800/80 border border-stone-700 rounded text-white focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block mb-1">
                    Venue Archetype
                  </label>
                  <input
                    type="text"
                    value={brainstormVenue}
                    onChange={(e) => setBrainstormVenue(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-800/80 border border-stone-700 rounded text-white focus:border-[#B4863A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-400 font-medium block mb-1">
                  Creative Directives / Inspirations
                </label>
                <input
                  type="text"
                  value={brainstormNotes}
                  onChange={(e) => setBrainstormNotes(e.target.value)}
                  placeholder="e.g. Incorporate smoked glass, Venetian amber chandeliers, wild herbs..."
                  className="w-full px-3 py-1.5 text-xs bg-stone-800/80 border border-stone-700 rounded text-white focus:border-[#B4863A] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isBrainstorming}
                className="flex items-center space-x-2 px-5 py-2 bg-[#B4863A] hover:bg-[#946A29] disabled:opacity-50 text-white text-xs font-medium uppercase tracking-wider rounded transition-colors shadow-sm"
              >
                {isBrainstorming ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Orchestrating Concept...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Creative Concept</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Preview */}
          {generatedConcept && (
            <div className="lg:w-1/2 bg-white text-charcoal-900 p-6 rounded-sm border border-[#B4863A] shadow-luxury animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-[10px] uppercase tracking-widest text-[#946A29] font-bold">
                  Generated Concept Proposal
                </span>
                <button
                  onClick={applyGeneratedConcept}
                  className="px-3 py-1 bg-charcoal-900 hover:bg-[#2A2421] text-white text-[11px] font-medium uppercase tracking-wider rounded"
                >
                  Apply to Event
                </button>
              </div>

              <h4 className="font-serif text-lg font-semibold text-charcoal-900 mt-3">
                {generatedConcept.conceptTitle}
              </h4>
              <p className="text-xs text-charcoal-600 font-light mt-1.5 leading-relaxed">
                {generatedConcept.narrative}
              </p>

              {/* Spatial Installations */}
              {generatedConcept.spatialInstallations && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block mb-1">
                    Spatial Architectural Features:
                  </span>
                  <ul className="text-xs text-charcoal-700 space-y-1 list-disc list-inside font-light">
                    {generatedConcept.spatialInstallations.map((inst: string, i: number) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
