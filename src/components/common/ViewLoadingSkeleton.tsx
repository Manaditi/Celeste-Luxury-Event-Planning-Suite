import React from 'react';

/**
 * Editorial luxury skeleton loader rendered during Suspense chunk resolution.
 * Matches Céleste's Playfair serif aesthetic and ivory/champagne canvas.
 */
export const ViewLoadingSkeleton: React.FC = () => {
  return (
    <div 
      className="w-full space-y-6 animate-pulse py-4"
      role="status"
      aria-label="Loading view components"
    >
      {/* Top Banner Placeholder */}
      <div className="h-28 bg-[#F4EFEA] border border-[#B4863A]/20 rounded-lg p-6 flex flex-col justify-between">
        <div className="h-6 w-1/3 bg-[#EAE2D8] rounded" />
        <div className="h-4 w-1/2 bg-[#EAE2D8]/70 rounded" />
      </div>

      {/* Grid Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-[#F4EFEA] border border-[#B4863A]/15 rounded-lg p-6 space-y-4">
          <div className="h-4 w-1/2 bg-[#EAE2D8] rounded" />
          <div className="h-8 w-3/4 bg-[#EAE2D8] rounded" />
          <div className="h-24 bg-[#FAF8F5] rounded border border-stone-200/50" />
        </div>
        <div className="h-64 bg-[#F4EFEA] border border-[#B4863A]/15 rounded-lg p-6 space-y-4">
          <div className="h-4 w-1/2 bg-[#EAE2D8] rounded" />
          <div className="h-8 w-3/4 bg-[#EAE2D8] rounded" />
          <div className="h-24 bg-[#FAF8F5] rounded border border-stone-200/50" />
        </div>
        <div className="h-64 bg-[#F4EFEA] border border-[#B4863A]/15 rounded-lg p-6 space-y-4">
          <div className="h-4 w-1/2 bg-[#EAE2D8] rounded" />
          <div className="h-8 w-3/4 bg-[#EAE2D8] rounded" />
          <div className="h-24 bg-[#FAF8F5] rounded border border-stone-200/50" />
        </div>
      </div>

      {/* Table / List Placeholder */}
      <div className="h-72 bg-[#F4EFEA] border border-[#B4863A]/20 rounded-lg p-6 space-y-3">
        <div className="h-5 w-1/4 bg-[#EAE2D8] rounded mb-4" />
        <div className="h-10 bg-white/60 rounded border border-stone-200/40" />
        <div className="h-10 bg-white/60 rounded border border-stone-200/40" />
        <div className="h-10 bg-white/60 rounded border border-stone-200/40" />
      </div>
      <span className="sr-only">Orchestrating view assets...</span>
    </div>
  );
};
