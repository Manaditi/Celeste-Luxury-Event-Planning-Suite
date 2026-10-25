import React, { useState, useEffect } from 'react';
import { useEventContext } from '../../context/EventContext';
import { generateVendorInquiryApi } from '../../services/api';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  X, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck, 
  CheckCircle2,
  Sliders
} from 'lucide-react';

export const VendorInquiryModal: React.FC = () => {
  const { 
    currentEvent, 
    selectedVendorForInquiry, 
    setSelectedVendorForInquiry, 
    updateVendorItem 
  } = useEventContext();

  const [tone, setTone] = useState<'editorial_luxury' | 'polite_inquiry' | 'contract_negotiation'>('editorial_luxury');
  const [specificRequirements, setSpecificRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  useEffect(() => {
    if (selectedVendorForInquiry) {
      setGeneratedDraft(null);
      setMarkedSent(false);
      setCopied(false);
      setSpecificRequirements(
        selectedVendorForInquiry.notes || `Confirming availability for ${currentEvent.date} and deliverable timeline.`
      );
    }
  }, [selectedVendorForInquiry, currentEvent.date]);

  if (!selectedVendorForInquiry) return null;

  const handleGenerateInquiry = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateVendorInquiryApi({
        vendorName: selectedVendorForInquiry.companyName,
        vendorCategory: selectedVendorForInquiry.category,
        eventTitle: currentEvent.title,
        eventDate: currentEvent.date,
        location: currentEvent.location,
        guestCount: currentEvent.guestCount,
        budgetEstimate: selectedVendorForInquiry.costEstimate,
        tone,
        specificRequirements,
      });
      setGeneratedDraft(draft);
    } catch (err) {
      console.error('Failed to draft vendor inquiry:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedDraft) return;
    const fullText = `Subject: ${generatedDraft.subject}\n\n${generatedDraft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkAsSent = () => {
    updateVendorItem(selectedVendorForInquiry.id, {
      contractStatus: 'inquiry_sent',
    });
    setMarkedSent(true);
    setTimeout(() => {
      setSelectedVendorForInquiry(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#B4863A]/40 w-full max-w-2xl rounded-sm shadow-luxury-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-sm bg-charcoal-900 flex items-center justify-center border border-[#B4863A]/40">
              <Mail className="w-4 h-4 text-[#B4863A]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-charcoal-900">
                Draft Vendor Outreach with Gemini
              </h3>
              <p className="text-xs text-charcoal-500 font-light">
                Direct procurement correspondence tailored to {selectedVendorForInquiry.companyName}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedVendorForInquiry(null)}
            className="p-1 text-charcoal-400 hover:text-charcoal-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vendor Summary Card */}
        <div className="mt-4 p-3.5 bg-[#FAF8F5] border border-stone-200/80 rounded flex items-center justify-between text-xs">
          <div>
            <span className="font-serif font-semibold text-charcoal-900">
              {selectedVendorForInquiry.companyName}
            </span>
            <span className="text-charcoal-500 ml-2">
              ({selectedVendorForInquiry.category})
            </span>
            <p className="text-[11px] text-charcoal-500 font-light mt-0.5">
              Contact: {selectedVendorForInquiry.contactName} · {selectedVendorForInquiry.email}
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-charcoal-500 block text-[10px] uppercase">Target Allocation</span>
            <span className="font-semibold text-charcoal-900">${selectedVendorForInquiry.costEstimate.toLocaleString()}</span>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1.5 flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-[#B4863A]" />
            <span>Tone of Correspondence:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'editorial_luxury', label: 'Editorial Luxury', desc: 'Poetic, refined, haute couture director cadence' },
              { id: 'polite_inquiry', label: 'Polite Inquiry', desc: 'Gracious, collaborative initial exploration' },
              { id: 'contract_negotiation', label: 'Contract Fiduciary', desc: 'Firm terms, date exclusivity & milestone caps' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id as any)}
                className={`p-2.5 text-left rounded border transition-all ${
                  tone === t.id
                    ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-xs'
                    : 'bg-white border-stone-200 text-charcoal-700 hover:border-[#B4863A]/40'
                }`}
              >
                <div className="font-semibold text-xs">{t.label}</div>
                <div className={`text-[10px] mt-0.5 font-light ${tone === t.id ? 'text-stone-300' : 'text-charcoal-500'}`}>
                  {t.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Requirements Input */}
        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-wider text-charcoal-600 font-medium block mb-1">
            Specific Deliverables or Directives:
          </label>
          <textarea
            rows={2}
            value={specificRequirements}
            onChange={(e) => setSpecificRequirements(e.target.value)}
            placeholder="e.g. Inquire if they can accommodate custom 14-foot suspended installations, and confirm 08:00 load-in availability."
            className="w-full px-3 py-2 text-xs border border-stone-200 rounded focus:border-[#B4863A] focus:outline-none"
          />
        </div>

        {/* Action Button */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-charcoal-400 font-light">
            Model: <code className="font-mono text-[#B4863A]">gemini-3.8-flash</code>
          </span>

          <button
            onClick={handleGenerateInquiry}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-5 py-2 bg-[#B4863A] hover:bg-[#946A29] disabled:opacity-50 text-white text-xs font-medium uppercase tracking-wider rounded transition-colors shadow-2xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Crafting Email Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Outreach Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Output Preview */}
        {generatedDraft && (
          <div className="mt-6 pt-5 border-t border-stone-200/80 animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-widest text-[#946A29] font-bold">
                Generated Correspondence Draft:
              </span>
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center space-x-1 text-xs text-[#946A29] hover:text-[#B4863A] font-medium px-2 py-0.5 rounded border border-[#B4863A]/30 bg-[#FAF8F5]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy All'}</span>
              </button>
            </div>

            <div className="bg-[#FAF8F5] border border-stone-200 rounded p-4 font-mono text-xs text-charcoal-800 leading-relaxed max-h-72 overflow-y-auto space-y-3">
              <div>
                <span className="text-charcoal-400 select-none">Subject: </span>
                <span className="font-semibold text-charcoal-900">{generatedDraft.subject}</span>
              </div>
              <div className="whitespace-pre-line text-charcoal-700 font-sans text-xs font-light">
                {generatedDraft.body}
              </div>
            </div>

            {/* Mark as sent & Close */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-charcoal-500 font-light">
                Status is currently: <span className="font-mono font-medium">{selectedVendorForInquiry.contractStatus}</span>
              </span>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedVendorForInquiry(null)}
                  className="px-4 py-2 text-xs text-charcoal-600 hover:text-charcoal-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleMarkAsSent}
                  disabled={markedSent}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-charcoal-900 hover:bg-[#2A2421] text-white text-xs font-medium uppercase tracking-wider rounded transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{markedSent ? 'Marked as Sent!' : 'Mark Inquiry as Sent'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
