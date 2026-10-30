'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GranularErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        `[GranularErrorBoundary] Error caught in module "${this.props.moduleName || 'Unknown'}":`,
        error,
        errorInfo
      );
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          dir="rtl"
          className="my-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-md dark:border-rose-500/30 dark:bg-rose-950/20 text-right"
        >
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <h3 className="text-base font-bold">
              حدث خطأ مؤقت أثناء تحميل {this.props.moduleName ? `قسم "${this.props.moduleName}"` : 'هذا الجزء'}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            لا تقلق، باقي صفحات المنصة تعمل بكفاءة. يمكنك إعادة محاولة تحميل هذا الجزء الآن.
          </p>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-black/50 p-2 text-xs text-rose-300 ltr text-left">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-4">
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-xl bg-bio-deep px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-bio-teal transition active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              <span>إعادة المحاولة</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
