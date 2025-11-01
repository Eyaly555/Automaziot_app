/**
 * Error Boundary for Demo Page
 * Isolates demo page from global app errors
 * Ensures demo works independently
 */

import React, { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DemoErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Demo Page Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              שגיאה בעמוד הדמו
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              מצטער, קרתה שגיאה בעמוד הדמו. אנא רענן את הדף.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 font-mono mb-4 break-words">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-md transition-shadow"
            >
              רענן את הדף
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DemoErrorBoundary;
