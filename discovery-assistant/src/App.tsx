import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppContent } from './components/AppContent';
import { useZohoIntegration } from './hooks/useZohoIntegration';
import { ZohoModeIndicator } from './components/ZohoModeIndicator';
import { ZohoConsent } from './components/ZohoConsent';

function AppWithZoho() {
  const { isZohoMode } = useZohoIntegration();

  return (
    <>
      <AppContent />
      {isZohoMode && <ZohoModeIndicator />}
      <ZohoConsent />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppWithZoho />
      </Router>
    </AuthProvider>
  );
}

export default App;