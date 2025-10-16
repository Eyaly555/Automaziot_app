import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppContent } from './components/AppContent';
import { ZohoIntegrationWrapper } from './components/ZohoIntegrationWrapper';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { AppErrorBoundary } from './components/Common/AppErrorBoundary';
import { setupGlobalErrorHandlers } from './services/errorReportingService';

function App() {
  // Setup global error handlers
  React.useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  return (
    <AppErrorBoundary>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <ZohoIntegrationWrapper>
              <AppContent />
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#333',
                    padding: '16px',
                    borderRadius: '8px',
                    boxShadow:
                      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </ZohoIntegrationWrapper>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </AppErrorBoundary>
  );
}

export default App;
