import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside Céleste:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="min-h-[400px] flex items-center justify-center p-6"
        >
          <div className="bg-white border border-[#B4863A]/40 rounded-sm shadow-luxury-lg p-8 max-w-lg text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-[#B4863A]" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-charcoal-900 mb-2">
              Workspace Interruption
            </h2>
            <p className="text-xs text-charcoal-600 font-light mb-6 leading-relaxed">
              An unexpected render fault was caught. Your event data remains securely stored in local state.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-charcoal-900 hover:bg-[#2A2421] text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors shadow-sm"
              aria-label="Recover and reload workspace"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Recover Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
