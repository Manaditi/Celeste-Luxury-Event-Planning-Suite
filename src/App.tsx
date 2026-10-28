import React, { Suspense } from 'react';
import { EventProvider, useEventContext } from './context/EventContext';
import { TopBar } from './components/layout/TopBar';
import { EventBanner } from './components/layout/EventBanner';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ViewLoadingSkeleton } from './components/common/ViewLoadingSkeleton';

// Optimized code-splitting for high runtime efficiency and reduced initial bundle weight
const OverviewDashboard = React.lazy(() => 
  import('./components/views/OverviewDashboard').then(m => ({ default: m.OverviewDashboard }))
);
const TimelineView = React.lazy(() => 
  import('./components/views/TimelineView').then(m => ({ default: m.TimelineView }))
);
const BudgetView = React.lazy(() => 
  import('./components/views/BudgetView').then(m => ({ default: m.BudgetView }))
);
const VendorView = React.lazy(() => 
  import('./components/views/VendorView').then(m => ({ default: m.VendorView }))
);
const CreativeView = React.lazy(() => 
  import('./components/views/CreativeView').then(m => ({ default: m.CreativeView }))
);
const TeamRoomView = React.lazy(() => 
  import('./components/views/TeamRoomView').then(m => ({ default: m.TeamRoomView }))
);

// On-demand modal chunks
const EventGeneratorModal = React.lazy(() => 
  import('./components/modals/EventGeneratorModal').then(m => ({ default: m.EventGeneratorModal }))
);
const VendorInquiryModal = React.lazy(() => 
  import('./components/modals/VendorInquiryModal').then(m => ({ default: m.VendorInquiryModal }))
);
const BudgetAdvisorModal = React.lazy(() => 
  import('./components/modals/BudgetAdvisorModal').then(m => ({ default: m.BudgetAdvisorModal }))
);
const ApiKeyModal = React.lazy(() => 
  import('./components/modals/ApiKeyModal').then(m => ({ default: m.ApiKeyModal }))
);

const MainContent: React.FC = () => {
  const { 
    activeView, 
    currentEvent, 
    isGeneratorOpen, 
    isBudgetAdvisorOpen, 
    selectedVendorForInquiry, 
    isApiKeyModalOpen 
  } = useEventContext();

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewDashboard />;
      case 'timeline':
        return <TimelineView />;
      case 'budget':
        return <BudgetView />;
      case 'vendors':
        return <VendorView />;
      case 'creative':
        return <CreativeView />;
      case 'team':
        return <TeamRoomView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-charcoal-900 flex flex-col font-sans">
      {/* WCAG Accessible Skip Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-charcoal-900 text-white border border-[#B4863A] rounded shadow-luxury text-xs uppercase tracking-wider font-semibold"
      >
        Skip to main content
      </a>

      {/* Screen Reader Live Region for status and notifications */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="a11y-announcer">
        Current view: {activeView}. Selected event: {currentEvent.title}.
      </div>

      {/* 3-Zone Top Bar Contract */}
      <TopBar />

      {/* Hero Header & 4-Stat Metric Strip */}
      <EventBanner />

      {/* Main Workspace Body with Error Boundary & Suspense Fallback */}
      <main 
        id="main-content" 
        tabIndex={-1} 
        className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none"
        aria-label="Event Orchestration Workspace"
      >
        <ErrorBoundary>
          <Suspense fallback={<ViewLoadingSkeleton />}>
            {renderActiveView()}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Editorial Luxury Footer */}
      <footer className="mt-auto border-t border-[#B4863A]/20 bg-white/70 py-6 text-xs text-charcoal-500" role="contentinfo">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-serif font-semibold tracking-wider text-charcoal-900 uppercase">CÉLESTE</span>
            <span className="text-stone-300" aria-hidden="true">/</span>
            <span className="text-[11px] font-light">Haute Event Orchestration & Collaboration Suite</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="font-mono text-charcoal-600">Gemini 3.8 Flash Proxy Active</span>
            </span>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <span>Tabular Fiduciary Ledger</span>
            <span className="text-stone-300" aria-hidden="true">·</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>

      {/* On-Demand Modals Loaded via Suspense */}
      <Suspense fallback={null}>
        {isGeneratorOpen && <EventGeneratorModal />}
        {isBudgetAdvisorOpen && <BudgetAdvisorModal />}
        {selectedVendorForInquiry && <VendorInquiryModal />}
        {isApiKeyModalOpen && <ApiKeyModal />}
      </Suspense>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EventProvider>
      <MainContent />
    </EventProvider>
  );
};

export default App;
