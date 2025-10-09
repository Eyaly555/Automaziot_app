import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 App Error:', error, errorInfo);

    // TODO: Send to error reporting service
    // errorReportingService.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              אופס! משהו השתבש
            </h1>
            <p className="text-gray-600 text-center mb-6">
              אירעה שגיאה בלתי צפויה. אנחנו כבר עובדים על זה.
            </p>

            {this.state.error && (
              <div className="bg-gray-100 rounded p-4 mb-4 text-xs font-mono overflow-auto max-h-40">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                טען מחדש
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                חזור לדשבורד
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
