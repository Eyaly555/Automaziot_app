import { logger } from '../utils/consoleLogger';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  meetingId?: string;
  errorBoundary?: boolean;
  additionalData?: any;
}

class ErrorReportingService {
  private errors: ErrorReport[] = [];
  private maxErrors: number = 100;

  // Report error to external service (Sentry, LogRocket, etc.)
  private async reportToExternalService(errorReport: ErrorReport): Promise<void> {
    try {
      // Here you would integrate with your error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.

      if (import.meta.env.DEV) {
        // In development, just log to console
        logger.error('Error Report (DEV)', errorReport);
        return;
      }

      // For production, send to error reporting service
      // Example:
      // await fetch('https://your-error-service.com/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      logger.info('Error reported to external service', { errorReport });
    } catch (reportingError) {
      logger.error('Failed to report error to external service', reportingError);
    }
  }

  // Report React error boundary error
  async reportReactError(error: Error, errorInfo: React.ErrorInfo, additionalData?: any): Promise<void> {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorBoundary: true,
      additionalData,
    };

    // Add to local storage for debugging
    this.addToLocalStorage(errorReport);

    // Report to external service
    await this.reportToExternalService(errorReport);
  }

  // Report unhandled promise rejection
  async reportUnhandledRejection(event: PromiseRejectionEvent): Promise<void> {
    const errorReport: ErrorReport = {
      message: event.reason?.message || 'Unhandled Promise Rejection',
      stack: event.reason?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      additionalData: { type: 'unhandledRejection', reason: event.reason },
    };

    this.addToLocalStorage(errorReport);
    await this.reportToExternalService(errorReport);
  }

  // Report uncaught error
  async reportUncaughtError(event: ErrorEvent): Promise<void> {
    const errorReport: ErrorReport = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      additionalData: { type: 'uncaughtError', filename: event.filename, lineno: event.lineno, colno: event.colno },
    };

    this.addToLocalStorage(errorReport);
    await this.reportToExternalService(errorReport);
  }

  // Add error to local storage for debugging
  private addToLocalStorage(errorReport: ErrorReport): void {
    try {
      const errors = this.getLocalErrors();
      errors.push(errorReport);

      // Keep only the latest errors
      if (errors.length > this.maxErrors) {
        errors.splice(0, errors.length - this.maxErrors);
      }

      localStorage.setItem('app_errors', JSON.stringify(errors));
    } catch (storageError) {
      logger.error('Failed to save error to localStorage', storageError);
    }
  }

  // Get errors from local storage
  getLocalErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('app_errors');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to read errors from localStorage', error);
      return [];
    }
  }

  // Clear local errors
  clearLocalErrors(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch (error) {
      logger.error('Failed to clear errors from localStorage', error);
    }
  }

  // Get error summary for debugging
  getErrorSummary(): { total: number; byType: Record<string, number>; recentErrors: ErrorReport[] } {
    const errors = this.getLocalErrors();
    const recentErrors = errors.slice(-10); // Last 10 errors

    const byType: Record<string, number> = {};
    errors.forEach(error => {
      const type = error.errorBoundary ? 'react' : error.additionalData?.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: errors.length,
      byType,
      recentErrors,
    };
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();

// Setup global error handlers
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorReportingService.reportUnhandledRejection(event);
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorReportingService.reportUncaughtError(event);
  });

  logger.info('Global error handlers setup complete');
}
